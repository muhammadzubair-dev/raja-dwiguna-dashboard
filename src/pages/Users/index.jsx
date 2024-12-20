import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  Container,
  Flex,
  Group,
  Radio,
  Tabs,
  Text,
  Stack,
  Tooltip,
  Center,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconArrowBarUp,
  IconClick,
  IconEdit,
  IconKeyFilled,
  IconLockPlus,
  IconRefresh,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import ErrorMessage from '../../components/ErrorMessage';
import {
  useGetRoles,
  useGetUsers,
  usePutUserRole,
  usePostChangeAccountStatus,
  useGetOptionRoles,
  usePostAccount,
  usePostResetPassword,
} from '../../helpers/apiHelper';
import { notificationSuccess } from '../../helpers/notificationHelper';
import usePagination from '../../helpers/usePagination';
import useSizeContainer from '../../helpers/useSizeContainer';

function ResetPassword({ id, email }) {
  const { mutate, isLoading, error } = useMutation(usePostResetPassword, {
    onSuccess: () => {
      modals.closeAll();
      notificationSuccess(`Reset Password successfully`);
    },
  });

  const handleAccount = () => mutate({ id });

  return (
    <>
      <Text size="sm">Are you sure you want to Reset Password {email} ?</Text>
      <Group justify="flex-end" mt="xl">
        <Button
          flex={1}
          fullWidth
          variant="outline"
          color="gray"
          onClick={() => modals.closeAll()}
        >
          Cancel
        </Button>
        <Button flex={1} fullWidth loading={isLoading} onClick={handleAccount}>
          Submit
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

function ChangeToAccount({ id, email, refetchUsers }) {
  const { mutate, isLoading, error } = useMutation(usePostAccount, {
    onSuccess: () => {
      refetchUsers();
      modals.closeAll();
      notificationSuccess(`Role deleted successfully`);
    },
  });

  const handleAccount = () => mutate({ id });

  return (
    <>
      <Text size="sm">
        Are you sure you want to change {email} to an account ?
      </Text>
      <Group justify="flex-end" mt="xl">
        <Button
          flex={1}
          fullWidth
          variant="outline"
          color="gray"
          onClick={() => modals.closeAll()}
        >
          Cancel
        </Button>
        <Button flex={1} fullWidth loading={isLoading} onClick={handleAccount}>
          Submit
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

function EditRoles({ id, dataIds, refetchUsers }) {
  const [valueIds, setValueIds] = useState(dataIds || []);
  const {
    data: dataRoles,
    isLoading: isLoadingRoles,
    error: errorRoles,
  } = useQuery(['roles-option'], useGetOptionRoles);

  const { mutate, isLoading, error } = useMutation(usePutUserRole, {
    onSuccess: () => {
      refetchUsers();
      modals.closeAll();
      notificationSuccess(`Roles updated successfully`);
    },
  });

  const recordRoles = dataRoles?.response;
  const recordRolesIds = recordRoles?.map((item) => item.id);

  const handleSave = () => {
    const insert_id = valueIds;
    const deleted_id = recordRolesIds.filter(
      (item) => !valueIds.includes(item)
    );
    mutate({ id, insert_id, deleted_id });
  };

  return (
    <>
      <Checkbox.Group value={valueIds} onChange={setValueIds}>
        <Stack gap="xs">
          {recordRoles?.map((item) => (
            <Checkbox value={item.id} key={item.id} label={item.name} />
          ))}
        </Stack>
      </Checkbox.Group>
      <Group justify="center" mt="lg">
        <Button
          variant="outline"
          color="gray"
          flex={1}
          fullWidth
          onClick={() => modals.closeAll()}
          disabled={isLoadingRoles || isLoading}
        >
          Cancel
        </Button>
        <Button
          flex={1}
          fullWidth
          onClick={handleSave}
          loading={isLoadingRoles || isLoading}
        >
          Save
        </Button>
      </Group>
      {(error || errorRoles) && (
        <Flex justify="center">
          <ErrorMessage message={error?.message || errorRoles?.message} />
        </Flex>
      )}
    </>
  );
}

function ChangeAccountStatus({ id, status, email, refetchUsers }) {
  const [value, setValue] = useState(status);

  const { mutate, isLoading, error } = useMutation(usePostChangeAccountStatus, {
    onSuccess: () => {
      refetchUsers();
      notificationSuccess('Account status changed successfully');
      modals.closeAll();
    },
  });

  const handleSave = () => {
    mutate({ id, status: value === 'true' ? true : false });
  };

  return (
    <>
      <Radio.Group
        value={value}
        onChange={setValue}
        name="chageStatus"
        label="Please select status"
        description={`email: ${email}`}
        withAsterisk
      >
        <Group mt="xs">
          <Radio value="true" label="Active" />
          <Radio value="false" label="Inactive" />
        </Group>
      </Radio.Group>
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
        <Button flex={1} fullWidth onClick={handleSave} loading={isLoading}>
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

function TabContent({ isAccount }) {
  const { page, limit, handlePageChange, handleLimitChange } = usePagination(
    1,
    10
  );
  const { data, isLoading, error, refetch } = useQuery(
    ['users', page, limit, isAccount],
    () =>
      useGetUsers({
        limit,
        page,
        is_account: isAccount,
      })
  );

  const records = data?.response?.data.map((item) => ({
    employee_id: item.employee_id,
    id: item.id,
    email: item.email,
    first_name: item.first_name,
    last_name: item.last_name,
    phone_number: item.phone_number,
    created_at: item.created_at,
    status: item.status,
    roles_ids: item.list_user_role.map((item) => item.list_role.id),
    roles: item.list_user_role.map((item) => item.list_role.name),
  }));

  const handleChangeStatus = (id, status, email) => {
    modals.open({
      title: 'Change Status',
      centered: true,
      radius: 'md',
      size: 'xs',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <ChangeAccountStatus
          id={id}
          status={status}
          email={email}
          refetchUsers={refetch}
        />
      ),
    });
  };

  const handleEditRoles = (id, rolesIds) => {
    modals.open({
      title: 'Edit Roles',
      size: 'xs',
      centered: true,
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <EditRoles id={id} dataIds={rolesIds} refetchUsers={refetch} />,
    });
  };

  const handleAccount = (id, email) => {
    modals.open({
      title: 'Change To Account',
      centered: true,
      size: 'xs',
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <ChangeToAccount id={id} email={email} refetchUsers={refetch} />
      ),
    });
  };

  const handleResetPassword = (id, email) => {
    modals.open({
      title: 'Reset Password',
      centered: true,
      size: 'xs',
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <ResetPassword id={id} email={email} />,
    });
  };

  return (
    <>
      <Card withBorder p="0" radius="sm" mt="sm">
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
            {
              accessor: 'index',
              title: 'No',
              textAlign: 'center',
              width: 40,
              render: (record) =>
                records.indexOf(record) + 1 + limit * (page - 1),
            },
            { accessor: 'employee_id', hidden: true },
            { accessor: 'email' },
            { accessor: 'first_name' },
            { accessor: 'last_name' },
            { accessor: 'phone_number' },
            {
              accessor: 'created_at',
              width: 160,
              render: ({ created_at }) => (
                <Text>{moment(created_at).format('YYYY-MM-DD HH:mm')}</Text>
              ),
            },
            {
              accessor: 'roles',
              render: ({ roles }) => (
                <Group gap={2}>
                  {roles.map((role) => (
                    <Badge key={role} variant="outline" color="gray">
                      {role}
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
              accessor: 'actions',
              title: (
                <Tooltip label="Refresh">
                  <ActionIcon variant="subtle" onClick={refetch} radius="xl">
                    <IconRefresh size={16} />
                  </ActionIcon>
                </Tooltip>
              ),
              textAlign: 'right',
              render: ({ id, employee_id, status, email, roles_ids }) => {
                if (isAccount) {
                  return (
                    <Group gap={4} justify="right" wrap="nowrap">
                      <Tooltip label="ResetPassword">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="red"
                          onClick={() => handleResetPassword(id, email)}
                        >
                          <IconKeyFilled size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Edit Roles">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="yellow"
                          onClick={() => handleEditRoles(id, roles_ids)}
                        >
                          <IconLockPlus size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Change Status">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="blue"
                          onClick={() =>
                            handleChangeStatus(
                              employee_id,
                              status ? 'true' : 'false',
                              email
                            )
                          }
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  );
                }
                return (
                  <Tooltip label="Change to Account">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="yellow"
                      onClick={() => handleAccount(id, email)}
                    >
                      <IconArrowBarUp size={16} />
                    </ActionIcon>
                  </Tooltip>
                ); // If isAccount is true, no actions column will be rendered
              },
            },
          ]}
        />
      </Card>
    </>
  );
}

function Users() {
  const sizeContainer = useSizeContainer((state) => state.sizeContainer);
  return (
    <Container
      size="xl"
      flex={1}
      fluid={sizeContainer === 'fluid'}
      p={{ base: 'md', md: 'xl' }}
    >
      <Tabs defaultValue="Accounts">
        <Tabs.List>
          <Tabs.Tab value="Accounts">Accounts</Tabs.Tab>
          <Tabs.Tab value="Not Accounts">Not Accounts</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="Accounts" pt="xs">
          <TabContent isAccount={true} />
        </Tabs.Panel>

        <Tabs.Panel value="Not Accounts" pt="xs">
          <TabContent isAccount={false} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}

export default Users;
