import { BarChart } from '@mantine/charts';
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
  rem,
} from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { IconBuildingBank, IconCoin, IconMoneybag } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';

const data = [
  { month: 'January', Income: 1200, Outgoing: 900 },
  { month: 'February', Income: 1900, Outgoing: 1200 },
  { month: 'March', Income: 400, Outgoing: 1000 },
  { month: 'April', Income: 1000, Outgoing: 200 },
  { month: 'May', Income: 800, Outgoing: 1400 },
  { month: 'June', Income: 750, Outgoing: 600 },
];

const dataCard = [
  {
    title: 'Net Profit',
    color: 'green',
    icon: <IconBuildingBank size={35} stroke={1.5} />,
  },
  {
    title: 'Total Income',
    color: 'blue',
    icon: <IconMoneybag size={35} stroke={1.5} />,
  },
  {
    title: 'Total Outgoing',
    color: 'red',
    icon: <IconCoin size={35} stroke={1.5} />,
  },
];

const iconStyle = { width: rem(12), height: rem(12) };

function Dashboard() {
  const [value, setValue] = useState([null, null]);
  return (
    <Container size="xl" flex={1} p="xl">
      <Title order={3}>Dashboard</Title>
      <Text size="sm" mb="xl">
        Monitor and measure your financial performance
      </Text>
      <Grid gutter="md">
        {dataCard.map(({ title, icon, color }) => (
          <Grid.Col span={3} key={title}>
            <Card withBorder p="lg" radius="lg">
              <Stack h={95} justify="center">
                <Flex gap="lg" align="center">
                  <ThemeIcon radius="lg" size={60} color={color}>
                    {icon}
                  </ThemeIcon>
                  <Box>
                    <Text c="dimmed">{title}</Text>
                    <Title order={4}>Rp 12,500k</Title>
                  </Box>
                </Flex>
                <Text c="dimmed" lineClamp={1}>
                  <Text span c={color} fw="bold" inherit>
                    250{' '}
                  </Text>
                  total transactions for the current month
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
        <Grid.Col span={3}>
          <Card withBorder radius="lg">
            <BarChart
              h={100}
              data={[
                {
                  month: 'Total',
                  Incoming: 1200,
                  Outgoing: 900,
                },
              ]}
              dataKey="month"
              orientation="vertical"
              withLegend
              withYAxis={false}
              // withXAxis={false}
              gridAxis="none"
              // yAxisProps={{ width: 80 }}
              minBarSize={5}
              // withBarValueLabel
              barProps={{ radius: 5 }}
              withTooltip={false}
              series={[
                { name: 'Incoming', color: 'blue.6' },
                { name: 'Outgoing', color: 'red.6' },
              ]}
            />
          </Card>
        </Grid.Col>

        <Grid.Col span={12}>
          <Card withBorder radius="lg">
            <Flex justify="space-between" mb="xl">
              <Box>
                <Text>Cash Flow</Text>
                <Text size="sm" c="dimmed">
                  Monthly Income and Outgoing
                </Text>
              </Box>
              <MonthPickerInput
                type="range"
                placeholder="Select month range"
                value={value}
                onChange={setValue}
              />
            </Flex>
            <BarChart
              h={300}
              data={data}
              dataKey="month"
              withLegend
              series={[
                { name: 'Income', color: 'violet.6' },
                { name: 'Outgoing', color: 'blue.6' },
              ]}
            />
          </Card>
        </Grid.Col>
        <Grid.Col span={8}>
          <Card withBorder pb="xl" radius="lg">
            <Text>Recent Transaction</Text>
            <Text size="sm" c="dimmed" mb="xs">
              Monthly Income and Outgoing
            </Text>
            <DataTable
              verticalSpacing="md"
              records={[
                {
                  id: '1323addd-a4ac-4dd2-8de2-6f934969a0f1',
                  category: 'Projects',
                  amount: '12.000.000',
                  createdAt: '2024-10-01 15:00',
                  description: 'lorem ipsum detail',
                },
                {
                  id: '0cf96f1c-62c9-4e3f-97b0-4a2e8fa2bf6b',
                  category: 'Corruption',
                  amount: '11.000.000',
                  createdAt: '2024-10-01 15:00',
                  description: 'lorem ipsum description',
                },
                {
                  id: '0cf96f1c-62c9-4e3f-97b0-4a2e8fa2bf6c',
                  category: 'Infaq',
                  amount: '9.000.000',
                  createdAt: '2024-10-01 15:00',
                  description: 'lorem ipsum setyawan',
                },
                {
                  id: '0cf96f1c-62c9-4e3f-97b0-4a2e8fa2bf6d',
                  category: 'Infaq',
                  amount: '9.000.000',
                  createdAt: '2024-10-01 15:00',
                  description: 'lorem ipsum maulana',
                },
              ]}
              columns={[
                { accessor: 'category' },
                { accessor: 'amount' },
                { accessor: 'createdAt' },
                { accessor: 'description' },
                // {
                //   accessor: 'status',
                //   render: () => <Badge color="green">Success</Badge>,
                // },
              ]}
            />
            <Button variant="outline" color="black" mt="lg" w={200}>
              See all Transactions
            </Button>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card withBorder radius="lg">
            <Text ta="right" mb="md">
              Top Transactions
            </Text>
            <Tabs
              defaultValue="top-incoming"
              classcategorys={{
                root: '--tabs-color: var(--mantine-color-red-filled)',
              }}
            >
              <Tabs.List>
                <Tabs.Tab
                  value="top-incoming"
                  leftSection={<IconMoneybag style={iconStyle} />}
                >
                  Incoming
                </Tabs.Tab>
                <Tabs.Tab
                  value="top-outgoing"
                  leftSection={<IconCoin style={iconStyle} />}
                >
                  Outgoing
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="top-incoming">
                <DataTable
                  verticalSpacing="md"
                  records={[
                    {
                      id: '1323addd-a4ac-4dd2-8de2-6f934969a0f1',
                      category: 'Isagi Yoichi',
                      amount: '12.600k',
                    },
                    {
                      id: '0cf96f1c-62c9-4e3f-97b0-4a2e8fa2bf6b',
                      category: 'Prabowo Subianto',
                      amount: '10.200k',
                    },
                    {
                      id: '0cf96f1c-62c9-4e3f-97b0-4a2e8fa2bf6z',
                      category: 'Budi Sudarsono',
                      amount: '9.700k',
                    },
                    {
                      id: '0cf96f1c-62c9-4e3f-97b0-4a2e8fa2bf6x',
                      category: '-',
                      amount: '-',
                    },
                    {
                      id: '0cf96f1c-62c9-4e3f-97b0-4a2e8fa2bf6cS',
                      category: '-',
                      amount: '-',
                    },
                  ]}
                  columns={[{ accessor: 'category' }, { accessor: 'amount' }]}
                />
              </Tabs.Panel>

              <Tabs.Panel value="top-outgoing">Messages tab content</Tabs.Panel>
            </Tabs>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default Dashboard;
