import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Group,
  Input,
  NumberFormatter,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import {
  IconCalendar,
  IconDownload,
  IconEdit,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import ErrorMessage from '../../components/ErrorMessage';
import {
  useGetOptionAccounts,
  useGetOptionCategories,
  useGetTransactions,
  usePostTransaction,
  usePutTransaction,
} from '../../helpers/apiHelper';
import { notificationSuccess } from '../../helpers/notificationHelper';
import usePagination from '../../helpers/usePagination';
import { DatePickerInput } from '@mantine/dates';
import { range } from '@mantine/hooks';

function Reports() {
  const [isIncome, setIsIncome] = useState(null);
  const [rangeDates, setRangeDates] = useState([null, null]);
  const [category, setCategory] = useState(null);
  const [subCategory, setSubCategory] = useState(null);
  const { page, limit, handlePageChange, handleLimitChange } = usePagination(
    1,
    10
  );

  const { data, isLoading, refetch, error } = useQuery(
    ['report-transactions', page, limit],
    () =>
      useGetTransactions({
        limit,
        page,
        ...(isIncome === 'Income' ? { is_income: true } : { is_income: false }),
        ...(category && { category_id: category }),
        ...(subCategory && { sub_category_id: subCategory }),
        ...(rangeDates.every((el) => el !== null) && {
          start_date: `${moment(rangeDates[0]).format('YYYY-MM-DD')}T00:00:00Z`,
          end_date: `${moment(rangeDates[1]).format('YYYY-MM-DD')}T00:00:00Z`,
        }),
      })
  );

  const { data: optionCategories, isLoading: isLoadingCategories } = useQuery(
    ['categories'],
    () => useGetOptionCategories()
  );

  const records = data?.response?.data.map((item) => ({
    id: item.id,
    amount: item.amount,
    is_income: item.list_category?.is_income,
    category: item.list_category?.name,
    sub_category: item.list_sub_category?.name,
    bank_name: item.list_account?.bank_name,
    description: item.description,
    created_at: item.created_at,
    account_id: item.list_account?.id,
    category_id: item.list_category?.id,
    sub_category_id: item.list_sub_category?.id,
    reference_number: item.reference_number,
    created_by: item.list_employee?.email,
  }));

  const recordsCategory = [
    {
      group: 'Income',
      items: (optionCategories?.response || [])
        .filter((category) => category.is_income === true)
        .map(({ id, name }) => ({ value: id, label: name })),
    },
    {
      group: 'Outcome',
      items: (optionCategories?.response || [])
        .filter((category) => category.is_income === false)
        .map(({ id, name }) => ({ value: id, label: name })),
    },
  ];

  const findSubCategory = optionCategories?.response.find(
    ({ id }) => id === category
  );

  const recordsSubCategory = findSubCategory?.list_transaction_sub_category.map(
    ({ id, name }) => ({
      value: id,
      label: name,
    })
  );

  return (
    <Container size="xl" flex={1} p={{ base: 'md', md: 'xl' }}>
      <Group justify="space-between" mb="lg">
        <Flex gap="sm">
          <Select
            placeholder="Select Type"
            data={['Income', 'Outcome']}
            onChange={setIsIncome}
            clearable
          />
          <Select
            disabled={isLoadingCategories}
            placeholder={isLoadingCategories ? 'Loading...' : 'Select Category'}
            data={recordsCategory}
            onChange={setCategory}
            searchable
            clearable
          />
          <Select
            disabled={isLoadingCategories || recordsSubCategory?.length === 0}
            placeholder={
              isLoadingCategories
                ? 'Loading...'
                : recordsSubCategory?.length === 0
                ? 'No Sub Category, Please select another Category'
                : 'Select Sub Category'
            }
            data={recordsSubCategory}
            onChange={setSubCategory}
            searchable
            clearable
          />
          <DatePickerInput
            miw={185}
            leftSection={<IconCalendar size={16} />}
            leftSectionPointerEvents="none"
            type="range"
            placeholder="Pick dates range"
            value={rangeDates}
            onChange={setRangeDates}
            clearable
          />
          <Button
            onClick={refetch}
            loading={isLoading}
            leftSection={<IconSearch size={16} />}
          >
            Search
          </Button>
        </Flex>
        <Group justify="center">
          <Button leftSection={<IconDownload size={14} />} variant="default">
            Download
          </Button>
        </Group>
      </Group>
      <Card withBorder p="0" radius="sm">
        <DataTable
          verticalSpacing="md"
          minHeight={400}
          fetching={isLoading}
          totalRecords={data?.response?.total || 0}
          recordsPerPage={limit}
          page={page}
          onPageChange={handlePageChange}
          recordsPerPageOptions={[10, 20, 50]}
          onRecordsPerPageChange={handleLimitChange}
          noRecordsText={
            error ? `Error: ${error?.message}` : 'No records found'
          }
          records={records}
          columns={[
            { accessor: 'id', hidden: true },
            {
              accessor: 'index',
              title: 'No',
              textAlign: 'center',
              width: 40,
              render: (record) =>
                records.indexOf(record) + 1 + limit * (page - 1),
            },
            {
              accessor: 'is_income',
              title: 'Type',
              render: ({ is_income }) => (
                <Badge
                  variant="outline"
                  radius="xl"
                  color={is_income ? 'green' : 'red'}
                >
                  {is_income ? 'Income' : 'Outcome'}
                </Badge>
              ),
            },
            { accessor: 'bank_name' },
            { accessor: 'category' },
            { accessor: 'sub_category' },
            {
              accessor: 'amount',
              render: ({ amount }) => (
                <NumberFormatter
                  value={amount}
                  prefix="Rp "
                  decimalScale={2}
                  thousandSeparator="."
                  decimalSeparator=","
                />
              ),
            },
            { accessor: 'description' },
            { accessor: 'reference_number' },
            { accessor: 'created_by' },
            {
              accessor: 'created_at',
              render: ({ created_at }) => (
                <Text>{moment(created_at).format('YYYY-MM-DD HH:mm')}</Text>
              ),
            },
          ]}
        />
      </Card>
    </Container>
  );
}

export default Reports;
