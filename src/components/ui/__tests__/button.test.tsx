import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Buy now</Button>);
    expect(screen.getByRole('button', { name: 'Buy now' })).toBeInTheDocument();
  });

  it('fires onClick when enabled', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when loading', () => {
    const onClick = jest.fn();
    render(
      <Button onClick={onClick} loading>
        Click me
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows a loading label instead of children while loading', () => {
    render(<Button loading>Buy now</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Please wait…');
  });
});
