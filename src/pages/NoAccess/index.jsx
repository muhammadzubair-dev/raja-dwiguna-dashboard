import { Center, Title } from '@mantine/core';
import React from 'react';

function NoAccess() {
  return (
    <Center h={500}>
      <Title order={3}>You do not have access to this page</Title>
    </Center>
  );
}

export default NoAccess;
