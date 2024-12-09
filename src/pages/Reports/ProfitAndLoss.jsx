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
import PrintProfitAndLoss from './PrintProfitAndLoss';

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

function ProfitAndLoss({ startMonth, selectedMonth, endMonth, data }) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const colorTitle1 = isDark ? 'dark.5' : 'gray.1';
  const colorTitle2 = isDark ? 'dark.7' : 'gray.3';
  const colorTitle3 = isDark ? 'dark.9' : 'gray.5';

  const getData = (headers) => {
    return data?.find((el) => el.headers === headers);
  };

  const dataIncome = getData('income');
  const dataCostOfGoodsSold = getData('cost-of-goods-sold');
  const dataOperationalExpenses = getData('operational-expenses');

  const totalIncome =
    dataIncome?.data?.reduce(
      (acc, { amount, is_income }) => acc + (is_income ? amount : -amount),
      0
    ) || 0;
  const totalCostOfGoodsSold =
    dataCostOfGoodsSold?.data?.reduce(
      (acc, { amount, is_income }) => acc + (is_income ? amount : -amount),
      0
    ) || 0;
  const totalOperationalExpenses =
    dataOperationalExpenses?.data?.reduce(
      (acc, { amount, is_income }) => acc + (is_income ? amount : -amount),
      0
    ) || 0;

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

      {/* Income */}
      <BuildRow isTitle={true} label="Income" bg={colorTitle1} />
      {dataIncome?.data?.map(({ name, amount, is_income }) => (
        <BuildRow key={name} label={name} value={amount} isIncome={is_income} />
      ))}
      <BuildRow
        isTitle={true}
        bg={colorTitle2}
        label="Total Income"
        value={totalIncome}
        isIncome={totalIncome >= 0}
      />
      <Box h={20} />

      {/* Cost of Goods Sold */}
      <BuildRow isTitle={true} label="Cost of Goods Sold" bg={colorTitle1} />
      {dataCostOfGoodsSold?.data?.map(({ name, amount, is_income }) => (
        <BuildRow key={name} label={name} value={amount} isIncome={is_income} />
      ))}
      <BuildRow
        isTitle={true}
        bg={colorTitle2}
        label="Total Cost of Goods Sold"
        value={totalCostOfGoodsSold}
        isIncome={totalCostOfGoodsSold >= 0}
      />
      <Box h={20} />

      {/* Operational Expenses */}
      <BuildRow isTitle={true} bg={colorTitle1} label="Operational Expenses" />
      {dataOperationalExpenses?.data?.map(({ name, amount, is_income }) => (
        <BuildRow key={name} label={name} value={amount} isIncome={is_income} />
      ))}
      <BuildRow
        isTitle={true}
        bg={colorTitle2}
        label="Total Operational Expenses"
        value={totalOperationalExpenses}
        isIncome={totalOperationalExpenses >= 0}
      />
      <Box h={30} />

      {/* Net Profit */}
      <BuildRow
        isTitle={true}
        bg={colorTitle3}
        label="Net Profit"
        fw={800}
        value={totalIncome + totalCostOfGoodsSold + totalOperationalExpenses}
        isIncome={
          totalIncome + totalCostOfGoodsSold + totalOperationalExpenses >= 0
        }
      />
      <PrintProfitAndLoss
        selectedMonth={selectedMonth}
        dataIncome={dataIncome}
        dataCostOfGoodsSold={dataCostOfGoodsSold}
        dataOperationalExpenses={dataOperationalExpenses}
      />
    </>
  );
}

export default ProfitAndLoss;
