import {
  Badge,
  Card,
  Container,
  Flex,
  Group,
  Input,
  Select,
  Text,
  Title,
  Tooltip,
  rem,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconSearch } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import React, { useState } from 'react';
import usePagination from '../../helpers/usePagination';
import { useGetLogActivities } from '../../helpers/apiHelper';
import { useQuery } from 'react-query';
import moment from 'moment';

const iconCalendar = (
  <IconCalendar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
);

function LogActivities() {
  const [value, setValue] = useState([null, null]);
  const { page, limit, handlePageChange, handleLimitChange } = usePagination(
    1,
    10
  );
  const { data, isLoading, refetch, error } = useQuery(
    ['roles', page, limit],
    () =>
      useGetLogActivities({
        limit,
        page,
      })
  );

  const records = data?.response?.data.map((item) => ({
    id: item.id,
    user_id: item.user_id,
    action: item.action,
    activity: item.activity,
    status: item.status,
    created_at: item.created_at,
    // roles: item.list_user_role.map((item) => item.list_role.name),
  }));

  return (
    <Container size="xl" flex={1} p="xl">
      <Group justify="space-between" my="lg">
        <Flex gap="sm">
          <Select placeholder="Select Accounts" data={['000001', '000002']} />
          <Select placeholder="Select Actions" data={['000001', '000002']} />
        </Flex>
        <DatePickerInput
          leftSection={iconCalendar}
          leftSectionPointerEvents="none"
          type="range"
          placeholder="Pick dates range"
          value={value}
          onChange={setValue}
        />
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
              render: (record) => records.indexOf(record) + 1,
            },
            { accessor: 'user_id' },
            { accessor: 'action' },
            { accessor: 'activity' },
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
          ]}
        />
      </Card>
    </Container>
  );
}

export default LogActivities;
