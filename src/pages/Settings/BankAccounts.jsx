import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Group,
  Input,
  NumberFormatter,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import {
  IconDownload,
  IconEdit,
  IconFilter,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import React from 'react';
import { useMutation, useQuery } from 'react-query';
import ErrorMessage from '../../components/ErrorMessage';
import {
  useGetAccountBank,
  usePostAccountBank,
  usePutAccountBank,
} from '../../helpers/apiHelper';
import { notificationSuccess } from '../../helpers/notificationHelper';
import usePagination from '../../helpers/usePagination';

function AddAndEditBankAccount({ data, refetchBankAccounts }) {
  const isAdd = data ? false : true;

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: data?.name || '',
      bank_name: data?.bank_name || '',
      account_number: data?.account_number || '',
      current_balance: data?.current_balance || '',
    },

    validate: {
      name: (value) =>
        value.trim().length > 0 ? null : 'Account name is required',
      bank_name: (value) =>
        value.trim().length > 0 ? null : 'Bank name is required',
      account_number: (value) =>
        String(value).trim().length > 0 ? null : 'Account Number is required',
      current_balance: (value) =>
        String(value).trim().length > 0 ? null : 'Current Balance is required',
    },
  });

  const { mutate, isLoading, error } = useMutation(
    isAdd ? usePostAccountBank : usePutAccountBank,
    {
      onSuccess: () => {
        refetchBankAccounts();
        modals.closeAll();
        notificationSuccess(
          `Bank Account ${isAdd ? 'added' : 'updated'} successfully`
        );
      },
    }
  );

  const handleSave = (values) => {
    const body = {
      ...values,
      account_number: String(values.account_number),
      ...(!isAdd && { id: data?.id }),
    };

    if (!isAdd) delete body.current_balance;
    mutate(body);
  };

  return (
    <form onSubmit={form.onSubmit(handleSave)}>
      <Stack gap="xs">
        <TextInput
          withAsterisk
          label="Bank"
          key={form.key('bank_name')}
          {...form.getInputProps('bank_name')}
        />
        <TextInput
          withAsterisk
          label="Account Name"
          key={form.key('name')}
          {...form.getInputProps('name')}
        />
        <NumberInput
          withAsterisk
          allowDecimal={false}
          label="Account Number"
          key={form.key('account_number')}
          {...form.getInputProps('account_number')}
        />
        <NumberInput
          withAsterisk
          disabled={!isAdd}
          prefix="Rp "
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          label="Current Balance"
          key={form.key('current_balance')}
          {...form.getInputProps('current_balance')}
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

function BankAccounts() {
  const { page, limit, handlePageChange, handleLimitChange } = usePagination(
    1,
    10
  );
  const { data, isLoading, error, refetch } = useQuery(
    ['bank-accounts', page, limit],
    () =>
      useGetAccountBank({
        limit,
        page,
      })
  );

  const records = data?.response?.data.map((item) => ({
    id: item.id,
    bank_name: item.bank_name,
    name: item.name,
    account_number: item.account_number,
    current_balance: item.current_balance,
    status: item.status,
    created_at: item.created_at,
  }));

  const handleAddBankAccount = () => {
    modals.open({
      title: 'Add Bank Account',
      centered: true,
      children: <AddAndEditBankAccount refetchBankAccounts={refetch} />,
    });
  };

  const handleEditBankAccount = (data) => {
    modals.open({
      title: 'Edit Bank Account',
      centered: true,
      children: (
        <AddAndEditBankAccount data={data} refetchBankAccounts={refetch} />
      ),
    });
  };

  return (
    <>
      <Group justify="space-between" my="lg">
        <Input
          placeholder="Search Bank Account"
          leftSection={<IconSearch size={16} />}
        />
        <Group justify="center">
          <Button
            onClick={() => {}}
            leftSection={<IconFilter size={14} />}
            variant="default"
          >
            Filters
          </Button>
          <Button leftSection={<IconDownload size={14} />} variant="default">
            Download
          </Button>
          <Button
            onClick={handleAddBankAccount}
            leftSection={<IconPlus size={18} />}
          >
            Bank Account
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
          noRecordsText={
            error ? `Error: ${error?.message}` : 'No records found'
          }
          records={records}
          columns={[
            { accessor: 'id', hidden: true },
            { accessor: 'bank_name' },
            { accessor: 'name' },
            { accessor: 'account_number' },
            {
              accessor: 'current_balance',
              render: ({ current_balance }) => (
                <NumberFormatter
                  value={current_balance}
                  prefix="Rp "
                  decimalScale={2}
                  thousandSeparator="."
                  decimalSeparator=","
                />
              ),
            },
            {
              accessor: 'status',
              render: ({ status }) => (
                <Badge radius="sm" color={status ? 'green' : 'red'}>
                  {status ? 'Active' : 'Inactive'}
                </Badge>
              ),
            },
            {
              accessor: 'created_at',
              render: ({ created_at }) => (
                <Text>{moment(created_at).format('YYYY-MM-DD HH:mm')}</Text>
              ),
            },
            {
              accessor: 'actions',
              title: <Box mr={6}></Box>,
              textAlign: 'right',
              render: (data) => (
                <Tooltip label="Edit Account Bank">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="blue"
                    onClick={() => handleEditBankAccount(data)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}

export default BankAccounts;
