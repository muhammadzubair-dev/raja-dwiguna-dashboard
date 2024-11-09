import { Group, Code, ScrollArea, rem, Flex, Title, Box } from '@mantine/core';
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
} from '@tabler/icons-react';
import UserButton from '../../components/UserButton';
import LinksGroup from '../../components/NavbarLinksGroup';
import classes from './index.module.css';
import { Outlet } from 'react-router-dom';
import logoImage from '../../assets/logo.png';

const mockdata = [
  { label: 'Dashboard', icon: IconDashboard, toLink: '/' },
  {
    label: 'Users',
    icon: IconUsers,
    initiallyOpened: true,
    links: [
      { label: 'Accounts', link: '/users' },
      { label: 'Roles', link: '/' },
      { label: 'Log Activities', link: '/' },
    ],
  },
];

function NavbarNested() {
  const links = mockdata.map((item) => (
    <LinksGroup {...item} key={item.label} />
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
      <Outlet />
    </Flex>
  );
}

export default NavbarNested;
