import { Box, Button, Drawer, Flex, rem } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import NavbarNested, { Navbar } from './NavbarNested';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';

function Layout() {
  const isMobile = useMediaQuery(`(max-width: 1100px)`);
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Flex gap="md">
      <NavbarNested isMobile={isMobile} />
      <Box w={rem(275)} style={{ display: isMobile ? 'none' : 'block' }} />
      <Box flex={1} w="100%">
        <Header onClickMenu={open} isMobile={isMobile} />
        <Outlet />
      </Box>
      <Drawer
        padding={0}
        size={rem(275)}
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
