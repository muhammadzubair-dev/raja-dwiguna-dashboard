import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  Flex,
  Group,
  Input,
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
  IconTrash,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import React from 'react';
import { useMutation, useQuery } from 'react-query';
import ErrorMessage from '../../components/ErrorMessage';
import {
  useDeleteCategory,
  useGetCategories,
  usePostCategory,
  usePutCategory,
} from '../../helpers/apiHelper';
import { notificationSuccess } from '../../helpers/notificationHelper';
import usePagination from '../../helpers/usePagination';

function AddAndEditCategory({ data, refetchCategories }) {
  const isAdd = data ? false : true;

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: data?.name || '',
      description: data?.description || '',
      is_income: data?.is_income || 'false',
    },

    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Name is required'),
      description: (value) =>
        value.trim().length > 0 ? null : 'Description is required',
    },
  });

  const { mutate, isLoading, error } = useMutation(
    isAdd ? usePostCategory : usePutCategory,
    {
      onSuccess: () => {
        refetchCategories();
        modals.closeAll();
        notificationSuccess(
          `Category ${isAdd ? 'added' : 'updated'} successfully`
        );
      },
    }
  );

  const handleSave = (values) => {
    const body = {
      ...values,
      is_income: values?.is_income === 'true' ? true : false,
      ...(!isAdd && { id: data?.id }),
    };

    mutate(body);
  };

  return (
    <form onSubmit={form.onSubmit(handleSave)}>
      <Stack gap="xs">
        <TextInput
          withAsterisk
          label="Category Name"
          key={form.key('name')}
          {...form.getInputProps('name')}
        />
        <TextInput
          withAsterisk
          label="Description"
          key={form.key('description')}
          {...form.getInputProps('description')}
        />
        <Chip.Group
          key={form.key('is_income')}
          {...form.getInputProps('is_income')}
        >
          <Group mt="xs" justify="flex-start" gap="xs">
            <Chip value="true" color="green">
              Income
            </Chip>
            <Chip value="false" color="red">
              Outcome
            </Chip>
          </Group>
        </Chip.Group>
      </Stack>
      <Group justify="flex-end" mt="xl">
        <Button
          variant="outline"
          color="gray"
          onClick={() => modals.closeAll()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          Save
        </Button>
      </Group>
      {error && (
        <Flex justify="flex-end">
          <ErrorMessage message={error?.message} />
        </Flex>
      )}
    </form>
  );
}

function DeleteCategory({ id, name, refetchCategories }) {
  const { mutate, isLoading, error } = useMutation(useDeleteCategory, {
    onSuccess: () => {
      refetchCategories();
      modals.closeAll();
      notificationSuccess(`Category deleted successfully`);
    },
  });

  const handleDelete = () => mutate({ id });

  return (
    <>
      <Text size="sm">
        Are you sure you want to delete category {name} ? This action is
        destructive and you will have to contact support to restore your data.
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
          Delete Category
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

function Categories() {
  const { page, limit, handlePageChange, handleLimitChange } = usePagination(
    1,
    10
  );
  const { data, isLoading, error, refetch } = useQuery(
    ['categories', page, limit],
    () =>
      useGetCategories({
        limit,
        page,
      })
  );

  const records = data?.response?.data.map((item) => ({
    id: item.id,
    is_income: item.is_income,
    name: item.name,
    description: item.description,
    status: item.status,
    updated_at: item.created_at,
    created_at: item.created_at,
  }));

  const handleAddCategory = () => {
    modals.open({
      title: 'Add Category',
      centered: true,
      children: <AddAndEditCategory refetchCategories={refetch} />,
    });
  };

  const handleEditCategory = (data) => {
    modals.open({
      title: 'Add Category',
      centered: true,
      children: (
        <AddAndEditCategory
          data={{ ...data, is_income: data.is_income ? 'true' : 'false' }}
          refetchCategories={refetch}
        />
      ),
    });
  };

  const handleDeleteCategory = (id, name) => {
    modals.open({
      title: 'Delete Category',
      centered: true,
      children: (
        <DeleteCategory id={id} name={name} refetchCategories={refetch} />
      ),
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
            onClick={() => {}}
            leftSection={<IconFilter size={14} />}
            variant="default"
          >
            Filters
          </Button>
          <Button leftSection={<IconDownload size={14} />} variant="default">
            Download
          </Button>
          <Button
            onClick={handleAddCategory}
            leftSection={<IconPlus size={18} />}
          >
            Category
          </Button>
        </Group>
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
            {
              accessor: 'index',
              title: 'No',
              textAlign: 'center',
              width: 40,
              render: (record) =>
                records.indexOf(record) + 1 + limit * (page - 1),
            },
            {
              accessor: 'is_income',
              title: 'Type',
              render: ({ is_income }) => (
                <Badge
                  variant="outline"
                  radius="xl"
                  color={is_income ? 'green' : 'red'}
                >
                  {is_income ? 'Income' : 'Outcome'}
                </Badge>
              ),
            },
            { accessor: 'name', title: 'Category' },
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
            {
              accessor: 'actions',
              title: '',
              textAlign: 'right',
              render: (data) => (
                <Group gap={4} justify="right" wrap="nowrap">
                  <Tooltip label="Edit Role">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="blue"
                      onClick={() => handleEditCategory(data)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete Role">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      onClick={() => handleDeleteCategory(data.id, data.name)}
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
    </>
  );
}

export default Categories;
