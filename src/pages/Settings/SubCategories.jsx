import { Badge, Button, Card, Group, Input, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDownload,
  IconFilter,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import React from 'react';
import { useQuery } from 'react-query';
import { useGetSubCategories } from '../../helpers/apiHelper';
import usePagination from '../../helpers/usePagination';

function SubCategories() {
  const [opened, { open, close }] = useDisclosure(false);
  const { page, limit, handlePageChange, handleLimitChange } = usePagination(
    1,
    10
  );
  const { data, isLoading, error } = useQuery(
    ['sub-categories', page, limit],
    () =>
      useGetSubCategories({
        limit,
        page,
      })
  );

  const records = data?.response?.data.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    status: item.status,
    updated_at: item.created_at,
    created_at: item.created_at,
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
          noRecordsText={
            error ? `Error: ${error?.message}` : 'No records found'
          }
          records={records}
          columns={[
            { accessor: 'name' },
            { accessor: 'description' },
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
          ]}
        />
      </Card>
    </>
  );
}

export default SubCategories;
