import { BrowserRouter } from 'react-router-dom';

import { AppRouter } from '../lib/router';
import { Providers } from './providers';

export default function App() {
  return (
    <BrowserRouter>
      <Providers>
        <AppRouter />
      </Providers>
    </BrowserRouter>
  );
}
