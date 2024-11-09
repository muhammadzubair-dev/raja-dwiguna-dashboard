import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Drawer,
  Flex,
  Group,
  Input,
  Radio,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDownload,
  IconEdit,
  IconEye,
  IconFilter,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import {
  useGetRoles,
  useGetUsers,
  usePostChangeAccountStatus,
  usePutRole,
} from '../../helpers/apiHelper';
import usePagination from '../../helpers/usePagination';
import { modals } from '@mantine/modals';
import ErrorMessage from '../../components/ErrorMessage';
import { notificationSuccess } from '../../helpers/notificationHelper';

function EditRole({ id, role }) {
  const [value, setValue] = useState(role);
  const { mutate, isLoading, error } = useMutation(usePutRole, {
    onSuccess: () => {
      modals.closeAll();
      notificationSuccess('Role updated successfully');
    },
  });

  const handleSave = () => {
    mutate({ id, name: value });
  };

  return (
    <>
      <TextInput
        label="Role Name"
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
      />
      <Group justify="flex-end" mt="xl">
        <Button
          variant="outline"
          color="gray"
          onClick={() => modals.closeAll()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} isLoading={isLoading}>
          Save
        </Button>
      </Group>
      {error && (
        <Flex justify="flex-end">
          <ErrorMessage message={error?.message} />
        </Flex>
      )}
    </>
  );
}

function Roles() {
  const { page, limit, handlePageChange, handleLimitChange } = usePagination(
    1,
    10
  );
  const { data, isLoading } = useQuery(['roles', page, limit], () =>
    useGetRoles({
      limit,
      page,
    })
  );

  const records = data?.response?.data.map((item) => ({
    id: item.id,
    name: item.name,
    status: item.status,
    updated_at: item.updated_at,
    created_at: item.created_at,
    // roles: item.list_user_role.map((item) => item.list_role.name),
  }));

  const handleDeleteAccount = (id) => {
    modals.open({
      title: 'Delete Account',
      centered: true,
      children: (
        <>
          <Text size="sm">
            Are you sure you want to delete Account with id {id} ? This action
            is destructive and you will have to contact support to restore your
            data.
          </Text>
          <Group justify="flex-end" mt="xl">
            <Button
              variant="outline"
              color="gray"
              onClick={() => modals.closeAll()}
            >
              No don't delete it
            </Button>
            <Button color="red" onClick={() => modals.closeAll()}>
              Delete account
            </Button>
          </Group>
        </>
      ),
    });
  };

  const handleEditRole = (id, role) => {
    modals.open({
      title: 'Edit Role',
      centered: true,
      children: <EditRole id={id} role={role} />,
    });
  };

  return (
    <Container size="xl" flex={1} p="xl">
      <Title order={3}>Roles</Title>
      <Text size="sm" mb="xl">
        Detailed Role Users
      </Text>

      <Group justify="space-between" my="lg">
        <Input
          placeholder="Search Role"
          leftSection={<IconSearch size={16} />}
        />
        <Group justify="center">
          <Button leftSection={<IconDownload size={14} />} variant="default">
            Download
          </Button>
          <Button leftSection={<IconPlus size={18} />}>Role</Button>
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
            { accessor: 'name' },
            {
              accessor: 'status',
              render: ({ status }) => (
                <Badge radius="sm" color={status ? 'green' : 'red'}>
                  {status ? 'Active' : 'Inactive'}
                </Badge>
              ),
            },
            {
              accessor: 'updated_at',
              render: ({ updated_at }) => (
                <Text>{moment(updated_at).format('YYYY-MM-DD HH:mm')}</Text>
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
              render: ({ id, name }) => (
                <Group gap={4} justify="right" wrap="nowrap">
                  <Tooltip label="Edit Role">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="blue"
                      onClick={() => handleEditRole(id, name)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete Role">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      onClick={() => handleDeleteAccount(employee_id)}
                    >
                      <IconTrash size={16} />
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

export default Roles;
