import { Box, Center, Container, Title } from '@mantine/core';
import React from 'react';
import useSizeContainer from '../../helpers/useSizeContainer';

function Invoices() {
  const sizeContainer = useSizeContainer((state) => state.sizeContainer);

  return (
    <Container
      size="xl"
      flex={1}
      fluid={sizeContainer === 'fluid'}
      p={{ base: 'md', md: 'xl' }}
    >
      <Center h={500} bg="var(--mantine-color-gray-light)">
        <Box bg="var(--mantine-color-blue-light)">
          <Title order={2}>Sabar gaess API nya belum jadi :)</Title>
        </Box>
      </Center>
    </Container>
  );
}

export default Invoices;
