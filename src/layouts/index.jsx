import { Box, Button, Drawer, Flex, rem } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import NavbarNested, { Navbar } from './NavbarNested';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import useAutoLogout from '../helpers/useAutoLogout';
import { useMutation } from 'react-query';
import { usePostLogout } from '../helpers/apiHelper';

function Layout() {
  const isMobile = useMediaQuery(`(max-width: 1100px)`);
  const [opened, { open, close }] = useDisclosure(false);

  const { mutate } = useMutation(usePostLogout, {
    onSuccess: () => {
      localStorage.removeItem('token');
      setTimeout(() => {
        window.location.replace('/');
      }, 500);
    },
  });

  useAutoLogout(10 * 60 * 1000, mutate);

  return (
    <Flex>
      <NavbarNested isMobile={isMobile} />
      <Box
        w={275}
        style={{ display: isMobile ? 'none' : 'block', flexShrink: 0 }}
      />
      <Box flex={1} w="calc(100% - 275px)">
        <Header onClickMenu={open} isMobile={isMobile} />
        <Outlet />
      </Box>
      <Drawer
        padding={0}
        size={275}
        opened={opened}
        onClose={close}
        withCloseButton={false}
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      >
        <Navbar onCloseMenu={close} />
      </Drawer>
    </Flex>
  );
}

export default Layout;
