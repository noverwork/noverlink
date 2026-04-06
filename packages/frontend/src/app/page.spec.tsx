import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import HomePage from './page';

describe('HomePage', () => {
  it('renders the hero content', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '影片上傳服務' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '上傳影片' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '瀏覽影片' })).toBeTruthy();
  });
});
