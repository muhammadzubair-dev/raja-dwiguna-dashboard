import { Text } from '@mantine/core';
import React from 'react';

function ErrorMessage({ message }) {
  return (
    <Text size="xs" c="red" mt={4} ta="center">
      {message}
    </Text>
  );
}

export default ErrorMessage;
