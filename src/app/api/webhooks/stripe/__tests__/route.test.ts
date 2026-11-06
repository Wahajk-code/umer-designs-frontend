/** @jest-environment node */
import Stripe from 'stripe';

const WEBHOOK_SECRET = 'whsec_test_secret';

jest.mock('@/lib/server/env', () => ({
  getServerEnv: () => ({ STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET }),
}));

const callBackendMock = jest.fn().mockResolvedValue({ received: true });
jest.mock('@/lib/server/backend-client', () => ({
  callBackend: (...args: unknown[]) => callBackendMock(...args),
}));

import { POST } from '@/app/api/webhooks/stripe/route';

function makeRequest(body: string, signature?: string): Request {
  const headers = new Headers();
  if (signature) headers.set('stripe-signature', signature);
  return new Request('http://localhost:3000/api/webhooks/stripe', {
    method: 'POST',
    headers,
    body,
  });
}

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    callBackendMock.mockClear();
  });

  it('rejects a request with no stripe-signature header', async () => {
    const res = await POST(makeRequest('{}') as never);
    expect(res.status).toBe(400);
    expect(callBackendMock).not.toHaveBeenCalled();
  });

  it('rejects a request with an invalid signature', async () => {
    const res = await POST(makeRequest('{"id":"evt_1"}', 't=1,v1=deadbeef') as never);
    expect(res.status).toBe(400);
    expect(callBackendMock).not.toHaveBeenCalled();
  });

  function signed(payload: string) {
    return Stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
  }

  it('ignores a checkout session that has not actually been paid', async () => {
    const payload = JSON.stringify({
      id: 'evt_unpaid',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_1', payment_status: 'unpaid', metadata: { kind: 'design_order', recordId: 'o1' } } },
    });
    const res = await POST(makeRequest(payload, signed(payload)) as never);
    expect(res.status).toBe(200);
    expect(callBackendMock).not.toHaveBeenCalled();
  });

  it('returns 500 (so Stripe retries) when the backend fails to process the event', async () => {
    callBackendMock.mockRejectedValueOnce(new Error('backend down'));
    const payload = JSON.stringify({
      id: 'evt_retry',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_2', payment_status: 'paid', metadata: { kind: 'design_order', recordId: 'o1' } } },
    });
    const res = await POST(makeRequest(payload, signed(payload)) as never);
    expect(res.status).toBe(500);
  });

  it('accepts a validly signed event and forwards a minimal trusted payload', async () => {
    const payload = JSON.stringify({
      id: 'evt_test_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_1',
          payment_intent: 'pi_test_1',
          metadata: { kind: 'design_order', recordId: 'order-1' },
        },
      },
    });
    const header = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: WEBHOOK_SECRET,
    });

    const res = await POST(makeRequest(payload, header) as never);

    expect(res.status).toBe(200);
    expect(callBackendMock).toHaveBeenCalledWith(
      '/webhooks/stripe',
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({
          eventId: 'evt_test_1',
          eventType: 'checkout.session.completed',
          checkoutSessionId: 'cs_test_1',
          paymentIntentId: 'pi_test_1',
          metadata: { kind: 'design_order', recordId: 'order-1' },
        }),
      }),
    );
  });
});
