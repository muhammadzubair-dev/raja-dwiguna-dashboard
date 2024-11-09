import {
  Button,
  Card,
  Container,
  Group,
  Input,
  Tabs,
  Text,
  Title,
  Badge,
  Drawer,
  ActionIcon,
  Box,
} from '@mantine/core';
import {
  IconDownload,
  IconEdit,
  IconEye,
  IconFilter,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import React from 'react';
import { useDisclosure } from '@mantine/hooks';

function Transactions() {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <Container size="xl" flex={1} p="xl">
      <Title order={3}>Transactions</Title>
      <Text size="sm" mb="xl">
        Detailed List of Financial Transactions
      </Text>
      <Tabs defaultValue="transactions">
        <Tabs.List>
          <Tabs.Tab value="transactions">Transactions</Tabs.Tab>
          <Tabs.Tab value="categories" color="blue">
            Categories
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="transactions" pt="xs">
          <Group justify="space-between" my="lg">
            <Input
              placeholder="Search Transaction"
              leftSection={<IconSearch size={16} />}
            />
            <Group justify="center">
              <Button
                onClick={open}
                leftSection={<IconFilter size={14} />}
                variant="default"
              >
                Filters
              </Button>
              <Button
                leftSection={<IconDownload size={14} />}
                variant="default"
              >
                Download
              </Button>
              <Button leftSection={<IconPlus size={18} />}>Transaction</Button>
            </Group>
          </Group>
          <Card withBorder p="lg" pt="0" radius="sm">
            <DataTable
              verticalSpacing="md"
              totalRecords={4}
              recordsPerPage={10}
              page={1}
              onPageChange={() => {}}
              records={[
                {
                  id: '1323addd-a4ac-4dd2-8de2-6f934969a0f1',
                  category: 'Projects',
                  type: 'incoming',
                  amount: '12.000.000',
                  createdAt: '2024-10-01 15:00',
                  createdBy: 'Admin',
                  description: 'lorem ipsum detail',
                },
                {
                  id: '0cf96f1c-62c9-4e3f-97b0-4a2e8fa2bf6b',
                  category: 'Corruption',
                  type: 'outgoing',
                  amount: '11.000.000',
                  createdAt: '2024-10-01 15:00',
                  createdBy: 'Admin',
                  description: 'lorem ipsum description',
                },
                {
                  id: '0cf96f1c-62c9-4e3f-97b0-4a2e8fa2bf6c',
                  category: 'Infaq',
                  type: 'outgoing',
                  amount: '9.000.000',
                  createdAt: '2024-10-01 15:00',
                  createdBy: 'Admin',
                  description: 'lorem ipsum setyawan',
                },
                {
                  id: '0cf96f1c-62c9-4e3f-97b0-4a2e8fa2bf6d',
                  category: 'Infaq',
                  type: 'incoming',
                  amount: '9.000.000',
                  createdAt: '2024-10-01 15:00',
                  createdBy: 'Admin',
                  description: 'lorem ipsum maulana',
                },
              ]}
              columns={[
                {
                  accessor: 'type',
                  render: ({ amount, type }) => (
                    <Badge
                      radius="sm"
                      color={type === 'outgoing' ? 'red' : 'green'}
                    >
                      {type}
                    </Badge>
                  ),
                },
                { accessor: 'category' },
                {
                  accessor: 'amount',
                  // render: ({ amount, type }) => (
                  //   <Text span fw="bold" c="dimmed" inherit>
                  //     {amount}
                  //   </Text>
                  // ),
                },
                { accessor: 'createdBy' },
                { accessor: 'createdAt' },
                { accessor: 'description' },
                {
                  accessor: 'actions',
                  title: <Box mr={6}></Box>,
                  textAlign: 'right',
                  render: (company) => (
                    <Group gap={4} justify="right" wrap="nowrap">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="green"
                        onClick={() => {}}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="blue"
                        onClick={() => {}}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => {}}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  ),
                },
                // {
                //   accessor: 'status',
                //   render: () => <Badge color="green">Success</Badge>,
                // },
              ]}
            />
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="categories" pt="xs">
          Second tab color is blue, it gets this value from props, props have
          the priority and will override context value
        </Tabs.Panel>
      </Tabs>
      <Drawer
        offset={8}
        radius="md"
        opened={opened}
        onClose={close}
        title="Authentication"
        position="right"
      >
        {/* Drawer content */}
      </Drawer>
    </Container>
  );
}

export default Transactions;
