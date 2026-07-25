import { render, screen } from '@testing-library/react';
import { DesignCard } from '@/components/designs/design-card';
import { CartProvider } from '@/lib/client/cart-context';
import { Design } from '@/lib/types/design';

function renderWithCart(ui: React.ReactElement) {
  return render(<CartProvider>{ui}</CartProvider>);
}

const baseDesign: Design = {
  id: 'd1',
  title: 'The Meridian',
  slug: 'the-meridian',
  category: 'CONTAINER',
  status: 'PUBLISHED',
  basePriceCents: 145000,
  bedrooms: 2,
  bathrooms: 1,
  sqft: 960,
  estimatedBuildCents: 11800000,
  summary: 'summary',
  description: 'description',
  coverImageUrl: '',
  galleryUrls: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('DesignCard', () => {
  it('renders the title, formatted price, and stats', () => {
    renderWithCart(<DesignCard design={baseDesign} />);
    expect(screen.getByText('The Meridian')).toBeInTheDocument();
    expect(screen.getByText('$1,450')).toBeInTheDocument();
    expect(screen.getByText('2 bed')).toBeInTheDocument();
    expect(screen.getByText('960 sq ft')).toBeInTheDocument();
    expect(screen.getByText('build ≈ $118k')).toBeInTheDocument();
  });

  it('shows the Container category badge', () => {
    renderWithCart(<DesignCard design={baseDesign} />);
    expect(screen.getByText('Container')).toBeInTheDocument();
  });

  it('links buy/details to the design detail page', () => {
    renderWithCart(<DesignCard design={baseDesign} />);
    const links = screen.getAllByRole('link');
    expect(links.every((link) => link.getAttribute('href') === '/designs/the-meridian')).toBe(true);
  });

  it('falls back to the placeholder pattern when there is no cover image', () => {
    const { container } = renderWithCart(<DesignCard design={baseDesign} />);
    expect(container.querySelector('.placeholder-stripes')).toBeInTheDocument();
  });
});
