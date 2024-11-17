import {
  Badge,
  Button,
  Card,
  Container,
  Flex,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { IconCalendar, IconFilter, IconSearch } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  useGetLogActivities,
  useGetOptionUsers,
} from '../../helpers/apiHelper';
import usePagination from '../../helpers/usePagination';
import useSizeContainer from '../../helpers/useSizeContainer';
import { modals } from '@mantine/modals';

function FilterLogActivities({
  isLoadingUsers,
  recordsUsers,
  setUser,
  setAction,
  value,
  setValue,
  refetch,
  isLoading,
}) {
  return (
    <>
      <Select
        disabled={isLoadingUsers}
        placeholder={isLoadingUsers ? 'Loading...' : 'Select User'}
        data={recordsUsers}
        onChange={setUser}
        searchable
      />
      <TextInput
        placeholder="Actions"
        onChange={(event) => setAction(event.currentTarget.value)}
      />
      <DatePickerInput
        miw={185}
        leftSection={<IconCalendar size={16} />}
        leftSectionPointerEvents="none"
        type="range"
        placeholder="Pick dates range"
        value={value}
        onChange={setValue}
      />
      <Button
        onClick={refetch}
        loading={isLoading}
        leftSection={<IconSearch size={16} />}
      >
        Search
      </Button>
    </>
  );
}

function LogActivities() {
  const [user, setUser] = useState('');
  const [action, setAction] = useState('');
  const [value, setValue] = useState([null, null]);
  const isMobile = useMediaQuery(`(max-width: 1100px)`);
  const sizeContainer = useSizeContainer((state) => state.sizeContainer);
  const { page, limit, handlePageChange, handleLimitChange } = usePagination(
    1,
    10
  );
  const { data, isLoading, refetch, error } = useQuery(
    ['log-activities', page, limit],
    () =>
      useGetLogActivities({
        limit,
        page,
        ...(user && { user_id: user }),
        ...(action && { action: action }),
        ...(value.every((el) => el !== null) && {
          start_date: `${moment(value[0]).format('YYYY-MM-DD')}T00:00:00Z`,
          end_date: `${moment(value[1]).format('YYYY-MM-DD')}T00:00:00Z`,
        }),
      }),
    {
      onSuccess: () => {
        modals.closeAll();
      },
    }
  );

  const { data: optionUsers, isLoading: isLoadingUsers } = useQuery(
    ['users'],
    () => useGetOptionUsers()
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

  const recordsUsers = optionUsers?.response.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const handleFilter = () => {
    modals.open({
      title: 'Filter Transactions',
      centered: true,
      size: 'xs',
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <Stack gap="md">
          <FilterLogActivities
            isLoadingUsers={isLoadingUsers}
            recordsUsers={recordsUsers}
            setUser={setUser}
            setAction={setAction}
            value={value}
            setValue={setValue}
            refetch={refetch}
            isLoading={isLoading}
          />
        </Stack>
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
      {isMobile ? (
        <Button
          mb="lg"
          variant="light"
          onClick={handleFilter}
          leftSection={<IconFilter size={18} />}
        >
          Filter
        </Button>
      ) : (
        <Flex gap="sm" mb="lg">
          <FilterLogActivities
            isLoadingUsers={isLoadingUsers}
            recordsUsers={recordsUsers}
            setUser={setUser}
            setAction={setAction}
            value={value}
            setValue={setValue}
            refetch={refetch}
            isLoading={isLoading}
          />
        </Flex>
      )}

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
            { accessor: 'user_id', noWrap: true },
            { accessor: 'action' },
            { accessor: 'activity', noWrap: true },
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
          ]}
        />
      </Card>
    </Container>
  );
}

export default LogActivities;
