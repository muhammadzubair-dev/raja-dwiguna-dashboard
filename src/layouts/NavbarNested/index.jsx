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

const slideTransition = {
  in: { transform: 'translateX(0)', opacity: 1 },
  out: { transform: 'translateX(-100%)', opacity: 0 },
  common: { transitionProperty: 'transform, opacity' },
};

const mockdata = [
  { label: 'Dashboard', icon: IconDashboard, toLink: '/' },
  {
    label: 'Finance',
    icon: IconCashRegister,
    initiallyOpened: false,
    links: [
      { label: 'Invoices', link: '/invoices' },
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

export function Navbar({ onCloseMenu }) {
  const [stateCollapse, setStateCollapse] = useState(mockdata);

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

  const links = stateCollapse.map((item) => (
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
