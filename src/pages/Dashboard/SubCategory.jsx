import { BarChart } from '@mantine/charts';
import { Center, Skeleton, Text } from '@mantine/core';
import React from 'react';
import shortCurrency from '../../helpers/shortCurrency';
import randomColors from '../../helpers/randomColors';

function removeSymbolsFromKeys(data) {
  return data.map((obj) => {
    let cleanedObj = {};
    Object.keys(obj).forEach((key) => {
      // Clean the key by removing symbols
      let cleanedKey = key.replace(/[^a-zA-Z0-9\s]/g, '');
      cleanedObj[cleanedKey] = obj[key];
    });
    return cleanedObj;
  });
}

function removeSymbolsFromArr(data) {
  return data.map((row) => row.replace(/[^a-zA-Z0-9\s]/g, ''));
}

function SubCategory({
  isLoadingBarChartSubCategory,
  errorBarChartSubCategory,
  recordBarChartSubCategory,
  selectedSubCategory,
}) {
  const records = removeSymbolsFromKeys(recordBarChartSubCategory);
  const selectedRecords = removeSymbolsFromArr(selectedSubCategory);

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
          data={records}
          dataKey="date"
          withLegend
          barProps={{ radius: 10 }}
          series={
            selectedRecords.length !== 0
              ? selectedRecords.map((key, index) => ({
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
