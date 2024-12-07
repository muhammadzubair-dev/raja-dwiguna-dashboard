import {
  Box,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Flex,
  Group,
  Loader,
  NumberFormatter,
  Select,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
  IconCalendar,
  IconDownload,
  IconFileSearch,
  IconFilter,
} from '@tabler/icons-react';
import React, { useState } from 'react';
import logoImage from '../../assets/logo.png';
import useSizeContainer from '../../helpers/useSizeContainer';
import moment from 'moment';
import { useQuery } from 'react-query';
import { useGetReports } from '../../helpers/apiHelper';
import ErrorMessage from '../../components/ErrorMessage';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PrintReports from './PrintReports';

function FilterReports({
  setSelectedReport,
  selectedMonth,
  selectedReport,
  setSelectedMonth,
  refetch,
  isLoading,
}) {
  return (
    <>
      <Select
        placeholder="Select Reports"
        value={selectedReport}
        data={[
          { label: 'Cash Flow', value: 'cash-flow' },
          { label: 'Profit And Loss', value: 'profit-and-loss' },
        ]}
        onChange={setSelectedReport}
      />
      <MonthPickerInput
        miw={200}
        maxDate={new Date()}
        leftSection={<IconCalendar size={16} />}
        leftSectionPointerEvents="none"
        placeholder="Select Month"
        value={selectedMonth}
        onChange={setSelectedMonth}
      />
      <Button
        onClick={refetch}
        loading={isLoading}
        leftSection={<IconFileSearch size={16} />}
      >
        Search
      </Button>
    </>
  );
}

function BuildRow({ isTitle, label, value, bg, fw = 600 }) {
  return (
    <Box bg={bg || ''}>
      <Flex justify="space-between" p="md">
        {isTitle ? (
          <>
            <Text fw={fw}>{label}</Text>
            {value >= 0 && (
              <Text fw={fw}>
                <NumberFormatter
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
            <Text>{label}</Text>
            <NumberFormatter
              value={value || 0}
              prefix="Rp "
              decimalScale={2}
              thousandSeparator="."
              decimalSeparator=","
            />
          </>
        )}
      </Flex>
      <Divider />
    </Box>
  );
}

function Reports() {
  const { colorScheme } = useMantineColorScheme();
  const isMobile = useMediaQuery(`(max-width: 1100px)`);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedReport, setSelectedReport] = useState('profit-and-loss');
  const sizeContainer = useSizeContainer((state) => state.sizeContainer);

  const isDark = colorScheme === 'dark';
  const startMonth = moment(selectedMonth).startOf('month');
  const endMonth = moment(selectedMonth).endOf('month');

  const colorTitle1 = isDark ? 'dark.5' : 'gray.1';
  const colorTitle2 = isDark ? 'dark.7' : 'gray.3';
  const colorTitle3 = isDark ? 'dark.9' : 'gray.5';

  const { data, isLoading, refetch, error } = useQuery(
    ['reports-cash-flow'],
    () =>
      useGetReports({
        start_date: `${startMonth.format('YYYY-MM-DD')}T00:00:00Z`,
        end_date: `${endMonth.format('YYYY-MM-DD')}T00:00:00Z`,
        report_name: selectedReport,
      })
  );

  const dataIncome = data?.response?.find((el) => el.headers === 'income');
  const dataOperationalExpenses = data?.response?.find(
    (el) => el.headers === 'operational-expenses'
  );

  const handleFilter = () => {
    modals.open({
      title: 'Filter Reports',
      centered: true,
      size: 'xs',
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <Stack gap="md">
          <FilterReports
            refetch={refetch}
            isLoading={isLoading}
            selectedMonth={selectedMonth}
            selectedReport={selectedReport}
            setSelectedMonth={setSelectedMonth}
            setSelectedReport={setSelectedReport}
          />
        </Stack>
      ),
    });
  };

  const handleExportToPDF = () => {
    const invoiceElement = document.getElementById('reports-to-capture');

    html2canvas(invoiceElement, { scale: 2 }).then((canvas) => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      const imgWidth = 190; // Width of the PDF (A4)
      const pageHeight = 297; // Height of the PDF (A4)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 10; // Start position

      // Add image to the PDF and handle multi-page content
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        if (heightLeft > 0) {
          pdf.addPage();
          position = 0;
        }
      }

      // Open a new window for preview and allow printing
      const pdfPreview = pdf.output('bloburl');
      window.open(pdfPreview, '_blank', 'width=800,height=600');
    });
  };

  return (
    <Container
      size="xl"
      flex={1}
      fluid={sizeContainer === 'fluid'}
      p={{ base: 'md', md: 'xl' }}
    >
      <Group justify="space-between" mb="lg">
        {isMobile ? (
          <Button
            variant="light"
            onClick={handleFilter}
            leftSection={<IconFilter size={18} />}
          >
            Filter
          </Button>
        ) : (
          <Flex gap="sm">
            <FilterReports
              refetch={refetch}
              isLoading={isLoading}
              selectedMonth={selectedMonth}
              selectedReport={selectedReport}
              setSelectedMonth={setSelectedMonth}
              setSelectedReport={setSelectedReport}
            />
          </Flex>
        )}
        <Group justify="flex-end">
          <Button
            onClick={handleExportToPDF}
            leftSection={<IconDownload size={14} />}
            variant="default"
          >
            Download
          </Button>
        </Group>
      </Group>
      <Card withBorder p={{ base: 'xs', md: 'xl' }} radius="sm">
        <Container w="100%" maw={1100} p={0}>
          {isLoading && (
            <Center mih={300}>
              <Loader />
            </Center>
          )}
          {!isLoading && error && (
            <Center mih={300}>
              <ErrorMessage message={error?.message} />
            </Center>
          )}
          {!isLoading && !error && (
            <>
              <Title order={2} mb="sm" ta="center">
                PT Dwiguna Raja Semesta
              </Title>
              <Text fz={18} c="dimmed" ta="center">
                Profit and Loss Reports
              </Text>
              <Divider mt="xl" mb="sm" />
              <Title order={4} mb="xl" ta="center">
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
                value={dataIncome?.data?.reduce(
                  (acc, el) => acc + el.amount,
                  0
                )}
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
            </>
          )}
        </Container>
        <PrintReports
          selectedMonth={selectedMonth}
          dataIncome={dataIncome}
          dataOperationalExpenses={dataOperationalExpenses}
        />
      </Card>
    </Container>
  );
}

export default Reports;
