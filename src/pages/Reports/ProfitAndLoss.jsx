import {
  Box,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Flex,
  Group,
  Loader,
  NumberFormatter,
  Select,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
  IconCalendar,
  IconDownload,
  IconFileSearch,
  IconFilter,
} from '@tabler/icons-react';
import React, { useState } from 'react';
import logoImage from '../../assets/logo.png';
import useSizeContainer from '../../helpers/useSizeContainer';
import moment from 'moment';
import { useQuery } from 'react-query';
import { useGetReports } from '../../helpers/apiHelper';
import ErrorMessage from '../../components/ErrorMessage';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PrintProfitAndLoss from './PrintProfitAndLoss';

function BuildRow({ isTitle, label, value, bg, fw = 600 }) {
  return (
    <Box bg={bg || ''}>
      <Flex justify="space-between" p="md">
        {isTitle ? (
          <>
            <Text fw={fw}>{label}</Text>
            {value >= 0 && (
              <Text fw={fw}>
                <NumberFormatter
                  value={value || 0}
                  prefix="Rp "
                  decimalScale={2}
                  thousandSeparator="."
                  decimalSeparator=","
                />
              </Text>
            )}
          </>
        ) : (
          <>
            <Text>{label}</Text>
            <NumberFormatter
              value={value || 0}
              prefix="Rp "
              decimalScale={2}
              thousandSeparator="."
              decimalSeparator=","
            />
          </>
        )}
      </Flex>
      <Divider />
    </Box>
  );
}

function ProfitAndLoss({ startMonth, selectedMonth, endMonth, data }) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const colorTitle1 = isDark ? 'dark.5' : 'gray.1';
  const colorTitle2 = isDark ? 'dark.7' : 'gray.3';
  const colorTitle3 = isDark ? 'dark.9' : 'gray.5';

  const dataIncome = data?.find((el) => el.headers === 'income');
  const dataOperationalExpenses = data?.find(
    (el) => el.headers === 'operational-expenses'
  );

  return (
    <>
      <Title order={2} mb="sm" ta="center">
        PT Dwiguna Raja Semesta
      </Title>
      <Text fz={18} c="dimmed" ta="center">
        Profit and Loss Report
      </Text>
      <Divider mt="xl" mb="sm" />
      <Title order={4} mb="xl" ta="center">
        {startMonth.format('DD MMMM YYYY')} - {endMonth.format('DD MMMM YYYY')}
      </Title>
      <BuildRow isTitle={true} label="Income" bg={colorTitle1} />
      {dataIncome?.data?.map(({ name, amount }) => (
        <BuildRow key={name} label={name} value={amount} />
      ))}
      <BuildRow
        isTitle={true}
        bg={colorTitle2}
        label="Total Income"
        value={dataIncome?.data?.reduce((acc, el) => acc + el.amount, 0)}
      />
      <Box h={20} />
      <BuildRow isTitle={true} bg={colorTitle1} label="Operational Expenses" />
      {dataOperationalExpenses?.data?.map(({ name, amount }) => (
        <BuildRow key={name} label={name} value={amount} />
      ))}
      <BuildRow
        isTitle={true}
        bg={colorTitle2}
        label="Total Operational Expenses"
        value={dataOperationalExpenses?.data?.reduce(
          (acc, el) => acc + el.amount,
          0
        )}
      />
      <Box h={30} />
      <BuildRow
        isTitle={true}
        bg={colorTitle3}
        label="Net Profit"
        fw={800}
        value={
          dataIncome?.data?.reduce((acc, el) => acc + el.amount, 0) -
          dataOperationalExpenses?.data?.reduce((acc, el) => acc + el.amount, 0)
        }
      />
      <PrintProfitAndLoss
        selectedMonth={selectedMonth}
        dataIncome={dataIncome}
        dataOperationalExpenses={dataOperationalExpenses}
      />
    </>
  );
}

export default ProfitAndLoss;
