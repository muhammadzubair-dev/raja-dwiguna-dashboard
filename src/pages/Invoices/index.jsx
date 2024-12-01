import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Group,
  Input,
  Menu,
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
  IconCreditCardPay,
  IconDownload,
  IconEdit,
  IconFileTypePdf,
  IconFilter,
  IconPdf,
  IconPlus,
  IconSearch,
  IconTrash,
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
  useDeleteInvoice,
  usePostInvoiceTransaction,
  useGetInvoiceTotalPaid,
} from '../../helpers/apiHelper';
import { notificationSuccess } from '../../helpers/notificationHelper';
import usePagination from '../../helpers/usePagination';
import { DatePickerInput } from '@mantine/dates';
import useSizeContainer from '../../helpers/useSizeContainer';
import { useMediaQuery } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
      group: 'Income',
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
    onSuccess: () => {
      refetchInvoices();
      modals.closeAll();
      notificationSuccess(`Make a Payment successfully`);
    },
  });

  const handleSave = (values) => {
    const transactionDate = `${moment(values.transaction_date).format(
      'YYYY-MM-DD'
    )}T00:00:00Z`;

    mutate({
      ...values,
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
        <Select
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
        />
        <NumberInput
          allowNegative={false}
          withAsterisk
          clampBehavior="strict"
          min={0}
          max={
            (data?.amount || 0) -
            (data?.amount || 0) * 0.02 -
            (dataTotalPaid?.response?.payment || 0)
          }
          prefix="Rp "
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          label="Amount"
          description={
            <Text size="xs">
              <NumberFormatter
                value={(data?.amount || 0) * 0.02}
                prefix="Rp "
                decimalScale={2}
                thousandSeparator="."
                decimalSeparator=","
              />{' '}
              WHT 23 (2%), and{' '}
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
                  (data?.amount || 0) -
                  (data?.amount || 0) * 0.02 -
                  (dataTotalPaid?.response?.payment || 0)
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

  const handleDelete = () => mutate({ id });

  return (
    <>
      <Text size="sm">
        Are you sure you want to delete invoice {reference_number} ?
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

  const handleExportToPDF = () => {
    const invoiceElement = document.getElementById('invoice-to-capture');

    html2canvas(invoiceElement, { scale: 2 }).then((canvas) => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      const imgWidth = 190; // Width of the PDF (A4)
      const pageHeight = 297; // Height of the PDF (A4)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 10; // Start position

      // Add image to the PDF and handle multi-page content
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        if (heightLeft > 0) {
          pdf.addPage();
          position = 0;
        }
      }

      pdf.save(`invoice-${printData?.reference_number}.pdf`);
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
                          // setTimeout(() => {
                          //   handleExportToPDF();
                          // }, 500);
                        }}
                      >
                        <IconDownload size={16} />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item
                        onClick={handleExportToPDF}
                        rightSection={<IconFileTypePdf size={20} />}
                      >
                        Download as PDF
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
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
