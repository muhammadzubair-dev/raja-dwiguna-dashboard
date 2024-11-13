import { createBrowserRouter } from 'react-router-dom';
import NavbarColored from './layouts/NavbarColored';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Users from './pages/Users';
import Transactions from './pages/Transactions';
import NavbarNested from './layouts/NavbarNested';
import RequireAuth from './layouts/RequireAuth';
import Roles from './pages/Roles';
import LogActivities from './pages/LogActivities';
import MasterCategories from './pages/Settings';
import Settings from './pages/Settings';
import Reports from './pages/Reports';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth>
        <NavbarNested />
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
