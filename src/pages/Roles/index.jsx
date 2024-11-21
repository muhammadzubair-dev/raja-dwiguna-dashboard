import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  Container,
  Flex,
  Group,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconEdit,
  IconLockPlus,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import ErrorMessage from '../../components/ErrorMessage';
import {
  useDeleteRole,
  useGetOptionModules,
  useGetRoles,
  usePostRole,
  usePutRole,
  usePutRolePermissions,
} from '../../helpers/apiHelper';
import { notificationSuccess } from '../../helpers/notificationHelper';
import usePagination from '../../helpers/usePagination';
import useSizeContainer from '../../helpers/useSizeContainer';

function EditPermissions({ id, dataIds, refetchRoles }) {
  const [valueIds, setValueIds] = useState(dataIds || []);
  const {
    data: dataModules,
    isLoading: isLoadingModules,
    error: errorModules,
  } = useQuery(['modules'], useGetOptionModules);

  const { mutate, isLoading, error } = useMutation(usePutRolePermissions, {
    onSuccess: () => {
      refetchRoles();
      modals.closeAll();
      notificationSuccess(`Role permissions updated successfully`);
    },
  });

  const recordsModules = dataModules?.response
    ?.map((item) => item.list_permission)
    .flat();

  const recordModulesIds = recordsModules?.map((item) => item.id);

  const handleSave = () => {
    const insert_id = valueIds;
    const deleted_id = recordModulesIds.filter(
      (item) => !valueIds.includes(item)
    );
    mutate({ id, insert_id, deleted_id });
  };

  return (
    <>
      <Checkbox.Group value={valueIds} onChange={setValueIds}>
        <Stack gap="xs">
          {recordsModules?.map((item) => (
            <Checkbox value={item.id} key={item.id} label={item.name} />
          ))}
        </Stack>
      </Checkbox.Group>
      <Group justify="center" mt="lg">
        <Button
          variant="outline"
          color="gray"
          onClick={() => modals.closeAll()}
          disabled={isLoadingModules || isLoading}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} loading={isLoadingModules || isLoading}>
          Save
        </Button>
      </Group>
      {(error || errorModules) && (
        <Flex justify="center">
          <ErrorMessage message={error?.message || errorModules?.message} />
        </Flex>
      )}
    </>
  );
}

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
      <Group justify="center" mt="xl">
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
        <Flex justify="center">
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
    permissions: (item?.list_role_permission || []).map(
      (item) => item.list_permission.name
    ),
    permissions_ids: (item?.list_role_permission || []).map(
      (item) => item.list_permission.id
    ),
    status: item.status,
    updated_at: item.updated_at,
    created_at: item.created_at,
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
      size: 'xs',
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <AddAndEditRole id={id} role={role} refetchRoles={refetch} />,
    });
  };

  const handleAddRole = () => {
    modals.open({
      title: 'Add Role',
      centered: true,
      size: 'xs',
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <AddAndEditRole refetchRoles={refetch} />,
    });
  };

  const handleEditPermissions = (id, permissionsIds) => {
    modals.open({
      title: 'Edit Permissions',
      size: 'xs',
      centered: true,
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <EditPermissions
          id={id}
          dataIds={permissionsIds}
          refetchRoles={refetch}
        />
      ),
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
              accessor: 'permissions',
              render: ({ permissions }) => (
                <Group gap={2}>
                  {permissions.map((item) => (
                    <Badge size="xs" key={item}>
                      {item}
                    </Badge>
                  ))}
                </Group>
              ),
            },
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
              render: ({ id, name, permissions_ids }) => (
                <Group gap={4} justify="right" wrap="nowrap">
                  <Tooltip label="Edit Permission">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="yellow"
                      onClick={() => handleEditPermissions(id, permissions_ids)}
                    >
                      <IconLockPlus size={16} />
                    </ActionIcon>
                  </Tooltip>
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
