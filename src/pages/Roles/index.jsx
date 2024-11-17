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
  Select,
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
  useDeleteRole,
  useGetRoles,
  useGetUsers,
  usePostChangeAccountStatus,
  usePostRole,
  usePutRole,
} from '../../helpers/apiHelper';
import usePagination from '../../helpers/usePagination';
import { modals } from '@mantine/modals';
import ErrorMessage from '../../components/ErrorMessage';
import { notificationSuccess } from '../../helpers/notificationHelper';
import useSizeContainer from '../../helpers/useSizeContainer';

function AddAndEditRole({ id, role, refetchRoles }) {
  const isAdd = id && role ? false : true;
  const [value, setValue] = useState(role || '');
  const { mutate, isLoading, error } = useMutation(
    isAdd ? usePostRole : usePutRole,
    {
      onSuccess: () => {
        refetchRoles();
        modals.closeAll();
        notificationSuccess(`Role ${isAdd ? 'added' : 'updated'} successfully`);
      },
    }
  );

  const handleSave = () => {
    mutate({ name: value, ...(!isAdd && { id }) });
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
        <Button onClick={handleSave} loading={isLoading}>
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

function DeleteRole({ id, name, refetchRoles }) {
  const { mutate, isLoading, error } = useMutation(useDeleteRole, {
    onSuccess: () => {
      refetchRoles();
      modals.closeAll();
      notificationSuccess(`Role deleted successfully`);
    },
  });

  const handleDelete = () => mutate({ id });

  return (
    <>
      <Text size="sm">
        Are you sure you want to delete role {name} ? This action is destructive
        and you will have to contact support to restore your data.
      </Text>
      <Group justify="flex-end" mt="xl">
        <Button
          variant="outline"
          color="gray"
          onClick={() => modals.closeAll()}
        >
          No don't delete it
        </Button>
        <Button color="red" loading={isLoading} onClick={handleDelete}>
          Delete account
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
  const sizeContainer = useSizeContainer((state) => state.sizeContainer);
  const { page, limit, handlePageChange, handleLimitChange } = usePagination(
    1,
    10
  );
  const { data, isLoading, refetch, error } = useQuery(
    ['roles', page, limit],
    () =>
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

  const handleDeleteRole = (id, name) => {
    modals.open({
      title: 'Delete Role',
      centered: true,
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <DeleteRole id={id} name={name} refetchRoles={refetch} />,
    });
  };

  const handleEditRole = (id, role) => {
    modals.open({
      title: 'Edit Role',
      centered: true,
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <AddAndEditRole id={id} role={role} refetchRoles={refetch} />,
    });
  };

  const handleAddRole = () => {
    modals.open({
      title: 'Add Role',
      centered: true,
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <AddAndEditRole refetchRoles={refetch} />,
    });
  };

  return (
    <Container
      size="xl"
      flex={1}
      fluid={sizeContainer === 'fluid'}
      p={{ base: 'md', md: 'xl' }}
    >
      <Group mb="sm" justify="flex-end">
        <Button onClick={handleAddRole} leftSection={<IconPlus size={18} />}>
          Role
        </Button>
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
            { accessor: 'name', noWrap: true },
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
              accessor: 'updated_at',
              noWrap: true,
              render: ({ updated_at }) => (
                <Text>{moment(updated_at).format('YYYY-MM-DD HH:mm')}</Text>
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
                      onClick={() => handleDeleteRole(id, name)}
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
