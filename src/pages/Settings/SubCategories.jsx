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
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
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
  useDeleteSubCategory,
  useGetOptionCategories,
  useGetSubCategories,
  usePostSubCategory,
  usePutSubCategory,
} from '../../helpers/apiHelper';
import { notificationSuccess } from '../../helpers/notificationHelper';
import usePagination from '../../helpers/usePagination';

function AddAndEditSubCategory({ data, refetchSubCategories }) {
  const isAdd = data ? false : true;
  const { data: optionCategories, isLoading: isLoadingCategories } = useQuery(
    ['categories'],
    () => useGetOptionCategories()
  );

  const recordsCategory = optionCategories?.response.map(({ id, name }) => ({
    value: id,
    label: name,
  }));

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      transaction_category_id: data?.transaction_category_id || null,
      name: data?.name || '',
      description: data?.description || '',
    },

    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Name is required'),
      transaction_category_id: (value) =>
        value ? null : 'Category is required',
      // description: (value) =>
      //   value.trim().length > 0 ? null : 'Description is required',
    },
  });

  const { mutate, isLoading, error } = useMutation(
    isAdd ? usePostSubCategory : usePutSubCategory,
    {
      onSuccess: () => {
        refetchSubCategories();
        modals.closeAll();
        notificationSuccess(
          `SubCategory ${isAdd ? 'added' : 'updated'} successfully`
        );
      },
    }
  );

  const handleSave = (values) => {
    const body = {
      ...values,
      ...(!isAdd && { id: data?.id }),
    };

    if (!isAdd) delete body.transaction_category_id;

    mutate(body);
  };

  return (
    <form onSubmit={form.onSubmit(handleSave)}>
      <Stack gap="xs">
        <Select
          withAsterisk
          disabled={isLoadingCategories || !isAdd}
          placeholder={isLoadingCategories ? 'Loading...' : ''}
          label="Category"
          data={recordsCategory}
          searchable
          key={form.key('transaction_category_id')}
          {...form.getInputProps('transaction_category_id')}
        />
        <TextInput
          withAsterisk
          label="SubCategory Name"
          key={form.key('name')}
          {...form.getInputProps('name')}
        />
        <Textarea
          autosize
          minRows={3}
          label="Description"
          key={form.key('description')}
          {...form.getInputProps('description')}
        />
      </Stack>
      <Group justify="flex-end" mt="xl">
        <Button
          variant="outline"
          color="gray"
          flex={1}
          fullWidth
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

function DeleteSubCategory({ id, name, refetchSubCategories }) {
  const { mutate, isLoading, error } = useMutation(useDeleteSubCategory, {
    onSuccess: () => {
      refetchSubCategories();
      modals.closeAll();
      notificationSuccess(`SubCategory deleted successfully`);
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
          Delete SubCategory
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

function SubCategories() {
  const { page, limit, handlePageChange, handleLimitChange } = usePagination(
    1,
    10
  );
  const { data, isLoading, error, refetch } = useQuery(
    ['sub-categories', page, limit],
    () =>
      useGetSubCategories({
        limit,
        page,
      })
  );

  const records = data?.response?.data.map((item) => ({
    id: item.id,
    is_income: item?.list_transaction_category?.is_income,
    transaction_category_id: item?.list_transaction_category?.id,
    category: item?.list_transaction_category?.name,
    name: item.name,
    description: item.description,
    status: item.status,
    updated_at: item.created_at,
    created_at: item.created_at,
  }));

  const handleAddSubCategory = () => {
    modals.open({
      title: 'Add SubCategory',
      centered: true,
      radius: 'md',
      size: 'xs',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <AddAndEditSubCategory refetchSubCategories={refetch} />,
    });
  };

  const handleEditSubCategory = (data) => {
    modals.open({
      title: 'Edit SubCategory',
      centered: true,
      radius: 'md',
      size: 'xs',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <AddAndEditSubCategory data={data} refetchSubCategories={refetch} />
      ),
    });
  };

  const handleDeleteSubCategory = (id, name) => {
    modals.open({
      title: 'Delete Sub Category',
      centered: true,
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <DeleteSubCategory id={id} name={name} refetchSubCategories={refetch} />
      ),
    });
  };

  return (
    <>
      {/* <Group justify="space-between" my="lg">
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
            onClick={handleAddSubCategory}
            leftSection={<IconPlus size={18} />}
          >
            SubCategory
          </Button>
        </Group>
      </Group> */}
      <Group justify="flex-end" mb="sm">
        <Button
          onClick={handleAddSubCategory}
          leftSection={<IconPlus size={18} />}
        >
          Sub Category
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
          records={records}
          noRecordsText={
            error ? `Error: ${error?.message}` : 'No records found'
          }
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
              width: 100,
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
            { accessor: 'category' },
            { accessor: 'name', title: 'Sub Category' },
            { accessor: 'description' },
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
              render: (data) => (
                <Group gap={4} justify="right" wrap="nowrap">
                  <Tooltip label="Edit Role">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="blue"
                      onClick={() => handleEditSubCategory(data)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete Role">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      onClick={() =>
                        handleDeleteSubCategory(data.id, data.name)
                      }
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

export default SubCategories;
