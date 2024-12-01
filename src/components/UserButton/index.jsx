import {
  UnstyledButton,
  Group,
  Avatar,
  Text,
  rem,
  Skeleton,
} from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import classes from './index.module.css';

function UserButton({ data, isLoadingProfile }) {
  return (
    <UnstyledButton className={classes.user}>
      <Group>
        <Skeleton w={38} radius="xl" visible={isLoadingProfile}>
          <Avatar radius="xl" color="cyan">
            {`${data?.first_name[0]}${data?.last_name[0]}`}
          </Avatar>
        </Skeleton>

        <div style={{ flex: 1 }}>
          <Skeleton visible={isLoadingProfile}>
            <Text size="sm" fw={500}>
              {`${data?.first_name} ${data?.last_name}`}
            </Text>
          </Skeleton>
          <Skeleton h={15} visible={isLoadingProfile}>
            <Text c="dimmed" size="xs">
              {data?.email}
            </Text>
          </Skeleton>
        </div>

        <IconChevronRight
          style={{ width: rem(14), height: rem(14) }}
          stroke={1.5}
        />
      </Group>
    </UnstyledButton>
  );
}

export default UserButton;
