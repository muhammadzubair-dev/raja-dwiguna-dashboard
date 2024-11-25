import {
  Box,
  Code,
  Flex,
  Group,
  ScrollArea,
  Title,
  Transition,
} from '@mantine/core';
import {
  IconCashRegister,
  IconDashboard,
  IconLogout2,
  IconUsers,
} from '@tabler/icons-react';
import { useState } from 'react';
import logoImage from '../../assets/logo.png';
import LinksGroup from '../../components/NavbarLinksGroup';
import UserButton from '../../components/UserButton';
import classes from './index.module.css';
import { useMediaQuery } from '@mantine/hooks';
import useHasPermission from '../../helpers/useHasPermission';

const slideTransition = {
  in: { transform: 'translateX(0)', opacity: 1 },
  out: { transform: 'translateX(-100%)', opacity: 0 },
  common: { transitionProperty: 'transform, opacity' },
};

export function Navbar({ onCloseMenu }) {
  const dashboardPermission = useHasPermission('dashboard', 'dashboard');
  //   {
  //     "module": "user_management",
  //     "status": true,
  //     "permission": {
  //         "account": true,
  //         "auth": false,
  //         "log_activity": true,
  //         "role": true
  //     }
  // },
  const financeInvoicePermission = useHasPermission('finance', 'invoice');
  const financeReportPermission = useHasPermission('finance', 'report');
  const financeSettingsPermission = useHasPermission('finance', 'settings');
  const financeTransactionPermission = useHasPermission(
    'finance',
    'transaction'
  );
  const userManagementPermission = useHasPermission(
    'user_management',
    'account'
  );
  const userManagementRolePermission = useHasPermission(
    'user_management',
    'role'
  );
  const userManagementLogActivityPermission = useHasPermission(
    'user_management',
    'log_activity'
  );

  const [stateCollapse, setStateCollapse] = useState([
    {
      label: 'Dashboard',
      icon: IconDashboard,
      toLink: '/',
      hasPermission: dashboardPermission,
    },
    {
      label: 'Finance',
      icon: IconCashRegister,
      initiallyOpened: false,
      hasPermission:
        financeInvoicePermission ||
        financeReportPermission ||
        financeSettingsPermission ||
        financeTransactionPermission,
      links: [
        {
          label: 'Invoices',
          link: '/invoices',
          hasPermission: financeInvoicePermission,
        },
        {
          label: 'Transactions',
          link: '/transactions',
          hasPermission: financeTransactionPermission,
        },
        {
          label: 'Reports',
          link: '/reports',
          hasPermission: financeReportPermission,
        },
        {
          label: 'Settings',
          link: '/settings',
          hasPermission: financeSettingsPermission,
        },
      ],
    },
    {
      label: 'Users',
      icon: IconUsers,
      initiallyOpened: false,
      hasPermission:
        userManagementPermission ||
        userManagementRolePermission ||
        userManagementLogActivityPermission,
      links: [
        {
          label: 'Accounts',
          link: '/users',
          hasPermission: userManagementPermission,
        },
        {
          label: 'Roles',
          link: '/roles',
          hasPermission: userManagementRolePermission,
        },
        {
          label: 'Log Activities',
          link: '/log-activities',
          hasPermission: userManagementLogActivityPermission,
        },
      ],
    },
    {
      label: 'Logout',
      icon: IconLogout2,
      hasPermission: true,
      toLink: '/login',
    },
  ]);

  const handleCollapse = (label) => {
    setStateCollapse((prev) =>
      prev.map((item) => {
        if (item.label === label) {
          return { ...item, initiallyOpened: !item.initiallyOpened };
        } else {
          return { ...item, initiallyOpened: false };
        }
      })
    );
  };

  const links = stateCollapse
    .filter((item) => item.hasPermission)
    .map((item) => (
      <LinksGroup
        {...item}
        key={item.label}
        onCollapse={handleCollapse}
        onCloseMenu={onCloseMenu}
      />
    ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between">
          <Flex gap="sm" align="center">
            <img height={50} src={logoImage} alt="logo" />
            <Box>
              <Title order={4} mb={-10}>
                Raja Dwiguna
              </Title>
              <Title order={4}>Semesta</Title>
            </Box>
          </Flex>
          <Code fw={700}>v3.1.2</Code>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <UserButton />
      </div>
    </nav>
  );
}

function NavbarNested({ isMobile }) {
  return (
    <Transition
      mounted={!isMobile}
      transition={slideTransition}
      duration={300}
      timingFunction="ease"
      keepMounted
    >
      {(transitionStyle) => (
        <div style={{ ...transitionStyle, zIndex: 1, position: 'fixed' }}>
          <Navbar />
        </div>
      )}
    </Transition>
  );
}

export default NavbarNested;
