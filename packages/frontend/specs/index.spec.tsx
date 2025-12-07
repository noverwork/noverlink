import { render, screen } from '@testing-library/react';
import React from 'react';

import Page from '../src/app/page';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

describe('Landing Page', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Page />);
    expect(baseElement).toBeTruthy();
  });

  it('should display the Noverlink brand', () => {
    render(<Page />);
    expect(screen.getByText('Noverlink')).toBeTruthy();
  });

  it('should have a hero section with main heading', () => {
    render(<Page />);
    expect(screen.getByText('Expose localhost to the world')).toBeTruthy();
  });

  it('should have a login link in the header', () => {
    render(<Page />);
    const loginLinks = screen.getAllByText('Login');
    expect(loginLinks.length).toBeGreaterThan(0);
  });

  it('should display the tunnel demonstration', () => {
    render(<Page />);
    expect(screen.getByText('$ noverlink http 3000')).toBeTruthy();
    expect(screen.getByText('✓ Tunnel established')).toBeTruthy();
  });

  it('should display feature cards', () => {
    render(<Page />);
    expect(screen.getByText('Open Source')).toBeTruthy();
    expect(screen.getByText('High Performance')).toBeTruthy();
    expect(screen.getByText('Secure by Default')).toBeTruthy();
    expect(screen.getByText('Custom Subdomains')).toBeTruthy();
    expect(screen.getByText('Request Inspector')).toBeTruthy();
    expect(screen.getByText('Real-time Dashboard')).toBeTruthy();
  });

  it('should display pricing plans', () => {
    render(<Page />);
    expect(screen.getByText('Self-Hosted')).toBeTruthy();
    expect(screen.getByText('Sandbox')).toBeTruthy();
    expect(screen.getByText('Starter')).toBeTruthy();
    expect(screen.getByText('Pro')).toBeTruthy();
  });

  it('should display pricing amounts', () => {
    render(<Page />);
    expect(screen.getAllByText('$0').length).toBeGreaterThan(0);
    expect(screen.getByText('$12')).toBeTruthy();
    expect(screen.getByText('$29')).toBeTruthy();
  });

  it('should have footer with copyright', () => {
    render(<Page />);
    expect(screen.getByText(/© 2024 Noverlink/)).toBeTruthy();
  });

  it('should have footer links', () => {
    render(<Page />);
    expect(screen.getByRole('link', { name: 'Docs' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Terms' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Privacy' })).toBeTruthy();
  });

  it('should have CTA section', () => {
    render(<Page />);
    expect(screen.getByText('Ready to get started?')).toBeTruthy();
    expect(screen.getAllByText('Try the Sandbox').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Self-Host (Free)').length).toBeGreaterThan(0);
  });

  it('should render tunnel visualization component', () => {
    render(<Page />);
    expect(screen.getByText('Local')).toBeTruthy();
    expect(screen.getByText(':3000')).toBeTruthy();
    expect(screen.getByText('Public')).toBeTruthy();
  });
});
