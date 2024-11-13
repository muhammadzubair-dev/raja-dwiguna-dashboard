import {
  Group,
  Code,
  ScrollArea,
  rem,
  Flex,
  Title,
  Box,
  useMantineColorScheme,
  useComputedColorScheme,
  Button,
} from '@mantine/core';
import {
  IconNotes,
  IconCalendarStats,
  IconGauge,
  IconPresentationAnalytics,
  IconFileAnalytics,
  IconAdjustments,
  IconLock,
  IconDashboard,
  IconUsers,
  IconLogout2,
  IconTransactionDollar,
  IconCashRegister,
  IconSun,
  IconMoon,
} from '@tabler/icons-react';
import UserButton from '../../components/UserButton';
import LinksGroup from '../../components/NavbarLinksGroup';
import classes from './index.module.css';
import { Outlet } from 'react-router-dom';
import logoImage from '../../assets/logo.png';
import Header from '../Header';
import { useState } from 'react';

const mockdata = [
  { label: 'Dashboard', icon: IconDashboard, toLink: '/' },
  {
    label: 'Finance',
    icon: IconCashRegister,
    initiallyOpened: false,
    links: [
      { label: 'Transactions', link: '/transactions' },
      { label: 'Reports', link: '/reports' },
      { label: 'Settings', link: '/settings' },
    ],
  },
  {
    label: 'Users',
    icon: IconUsers,
    initiallyOpened: false,
    links: [
      { label: 'Accounts', link: '/users' },
      { label: 'Roles', link: '/roles' },
      { label: 'Log Activities', link: '/log-activities' },
    ],
  },
  { label: 'Logout', icon: IconLogout2, toLink: '/login' },
];

function NavbarNested() {
  const [stateCollapse, setStateCollapse] = useState(mockdata);

  const handleCollapse = (label) => {
    setStateCollapse((prev) =>
      prev.map((item) => {
        if (item.label === label) {
          // Toggle the clicked section's `initiallyOpened` state
          return { ...item, initiallyOpened: !item.initiallyOpened };
        } else {
          // Collapse all other sections
          return { ...item, initiallyOpened: false };
        }
      })
    );
  };

  const links = stateCollapse.map((item) => (
    <LinksGroup {...item} key={item.label} onCollapse={handleCollapse} />
  ));

  return (
    <Flex gap="md">
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
      <Box flex={1}>
        <Header />
        <Outlet />
      </Box>
    </Flex>
  );
}

export default NavbarNested;
