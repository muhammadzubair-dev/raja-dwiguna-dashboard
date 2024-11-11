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
  IconDownload,
  IconEdit,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import React from 'react';
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

function AddAndEditTransaction({ data, refetchTransactions }) {
  const isAdd = data ? false : true;
  const form = useForm({
    mode: 'controlled',
    initialValues: {
      account_id: data?.account_id || null,
      category_id: data?.category_id || null,
      sub_category_id: data?.sub_category_id || null,
      amount: data?.amount || '',
      description: data?.description || '',
      reference_number: data?.reference_number || '',
    },
    validate: {
      account_id: (value) => (value ? null : 'Bank Account is required'),
      category_id: (value) => (value ? null : 'Category is required'),
      sub_category_id: (value) => (value ? null : 'Sub Category is required'),
      amount: (value) =>
        String(value).trim().length > 0
          ? null
          : 'Amount is required and must be greater than 0',
      description: (value) =>
        value.trim().length > 0 ? null : 'Description is required',
      reference_number: (value) =>
        value.trim().length > 0 ? null : 'Reference number is required',
    },
  });

  form.watch('category_id', () => {
    form.setFieldValue('sub_category_id', null);
  });

  const { data: optionAccounts, isLoading: isLoadingAccounts } = useQuery(
    ['accounts'],
    () => useGetOptionAccounts()
  );

  const { data: optionCategories, isLoading: isLoadingCategories } = useQuery(
    ['categories'],
    () => useGetOptionCategories()
  );

  const recordsAccount = optionAccounts?.response.map(
    ({ bank_name, name, id }) => ({
      value: id,
      label: `${bank_name} - ${name}`,
    })
  );

  const recordsCategory = optionCategories?.response.map(({ id, name }) => ({
    value: id,
    label: name,
  }));

  const findSubCategory = optionCategories?.response.find(
    ({ id }) => id === form.values?.category_id
  );

  const recordsSubCategory = findSubCategory?.list_transaction_sub_category.map(
    ({ id, name }) => ({
      value: id,
      label: name,
    })
  );

  const { mutate, isLoading, error } = useMutation(
    isAdd ? usePostTransaction : usePutTransaction,
    {
      onSuccess: () => {
        refetchTransactions();
        modals.closeAll();
        notificationSuccess(
          `Transaction ${isAdd ? 'added' : 'updated'} successfully`
        );
      },
    }
  );

  const handleSave = (values) => {
    const body = {
      ...values,
      ...(!isAdd && { id: data?.id }),
    };

    if (!isAdd) delete body.transaction_category_id;
    mutate(body);
  };

  return (
    <form onSubmit={form.onSubmit(handleSave)}>
      <Stack gap="xs">
        <Select
          withAsterisk
          disabled={isLoadingAccounts}
          placeholder={isLoadingAccounts ? 'Loading...' : ''}
          label="Bank Account"
          data={recordsAccount}
          searchable
          key={form.key('account_id')}
          {...form.getInputProps('account_id')}
        />
        <Select
          withAsterisk
          disabled={isLoadingCategories}
          placeholder={isLoadingCategories ? 'Loading...' : ''}
          label="Category"
          data={recordsCategory}
          searchable
          key={form.key('category_id')}
          {...form.getInputProps('category_id')}
        />
        <Select
          withAsterisk
          disabled={isLoadingCategories}
          placeholder={isLoadingCategories ? 'Loading...' : ''}
          label="Sub Category"
          data={recordsSubCategory}
          searchable
          key={form.key('sub_category_id')}
          {...form.getInputProps('sub_category_id')}
        />
        <NumberInput
          withAsterisk
          prefix="Rp "
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          label="Amount"
          key={form.key('amount')}
          {...form.getInputProps('amount')}
        />
        <TextInput
          withAsterisk
          label="Description"
          key={form.key('description')}
          {...form.getInputProps('description')}
        />
        <TextInput
          withAsterisk
          label="Reference Number"
          key={form.key('reference_number')}
          {...form.getInputProps('reference_number')}
        />
      </Stack>
      <Group justify="flex-end" mt="xl">
        <Button
          variant="outline"
          color="gray"
          onClick={() => modals.closeAll()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          Save
        </Button>
      </Group>
      {error && (
        <Flex justify="flex-end">
          <ErrorMessage message={error?.message} />
        </Flex>
      )}
    </form>
  );
}

function Transactions() {
  const { page, limit, handlePageChange, handleLimitChange } = usePagination(
    1,
    10
  );
  const { data, isLoading, refetch } = useQuery(
    ['transactions', page, limit],
    () =>
      useGetTransactions({
        limit,
        page,
      })
  );

  const records = data?.response?.data.map((item) => ({
    id: item.id,
    amount: item.amount,
    list_category: item.list_category.is_income,
    category: item.list_category.name,
    sub_category: item.list_sub_category.name,
    bank_name: item.list_account.bank_name,
    description: item.description,
    created_at: item.created_at,
    account_id: item.list_account.id,
    category_id: item.list_category.id,
    sub_category_id: item.list_sub_category.id,
    reference_number: item.reference_number,
  }));

  const handleEditTransaction = (data) => {
    modals.open({
      title: 'Edit Transaction',
      centered: true,
      children: (
        <AddAndEditTransaction data={data} refetchTransactions={refetch} />
      ),
    });
  };

  const handleAddTransaction = () => {
    modals.open({
      title: 'Add Transaction',
      centered: true,
      children: <AddAndEditTransaction refetchTransactions={refetch} />,
    });
  };

  return (
    <Container size="xl" flex={1} p="xl">
      <Title order={3}>Transactions</Title>
      <Text size="sm" mb="xl">
        Detailed Transaction of Users
      </Text>

      <Group justify="space-between" my="lg">
        <Flex gap="sm">
          <Input
            placeholder="Search Transaction"
            leftSection={<IconSearch size={16} />}
          />
          <Select placeholder="Select Status" data={['Active', 'Inactive']} />
        </Flex>
        <Group justify="center">
          <Button leftSection={<IconDownload size={14} />} variant="default">
            Download
          </Button>
          <Button
            onClick={handleAddTransaction}
            leftSection={<IconPlus size={18} />}
          >
            Transaction
          </Button>
        </Group>
      </Group>
      <Card withBorder p="lg" pt="0" radius="sm">
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
          records={records}
          columns={[
            { accessor: 'id', hidden: true },
            {
              accessor: 'is_income',
              title: '',
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
            { accessor: 'bank_name' },
            { accessor: 'category' },
            { accessor: 'sub_category' },
            { accessor: 'description' },
            {
              accessor: 'created_at',
              render: ({ created_at }) => (
                <Text>{moment(created_at).format('YYYY-MM-DD HH:mm')}</Text>
              ),
            },
            {
              accessor: 'actions',
              title: '',
              textAlign: 'right',
              render: (data) => (
                <Group gap={4} justify="right" wrap="nowrap">
                  <Tooltip label="Edit Transaction">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="blue"
                      onClick={() => handleEditTransaction(data)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              ),
            },
          ]}
        />
      </Card>
    </Container>
  );
}

export default Transactions;
