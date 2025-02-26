import {
  Box,
  Button,
  Card,
  Center,
  Container,
  Flex,
  Group,
  Loader,
  Select,
  Stack,
} from '@mantine/core';
import { MonthPickerInput, YearPickerInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
  IconCalendar,
  IconDownload,
  IconFileSearch,
  IconFilter,
} from '@tabler/icons-react';
import moment from 'moment';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import ErrorMessage from '../../components/ErrorMessage';
import { useGetReportBalance, useGetReports } from '../../helpers/apiHelper';
import exportToPDF from '../../helpers/exportToPDF';
import useSizeContainer from '../../helpers/useSizeContainer';
import CashFlow from './CashFlow';
import ProfitAndLoss from './ProfitAndLoss';

function FilterReports({
  selectedInterval,
  setSelectedInterval,
  setSelectedReport,
  selectedMonth,
  selectedReport,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  refetch,
  isLoading,
}) {
  return (
    <>
      <Select
        placeholder="Select Reports"
        value={selectedReport}
        data={[
          { label: 'Cash Flow', value: 'cash-flow' },
          { label: 'Profit And Loss', value: 'profit-and-loss' },
        ]}
        onChange={setSelectedReport}
      />
      <Select
        placeholder="Select Period"
        value={selectedInterval}
        data={[
          { label: 'Monthly', value: 'month' },
          { label: 'Yearly', value: 'year' },
        ]}
        onChange={setSelectedInterval}
      />
      {selectedInterval === 'year' && (
        <YearPickerInput
          miw={150}
          maxDate={new Date()}
          leftSection={<IconCalendar size={16} />}
          leftSectionPointerEvents="none"
          placeholder="Select Month"
          value={selectedYear}
          onChange={setSelectedYear}
        />
      )}
      {selectedInterval === 'month' && (
        <MonthPickerInput
          miw={200}
          maxDate={new Date()}
          leftSection={<IconCalendar size={16} />}
          leftSectionPointerEvents="none"
          placeholder="Select Month"
          value={selectedMonth}
          onChange={setSelectedMonth}
        />
      )}
      <Button
        onClick={refetch}
        loading={isLoading}
        leftSection={<IconFileSearch size={16} />}
      >
        Search
      </Button>
    </>
  );
}

function Reports() {
  const isMobile = useMediaQuery(`(max-width: 1100px)`);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date());
  const [selectedInterval, setSelectedInterval] = useState('month');
  const [currentReport, setCurrentReport] = useState('profit-and-loss');
  const [selectedReport, setSelectedReport] = useState('profit-and-loss');
  const sizeContainer = useSizeContainer((state) => state.sizeContainer);
  const interval = selectedInterval === 'month' ? selectedMonth : selectedYear;

  const startMonth = moment(interval).startOf(selectedInterval);
  const endMonth = moment(interval).endOf(selectedInterval);

  const { data, isLoading, refetch, error, isFetching } = useQuery(
    ['reports-cash-flow'],
    () =>
      useGetReports({
        start_date: `${startMonth.format('YYYY-MM-DD')}T00:00:00Z`,
        end_date: `${endMonth.format('YYYY-MM-DD')}T00:00:00Z`,
        report_name: selectedReport,
      }),
    {
      onSuccess: () => {
        refetchBalance();
        setCurrentReport(selectedReport);
      },
    }
  );

  const {
    data: dataBalance,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
    error: errorBalance,
  } = useQuery(['reports-cash-flow-balance'], () =>
    useGetReportBalance({
      start_date: `${startMonth.format('YYYY-MM-DD')}T00:00:00Z`,
      end_date: `${endMonth.format('YYYY-MM-DD')}T00:00:00Z`,
    })
  );

  const handleFilter = () => {
    modals.open({
      title: 'Filter Reports',
      centered: true,
      size: 'xs',
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <Stack gap="md">
          <FilterReports
            refetch={refetch}
            isLoading={isLoading}
            selectedInterval={selectedInterval}
            setSelectedInterval={setSelectedInterval}
            selectedMonth={selectedMonth}
            selectedReport={selectedReport}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            setSelectedMonth={setSelectedMonth}
            setSelectedReport={setSelectedReport}
          />
        </Stack>
      ),
    });
  };

  return (
    <Container
      size="xl"
      flex={1}
      fluid={sizeContainer === 'fluid'}
      p={{ base: 'md', md: 'xl' }}
    >
      <Group justify="space-between" mb="lg">
        {isMobile ? (
          <Button
            variant="light"
            onClick={handleFilter}
            leftSection={<IconFilter size={18} />}
          >
            Filter
          </Button>
        ) : (
          <Flex gap="sm">
            <FilterReports
              refetch={refetch}
              isLoading={isLoading}
              selectedInterval={selectedInterval}
              setSelectedInterval={setSelectedInterval}
              selectedMonth={selectedMonth}
              selectedReport={selectedReport}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              setSelectedMonth={setSelectedMonth}
              setSelectedReport={setSelectedReport}
            />
          </Flex>
        )}
        <Group justify="flex-end">
          <Button
            onClick={() => exportToPDF(currentReport)}
            leftSection={<IconDownload size={14} />}
            variant="default"
          >
            Download
          </Button>
        </Group>
      </Group>
      <Card withBorder p={{ base: 'xs', md: 'xl' }} radius="sm">
        <Container w="100%" maw={1100} p={0}>
          {(isLoading || isFetching) && (
            <Center mih={300}>
              <Loader />
            </Center>
          )}
          {!isLoading && !isFetching && error && (
            <Center mih={300}>
              <ErrorMessage message={error?.message} />
            </Center>
          )}
          {!isLoading && !isFetching && !error && (
            <>
              {currentReport === 'profit-and-loss' && (
                <ProfitAndLoss
                  startMonth={startMonth}
                  selectedMonth={selectedMonth}
                  endMonth={endMonth}
                  data={data?.response || []}
                />
              )}
              {currentReport === 'cash-flow' && (
                <CashFlow
                  startMonth={startMonth}
                  selectedMonth={selectedMonth}
                  dataBalance={dataBalance?.response || 0}
                  endMonth={endMonth}
                  data={data?.response || []}
                />
              )}
            </>
          )}
        </Container>
        <Box h={50} />
      </Card>
    </Container>
  );
}

export default Reports;
