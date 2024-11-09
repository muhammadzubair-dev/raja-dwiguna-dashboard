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
  useGetUsers,
  usePostChangeAccountStatus,
} from '../../helpers/apiHelper';
import usePagination from '../../helpers/usePagination';
import { modals } from '@mantine/modals';
import ErrorMessage from '../../components/ErrorMessage';

function ChangeAccountStatus({ id, status, email }) {
  const [value, setValue] = useState(status);
  const { mutate, isLoading, error } = useMutation(usePostChangeAccountStatus, {
    onSuccess: (data) => {
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
        label="Please select new status"
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

function TabContent({ isAccount }) {
  const [opened, { open, close }] = useDisclosure(false);
  const { page, limit, handlePageChange, handleLimitChange } = usePagination(
    1,
    10
  );
  const { data, isLoading } = useQuery(['users', page, limit, isAccount], () =>
    useGetUsers({
      limit,
      page,
      is_account: isAccount,
    })
  );

  const records = data?.response?.data.map((item) => ({
    employee_id: item.employee_id,
    email: item.email,
    first_name: item.first_name,
    last_name: item.last_name,
    phone_number: item.phone_number,
    created_at: item.created_at,
    status: item.status,
    roles: item.list_user_role.map((item) => item.list_role.name),
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

  const handleChangeStatus = (id, status, email) => {
    modals.open({
      title: 'Change Status',
      centered: true,
      children: <ChangeAccountStatus id={id} status={status} email={email} />,
    });
  };

  return (
    <>
      <Group justify="space-between" my="lg">
        <Input
          placeholder="Search User"
          leftSection={<IconSearch size={16} />}
        />
        <Group justify="center">
          <Button
            onClick={open}
            leftSection={<IconFilter size={14} />}
            variant="default"
          >
            Filters
          </Button>
          <Button leftSection={<IconDownload size={14} />} variant="default">
            Download
          </Button>
          <Button leftSection={<IconPlus size={18} />}>Accounts</Button>
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
            { accessor: 'employee_id', hidden: true },
            { accessor: 'email' },
            { accessor: 'first_name' },
            { accessor: 'last_name' },
            { accessor: 'phone_number' },
            {
              accessor: 'created_at',
              render: ({ created_at }) => (
                <Text>{moment(created_at).format('YYYY-MM-DD HH:mm')}</Text>
              ),
            },
            {
              accessor: 'roles',
              render: ({ roles }) => (
                <Group gap="xs">
                  {roles.map((role) => (
                    <Badge variant="outline" color="gray">
                      {role}
                    </Badge>
                  ))}
                </Group>
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
              accessor: 'actions',
              title: <Box mr={6}></Box>,
              textAlign: 'right',
              render: ({ employee_id, status, email }) => (
                <Group gap={4} justify="right" wrap="nowrap">
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
                  <Tooltip label="Delete Account">
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
      <Drawer
        offset={8}
        radius="md"
        opened={opened}
        onClose={close}
        title="Filter Accounts"
        position="right"
      >
        {/* Drawer content */}
      </Drawer>
    </>
  );
}

function Users() {
  return (
    <Container size="xl" flex={1} p="xl">
      <Title order={3}>Accounts</Title>
      <Text size="sm" mb="xl">
        Detailed User Accounts
      </Text>

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
