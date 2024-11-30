import { BarChart } from '@mantine/charts';
import { Center, Skeleton, Text } from '@mantine/core';
import React from 'react';
import shortCurrency from '../../helpers/shortCurrency';
import randomColors from '../../helpers/randomColors';

function Category({
  isLoadingBarChartCategory,
  errorBarChartCategory,
  recordBarChartCategory,
  selectedCategory,
}) {
  return (
    <Skeleton visible={isLoadingBarChartCategory}>
      {errorBarChartCategory ? (
        <Center h={300}>
          <Text c="red">Error: {errorBarChartCategory?.message}</Text>
        </Center>
      ) : (
        <BarChart
          h={300}
          valueFormatter={(value) => shortCurrency(value)}
          data={recordBarChartCategory}
          dataKey="date"
          withLegend
          barProps={{ radius: 10 }}
          series={
            selectedCategory.length !== 0
              ? selectedCategory.map((key, index) => ({
                  name: key,
                  color: randomColors[index],
                }))
              : []
          }
        />
      )}
    </Skeleton>
  );
}

export default Category;
