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
    expect(screen.getByText('NOVERLINK')).toBeTruthy();
  });

  it('should have a hero section with main heading', () => {
    render(<Page />);
    expect(screen.getByText('EXPOSE LOCALHOST TO THE WORLD')).toBeTruthy();
  });

  it('should have a login link in the header', () => {
    render(<Page />);
    const loginLinks = screen.getAllByText('Login');
    expect(loginLinks.length).toBeGreaterThan(0);
  });

  it('should display the tunnel demonstration', () => {
    render(<Page />);
    expect(screen.getByText('$ noverlink http 3000')).toBeTruthy();
    expect(screen.getByText('OK TUNNEL ESTABLISHED')).toBeTruthy();
  });

  it('should display feature cards', () => {
    render(<Page />);
    expect(screen.getByText('OPEN SOURCE')).toBeTruthy();
    expect(screen.getByText('HIGH PERFORMANCE')).toBeTruthy();
    expect(screen.getByText('SECURE BY DEFAULT')).toBeTruthy();
    expect(screen.getByText('CUSTOM SUBDOMAINS')).toBeTruthy();
    expect(screen.getByText('REQUEST INSPECTOR')).toBeTruthy();
    expect(screen.getByText('REAL-TIME DASHBOARD')).toBeTruthy();
  });

  it('should display pricing plans', () => {
    render(<Page />);
    expect(screen.getByText('SELF-HOSTED')).toBeTruthy();
    expect(screen.getByText('SANDBOX')).toBeTruthy();
    expect(screen.getByText('STARTER')).toBeTruthy();
    expect(screen.getByText('PRO')).toBeTruthy();
  });

  it('should display pricing amounts', () => {
    render(<Page />);
    expect(screen.getAllByText('$0').length).toBeGreaterThan(0);
    expect(screen.getByText('$12')).toBeTruthy();
    expect(screen.getByText('$29')).toBeTruthy();
  });

  it('should have footer with copyright', () => {
    render(<Page />);
    expect(screen.getByText(/2024 NOVERLINK\. ALL RIGHTS RESERVED\./)).toBeTruthy();
  });

  it('should have footer links', () => {
    render(<Page />);
    expect(screen.getByRole('link', { name: 'Docs' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Terms' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Privacy' })).toBeTruthy();
  });

  it('should have CTA section', () => {
    render(<Page />);
    expect(screen.getByText('READY TO GET STARTED?')).toBeTruthy();
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
