import React, { useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { useComputedColorScheme } from '@mantine/core';
import shortCurrency from '../../helpers/shortCurrency';

export default function ApexDonutChart({
  title = '',
  series = [],
  labels = [],
  legendPosition = 'right',
}) {
  const computedColorScheme = useComputedColorScheme('light');

  const themeColors = {
    light: {
      textColor: '#000000',
      backgroundColor: '#FFFFFF',
      borderColor: '#ffffff',
      gridColor: '#ffffff',
      dividerColor: '#ffffff',
    },
    dark: {
      textColor: '#FFFFFF',
      backgroundColor: '#2e2e2e',
      borderColor: '#2e2e2e',
      gridColor: '#2e2e2e',
      dividerColor: '#2e2e2e',
    },
  };

  const currentTheme = themeColors[computedColorScheme];
  const chartOptions = {
    chart: {
      type: 'donut',
      // width: 400, // Lebar total chart
      // height: 400, // Tinggi total chart
      // background: currentTheme.backgroundColor,
      foreColor: currentTheme.textColor,
      // Kustomisasi border chart
      // toolbar: {
      //   show: true,
      //   tools: {
      //     download: true,
      //     selection: true,
      //     zoom: true,
      //     zoomin: true,
      //     zoomout: true,
      //     pan: true,
      //     reset: true,
      //   },
      //   autoSelected: 'zoom',
      // },
      // Border chart
      style: {
        border: `1px solid ${currentTheme.borderColor}`,
        borderRadius: '8px',
      },
    },
    labels: labels,
    // Kustomisasi grid
    // grid: {
    //   show: true,
    //   borderColor: currentTheme.gridColor,
    //   strokeDashArray: 7,
    //   xaxis: {
    //     lines: {
    //       show: true,
    //     },
    //   },
    //   yaxis: {
    //     lines: {
    //       show: true,
    //     },
    //   },
    // },
    // Kustomisasi stroke (garis pemisah antar segmen)
    stroke: {
      show: true,
      width: 2,
      colors: [currentTheme.backgroundColor],
    },
    // Kustomisasi plotOptions untuk border
    plotOptions: {
      pie: {
        donut: {
          background: currentTheme.backgroundColor,
          labels: {
            show: false,
            name: {
              color: currentTheme.textColor,
            },
            value: {
              color: currentTheme.textColor,
            },
            total: {
              show: false,
              label: title,
              color: currentTheme.textColor,
              formatter: function (w) {
                //   return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return '';
              },
            },
          },
          // Border antar segmen

          borderWidth: 2,
          borderColor: currentTheme.dividerColor,
        },
      },
    },
    // Kustomisasi legend
    legend: {
      show: false,
      // width: '30%',
      position: legendPosition,
      labels: {
        colors: Array(5).fill(currentTheme.textColor),

        style: {
          maxWidth: '100px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      },
      markers: {
        // Border marker legend
        strokeColor: currentTheme.dividerColor,
        strokeWidth: 2,
      },
      itemMargin: {
        // Jarak antar item legend
        horizontal: 5,
        vertical: 1,
      },
      // Garis pembatas legend
      // horizontalAlign: 'left',
      // floating: true,
      // offsetY: -55,
      // offsetX: -70,
      // paddingBottom: 10,
      // width: '100%',
      // borderBottom: `1px solid ${currentTheme.dividerColor}`,
      formatter: function (seriesName, opts) {
        if (seriesName.length > 20) {
          return seriesName.substring(0, 20) + '...';
        } else {
          return seriesName;
        }
      },
    },
    // Kustomisasi tooltip
    tooltip: {
      y: {
        formatter: function (
          value,
          { series, seriesIndex, dataPointIndex, w }
        ) {
          return shortCurrency(value, true);
        },
      },
      theme: computedColorScheme,
      style: {
        fontSize: '12px',
        fontFamily: undefined,
        borderColor: currentTheme.dividerColor,
        borderWidth: 1,
      },
      marker: {
        strokeColor: currentTheme.dividerColor,
      },
    },
  };

  return (
    <div
      className={`p-4 rounded-lg shadow-md ${
        computedColorScheme === 'dark' ? 'bg-dark-700' : 'bg-white'
      }`}
    >
      <Chart
        options={chartOptions}
        series={series}
        type="donut"
        width={230}
        height={230}
      />
    </div>
  );
}
