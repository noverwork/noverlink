import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ConnectionBadge, PulseBadge, StatusIndicator } from './pulse-badge';

describe('PulseBadge', () => {
  it('should render children', () => {
    render(<PulseBadge>Connected</PulseBadge>);
    expect(screen.getByText('Connected')).toBeTruthy();
  });

  it('should apply connected variant by default', () => {
    render(<PulseBadge>Status</PulseBadge>);
    const badge = screen.getByText('Status').closest('span');
    expect(badge?.className).toContain('text-teal-400');
  });

  it('should apply disconnected variant', () => {
    render(<PulseBadge variant="disconnected">Offline</PulseBadge>);
    const badge = screen.getByText('Offline').closest('span');
    expect(badge?.className).toContain('text-rose-400');
  });

  it('should apply warning variant', () => {
    render(<PulseBadge variant="warning">Warning</PulseBadge>);
    const badge = screen.getByText('Warning').closest('span');
    expect(badge?.className).toContain('text-amber-400');
  });

  it('should apply info variant', () => {
    render(<PulseBadge variant="info">Info</PulseBadge>);
    const badge = screen.getByText('Info').closest('span');
    expect(badge?.className).toContain('text-cyan-400');
  });

  it('should apply processing variant', () => {
    render(<PulseBadge variant="processing">Processing</PulseBadge>);
    const badge = screen.getByText('Processing').closest('span');
    expect(badge?.className).toContain('text-purple-400');
  });

  it('should show pulsing dot by default', () => {
    const { container } = render(<PulseBadge>Status</PulseBadge>);
    const pulsingElement = container.querySelector('.animate-ping');
    expect(pulsingElement).toBeTruthy();
  });

  it('should not show pulsing when pulse is false', () => {
    const { container } = render(<PulseBadge pulse={false}>Static</PulseBadge>);
    const pulsingElement = container.querySelector('.animate-ping');
    expect(pulsingElement).toBeFalsy();
  });

  it('should apply pill appearance', () => {
    render(<PulseBadge appearance="pill">Pill</PulseBadge>);
    const badge = screen.getByText('Pill').closest('span');
    expect(badge?.className).toContain('rounded-full');
    expect(badge?.className).toContain('bg-slate-900');
  });

  it('should apply tag appearance', () => {
    render(<PulseBadge appearance="tag">Tag</PulseBadge>);
    const badge = screen.getByText('Tag').closest('span');
    expect(badge?.className).toContain('border-l-2');
  });

  it('should apply size variants', () => {
    const { rerender } = render(<PulseBadge size="sm">Small</PulseBadge>);
    expect(screen.getByText('Small').closest('span')?.className).toContain('text-[10px]');

    rerender(<PulseBadge size="lg">Large</PulseBadge>);
    expect(screen.getByText('Large').closest('span')?.className).toContain('text-sm');
  });

  it('should render icon when provided', () => {
    render(
      <PulseBadge icon={<span data-testid="custom-icon">★</span>}>
        With Icon
      </PulseBadge>
    );
    expect(screen.getByTestId('custom-icon')).toBeTruthy();
  });
});

describe('StatusIndicator', () => {
  it('should show connected status', () => {
    render(<StatusIndicator status="connected" />);
    expect(screen.getByText('Connected')).toBeTruthy();
  });

  it('should show disconnected status', () => {
    render(<StatusIndicator status="disconnected" />);
    expect(screen.getByText('Disconnected')).toBeTruthy();
  });

  it('should show idle status', () => {
    render(<StatusIndicator status="idle" />);
    expect(screen.getByText('Idle')).toBeTruthy();
  });

  it('should show busy status', () => {
    render(<StatusIndicator status="busy" />);
    expect(screen.getByText('Busy')).toBeTruthy();
  });

  it('should hide label when showLabel is false', () => {
    render(<StatusIndicator status="connected" showLabel={false} />);
    expect(screen.queryByText('Connected')).toBeFalsy();
  });

  it('should pulse for connected status', () => {
    const { container } = render(<StatusIndicator status="connected" />);
    expect(container.querySelector('.animate-ping')).toBeTruthy();
  });

  it('should not pulse for disconnected status', () => {
    const { container } = render(<StatusIndicator status="disconnected" />);
    expect(container.querySelector('.animate-ping')).toBeFalsy();
  });
});

describe('ConnectionBadge', () => {
  it('should show Connected when connected', () => {
    render(<ConnectionBadge connected={true} />);
    expect(screen.getByText('Connected')).toBeTruthy();
  });

  it('should show Disconnected when not connected', () => {
    render(<ConnectionBadge connected={false} />);
    expect(screen.getByText('Disconnected')).toBeTruthy();
  });

  it('should show latency when connected and showLatency is true', () => {
    render(<ConnectionBadge connected={true} latency={50} showLatency={true} />);
    expect(screen.getByText('50ms')).toBeTruthy();
  });

  it('should not show latency when disconnected', () => {
    render(<ConnectionBadge connected={false} latency={50} showLatency={true} />);
    expect(screen.queryByText('50ms')).toBeFalsy();
  });

  it('should not show latency when showLatency is false', () => {
    render(<ConnectionBadge connected={true} latency={50} showLatency={false} />);
    expect(screen.queryByText('50ms')).toBeFalsy();
  });

  it('should apply teal color for low latency', () => {
    render(<ConnectionBadge connected={true} latency={30} />);
    const latencyElement = screen.getByText('30ms');
    expect(latencyElement.className).toContain('text-teal-400');
  });

  it('should apply amber color for medium latency', () => {
    render(<ConnectionBadge connected={true} latency={100} />);
    const latencyElement = screen.getByText('100ms');
    expect(latencyElement.className).toContain('text-amber-400');
  });

  it('should apply rose color for high latency', () => {
    render(<ConnectionBadge connected={true} latency={200} />);
    const latencyElement = screen.getByText('200ms');
    expect(latencyElement.className).toContain('text-rose-400');
  });
});
