import { createBrowserRouter } from 'react-router-dom';
import Layout from './layouts';
import RequireAuth from './layouts/RequireAuth';
import Dashboard from './pages/Dashboard';
import LogActivities from './pages/LogActivities';
import Login from './pages/Login';
import Reports from './pages/Reports';
import Roles from './pages/Roles';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import Users from './pages/Users';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
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
        path: '/reports',
        element: <Reports />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
      {
        path: '/users',
        element: <Users />,
      },
      {
        path: '/roles',
        element: <Roles />,
      },
      {
        path: '/log-activities',
        element: <LogActivities />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

export default router;
