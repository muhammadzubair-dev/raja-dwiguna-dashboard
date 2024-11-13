import {
  ActionIcon,
  Box,
  Container,
  Flex,
  Text,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import React from 'react';
import { useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  const headers = [
    {
      title: 'Dashboard',
      subtitle: 'Monitor and measure your financial performance',
      path: '/',
    },
    {
      title: 'Log Activities',
      subtitle: 'Detailed Log Activities of Users',
      path: '/log-activities',
    },
    { title: 'Roles', subtitle: 'Detailed Role of Users', path: '/roles' },
    { title: 'Accounts', subtitle: 'Detailed User Accounts', path: '/users' },
    {
      title: 'Transactions',
      subtitle: 'Detailed Transaction of Users',
      path: '/transactions',
    },
    {
      title: 'Reports',
      subtitle: 'Detailed Reports of Transactions',
      path: '/reports',
    },
    {
      title: 'Settings',
      subtitle: 'Detailed Settings of Financial Transactions',
      path: '/settings',
    },
  ];

  const header = headers.find((item) => item.path.includes(location.pathname));

  return (
    <Container size="xl" flex={1} p="xl" pb={0}>
      <Flex justify="space-between" align="start" gap="md">
        <Box>
          <Title order={3}>{header.title}</Title>
          <Text size="sm">{header.subtitle}</Text>
        </Box>
        <ActionIcon onClick={toggleColorScheme}>
          {computedColorScheme === 'light' ? (
            <IconSun style={{ width: '70%', height: '70%' }} />
          ) : (
            <IconMoon style={{ width: '70%', height: '70%' }} />
          )}
        </ActionIcon>
      </Flex>
    </Container>
  );
}

export default Header;
