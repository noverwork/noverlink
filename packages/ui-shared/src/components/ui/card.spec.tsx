import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';

describe('Card', () => {
  it('should render children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeTruthy();
  });

  it('should have data-slot attribute', () => {
    render(<Card>Content</Card>);
    expect(screen.getByText('Content').getAttribute('data-slot')).toBe('card');
  });

  it('should merge custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    expect(screen.getByText('Content').className).toContain('custom-class');
  });

  it('should apply default styles', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Content');
    expect(card.className).toContain('rounded-xl');
    expect(card.className).toContain('border');
    expect(card.className).toContain('shadow-sm');
  });
});

describe('CardHeader', () => {
  it('should render children', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeTruthy();
  });

  it('should have data-slot attribute', () => {
    render(<CardHeader>Header</CardHeader>);
    expect(screen.getByText('Header').getAttribute('data-slot')).toBe('card-header');
  });

  it('should apply grid layout', () => {
    render(<CardHeader>Header</CardHeader>);
    expect(screen.getByText('Header').className).toContain('grid');
  });
});

describe('CardTitle', () => {
  it('should render children', () => {
    render(<CardTitle>My Title</CardTitle>);
    expect(screen.getByText('My Title')).toBeTruthy();
  });

  it('should have data-slot attribute', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByText('Title').getAttribute('data-slot')).toBe('card-title');
  });

  it('should apply font-semibold', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByText('Title').className).toContain('font-semibold');
  });
});

describe('CardDescription', () => {
  it('should render children', () => {
    render(<CardDescription>Description text</CardDescription>);
    expect(screen.getByText('Description text')).toBeTruthy();
  });

  it('should have data-slot attribute', () => {
    render(<CardDescription>Desc</CardDescription>);
    expect(screen.getByText('Desc').getAttribute('data-slot')).toBe('card-description');
  });

  it('should apply muted text color', () => {
    render(<CardDescription>Desc</CardDescription>);
    expect(screen.getByText('Desc').className).toContain('text-muted-foreground');
  });
});

describe('CardAction', () => {
  it('should render children', () => {
    render(<CardAction>Action</CardAction>);
    expect(screen.getByText('Action')).toBeTruthy();
  });

  it('should have data-slot attribute', () => {
    render(<CardAction>Action</CardAction>);
    expect(screen.getByText('Action').getAttribute('data-slot')).toBe('card-action');
  });
});

describe('CardContent', () => {
  it('should render children', () => {
    render(<CardContent>Main content here</CardContent>);
    expect(screen.getByText('Main content here')).toBeTruthy();
  });

  it('should have data-slot attribute', () => {
    render(<CardContent>Content</CardContent>);
    expect(screen.getByText('Content').getAttribute('data-slot')).toBe('card-content');
  });

  it('should apply horizontal padding', () => {
    render(<CardContent>Content</CardContent>);
    expect(screen.getByText('Content').className).toContain('px-6');
  });
});

describe('CardFooter', () => {
  it('should render children', () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText('Footer content')).toBeTruthy();
  });

  it('should have data-slot attribute', () => {
    render(<CardFooter>Footer</CardFooter>);
    expect(screen.getByText('Footer').getAttribute('data-slot')).toBe('card-footer');
  });

  it('should apply flex layout', () => {
    render(<CardFooter>Footer</CardFooter>);
    expect(screen.getByText('Footer').className).toContain('flex');
  });
});

describe('Card composition', () => {
  it('should compose all card parts together', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
          <CardDescription>A test card description</CardDescription>
          <CardAction>
            <button>Action</button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p>Main content goes here</p>
        </CardContent>
        <CardFooter>
          <button>Save</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Test Card')).toBeTruthy();
    expect(screen.getByText('A test card description')).toBeTruthy();
    expect(screen.getByText('Main content goes here')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Action' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
  });
});
