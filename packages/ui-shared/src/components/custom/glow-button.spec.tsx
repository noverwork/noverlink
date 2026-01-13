import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { GlowButton } from './glow-button';

describe('GlowButton', () => {
  it('should render children correctly', () => {
    render(<GlowButton>Click me</GlowButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeTruthy();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();

    render(<GlowButton onClick={handleClick}>Click me</GlowButton>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply primary variant by default', () => {
    render(<GlowButton>Primary</GlowButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-white');
    expect(button.className).toContain('text-[#0a0a0a]');
  });

  it('should apply secondary variant', () => {
    render(<GlowButton variant="secondary">Secondary</GlowButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('border-white/20');
  });

  it('should apply ghost variant', () => {
    render(<GlowButton variant="ghost">Ghost</GlowButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('text-white/60');
  });

  it('should apply danger variant', () => {
    render(<GlowButton variant="danger">Danger</GlowButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('border-[#ff0000]/50');
    expect(button.className).toContain('text-[#ff0000]');
  });

  it('should apply success variant', () => {
    render(<GlowButton variant="success">Success</GlowButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('border-[#00ff00]/50');
    expect(button.className).toContain('text-[#00ff00]');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<GlowButton disabled>Disabled</GlowButton>);
    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true);
  });

  it('should be disabled when loading', () => {
    render(<GlowButton loading>Loading</GlowButton>);
    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true);
  });

  it('should show loading state', () => {
    render(<GlowButton loading>Submit</GlowButton>);
    expect(screen.getByText('PROCESSING...')).toBeTruthy();
  });

  it('should apply size variants', () => {
    const { rerender } = render(<GlowButton size="sm">Small</GlowButton>);
    expect(screen.getByRole('button').className).toContain('h-8');

    rerender(<GlowButton size="lg">Large</GlowButton>);
    expect(screen.getByRole('button').className).toContain('h-12');

    rerender(<GlowButton size="xl">XL</GlowButton>);
    expect(screen.getByRole('button').className).toContain('h-14');
  });

  it('should apply rounded variants', () => {
    const { rerender } = render(<GlowButton rounded="full">Full</GlowButton>);
    expect(screen.getByRole('button').className).toContain('rounded-full');

    rerender(<GlowButton rounded="none">None</GlowButton>);
    expect(screen.getByRole('button').className).toContain('rounded-none');
  });

  it('should merge custom className', () => {
    render(<GlowButton className="custom-class">Custom</GlowButton>);
    expect(screen.getByRole('button').className).toContain('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<GlowButton ref={ref}>Ref</GlowButton>);
    expect(ref).toHaveBeenCalled();
  });
});
