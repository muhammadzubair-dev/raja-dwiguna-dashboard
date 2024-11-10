import { useState } from 'react';
import {
  Group,
  Box,
  Collapse,
  ThemeIcon,
  Text,
  UnstyledButton,
  rem,
} from '@mantine/core';
import { IconCalendarStats, IconChevronRight } from '@tabler/icons-react';
import classes from './index.module.css';
import { useNavigate } from 'react-router-dom';

export function LinksGroup({
  icon: Icon,
  label,
  initiallyOpened,
  links,
  toLink,
}) {
  const navigate = useNavigate();
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);

  const items = (hasLinks ? links : []).map((link) => (
    <Text
      component="a"
      className={classes.link}
      key={link.label}
      onClick={(event) => {
        event.preventDefault();
        navigate(link.link);
      }}
    >
      {link.label}
    </Text>
  ));

  return (
    <>
      <UnstyledButton
        onClick={
          hasLinks
            ? () => setOpened((o) => !o)
            : () => {
                if (label === 'Logout') {
                  localStorage.removeItem('token');
                  setTimeout(() => {
                    window.location.replace('/');
                  }, 500);
                } else {
                  navigate(toLink);
                }
              }
        }
        className={classes.control}
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
