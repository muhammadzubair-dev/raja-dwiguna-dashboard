import {
  ActionIcon,
  Box,
  Button,
  Card,
  Center,
  Flex,
  Group,
  NumberInput,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { IconEdit, IconNumber62Small, IconPlus } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import ErrorMessage from '../../components/ErrorMessage';
import {
  useGetClients,
  usePostClient,
  usePutChangeAStatusClient,
  usePutClient,
} from '../../helpers/apiHelper';
import {
  notificationError,
  notificationSuccess,
} from '../../helpers/notificationHelper';
import usePagination from '../../helpers/usePagination';

function AddAndEditClient({ data, refetchClients }) {
  const isAdd = data ? false : true;

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: data?.name || '',
      email: data?.email || '',
      phone: data?.phone
        ? data?.phone.startsWith('62')
          ? data?.phone.slice(2)
          : data?.phone
        : '',
      address: data?.address || '',
    },

    validate: {
      name: (value) =>
        value.trim().length > 0 ? null : 'Account name is required',
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),

      phone: (value) =>
        String(value).trim().length > 0 ? null : 'Phone Number is required',
      address: (value) =>
        value.trim().length > 0 ? null : 'Address is required',
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
      phone: `62${values.phone}`,
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
          label="Name"
          key={form.key('name')}
          {...form.getInputProps('name')}
        />
        <TextInput
          withAsterisk
          label="Email"
          key={form.key('email')}
          {...form.getInputProps('email')}
        />
        <NumberInput
          leftSection={<IconNumber62Small size={26} />}
          allowNegative={false}
          withAsterisk
          allowDecimal={false}
          label="Phone Number"
          key={form.key('phone')}
          {...form.getInputProps('phone')}
        />
        <Textarea
          autosize
          minRows={3}
          label="Address"
          key={form.key('address')}
          {...form.getInputProps('address')}
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

function EditStatus({ id, status }) {
  const [checked, setChecked] = useState(status);
  const { mutate } = useMutation(usePutChangeAStatusClient, {
    onSuccess: (data, variables) => {
      setChecked(variables.status);
      notificationSuccess('Client status changed successfully');
      modals.closeAll();
    },
    onError: (err) => {
      notificationError(err?.message);
    },
  });

  const handleChangeStatus = (values) => {
    mutate({ id, status: values });
  };

  return (
    <Center>
      <Switch
        // disabled
        size="md"
        onLabel={
          <Box px="xs">
            <Text size="xs">Active</Text>
          </Box>
        }
        offLabel={
          <Box px="xs">
            <Text size="xs">Inactive</Text>
          </Box>
        }
        checked={checked}
        onChange={(event) => handleChangeStatus(event.currentTarget.checked)}
      />
    </Center>
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
      size: 'xs',
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
              accessor: 'Status',
              textAlign: 'center',
              width: 200,
              render: ({ id, status }) => (
                <EditStatus id={id} status={status} />
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
                <Tooltip label="Edit Client">
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
