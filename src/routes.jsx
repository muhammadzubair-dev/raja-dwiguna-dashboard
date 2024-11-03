import { createBrowserRouter } from 'react-router-dom';
import NavbarColored from './layouts/NavbarColored';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Users from './pages/Users';

const router = createBrowserRouter([
  {
    path: '/',
    element: <NavbarColored />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: '/transactions',
        element: <Users />,
      },
      {
        path: '/users',
        element: <Users />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

export default router;
