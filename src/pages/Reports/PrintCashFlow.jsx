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

function PrintCashFlow({
  selectedMonth,
  dataOperational,
  dataInvestment,
  dataFunding,
  dataBalance,
}) {
  const startMonth = moment(selectedMonth).startOf('month');
  const endMonth = moment(selectedMonth).endOf('month');

  const colorTitle1 = 'gray.1';
  const colorTitle2 = 'gray.3';
  const colorTitle3 = 'gray.5';

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
    <Box
      w="100%"
      id="cash-flow-to-capture"
      style={{ position: 'absolute', top: 999999 }}
    >
      <Container w="100%" maw={1500} p={0} bg="white" pos="relative">
        <img
          height={70}
          src={logoImage}
          alt="logo"
          style={{ position: 'absolute', top: 10, left: 10 }}
        />
        <Title c="#000" order={2} mb="sm" ta="center">
          PT Dwiguna Raja Semesta
        </Title>
        <Text fz={18} c="#868e96" ta="center">
          Cash Flow Report
        </Text>
        <Divider mt="xl" mb="sm" c="#dee2e6" />
        <Title c="#000" order={4} mb="xl" ta="center">
          {startMonth.format('DD MMMM YYYY')} -{' '}
          {endMonth.format('DD MMMM YYYY')}
        </Title>

        {/* Operational Activities */}
        <BuildRow
          isTitle={true}
          label="Operational Activities"
          bg={colorTitle1}
        />
        {dataOperational?.data?.map(({ name, amount, is_income }) => (
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
          label="Net Cash from Operational Activities"
          value={totalOperational}
          isIncome={totalOperational >= 0}
        />
        <Box h={20} />

        <BuildRow
          isTitle={true}
          label="Investment Activities"
          bg={colorTitle1}
        />
        {dataInvestment?.data?.map(({ name, amount, is_income }) => (
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
          label="Net Cash from Investment Activities"
          value={totalInvestment}
          isIncome={totalInvestment >= 0}
        />
        <Box h={20} />

        {/* Funding Activities */}
        <BuildRow isTitle={true} label="Funding Activities" bg={colorTitle1} />
        {dataFunding?.data?.map(({ name, amount, is_income }) => (
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
          value={
            totalOperational + totalInvestment + totalFunding + dataBalance
          }
          isIncome={
            totalOperational + totalInvestment + totalFunding + dataBalance >= 0
          }
        />
      </Container>
    </Box>
  );
}

export default PrintCashFlow;
