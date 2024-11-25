import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Group,
  Input,
  NumberFormatter,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import {
  IconCalendar,
  IconDownload,
  IconEdit,
  IconFilter,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import ErrorMessage from '../../components/ErrorMessage';
import {
  useGetOptionAccounts,
  useGetOptionCategories,
  useGetInvoices,
  usePostInvoice,
  usePutInvoice,
} from '../../helpers/apiHelper';
import { notificationSuccess } from '../../helpers/notificationHelper';
import usePagination from '../../helpers/usePagination';
import { DatePickerInput } from '@mantine/dates';
import useSizeContainer from '../../helpers/useSizeContainer';
import { useMediaQuery } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';

function AddAndEditInvoice({ data, refetchInvoices }) {
  const isAdd = data ? false : true;
  const form = useForm({
    mode: 'controlled',
    initialValues: {
      account_id: data?.account_id || null,
      category_id: data?.category_id || null,
      sub_category_id: data?.sub_category_id || null,
      amount: data?.amount || '',
      description: data?.description || '',
      reference_number: data?.reference_number || '',
    },
    validate: {
      account_id: (value) => (value ? null : 'Bank Account is required'),
      category_id: (value) => (value ? null : 'Category is required'),
      sub_category_id: (value) => (value ? null : 'Sub Category is required'),
      amount: (value) =>
        String(value).trim().length > 0
          ? null
          : 'Amount is required and must be greater than 0',
      // description: (value) =>
      //   value.trim().length > 0 ? null : 'Description is required',
      reference_number: (value) =>
        value.trim().length > 0 ? null : 'Reference number is required',
    },
  });

  form.watch('category_id', () => {
    form.setFieldValue('sub_category_id', null);
  });

  const { data: optionAccounts, isLoading: isLoadingAccounts } = useQuery(
    ['accounts'],
    () => useGetOptionAccounts()
  );

  const { data: optionCategories, isLoading: isLoadingCategories } = useQuery(
    ['categories'],
    () => useGetOptionCategories()
  );

  const recordsAccount = optionAccounts?.response.map(
    ({ bank_name, name, id }) => ({
      value: id,
      label: `${bank_name} - ${name}`,
    })
  );

  const recordsCategory = [
    {
      group: 'Income',
      items: (optionCategories?.response || [])
        .filter((category) => category.is_income === true)
        .map(({ id, name }) => ({ value: id, label: name })),
    },
    {
      group: 'Outcome',
      items: (optionCategories?.response || [])
        .filter((category) => category.is_income === false)
        .map(({ id, name }) => ({ value: id, label: name })),
    },
  ];

  const findSubCategory = optionCategories?.response.find(
    ({ id }) => id === form.values?.category_id
  );

  const recordsSubCategory = findSubCategory?.list_transaction_sub_category.map(
    ({ id, name }) => ({
      value: id,
      label: name,
    })
  );

  const { mutate, isLoading, error } = useMutation(
    isAdd ? usePostInvoice : usePutInvoice,
    {
      onSuccess: () => {
        refetchInvoices();
        modals.closeAll();
        notificationSuccess(
          `Invoice ${isAdd ? 'added' : 'updated'} successfully`
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
          disabled={isLoadingAccounts}
          placeholder={isLoadingAccounts ? 'Loading...' : ''}
          label="Bank Account"
          data={recordsAccount}
          searchable
          key={form.key('account_id')}
          {...form.getInputProps('account_id')}
        />
        <Select
          withAsterisk
          disabled={isLoadingCategories}
          placeholder={isLoadingCategories ? 'Loading...' : ''}
          label="Category"
          data={recordsCategory}
          searchable
          key={form.key('category_id')}
          {...form.getInputProps('category_id')}
        />
        <Select
          withAsterisk
          disabled={isLoadingCategories || recordsSubCategory?.length === 0}
          placeholder={
            isLoadingCategories
              ? 'Loading...'
              : recordsSubCategory?.length === 0
              ? 'No Sub Category, Please select another Category'
              : ''
          }
          label="Sub Category"
          data={recordsSubCategory}
          searchable
          key={form.key('sub_category_id')}
          {...form.getInputProps('sub_category_id')}
        />
        <NumberInput
          allowNegative={false}
          withAsterisk
          prefix="Rp "
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          label="Amount"
          key={form.key('amount')}
          {...form.getInputProps('amount')}
        />
        <TextInput
          withAsterisk
          label="Reference Number"
          key={form.key('reference_number')}
          {...form.getInputProps('reference_number')}
        />
        <Textarea
          // withAsterisk
          autosize
          minRows={3}
          label="Description"
          key={form.key('description')}
          {...form.getInputProps('description')}
        />
      </Stack>
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

function FilterInvoices({
  setInvoiceNumber,
  isLoadingCategories,
  recordsCategory,
  setCategory,
  recordsSubCategory,
  setSubCategory,
  rangeDates,
  setRangeDates,
  isLoading,
  refetch,
}) {
  return (
    <>
      <TextInput
        placeholder="Invoice Number"
        onChange={(event) => setInvoiceNumber(event.currentTarget.value)}
      />
      <Select
        disabled={isLoadingCategories}
        placeholder={isLoadingCategories ? 'Loading...' : 'Select Category'}
        data={recordsCategory}
        onChange={setCategory}
        searchable
        clearable
      />
      <Select
        disabled={isLoadingCategories || recordsSubCategory?.length === 0}
        placeholder={
          isLoadingCategories
            ? 'Loading...'
            : recordsSubCategory?.length === 0
            ? 'No Sub Category, Please select another Category'
            : 'Select Sub Category'
        }
        data={recordsSubCategory}
        onChange={setSubCategory}
        searchable
        clearable
      />
      <DatePickerInput
        miw={185}
        leftSection={<IconCalendar size={16} />}
        leftSectionPointerEvents="none"
        type="range"
        placeholder="Pick dates range"
        value={rangeDates}
        onChange={setRangeDates}
        clearable
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

function Invoices() {
  const navigate = useNavigate();
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [category, setCategory] = useState(null);
  const [subCategory, setSubCategory] = useState(null);
  const isMobile = useMediaQuery(`(max-width: 1100px)`);
  const [rangeDates, setRangeDates] = useState([null, null]);
  const sizeContainer = useSizeContainer((state) => state.sizeContainer);
  const { page, limit, handlePageChange, handleLimitChange } = usePagination(
    1,
    10
  );
  const { data, isLoading, refetch, error } = useQuery(
    ['invoices', page, limit],
    () =>
      useGetInvoices({
        limit,
        page,
        ...(invoiceNumber && { reference_number: invoiceNumber }),
        ...(category && { category_id: category }),
        ...(subCategory && { sub_category_id: subCategory }),
        ...(rangeDates.every((el) => el !== null) && {
          start_date: `${moment(rangeDates[0]).format('YYYY-MM-DD')}T00:00:00Z`,
          end_date: `${moment(rangeDates[1]).format('YYYY-MM-DD')}T00:00:00Z`,
        }),
      }),
    {
      onSuccess: () => {
        modals.closeAll();
      },
    }
  );
  const { data: optionCategories, isLoading: isLoadingCategories } = useQuery(
    ['categories'],
    () => useGetOptionCategories()
  );

  const records = data?.response?.data.map((item) => ({
    id: item.id,
    reference_number: item.reference_number,
    client: item.list_client.name,
    due_date: item.due_date,
    amount: item.total,
    category: item.list_category?.name,
    sub_category: item.list_sub_category?.name,
    bank_name: item.list_account.bank_name,
    notes: item.notes,
    created_at: item.created_at,
    account_id: item.list_account.id,
    category_id: item.list_category?.id,
    sub_category_id: item.list_sub_category?.id,
    created_by: item.list_employee.email,
  }));

  const handleEditInvoice = (data) => {
    modals.open({
      title: 'Edit Invoice',
      centered: true,
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <AddAndEditInvoice data={data} refetchInvoices={refetch} />,
    });
  };

  const handleAddInvoice = () => {
    modals.open({
      title: 'Add Invoice',
      centered: true,
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <AddAndEditInvoice refetchInvoices={refetch} />,
    });
  };

  const recordsCategory = [
    {
      group: 'Income',
      items: (optionCategories?.response || [])
        .filter((category) => category.is_income === true)
        .map(({ id, name }) => ({ value: id, label: name })),
    },
  ];

  const findSubCategory = optionCategories?.response.find(
    ({ id }) => id === category
  );

  const recordsSubCategory = findSubCategory?.list_transaction_sub_category.map(
    ({ id, name }) => ({
      value: id,
      label: name,
    })
  );

  const handleFilter = () => {
    modals.open({
      title: 'Filter Invoices',
      centered: true,
      size: 'xs',
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <Stack gap="md">
          <FilterInvoices
            setInvoiceNumber={setInvoiceNumber}
            isLoadingCategories={isLoadingCategories}
            recordsCategory={recordsCategory}
            setCategory={setCategory}
            recordsSubCategory={recordsSubCategory}
            setSubCategory={setSubCategory}
            rangeDates={rangeDates}
            setRangeDates={setRangeDates}
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
      <Group justify="space-between" mb="lg">
        {isMobile ? (
          <Button
            variant="light"
            onClick={handleFilter}
            leftSection={<IconFilter size={18} />}
          >
            Filter
          </Button>
        ) : (
          <Flex gap="sm" wrap="wrap">
            <FilterInvoices
              setInvoiceNumber={setInvoiceNumber}
              isLoadingCategories={isLoadingCategories}
              recordsCategory={recordsCategory}
              setCategory={setCategory}
              recordsSubCategory={recordsSubCategory}
              setSubCategory={setSubCategory}
              rangeDates={rangeDates}
              setRangeDates={setRangeDates}
              refetch={refetch}
              isLoading={isLoading}
            />
          </Flex>
        )}

        <Group justify="center">
          <Button
            onClick={() => navigate('/invoice')}
            leftSection={<IconPlus size={18} />}
          >
            Invoice
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
            { accessor: 'id', hidden: true },

            {
              accessor: 'index',
              title: 'No',
              textAlign: 'center',
              width: 40,
              render: (record) =>
                records.indexOf(record) + 1 + limit * (page - 1),
            },
            {
              accessor: 'reference_number',
              title: 'Invoice Number',
              ...(sizeContainer !== 'fluid' && { width: 150, ellipsis: true }),
            },
            { accessor: 'client' },

            { accessor: 'bank_name' },
            { accessor: 'category' },
            { accessor: 'sub_category' },
            {
              accessor: 'amount',
              noWrap: true,
              render: ({ amount }) => (
                <NumberFormatter
                  value={amount}
                  prefix="Rp "
                  decimalScale={2}
                  thousandSeparator="."
                  decimalSeparator=","
                />
              ),
            },

            {
              accessor: 'notes',
              ...(sizeContainer !== 'fluid' && { width: 250, ellipsis: true }),
            },
            { accessor: 'created_by', noWrap: true },
            {
              accessor: 'due_date',
              noWrap: true,
              render: ({ due_date }) => (
                <Text>{moment(due_date).format('YYYY-MM-DD HH:mm')}</Text>
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
                  <Tooltip label="Edit Invoice">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="blue"
                      onClick={() => handleEditInvoice(data)}
                    >
                      <IconEdit size={16} />
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

export default Invoices;
