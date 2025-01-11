import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Flex,
  Group,
  Image,
  Loader,
  Menu,
  NumberFormatter,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
  IconCalendar,
  IconCreditCardPay,
  IconDownload,
  IconEdit,
  IconFileTypePdf,
  IconFilter,
  IconPhoto,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import ErrorMessage from '../../components/ErrorMessage';
import ImageFullScreen from '../../components/ImageFullScreen';
import UploadImage from '../../components/UploadImage';
import {
  useDeleteInvoice,
  useDeleteTransactionImages,
  useGetInvoiceImages,
  useGetInvoiceTotalPaid,
  useGetInvoices,
  useGetOptionAccounts,
  useGetOptionCategories,
  usePostInvoiceTransaction,
} from '../../helpers/apiHelper';
import exportToPDF from '../../helpers/exportToPDF';
import {
  notificationError,
  notificationSuccess,
} from '../../helpers/notificationHelper';
import usePagination from '../../helpers/usePagination';
import useSizeContainer from '../../helpers/useSizeContainer';
import useFileUpload from '../../helpers/useUploadFile';
import PrintInvoice from './PrintInvoice';
function MakeATransaction({ data, refetchInvoices }) {
  const form = useForm({
    mode: 'controlled',
    initialValues: {
      account_id: data?.account_id || null,
      category_id: data?.category_id || null,
      sub_category_id: data?.sub_category_id || null,
      transaction_date: data?.transaction_date
        ? moment(data.transaction_date)
        : new Date(),
      amount: '',
      description: '',
      reference_number: data?.reference_number || '',
    },
    validate: {
      account_id: (value) => (value ? null : 'Bank Account is required'),
      category_id: (value) => (value ? null : 'Category is required'),
      sub_category_id: (value) => (value ? null : 'Sub Category is required'),
      amount: (value) =>
        value > 0 ? null : 'Amount is required and must be greater than 0',
      reference_number: (value) =>
        value.trim().length > 0 ? null : 'Reference number is required',
    },
  });

  const [files, setFiles] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);

  form.watch('category_id', () => {
    form.setFieldValue('sub_category_id', null);
  });

  const { data: optionAccounts, isLoading: isLoadingAccounts } = useQuery(
    ['accounts'],
    () => useGetOptionAccounts()
  );

  const { data: dataTotalPaid, isLoading: isLoadingTotalPaid } = useQuery(
    ['total-paid', data?.reference_number],
    () => useGetInvoiceTotalPaid({ reference_number: data?.reference_number })
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
      group: 'Debit',
      items: (optionCategories?.response || [])
        .filter((category) => category.is_income === true)
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

  const { mutate, isLoading, error } = useMutation(usePostInvoiceTransaction, {
    onSuccess: async (res, variables) => {
      try {
        const containObject = files.some((url) => typeof url === 'object');
        if (files.length > 0 && containObject) {
          res = await useFileUpload(
            `/finance/transaction/upload/${variables.id}`,
            files.filter((file) => typeof file !== 'string')
          );
        }

        if (deletedFiles.length > 0) {
          res = await useDeleteTransactionImages(variables.id, {
            files: deletedFiles,
          });
        }

        if (res?.code === 200) {
          refetchInvoices();
          modals.closeAll();
          notificationSuccess(`Make a Payment successfully`);
        }
      } catch (err) {
        notificationError(err.message);
        throw err;
      }
    },
  });

  const handleSave = (values) => {
    const transactionDate = `${moment(values.transaction_date).format(
      'YYYY-MM-DD'
    )}T00:00:00Z`;

    mutate({
      ...values,
      id: uuidv4(),
      transaction_date: transactionDate,
    });
  };

  return (
    <form onSubmit={form.onSubmit(handleSave)}>
      <Stack gap="xs">
        <TextInput
          readOnly
          withAsterisk
          label="Invoice Number"
          key={form.key('reference_number')}
          {...form.getInputProps('reference_number')}
        />
        {/* <Select
          readOnly
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
          readOnly
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
          readOnly
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
        /> */}
        <NumberInput
          allowNegative={false}
          withAsterisk
          clampBehavior="strict"
          min={0}
          max={(data?.amount || 0) - (dataTotalPaid?.response?.payment || 0)}
          prefix="Rp "
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          label="Amount"
          description={
            <Text size="xs">
              <NumberFormatter
                value={dataTotalPaid?.response?.payment || 0}
                prefix="Rp "
                decimalScale={2}
                thousandSeparator="."
                decimalSeparator=","
              />{' '}
              has been paid, and{' '}
              <NumberFormatter
                value={
                  (data?.amount || 0) - (dataTotalPaid?.response?.payment || 0)
                }
                prefix="Rp "
                decimalScale={2}
                thousandSeparator="."
                decimalSeparator=","
              />{' '}
              remains
            </Text>
          }
          key={form.key('amount')}
          {...form.getInputProps('amount')}
        />
        <DatePickerInput
          maxDate={new Date()}
          rightSection={<IconCalendar size={18} />}
          label="Payment Date"
          key={form.key('transaction_date')}
          {...form.getInputProps('transaction_date')}
          // value={invoiceDate}
          // onChange={(value) => {
          //   setDueDate(null);
          //   setInvoiceDate(value);
          // }}
        />
        <UploadImage
          files={files}
          setFiles={setFiles}
          setDeletedFiles={setDeletedFiles}
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

function DeleteInvoice({ id, reference_number, refetchInvoices }) {
  const { mutate, isLoading, error } = useMutation(useDeleteInvoice, {
    onSuccess: () => {
      refetchInvoices();
      modals.closeAll();
      notificationSuccess(`Invoice Deleted successfully`);
    },
  });

  const {
    data: dataTotalPaid,
    isLoading: isLoadingTotalPaid,
    error: errorTotalPaid,
  } = useQuery(['total-paid', reference_number], () =>
    useGetInvoiceTotalPaid({ reference_number: reference_number })
  );

  const hasPayment = dataTotalPaid?.response?.payment > 0;

  const handleDelete = () => mutate({ id });

  return (
    <>
      {isLoadingTotalPaid && (
        <Center h={100}>
          <Loader />
        </Center>
      )}
      {!isLoadingTotalPaid && errorTotalPaid && (
        <Center h={100}>
          <ErrorMessage message="ini error" />
        </Center>
      )}
      {!isLoadingTotalPaid && !errorTotalPaid && (
        <>
          {hasPayment && (
            <Center h={100}>
              <Text size="sm">
                This invoice {reference_number} cannot be deleted because
                payment has already been made.
              </Text>
            </Center>
          )}
          {!hasPayment && (
            <>
              <Text size="sm">
                Are you sure you want to delete invoice ${reference_number} ?
              </Text>
              <Group justify="flex-end" mt="xl">
                <Button
                  variant="outline"
                  color="gray"
                  onClick={() => modals.closeAll()}
                >
                  Cancel
                </Button>
                <Button color="red" loading={isLoading} onClick={handleDelete}>
                  Delete
                </Button>
              </Group>
              {error && (
                <Flex justify="flex-end">
                  <ErrorMessage message={error?.message} />
                </Flex>
              )}
            </>
          )}
        </>
      )}
    </>
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
  setIsPaid,
}) {
  return (
    <>
      <Select
        placeholder="Select Status"
        data={['Paid', 'Unpaid']}
        onChange={setIsPaid}
        clearable
      />
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

function ViewImages({ id }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const { data, isLoading, error, isFetching } = useQuery(
    ['invoice-images', id],
    () => useGetInvoiceImages(id),
    {
      onSuccess: (res) => {
        if (res?.code === 200 && res?.response?.length > 0) {
          setSelectedImage(res?.response[0]);
        }
      },
    }
  );

  const handleDownload = () => {
    const imageUrl = `https://dev.arieslibre.my.id/api/v1/public/invoice/download/${id}/${selectedImage}`;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = selectedImage;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const dataNotFound = data?.response?.length === 0;

  return (
    <Box>
      {isLoading && (
        <Center h={300}>
          <Loader />
        </Center>
      )}

      {!isLoading && !error && dataNotFound && (
        <Center h={300}>
          <Text>No Images</Text>
        </Center>
      )}

      {!isLoading && !error && !dataNotFound && (
        <>
          <Box pos="relative">
            <ImageFullScreen
              w="100%"
              h={400}
              fit="contain"
              radius="sm"
              src={`https://dev.arieslibre.my.id/api/v1/public/invoice/download/${id}/${selectedImage}`}
            />
            <Tooltip label="Download">
              <ActionIcon
                color="blue"
                size="lg"
                radius="sm"
                pos="absolute"
                right={8}
                top={8}
                onClick={handleDownload}
              >
                <IconDownload strokeWidth={3} size={18} />
              </ActionIcon>
            </Tooltip>
          </Box>
          <Box h={8} />
          <Group gap="xs">
            {data?.response?.map((item, i) => (
              <Image
                onClick={() => setSelectedImage(item)}
                style={{
                  cursor: 'pointer',
                  border:
                    selectedImage === item
                      ? '2px solid var(--mantine-color-red-5)'
                      : 'none',
                  transform: selectedImage === item ? 'scale(1.2)' : 'scale(1)',
                  transition: 'transform 0.1s ease-out', // Ease-in transition for smooth scaling
                  width: 50,
                  height: 50,
                }}
                w={50}
                h={50}
                bg={'dark.8'}
                fit="contain"
                radius="sm"
                src={`https://dev.arieslibre.my.id/api/v1/public/invoice/download/${id}/${item}`}
              />
            ))}
          </Group>
        </>
      )}
    </Box>
  );
}

function Invoices() {
  const navigate = useNavigate();
  const [printData, setPrintData] = useState(null);
  const [isPaid, setIsPaid] = useState(null);
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
        ...(isPaid === 'Paid' && { is_paid: true }),
        ...(isPaid === 'Unpaid' && { is_paid: false }),
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
    is_paid: item.is_paid,
    client: item.list_client.name,
    client_id: item.list_client.id,
    client_address: item.list_client.address,
    invoice_date: item.invoice_date,
    transaction_date: item.transaction_date,
    due_date: item.due_date,
    amount: item.total,
    category: item.list_category?.name,
    sub_category: item.list_sub_category?.name,
    bank_name: item.list_account.bank_name,
    bank_account: item.list_account.name,
    bank_account_number: item.list_account.account_number,
    notes: item.notes,
    created_at: item.created_at,
    account_id: item.list_account.id,
    category_id: item.list_category?.id,
    sub_category_id: item.list_sub_category?.id,
    created_by: item.list_employee.email,
    list_invoice_item: item.list_invoice_item,
    with_holding_tax: item.with_holding_tax,
    value_added_tax: item.value_added_tax,
    value_added_tax_percentage: item.value_added_tax_percentage,
    with_holding_tax_percentage: item.with_holding_tax_percentage,
  }));

  const handleEditInvoice = (data) => {
    navigate(`/invoice`, { state: { data, mode: 'edit' } });
  };

  const handleMakeATransaction = (data) => {
    modals.open({
      title: 'Make a Payment',
      centered: true,
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <MakeATransaction data={data} refetchInvoices={refetch} />,
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
      group: 'Debit',
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
            setIsPaid={setIsPaid}
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

  const handleDeleteInvoice = (id, reference_number) => {
    modals.open({
      title: 'Delete Invoice',
      centered: true,
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <DeleteInvoice
          id={id}
          reference_number={reference_number}
          refetchInvoices={refetch}
        />
      ),
    });
  };

  const handleViewImages = (id) => {
    modals.open({
      title: 'View Images',
      centered: true,
      radius: 'md',

      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <ViewImages id={id} />,
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
              setIsPaid={setIsPaid}
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
          highlightOnHover
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
              accessor: 'is_paid',
              title: 'Status',
              width: 100,
              render: ({ is_paid }) => (
                <Badge
                  variant="outline"
                  radius="xl"
                  color={is_paid ? 'green' : 'red'}
                >
                  {is_paid ? 'Paid' : 'Unpaid'}
                </Badge>
              ),
            },
            {
              accessor: 'reference_number',
              title: 'Invoice Number',
              render: (record) => (
                <Anchor
                  onClick={() => {
                    navigate(`/invoice`, {
                      state: { data: record, mode: 'detail' },
                    });
                  }}
                  underline="always"
                >
                  {record.reference_number}
                </Anchor>
              ),
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
            {
              accessor: 'due_date',
              noWrap: true,
              render: ({ due_date }) => (
                <Text>{moment(due_date).format('YYYY-MM-DD HH:mm')}</Text>
              ),
            },
            { accessor: 'created_by', noWrap: true },
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
                  {!data.is_paid && (
                    <Tooltip label="Make a Payment">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="green"
                        onClick={() => handleMakeATransaction(data)}
                      >
                        <IconCreditCardPay size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  <Menu width={200} shadow="md">
                    <Menu.Target>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="green.8"
                        onClick={() => {
                          setPrintData(data);
                        }}
                      >
                        <IconDownload size={16} />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item
                        onClick={() => exportToPDF('invoice')}
                        rightSection={<IconFileTypePdf size={20} />}
                      >
                        Download as PDF
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                  <Tooltip label="View Images">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="teal"
                      onClick={() => handleViewImages(data.id)}
                    >
                      <IconPhoto size={16} />
                    </ActionIcon>
                  </Tooltip>
                  {!data.is_paid && (
                    <>
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
                      <Tooltip label="Delete Invoice">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="red"
                          onClick={() =>
                            handleDeleteInvoice(data.id, data.reference_number)
                          }
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </>
                  )}
                </Group>
              ),
            },
          ]}
        />
      </Card>
      <PrintInvoice data={printData} />
    </Container>
  );
}

export default Invoices;
