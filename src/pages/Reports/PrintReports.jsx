import {
  Box,
  Container,
  Divider,
  Flex,
  NumberFormatter,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import moment from 'moment';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import logoImage from '../../assets/logo.png';
import { useGetReports } from '../../helpers/apiHelper';
import useSizeContainer from '../../helpers/useSizeContainer';

function BuildRow({ isTitle, label, value, bg, fw = 600 }) {
  return (
    <Box bg={bg || ''}>
      <Flex justify="space-between" p="md">
        {isTitle ? (
          <>
            <Text c="#000" fw={fw}>
              {label}
            </Text>
            {value >= 0 && (
              <Text c="#000" fw={fw}>
                <NumberFormatter
                  color="#000"
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
            <Text c="#000">{label}</Text>
            <Text c="#000">
              <NumberFormatter
                color="#000"
                value={value || 0}
                prefix="Rp "
                decimalScale={2}
                thousandSeparator="."
                decimalSeparator=","
              />
            </Text>
          </>
        )}
      </Flex>
      <Divider />
    </Box>
  );
}

function PrintReports({ selectedMonth, dataIncome, dataOperationalExpenses }) {
  const startMonth = moment(selectedMonth).startOf('month');
  const endMonth = moment(selectedMonth).endOf('month');

  const colorTitle1 = 'gray.1';
  const colorTitle2 = 'gray.3';
  const colorTitle3 = 'gray.5';

  return (
    <Box
      w="100%"
      id="reports-to-capture"
      style={{ position: 'absolute', right: 999999 }}
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
          Profit and Loss Reports
        </Text>
        <Divider mt="xl" mb="sm" c="#dee2e6" />
        <Title c="#000" order={4} mb="xl" ta="center">
          {startMonth.format('DD MMMM YYYY')} -{' '}
          {endMonth.format('DD MMMM YYYY')}
        </Title>
        <BuildRow isTitle={true} label="Income" bg={colorTitle1} />
        {dataIncome?.data?.map(({ name, amount }) => (
          <BuildRow label={name} value={amount} />
        ))}
        <BuildRow
          isTitle={true}
          bg={colorTitle2}
          label="Total Income"
          value={dataIncome?.data?.reduce((acc, el) => acc + el.amount, 0)}
        />
        <Box h={20} />
        <BuildRow
          isTitle={true}
          bg={colorTitle1}
          label="Operational Expenses"
        />
        {dataOperationalExpenses?.data?.map(({ name, amount }) => (
          <BuildRow label={name} value={amount} />
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
            dataOperationalExpenses?.data?.reduce(
              (acc, el) => acc + el.amount,
              0
            )
          }
        />
      </Container>
    </Box>
  );
}

export default PrintReports;
