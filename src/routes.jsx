import { createBrowserRouter } from 'react-router-dom';
import Layout from './layouts';
import RequireAuth from './layouts/RequireAuth';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import LogActivities from './pages/LogActivities';
import Login from './pages/Login';
import Reports from './pages/Reports';
import Roles from './pages/Roles';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import Users from './pages/Users';
import Privilege from './components/Privilege';
import NoAccess from './pages/NoAccess';

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
        element: (
          <Privilege module="dashboard" menu="dashboard">
            <Dashboard />
          </Privilege>
        ),
      },
      {
        path: '/invoices',
        element: (
          <Privilege module="finance" menu="invoice">
            <Invoices />
          </Privilege>
        ),
      },
      {
        path: '/transactions',
        element: (
          <Privilege module="finance" menu="transaction">
            <Transactions />
          </Privilege>
        ),
      },
      {
        path: '/reports',
        element: (
          <Privilege module="finance" menu="report">
            <Reports />
          </Privilege>
        ),
      },
      {
        path: '/settings',
        element: (
          <Privilege module="finance" menu="settings">
            <Settings />
          </Privilege>
        ),
      },
      {
        path: '/users',
        element: (
          <Privilege module="user_management" menu="account">
            <Users />
          </Privilege>
        ),
      },
      {
        path: '/roles',
        element: (
          <Privilege module="user_management" menu="role">
            <Roles />
          </Privilege>
        ),
      },
      {
        path: '/log-activities',
        element: (
          <Privilege module="user_management" menu="log_activity">
            <LogActivities />
          </Privilege>
        ),
      },
      {
        path: '/403',
        element: <NoAccess />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

export default router;
