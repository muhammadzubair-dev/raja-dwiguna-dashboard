import { DonutChart, PieChart } from '@mantine/charts';
import {
  ActionIcon,
  Card,
  Center,
  Flex,
  Group,
  Skeleton,
  Stack,
  Text,
  rem,
  useMantineColorScheme,
} from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { IconSearch } from '@tabler/icons-react';
import moment from 'moment';
import { useState } from 'react';
import { useQuery } from 'react-query';
import {
  useGetDashboardBarChart,
  useGetDashboardBarChartCategory,
  useGetDashboardBarChartSubCategory,
} from '../../helpers/apiHelper';
import randomColors from '../../helpers/randomColors';
import shortCurrency from '../../helpers/shortCurrency';
import classes from './index.module.css';
import DonutChartExample from './ApexDonutChart';
import ApexDonutChart from './ApexDonutChart';

const TEN_MINUTES = 600000;

const iconStyle = { width: rem(12), height: rem(12) };

function PercentageChart() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [valueMonth, setValueMonth] = useState(moment());
  const startMonth = `${moment(valueMonth)
    .startOf('month')
    .format('YYYY-MM-DD')}T00:00:00Z`;
  const endMonth = `${moment(valueMonth)
    .endOf('month')
    .format('YYYY-MM-DD')}T00:00:00Z`;

  const {
    data: dataPieChart,
    isLoading: isLoadingPieChart,
    error: errorPieChart,
    refetch: refetchPieChart,
  } = useQuery(
    ['dashboard-PieChart'],
    () =>
      useGetDashboardBarChart({
        start_date: startMonth,
        end_date: endMonth,
        formatter: 'month',
      }),
    {
      refetchInterval: TEN_MINUTES,
    }
  );

  const {
    data: dataPieChartCategory,
    isLoading: isLoadingPieChartCategory,
    error: errorPieChartCategory,
    refetch: refetchPieChartCategory,
  } = useQuery(
    ['dashboard-PieChart-category'],
    () =>
      useGetDashboardBarChartCategory({
        start_date: startMonth,
        end_date: endMonth,
        formatter: 'month',
      }),
    {
      refetchInterval: TEN_MINUTES,
    }
  );

  const {
    data: dataPieChartSubCategory,
    isLoading: isLoadingPieChartSubCategory,
    error: errorPieChartSubCategory,
    refetch: refetchPieChartSubCategory,
  } = useQuery(
    ['dashboard-PieChart-sub-category'],
    () =>
      useGetDashboardBarChartSubCategory({
        start_date: startMonth,
        end_date: endMonth,
        formatter: 'month',
      }),
    {
      refetchInterval: TEN_MINUTES,
    }
  );

  const responsePieChart = dataPieChart?.response?.[0] || null;
  const recordPieChart =
    responsePieChart &&
    Object.keys(responsePieChart)
      .filter((key) => key !== 'date')
      .map((key) => ({
        name: key === 'incoming' ? 'Debit' : 'Credit',
        value: responsePieChart[key],
        color: key === 'incoming' ? 'green' : 'red',
      }));

  const responsePieChartCategory =
    dataPieChartCategory?.response?.chart[0] || null;
  const recordPieChartCategory =
    responsePieChartCategory &&
    Object.keys(responsePieChartCategory)
      .filter((key) => key !== 'date')
      .filter((key) => responsePieChartCategory[key] !== 0)
      .map((key, index) => ({
        name: key,
        value: responsePieChartCategory[key],
        color: randomColors[index],
      }));

  const responsePieChartSubCategory =
    dataPieChartSubCategory?.response?.chart[0] || null;
  const recordPieChartSubCategory =
    responsePieChartSubCategory &&
    Object.keys(responsePieChartSubCategory)
      .filter((key) => key !== 'date')
      .filter((key) => responsePieChartSubCategory[key] !== 0)
      .map((key, index) => ({
        name: key,
        value: responsePieChartSubCategory[key],
        color: randomColors[index],
      }));

  const handleRefetch = () => {
    refetchPieChart();
    refetchPieChartCategory();
    refetchPieChartSubCategory();
  };

  return (
    <Card withBorder radius="lg" style={{ overflow: 'visible' }}>
      <Flex
        justify="space-between"
        gap="md"
        direction={{ base: 'column', md: 'row' }}
        mb={{ base: 'xl', md: 0 }}
      >
        <Stack gap={2}>
          <Text>Percentage Pie Chart</Text>
          <Text size="sm" fw={400} c="dimmed">
            Cash Flow, Categories and Subcategories
          </Text>
        </Stack>
        <Stack gap="xs" align="flex-end">
          <Flex gap={4} align="flex-start">
            <MonthPickerInput
              miw={250}
              placeholder="Select month"
              value={valueMonth}
              onChange={setValueMonth}
              //   disabled={isLoadingBarChart}
              rightSection={
                <ActionIcon
                  variant="subtle"
                  loading={
                    isLoadingPieChart ||
                    isLoadingPieChartCategory ||
                    isLoadingPieChartSubCategory
                  }
                  onClick={handleRefetch}
                >
                  <IconSearch size={14} />
                </ActionIcon>
              }
            />
          </Flex>
        </Stack>
      </Flex>
      <Group justify="space-evenly">
        <Skeleton flex={1.5} visible={isLoadingPieChart}>
          <Group
            gap="xs"
            align="center"
            justify="center"
            // dark4 / gray3
            style={{
              borderRight: `3px solid var(--mantine-color-${
                isDark ? 'dark-4' : 'gray-3'
              })
            `,
            }}
          >
            <Text>Cash Flow</Text>
            {errorPieChart ? (
              <Center>
                <Text c="red">Error: {errorPieChart?.message}</Text>
              </Center>
            ) : (
              <PieChart
                // withLabelsLine
                // size={150}
                // labelsPosition="outside"
                style={{ width: 300 }}
                valueFormatter={(value) => shortCurrency(value)}
                labelsType="percent"
                withLabels
                withTooltip
                data={recordPieChart || []}
              />
            )}
          </Group>
        </Skeleton>
        <Skeleton flex={1} visible={isLoadingPieChartCategory}>
          {errorPieChartCategory ? (
            <Text c="red">Error: {errorPieChartCategory?.message}</Text>
          ) : (
            // <DonutChart
            //   withLabelsLine
            //   withLabels
            //   valueFormatter={(value) => shortCurrency(value)}
            //   style={{ width: 300 }}
            //   paddingAngle={5}
            //   withTooltip
            //   labelsType="percent"
            //   data={recordPieChartCategory || []}
            //   chartLabel="Category"
            // />
            <Flex
              justify="center"
              align="center"
              direction={{ base: 'column', md: 'row' }}
              gap="xs"
            >
              <Text>Categories</Text>
              <ApexDonutChart
                title="Category"
                legendPosition="bottom"
                series={(recordPieChartCategory || []).map(
                  (item) => item.value
                )}
                labels={(recordPieChartCategory || []).map((item) => item.name)}
              />
            </Flex>
          )}
        </Skeleton>
        <Skeleton flex={1} visible={isLoadingPieChartSubCategory}>
          {/* <Center> */}
          {errorPieChartSubCategory ? (
            <Text c="red">Error: {errorPieChartSubCategory?.message}</Text>
          ) : (
            // <DonutChart
            //   withLabelsLine
            //   withLabels
            //   valueFormatter={(value) => shortCurrency(value, false)}
            //   style={{ width: 300 }}
            //   paddingAngle={5}
            //   withTooltip
            //   labelsType="percent"
            //   data={recordPieChartSubCategory || []}
            //   chartLabel="Sub Category"
            // />
            <Flex
              justify="center"
              align="center"
              direction={{ base: 'column', md: 'row' }}
              gap="xs"
            >
              <Text>Sub Categories</Text>
              <ApexDonutChart
                title="Sub Category"
                legendPosition="bottom"
                series={(recordPieChartSubCategory || []).map(
                  (item) => item.value
                )}
                labels={(recordPieChartSubCategory || []).map(
                  (item) => item.name
                )}
              />
            </Flex>
          )}
          {/* </Center> */}
        </Skeleton>
      </Group>
    </Card>
  );
}

export default PercentageChart;
