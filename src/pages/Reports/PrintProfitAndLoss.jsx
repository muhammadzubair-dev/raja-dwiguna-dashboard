import {
  Box,
  Container,
  Divider,
  Flex,
  NumberFormatter,
  Text,
  Title,
} from '@mantine/core';
import moment from 'moment';
import React from 'react';
import logoImage from '../../assets/logo.png';

function BuildRow({ isTitle, label, value, bg, fw = 600, isIncome = false }) {
  if (value < 0) {
    isIncome = false;
    value = Math.abs(value);
  }
  return (
    <Box bg={bg || ''}>
      <Flex justify="space-between" p="md">
        <Text c="#000" fw={isTitle ? fw : 500}>
          {label}
        </Text>
        <Text c="#000" fw={isTitle ? fw : 500}>
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

function PrintProfitAndLoss({
  selectedMonth,
  dataIncome,
  dataCostOfGoodsSold,
  dataOperationalExpenses,
}) {
  const startMonth = moment(selectedMonth).startOf('month');
  const endMonth = moment(selectedMonth).endOf('month');

  const colorTitle1 = 'gray.1';
  const colorTitle2 = 'gray.3';
  const colorTitle3 = 'gray.5';

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
    <Box w="100%" style={{ position: 'absolute', right: 999999 }}>
      <Container w="100%" maw={1500} p={0} bg="white" pos="relative">
        <div id="profit-and-loss-to-capture">
          <img
            height={70}
            src={logoImage}
            alt="logo"
            style={{ position: 'absolute', top: 10, left: 10 }}
          />
          <Title c="#000" order={2} mb="sm" ta="center">
            PT Raja Dwiguna Semesta
          </Title>
          <Text fz={18} c="#868e96" ta="center">
            Profit and Loss Report
          </Text>
          <Divider mt="xl" mb="sm" c="#dee2e6" />
          <Title c="#000" order={4} mb="xl" ta="center">
            {startMonth.format('DD MMMM YYYY')} -{' '}
            {endMonth.format('DD MMMM YYYY')}
          </Title>

          {/* Income */}
          <BuildRow isTitle={true} label="Income" bg={colorTitle1} />
          {dataIncome?.data?.map(({ name, amount, is_income }) => (
            <BuildRow
              key={name}
              label={name}
              value={amount}
              isIncome={is_income}
            />
          ))}
          <BuildRow
            isTitle={true}
            bg={colorTitle2}
            label="Total Income"
            value={totalIncome}
            isIncome={totalIncome >= 0}
          />
          <Box h={20} />

          {/* Project Expenses */}
          <BuildRow isTitle={true} label="Project Expenses" bg={colorTitle1} />
          {dataCostOfGoodsSold?.data?.map(({ name, amount, is_income }) => (
            <BuildRow
              key={name}
              label={name}
              value={amount}
              isIncome={is_income}
            />
          ))}
          <BuildRow
            isTitle={true}
            bg={colorTitle2}
            label="Total Project Expenses"
            value={totalCostOfGoodsSold}
            isIncome={totalCostOfGoodsSold >= 0}
          />
          <Box h={20} />

          {/* Gross Profit */}
          <BuildRow
            isTitle={true}
            bg={colorTitle3}
            label="Gross Profit"
            fw={800}
            value={totalIncome + totalCostOfGoodsSold}
            isIncome={totalIncome + totalCostOfGoodsSold >= 0}
          />
          <Box h={20} />

          {/* Operational Expenses */}
          <BuildRow
            isTitle={true}
            bg={colorTitle1}
            label="Operational Expenses"
          />
          {dataOperationalExpenses?.data?.map(({ name, amount, is_income }) => (
            <BuildRow
              key={name}
              label={name}
              value={amount}
              isIncome={is_income}
            />
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
            value={
              totalIncome + totalCostOfGoodsSold + totalOperationalExpenses
            }
            isIncome={
              totalIncome + totalCostOfGoodsSold + totalOperationalExpenses >= 0
            }
          />
        </div>
      </Container>
    </Box>
  );
}

export default PrintProfitAndLoss;
