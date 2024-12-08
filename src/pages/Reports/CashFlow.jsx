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

function BuildRow({ isTitle, label, value, bg, fw = 600, isIncome = false }) {
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
                  prefix={`${isIncome ? 'Rp ' : '( Rp '}`}
                  suffix={isIncome ? '' : ' )'}
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
              prefix={`${isIncome ? 'Rp ' : '( Rp '}`}
              suffix={isIncome ? '' : ' )'}
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

function CashFlow({ startMonth, selectedMonth, endMonth, data }) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const colorTitle1 = isDark ? 'dark.5' : 'gray.1';
  const colorTitle2 = isDark ? 'dark.7' : 'gray.3';
  const colorTitle3 = isDark ? 'dark.9' : 'gray.5';

  const dataOperational = data?.find(
    (el) => el.headers === 'operational-activities'
  );
  const dataInvestment = data?.find(
    (el) => el.headers === 'investment-activities'
  );
  const dataFunding = data?.find((el) => el.headers === 'funding-activities');

  const totalOperational = dataOperational?.data?.reduce(
    (acc, { amount, is_income }) => acc + (is_income ? amount : -amount),
    0
  );
  const totalInvestment = dataInvestment?.data?.reduce(
    (acc, { amount, is_income }) => acc + (is_income ? amount : -amount),
    0
  );
  const totalFunding = dataFunding?.data?.reduce(
    (acc, { amount, is_income }) => acc + (is_income ? amount : -amount),
    0
  );

  console.log(JSON.stringify(dataOperational, null, 2));

  return (
    <>
      <Title order={2} mb="sm" ta="center">
        PT Dwiguna Raja Semesta
      </Title>
      <Text fz={18} c="dimmed" ta="center">
        Cash Flow Report
      </Text>
      <Divider mt="xl" mb="sm" />
      <Title order={4} mb="xl" ta="center">
        {startMonth.format('DD MMMM YYYY')} - {endMonth.format('DD MMMM YYYY')}
      </Title>
      <BuildRow
        isTitle={true}
        label="Operational Activities"
        bg={colorTitle1}
      />
      {dataOperational?.data?.map(({ name, amount, is_income }) => (
        <BuildRow key={name} label={name} value={amount} isIncome={is_income} />
      ))}
      <BuildRow
        isTitle={true}
        bg={colorTitle2}
        label="Net Cash from Operational Activities"
        value={totalOperational}
        isIncome={totalOperational >= 0}
      />
      <Box h={20} />

      <BuildRow isTitle={true} label="Investment Activities" bg={colorTitle1} />
      {dataInvestment?.data?.map(({ name, amount, is_income }) => (
        <BuildRow key={name} label={name} value={amount} isIncome={is_income} />
      ))}
      <BuildRow
        isTitle={true}
        bg={colorTitle2}
        label="Net Cash from Investment Activities"
        value={totalInvestment}
        isIncome={totalInvestment >= 0}
      />
      <Box h={20} />

      <BuildRow isTitle={true} label="Funding Activities" bg={colorTitle1} />
      {dataFunding?.data?.map(({ name, amount, is_income }) => (
        <BuildRow key={name} label={name} value={amount} isIncome={is_income} />
      ))}
      <BuildRow
        isTitle={true}
        bg={colorTitle2}
        label="Net Cash from Funding Activities"
        value={totalFunding}
        isIncome={totalFunding >= 0}
      />
      <Box h={30} />

      <BuildRow
        isTitle={true}
        bg={colorTitle3}
        label="Net Increase in Cash"
        fw={800}
        value={totalOperational + totalInvestment + totalFunding}
        isIncome={totalOperational + totalInvestment + totalFunding >= 0}
      />

      {/* net increase in cash */}
      {/* cash at the beginning of the period */}
      {/* cash at the end of the period */}
    </>
  );
}

export default CashFlow;
