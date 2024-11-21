import {
  ActionIcon,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Fieldset,
  Grid,
  Group,
  Select,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import React, { useState } from 'react';
import useSizeContainer from '../../helpers/useSizeContainer';
import { DatePickerInput } from '@mantine/dates';
import {
  IconCalendar,
  IconEdit,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';

function Invoices() {
  const sizeContainer = useSizeContainer((state) => state.sizeContainer);
  const [value, setValue] = useState(null);

  return (
    <Container
      size="xl"
      flex={1}
      fluid={sizeContainer === 'fluid'}
      p={{ base: 'md', md: 'xl' }}
    >
      <Fieldset mb="md" legend={<Title order={4}>Client Information</Title>}>
        <Select
          label="Client"
          placeholder="Select Client"
          data={['Hanzo', 'Tigreal', 'Eudora', 'Sugiwa']}
          searchable
        />
      </Fieldset>
      <Fieldset mb="md" legend={<Title order={4}>Invoice Details</Title>}>
        <Grid mb="md">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput flex={1} label="Invoice Number" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <DatePickerInput
              rightSection={<IconCalendar size={18} />}
              label="Invoice Date"
              value={value}
              onChange={setValue}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <DatePickerInput
              rightSection={<IconCalendar size={18} />}
              label="Due Date"
              value={value}
              onChange={setValue}
            />
          </Grid.Col>
        </Grid>
        <Textarea label="Additional Notes" />
      </Fieldset>
      <Fieldset mb="md" legend={<Title order={4}>Invoice Items</Title>}>
        <Group mb="sm" justify="flex-end">
          <Button
            variant="light"
            size="xs"
            leftSection={<IconPlus size={18} />}
          >
            Item
          </Button>
        </Group>
        <DataTable
          columns={[
            { accessor: 'description' },
            { accessor: 'quantity' },
            { accessor: 'unit_price', noWrap: true },
            { accessor: 'amount', noWrap: true },
            {
              accessor: '',
              render: () => (
                <Group gap={4} justify="right" wrap="nowrap">
                  <ActionIcon size="sm" variant="subtle" color="blue">
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon size="sm" variant="subtle" color="red">
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ),
            },
          ]}
          records={[
            {
              description: 'Item 1',
              quantity: 1,
              unit_price: 'Rp. 12.000.000',
              amount: 'Rp. 12.000.000',
            },
            {
              description: 'Item 2',
              quantity: 2,
              unit_price: 'Rp. 12.000.000',
              amount: 'Rp. 24.000.000',
            },
            {
              description: 'Item 3',
              quantity: 1,
              unit_price: 'Rp. 12.000.000',
              amount: 'Rp. 12.000.000',
            },
          ]}
        />
        <Group mb="sm" mt="xl" justify="flex-end">
          <Box w={300}>
            <Group justify="space-between">
              <Text>Subtotal</Text>
              <Text>Rp. 12.000.000</Text>
            </Group>
            <Group justify="space-between">
              <Text>Tax (11%)</Text>
              <Text>Rp. 12.000</Text>
            </Group>
            <Divider my="md" />
            <Group justify="space-between">
              <Title order={4}>Total</Title>
              <Title order={4}>Rp. 12.012.000</Title>
            </Group>
          </Box>
        </Group>
      </Fieldset>
      <Group justify="flex-end">
        <Button>Submit</Button>
      </Group>
    </Container>
  );
}

export default Invoices;
