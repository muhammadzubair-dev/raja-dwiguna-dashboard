import {
  Box,
  Collapse,
  Group,
  Text,
  ThemeIcon,
  UnstyledButton,
  rem,
  useComputedColorScheme,
} from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classes from './index.module.css';
import { modals } from '@mantine/modals';

const activeStylesLight = {
  backgroundColor: 'var(--mantine-color-blue-0)',
  color: 'var(--mantine-color-blue-7)',
  fontWeight: 700,
  borderRight: '4px solid var(--mantine-color-blue-7)',
};

const activeStylesDark = {
  backgroundColor:
    'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8)',
  color: 'var(--mantine-color-white)',
  fontWeight: 700,
  borderRight: '4px solid var(--mantine-color-blue-7)',
};

export function LinksGroup({
  icon: Icon,
  label,
  initiallyOpened,
  links,
  toLink,
  onCollapse,
  onCloseMenu,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasLinks = Array.isArray(links);
  const computedColorScheme = useComputedColorScheme('light');

  const activeStyles =
    computedColorScheme === 'dark' ? activeStylesDark : activeStylesLight;

  const handleLogout = () =>
    modals.openConfirmModal({
      title: 'Logout',
      centered: true,
      children: <Text size="sm">Are you sure you want to Logout ?</Text>,
      labels: { confirm: 'Logout', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onCancel: () => modals.closeAll(),
      onConfirm: () => {
        localStorage.removeItem('token');
        setTimeout(() => {
          window.location.replace('/');
        }, 500);
      },
    });

  const handleClick = () => {
    if (hasLinks) {
      onCollapse(label);
    } else {
      if (label === 'Logout') {
        handleLogout();
      } else {
        navigate(toLink);
        onCloseMenu();
      }
    }
  };

  const items = (hasLinks ? links : []).map((link) => (
    <Text
      component="a"
      className={classes.link}
      key={link.label}
      onClick={(event) => {
        event.preventDefault();
        navigate(link.link);
        onCloseMenu();
      }}
      style={{
        ...(location.pathname === link.link && activeStyles),
      }}
    >
      {link.label}
    </Text>
  ));

  return (
    <>
      <UnstyledButton
        onClick={handleClick}
        className={classes.control}
        style={{
          ...(location.pathname === toLink && activeStyles),
        }}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeIcon variant={computedColorScheme} size={30}>
              <Icon style={{ width: rem(18), height: rem(18) }} />
            </ThemeIcon>
            <Box ml="md">{label}</Box>
          </Box>
          {hasLinks && (
            <IconChevronRight
              className={classes.chevron}
              stroke={1.5}
              style={{
                width: rem(16),
                height: rem(16),
                transform: initiallyOpened ? 'rotate(-90deg)' : 'none',
              }}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks ? <Collapse in={initiallyOpened}>{items}</Collapse> : null}
    </>
  );
}

export default LinksGroup;
