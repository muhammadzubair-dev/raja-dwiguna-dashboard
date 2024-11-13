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

const activeStylesLight = {
  backgroundColor: 'var(--mantine-color-blue-0)',
  color: 'var(--mantine-color-blue-7)',
  fontWeight: 700,
  borderRight: '4px solid var(--mantine-color-blue-7)',
};

const activeStylesDark = {
  backgroundColor: 'var(--mantine-color-blue-7)',
  color: 'var(--mantine-color-white)',
  fontWeight: 700,
  borderRight: '4px solid var(--mantine-color-white)',
};

export function LinksGroup({
  icon: Icon,
  label,
  initiallyOpened,
  links,
  toLink,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);
  const computedColorScheme = useComputedColorScheme('light');

  const activeStyles =
    computedColorScheme === 'dark' ? activeStylesDark : activeStylesLight;

  const handleClick = () => {
    if (hasLinks) {
      setOpened((prev) => !prev);
    } else {
      if (label === 'Logout') {
        localStorage.removeItem('token');
        setTimeout(() => {
          window.location.replace('/');
        }, 500);
      } else {
        navigate(toLink);
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
            <ThemeIcon variant="light" size={30}>
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
                transform: opened ? 'rotate(-90deg)' : 'none',
              }}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}

export default LinksGroup;
