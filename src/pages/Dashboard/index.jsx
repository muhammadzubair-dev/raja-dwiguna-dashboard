import { BarChart } from '@mantine/charts';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Flex,
  Grid,
  NumberFormatter,
  NumberInput,
  Skeleton,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
  rem,
} from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import {
  IconBuildingBank,
  IconCoin,
  IconMoneybag,
  IconSearch,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import {
  useGetDashboardIncome,
  useGetDashboardOutcome,
  useGetDashboardBalance,
  useGetDashboardBarChart,
  useGetDashboardTopIncome,
  useGetDashboardTopOutcome,
  useGetTransactions,
} from '../../helpers/apiHelper';
import { useNavigate } from 'react-router-dom';

const TEN_MINUTES = 600000;

const iconStyle = { width: rem(12), height: rem(12) };

function Dashboard() {
  const navigate = useNavigate();
  const start_date = moment().utc().startOf('month').format();
  const end_date = moment().utc().endOf('month').format();
  const start_date_prev_six_month = moment()
    .startOf('month')
    .subtract(6, 'months');

  const start_date_prev_current_month = moment().endOf('month');

  const [valueBarChart, setValueBarChart] = useState([
    start_date_prev_six_month,
    start_date_prev_current_month,
  ]);

  const {
    data: dataIncome,
    isLoading: isLoadingIncome,
    error: errorIncome,
  } = useQuery(
    ['dashboard-income', start_date, end_date],
    () =>
      useGetDashboardIncome({
        start_date,
        end_date,
      }),
    {
      refetchInterval: TEN_MINUTES,
    }
  );

  const {
    data: dataOutcome,
    isLoading: isLoadingOutcome,
    error: errorOutcome,
  } = useQuery(
    ['dashboard-outcome', start_date, end_date],
    () =>
      useGetDashboardOutcome({
        start_date,
        end_date,
      }),
    {
      refetchInterval: TEN_MINUTES,
    }
  );

  const {
    data: dataBalance,
    isLoading: isLoadingBalance,
    error: errorBalance,
  } = useQuery(
    ['dashboard-balance', start_date, end_date],
    () =>
      useGetDashboardBalance({
        start_date,
        end_date,
      }),
    {
      refetchInterval: TEN_MINUTES,
    }
  );

  const {
    data: dataBarChart,
    isLoading: isLoadingBarChart,
    error: errorBarChart,
    refetch: refetchBarChart,
  } = useQuery(
    ['dashboard-BarChart'],
    () =>
      useGetDashboardBarChart({
        start_date: moment(valueBarChart[0]).utc().format(),
        end_date: moment(valueBarChart[1]).utc().format(),
        formatter: 'month',
      }),
    {
      refetchInterval: TEN_MINUTES,
      enabled: false,
    }
  );

  const {
    data: dataTopIncome,
    isLoading: isLoadingTopIncome,
    error: errorTopIncome,
  } = useQuery(
    ['dashboard-top-income', start_date, end_date],
    () =>
      useGetDashboardTopIncome({
        start_date,
        end_date,
      }),
    {
      refetchInterval: TEN_MINUTES,
    }
  );

  const {
    data: dataTopOutcome,
    isLoading: isLoadingTopOutcome,
    error: errorTopOutcome,
  } = useQuery(
    ['dashboard-top-outcome', start_date, end_date],
    () =>
      useGetDashboardTopOutcome({
        start_date,
        end_date,
      }),
    {
      refetchInterval: TEN_MINUTES,
    }
  );

  const {
    data: dataTransactions,
    isLoading: isLoadingTransactions,
    error: errorTransactions,
  } = useQuery(
    ['transactions', 1, 4],
    () =>
      useGetTransactions({
        limit: 4,
        page: 1,
      }),
    {
      refetchInterval: TEN_MINUTES,
    }
  );

  const recordTransactions = dataTransactions?.response?.data.map((item) => ({
    id: item.id,
    amount: item.amount,
    list_category: item.list_category.is_income,
    category: item.list_category.name,
    sub_category: item.list_sub_category.name,
    bank_name: item.list_account.bank_name,
    description: item.description,
    created_at: item.created_at,
    account_id: item.list_account.id,
    category_id: item.list_category.id,
    sub_category_id: item.list_sub_category.id,
    reference_number: item.reference_number,
    created_by: item.list_employee.email,
  }));

  const recordBarChart = dataBarChart?.response?.map((item) => ({
    month: item.date,
    Income: item.incoming,
    Outcome: item.outcoming,
  }));

  const dataCard = [
    {
      title: 'Total Outcome',
      color: 'red',
      data: dataOutcome?.response,
      isLoading: isLoadingOutcome,
      error: errorOutcome?.message,
      subtitle: ' transactions for the current month',
      icon: <IconCoin size={35} stroke={1.5} />,
    },
    {
      title: 'Total Income',
      color: 'blue',
      data: dataIncome?.response,
      isLoading: isLoadingIncome,
      error: errorIncome?.message,
      subtitle: ' transactions for the current month',
      icon: <IconMoneybag size={35} stroke={1.5} />,
    },
    {
      title: 'Balance',
      color: 'green',
      data: dataBalance?.response,
      isLoading: isLoadingBalance,
      error: errorBalance?.message,
      subtitle: ' account banks',
      icon: <IconBuildingBank size={35} stroke={1.5} />,
    },
  ];

  useEffect(() => {
    refetchBarChart();
  }, []);

  return (
    <Container flex={1} p="xl">
      <Grid gutter="md">
        {dataCard.map(
          ({ title, icon, color, data, isLoading, error, subtitle }) => (
            <Grid.Col span={4} key={title}>
              <Card withBorder p="lg" radius="lg">
                <Stack h={95} justify="center">
                  <Flex gap="lg" align="center">
                    <ThemeIcon radius="lg" size={60} color={color}>
                      {icon}
                    </ThemeIcon>
                    <Box>
                      <Text c="dimmed">{title}</Text>
                      <Skeleton visible={isLoading}>
                        <NumberFormatter
                          style={{ fontSize: 20, fontWeight: 600 }}
                          value={
                            error
                              ? 0
                              : title === 'Balance'
                              ? data?.total
                              : data?.amount
                          }
                          prefix="Rp "
                          decimalScale={2}
                          thousandSeparator="."
                          decimalSeparator=","
                        />
                      </Skeleton>
                    </Box>
                  </Flex>
                  <Skeleton visible={isLoading}>
                    {error ? (
                      <Text c="red" lineClamp={1}>
                        Error:{error}
                      </Text>
                    ) : (
                      <Text size="sm" fw={400} c="dimmed" lineClamp={1}>
                        <Text span c={color} fw="bold" inherit>
                          {title === 'Balance'
                            ? (data?.accounts || []).length
                            : data?.total}
                        </Text>
                        {subtitle}
                      </Text>
                    )}
                  </Skeleton>
                </Stack>
              </Card>
            </Grid.Col>
          )
        )}

        <Grid.Col span={12}>
          <Card withBorder radius="lg">
            <Flex justify="space-between" mb="xl">
              <Box>
                <Text>Cash Flow</Text>
                <Text size="sm" c="dimmed">
                  Monthly Income and Outcome
                </Text>
              </Box>
              <Flex gap={4} align="flex-start">
                <MonthPickerInput
                  type="range"
                  placeholder="Select month range"
                  value={valueBarChart}
                  onChange={setValueBarChart}
                  disabled={isLoadingBarChart}
                  rightSection={
                    <ActionIcon
                      variant="subtle"
                      loading={isLoadingBarChart}
                      onClick={refetchBarChart}
                    >
                      <IconSearch size={14} />
                    </ActionIcon>
                  }
                />
              </Flex>
            </Flex>
            <Skeleton visible={isLoadingBarChart}>
              {errorBarChart ? (
                <Center h={300}>
                  <Text c="red">Error: {errorBarChart?.message}</Text>
                </Center>
              ) : (
                <BarChart
                  h={300}
                  data={recordBarChart || []}
                  dataKey="month"
                  withLegend
                  series={[
                    { name: 'Income', color: 'violet.6' },
                    { name: 'Outcome', color: 'blue.6' },
                  ]}
                />
              )}
            </Skeleton>
          </Card>
        </Grid.Col>
        <Grid.Col span={8}>
          <Card withBorder pb="xl" radius="lg">
            <Text>Recent Transaction</Text>
            <Text size="sm" c="dimmed" mb="xs">
              Monthly Income and Outcome
            </Text>

            <DataTable
              verticalSpacing="md"
              fetching={isLoadingTransactions}
              records={recordTransactions}
              minHeight={280}
              noRecordsText={
                errorTransactions
                  ? `Error: ${errorTransactions?.message}`
                  : 'No records found'
              }
              columns={[
                // {
                //   accessor: 'index',
                //   title: 'No',
                //   textAlign: 'center',
                //   width: 40,
                //   render: (record) => recordTransactions.indexOf(record) + 1,
                // },
                {
                  accessor: 'is_income',
                  title: 'Type',
                  render: ({ is_income }) => (
                    <Badge
                      variant="outline"
                      radius="xl"
                      color={is_income ? 'green' : 'red'}
                    >
                      {is_income ? 'Income' : 'Outcome'}
                    </Badge>
                  ),
                },
                { accessor: 'bank_name' },
                { accessor: 'category' },
                // { accessor: 'sub_category' },
                {
                  accessor: 'amount',
                  render: ({ amount }) => (
                    <NumberFormatter
                      value={amount}
                      prefix="Rp "
                      decimalScale={2}
                      thousandSeparator="."
                      decimalSeparator=","
                    />
                  ),
                },
                { accessor: 'description' },
                // { accessor: 'reference_number' },
                { accessor: 'created_by' },
                {
                  accessor: 'created_at',
                  render: ({ created_at }) => (
                    <Text>{moment(created_at).format('YYYY-MM-DD HH:mm')}</Text>
                  ),
                },
              ]}
            />

            <Button
              variant="outline"
              mt="lg"
              w={200}
              onClick={() => navigate('/transactions')}
            >
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
                  value="top-outcome"
                  leftSection={<IconCoin style={iconStyle} />}
                >
                  Outcome
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="top-incoming">
                <DataTable
                  verticalSpacing="md"
                  minHeight={325}
                  fetching={isLoadingTopIncome}
                  records={dataTopIncome?.response}
                  noRecordsText={
                    errorTopIncome
                      ? `Error: ${errorTopIncome?.message}`
                      : 'No records found'
                  }
                  columns={[
                    {
                      accessor: 'index',
                      title: 'No',
                      textAlign: 'center',
                      width: 40,
                      render: (record) =>
                        dataTopIncome?.response.indexOf(record) + 1,
                    },
                    { accessor: 'category' },
                    {
                      accessor: 'amount',
                      render: ({ amount }) => (
                        <NumberFormatter
                          value={amount}
                          prefix="Rp "
                          decimalScale={2}
                          thousandSeparator="."
                          decimalSeparator=","
                        />
                      ),
                    },
                  ]}
                />
              </Tabs.Panel>

              <Tabs.Panel value="top-outcome">
                <DataTable
                  verticalSpacing="md"
                  minHeight={325}
                  fetching={isLoadingTopOutcome}
                  records={dataTopOutcome?.response}
                  noRecordsText={
                    errorTopOutcome
                      ? `Error: ${errorTopOutcome?.message}`
                      : 'No records found'
                  }
                  columns={[
                    {
                      accessor: 'index',
                      title: 'No',
                      textAlign: 'center',
                      width: 40,
                      render: (record) =>
                        dataTopOutcome?.response.indexOf(record) + 1,
                    },
                    { accessor: 'category' },
                    {
                      accessor: 'amount',
                      render: ({ amount }) => (
                        <NumberFormatter
                          value={amount}
                          prefix="Rp "
                          decimalScale={2}
                          thousandSeparator="."
                          decimalSeparator=","
                        />
                      ),
                    },
                  ]}
                />
              </Tabs.Panel>
            </Tabs>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default Dashboard;
