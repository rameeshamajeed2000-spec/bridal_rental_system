import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock(
  'react-router-dom',
  () => ({
    BrowserRouter: ({ children }) => children,
    Routes: ({ children }) => {
      const routes = Array.isArray(children) ? children : [children];
      return routes.find((route) => route.props.path === '/')?.props.element || null;
    },
    Route: () => null,
    useLocation: () => ({ pathname: '/', search: '', state: null }),
    useNavigate: () => jest.fn(),
  }),
  { virtual: true }
);

jest.mock('react-calendar', () => function MockCalendar() {
  return <div data-testid="calendar" />;
});

test('renders the login screen', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /sign in to bridal bliss/i })).toBeInTheDocument();
});
