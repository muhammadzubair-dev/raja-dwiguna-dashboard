import {
  Box,
  Divider,
  Flex,
  NumberFormatter,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import React from 'react';
import PrintCashFlow from './PrintCashFlow';

function BuildRow({ isTitle, label, value, bg, fw = 600, isIncome = false }) {
  if (value < 0) {
    isIncome = false;
    value = Math.abs(value);
  }
  return (
    <Box bg={bg || ''}>
      <Flex justify="space-between" p="md">
        <Text fw={isTitle ? fw : 500}>{label}</Text>
        <Text fw={isTitle ? fw : 500}>
          {value !== undefined && (
            <NumberFormatter
              value={value || 0}
              prefix={`${isIncome ? 'Rp ' : '( Rp '}`}
              suffix={isIncome ? '' : ' )'}
              decimalScale={2}
              allowNegative={true}
              thousandSeparator="."
              decimalSeparator=","
            />
          )}
        </Text>
      </Flex>
      <Divider />
    </Box>
  );
}

function CashFlow({ startMonth, selectedMonth, endMonth, data, dataBalance }) {
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

  const totalOperational =
    dataOperational?.data?.reduce(
      (acc, { amount, is_income }) => acc + (is_income ? amount : -amount),
      0
    ) || 0;
  const totalInvestment =
    dataInvestment?.data?.reduce(
      (acc, { amount, is_income }) => acc + (is_income ? amount : -amount),
      0
    ) || 0;
  const totalFunding =
    dataFunding?.data?.reduce(
      (acc, { amount, is_income }) => acc + (is_income ? amount : -amount),
      0
    ) || 0;

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

      {/* Operational Activities */}
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

      {/* Funding Activities */}
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
        bg={colorTitle2}
        label="Net Increase in Cash"
        fw={800}
        value={totalOperational + totalInvestment + totalFunding}
        isIncome={totalOperational + totalInvestment + totalFunding >= 0}
      />
      <BuildRow
        isTitle={true}
        bg={colorTitle2}
        label="Cash at the beginning of the period"
        fw={800}
        value={dataBalance}
        isIncome={dataBalance >= 0}
      />
      <BuildRow
        isTitle={true}
        bg={colorTitle3}
        label="Cash at the End of the period"
        fw={800}
        value={totalOperational + totalInvestment + totalFunding + dataBalance}
        isIncome={
          totalOperational + totalInvestment + totalFunding + dataBalance >= 0
        }
      />

      <PrintCashFlow
        selectedMonth={selectedMonth}
        dataOperational={dataOperational}
        dataInvestment={dataInvestment}
        dataFunding={dataFunding}
        dataBalance={dataBalance}
      />
    </>
  );
}

export default CashFlow;
