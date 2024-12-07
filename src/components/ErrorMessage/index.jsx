import { Text } from '@mantine/core';
import React from 'react';

function ErrorMessage({ message, ta }) {
  return (
    <Text size="xs" c="red" mt={4} ta={ta || 'center'}>
      Error: {message}
    </Text>
  );
}

export default ErrorMessage;
