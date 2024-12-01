import { BarChart } from '@mantine/charts';
import { Center, Skeleton, Text } from '@mantine/core';
import React from 'react';
import shortCurrency from '../../helpers/shortCurrency';

function Cashflow({ isLoadingBarChart, errorBarChart, recordBarChart }) {
  return (
    <Skeleton visible={isLoadingBarChart}>
      {errorBarChart ? (
        <Center h={300}>
          <Text c="red">Error: {errorBarChart?.message}</Text>
        </Center>
      ) : (
        <BarChart
          h={300}
          valueFormatter={
            (value) => shortCurrency(value)
            // new Intl.NumberFormat('id-ID').format(value)
          }
          data={recordBarChart || []}
          dataKey="month"
          withLegend
          barProps={{ radius: 10 }}
          series={[
            { name: 'Credit', color: 'green' },
            { name: 'Debit', color: 'red' },
          ]}
        />
      )}
    </Skeleton>
  );
}

export default Cashflow;
