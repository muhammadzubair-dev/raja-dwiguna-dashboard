import { BarChart } from '@mantine/charts';
import { Center, Skeleton, Text } from '@mantine/core';
import React from 'react';
import shortCurrency from '../../helpers/shortCurrency';
import randomColors from '../../helpers/randomColors';

function SubCategory({
  isLoadingBarChartSubCategory,
  errorBarChartSubCategory,
  recordBarChartSubCategory,
  selectedSubCategory,
}) {
  return (
    <Skeleton visible={isLoadingBarChartSubCategory}>
      {errorBarChartSubCategory ? (
        <Center h={300}>
          <Text c="red">Error: {errorBarChartSubCategory?.message}</Text>
        </Center>
      ) : (
        <BarChart
          h={300}
          valueFormatter={(value) => shortCurrency(value)}
          data={recordBarChartSubCategory}
          dataKey="date"
          withLegend
          barProps={{ radius: 10 }}
          series={
            selectedSubCategory.length !== 0
              ? selectedSubCategory.map((key, index) => ({
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

export default SubCategory;
