import { createBrowserRouter } from 'react-router-dom';
import NavbarColored from './layouts/NavbarColored';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Users from './pages/Users';
import Transactions from './pages/Transactions';
import NavbarNested from './layouts/NavbarNested';

const router = createBrowserRouter([
  {
    path: '/',
    element: <NavbarNested />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: '/transactions',
        element: <Transactions />,
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
