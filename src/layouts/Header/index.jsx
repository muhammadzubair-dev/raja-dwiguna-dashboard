import {
  ActionIcon,
  Box,
  Button,
  Center,
  Container,
  Drawer,
  Flex,
  Group,
  PasswordInput,
  SegmentedControl,
  Stack,
  Text,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconArrowAutofitContentFilled,
  IconArrowsDiff,
  IconKey,
  IconMenu2,
  IconMoonFilled,
  IconSettings,
  IconSunFilled,
} from '@tabler/icons-react';
import React from 'react';
import { useLocation } from 'react-router-dom';
import useSizeContainer from '../../helpers/useSizeContainer';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { useMutation } from 'react-query';
import { usePostChangePassword } from '../../helpers/apiHelper';
import ErrorMessage from '../../components/ErrorMessage';
import { notificationSuccess } from '../../helpers/notificationHelper';

function NewPassword() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      old_password: '',
      new_password: '',
      re_new_password: '',
    },

    validate: {
      old_password: (value) =>
        value.trim().length > 0 ? null : 'Old Password is required',
      new_password: (value) =>
        value.trim().length > 0 ? null : 'New Password is required',
      re_new_password: (value, values) =>
        value === values.new_password ? null : "Passwords do'nt match", // Custom validation
    },
  });

  const { mutate, isLoading, error } = useMutation(usePostChangePassword, {
    onSuccess: () => {
      modals.closeAll();
      notificationSuccess(`Password changed successfully`);
    },
  });

  return (
    <form onSubmit={form.onSubmit(mutate)}>
      <Stack gap="xs">
        <PasswordInput
          {...form.getInputProps('old_password')}
          key={form.key('old_password')}
          label="Old Password"
          placeholder="Your Old password"
          required
        />
        <PasswordInput
          {...form.getInputProps('new_password')}
          key={form.key('new_password')}
          label="New Password"
          placeholder="Your New password"
          required
        />
        <PasswordInput
          {...form.getInputProps('re_new_password')}
          key={form.key('re_new_password')}
          label="Retype New Password"
          placeholder="Retype your New password"
          required
        />
        <Group justify="center" mt="md">
          <Button
            flex={1}
            variant="outline"
            color="gray"
            onClick={() => modals.closeAll()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button flex={1} type="submit" loading={isLoading}>
            Save
          </Button>
        </Group>
        {error && (
          <Flex justify="center">
            <ErrorMessage message={error?.message} />
          </Flex>
        )}
      </Stack>
    </form>
  );
}

function Header({ onClickMenu, isMobile }) {
  const theme = useMantineTheme();
  const location = useLocation();
  const [opened, { open, close }] = useDisclosure(false);
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');
  const updateSizeContainer = useSizeContainer(
    (state) => state.updateSizeContainer
  );
  const sizeContainer = useSizeContainer((state) => state.sizeContainer);

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
      title: 'Invoices',
      subtitle: 'Detailed Invoices of Transaction',
      path: '/invoices',
    },
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

  const handleChangePassword = () => {
    modals.open({
      title: 'Change Password',
      centered: true,
      radius: 'md',
      size: 'xs',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <NewPassword />,
    });
  };

  return (
    <Container
      size="xl"
      flex={1}
      pb={0}
      p={{ base: 'md', md: 'xl' }}
      fluid={sizeContainer === 'fluid'}
    >
      <Flex justify="space-between" align="start" gap="xl">
        <Box>
          <Title order={3}>{header.title}</Title>
          <Text size="sm">{header.subtitle}</Text>
        </Box>
        <Group gap="xs" justify="flex-end" w={131}>
          <ActionIcon size="lg" onClick={open}>
            <IconSettings size={20} />
          </ActionIcon>
          {isMobile && (
            <ActionIcon size="lg" onClick={onClickMenu}>
              <IconMenu2 />
            </ActionIcon>
          )}
        </Group>
      </Flex>
      <Drawer
        opened={opened}
        onClose={close}
        size={300}
        position="right"
        title="Settings"
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      >
        <Flex align="center" gap="xl" my="xl">
          <Text w={50} size="sm">
            Change Password
          </Text>
          <Button
            fullWidth
            size="sm"
            leftSection={<IconKey size={16} />}
            onClick={handleChangePassword}
          >
            Change Password
          </Button>
        </Flex>
        <Flex align="center" gap="xl" my="xl">
          <Text w={50} size="sm">
            Mode
          </Text>
          <SegmentedControl
            color={theme.primaryColor}
            value={computedColorScheme}
            onChange={toggleColorScheme}
            fullWidth
            flex={1}
            data={[
              {
                value: 'dark',
                label: (
                  <Center style={{ gap: 10 }}>
                    <IconMoonFilled color="black" size={20} />
                    <span>Dark</span>
                  </Center>
                ),
              },
              {
                value: 'light',
                label: (
                  <Center style={{ gap: 10 }}>
                    <span>Light</span>
                    <IconSunFilled color="yellow" size={20} />
                  </Center>
                ),
              },
            ]}
          />
        </Flex>
        <Flex align="center" gap="xl">
          <Text w={50} size="xs">
            Content Size
          </Text>
          <SegmentedControl
            color={theme.primaryColor}
            value={sizeContainer}
            onChange={(value) => updateSizeContainer(value)}
            fullWidth
            flex={1}
            data={[
              {
                value: 'fit',
                label: (
                  <Center style={{ gap: 10 }}>
                    <IconArrowsDiff size={20} />
                    <span>Fit</span>
                  </Center>
                ),
              },
              {
                value: 'fluid',
                label: (
                  <Center style={{ gap: 10 }}>
                    <span>Fluid</span>
                    <IconArrowAutofitContentFilled size={20} />
                  </Center>
                ),
              },
            ]}
          />
        </Flex>
      </Drawer>
    </Container>
  );
}

export default Header;
