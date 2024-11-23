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
  useGetClients,
  usePostClient,
  usePutClient,
} from '../../helpers/apiHelper';
import { notificationSuccess } from '../../helpers/notificationHelper';
import usePagination from '../../helpers/usePagination';

function AddAndEditClient({ data, refetchClients }) {
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
    isAdd ? usePostClient : usePutClient,
    {
      onSuccess: () => {
        refetchClients();
        modals.closeAll();
        notificationSuccess(
          `Client ${isAdd ? 'added' : 'updated'} successfully`
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
          allowNegative={false}
          withAsterisk
          allowDecimal={false}
          label="Account Number"
          key={form.key('account_number')}
          {...form.getInputProps('account_number')}
        />
        <NumberInput
          allowNegative={false}
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
          flex={1}
          fullWidth
          variant="outline"
          color="gray"
          onClick={() => modals.closeAll()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button flex={1} fullWidth type="submit" loading={isLoading}>
          Save
        </Button>
      </Group>
      {error && (
        <Flex justify="center">
          <ErrorMessage message={error?.message} />
        </Flex>
      )}
    </form>
  );
}

function Clients() {
  const { page, limit, handlePageChange, handleLimitChange } = usePagination(
    1,
    10
  );
  const { data, isLoading, error, refetch } = useQuery(
    ['clients', page, limit],
    () =>
      useGetClients({
        limit,
        page,
      })
  );

  const records = data?.response?.data.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    address: item.address,
    status: item.status,
    created_at: item.created_at,
  }));

  const handleAddClient = () => {
    modals.open({
      title: 'Add Client',
      centered: true,
      radius: 'md',
      size: 'xs',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <AddAndEditClient refetchClients={refetch} />,
    });
  };

  const handleEditClient = (data) => {
    modals.open({
      title: 'Edit Client',
      centered: true,
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <AddAndEditClient data={data} refetchClients={refetch} />,
    });
  };

  return (
    <>
      {/* <Group justify="space-between" my="lg"> */}
      {/* <Input
          placeholder="Search Bank Account"
          leftSection={<IconSearch size={16} />}
        /> */}
      {/* <Group justify="center"> */}
      {/* <Button
            onClick={() => {}}
            leftSection={<IconFilter size={14} />}
            variant="default"
          >
            Filters
          </Button>
          <Button leftSection={<IconDownload size={14} />} variant="default">
            Download
          </Button> */}
      <Group justify="flex-end" mb="sm">
        <Button onClick={handleAddClient} leftSection={<IconPlus size={18} />}>
          Client
        </Button>
      </Group>
      {/* </Group> */}
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

            { accessor: 'name', noWrap: true },
            { accessor: 'phone', noWrap: true },
            { accessor: 'email', noWrap: true },
            { accessor: 'address' },
            {
              accessor: 'status',
              width: 100,
              render: ({ status }) => (
                <Badge radius="sm" color={status ? 'green' : 'red'}>
                  {status ? 'Active' : 'Inactive'}
                </Badge>
              ),
            },
            {
              accessor: 'created_at',
              noWrap: true,
              render: ({ created_at }) => (
                <Text>{moment(created_at).format('YYYY-MM-DD HH:mm')}</Text>
              ),
            },
            {
              accessor: 'actions',
              title: '',
              textAlign: 'right',
              render: (data) => (
                <Tooltip label="Edit Account Bank">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="blue"
                    onClick={() => handleEditClient(data)}
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

export default Clients;
