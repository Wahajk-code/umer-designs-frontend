import { render, screen } from '@testing-library/react';
import { StatusPipeline } from '@/components/modifications/status-pipeline';

describe('StatusPipeline', () => {
  it('renders all five stage labels', () => {
    render(<StatusPipeline status="IN_PROGRESS" />);
    expect(screen.getByText('SUBMITTED')).toBeInTheDocument();
    expect(screen.getByText('IN REVIEW')).toBeInTheDocument();
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
    expect(screen.getByText('REVISION')).toBeInTheDocument();
    expect(screen.getByText('DELIVERED')).toBeInTheDocument();
  });

  it('bolds only the current stage label', () => {
    render(<StatusPipeline status="REVISION" />);
    expect(screen.getByText('REVISION')).toHaveClass('font-semibold');
    expect(screen.getByText('SUBMITTED')).not.toHaveClass('font-semibold');
    expect(screen.getByText('DELIVERED')).not.toHaveClass('font-semibold');
  });
});
