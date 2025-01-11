import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Flex,
  Grid,
  Group,
  Image,
  Input,
  Loader,
  NumberFormatter,
  NumberInput,
  Select,
  Skeleton,
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
  IconPhoto,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Carousel } from '@mantine/carousel';
import ErrorMessage from '../../components/ErrorMessage';
import {
  useGetOptionAccounts,
  useGetOptionCategories,
  useGetTransactions,
  usePostTransaction,
  usePutTransaction,
  useGetTransactionImage,
  useDeleteTransactionImages,
  useGetDashboardBalance,
} from '../../helpers/apiHelper';
import {
  notificationError,
  notificationSuccess,
} from '../../helpers/notificationHelper';
import usePagination from '../../helpers/usePagination';
import { DatePickerInput } from '@mantine/dates';
import useSizeContainer from '../../helpers/useSizeContainer';
import { useMediaQuery } from '@mantine/hooks';
import UploadImage from '../../components/UploadImage';
import { v4 as uuidv4 } from 'uuid';
import useFileUpload from '../../helpers/useUploadFile';
import ImageFullScreen from '../../components/ImageFullScreen';

function AddAndEditTransaction({ data, refetchTransactions }) {
  const isAdd = data ? false : true;
  const [files, setFiles] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);

  const form = useForm({
    mode: 'controlled',
    initialValues: {
      account_id: data?.account_id || null,
      category_id: data?.category_id || null,
      sub_category_id: data?.sub_category_id || null,
      amount: data?.amount || '',
      description: data?.description || '',
      reference_number: data?.reference_number || '',
      transaction_date: data?.transaction_date
        ? moment(data.transaction_date)
        : new Date(),
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

  const {
    data: dataImages,
    isLoading: isLoadingImages,
    error: errorImages,
  } = useQuery(
    ['transaction-images', data?.id],
    () => useGetTransactionImage(data?.id),
    {
      enabled: !isAdd,
      onSuccess: (res) => {
        if (res?.response?.length > 0) {
          setFiles(
            res?.response.map(
              (item) =>
                `https://dev.arieslibre.my.id/api/v1/public/transaction/download/${data?.id}/${item}`
            )
          );
        }
      },
    }
  );

  const { data: optionAccounts, isLoading: isLoadingAccounts } = useQuery(
    ['accounts'],
    () => useGetOptionAccounts()
  );

  const { data: optionCategories, isLoading: isLoadingCategories } = useQuery(
    ['option-categories'],
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
    {
      group: 'Credit',
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
    isAdd ? usePostTransaction : usePutTransaction,
    {
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
            refetchTransactions();
            modals.closeAll();
            notificationSuccess(
              `Transaction ${isAdd ? 'added' : 'updated'} successfully`
            );
          }
        } catch (err) {
          notificationError(err.message);
          throw err;
        }
      },
    }
  );

  const handleSave = (values) => {
    const transactionDate = `${moment(values.transaction_date).format(
      'YYYY-MM-DD'
    )}T00:00:00Z`;

    const body = {
      ...values,
      ...(isAdd && { id: uuidv4() }),
      ...(!isAdd && { id: data?.id }),
      transaction_date: transactionDate,
    };

    if (!isAdd) delete body.transaction_category_id;
    mutate(body);
  };

  return (
    <form onSubmit={form.onSubmit(handleSave)}>
      <Stack gap="xs">
        {/* {isAdd && (
          <> */}
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
        {/* </>
        )} */}
        <TextInput
          withAsterisk
          readOnly={!isAdd}
          label="Reference Number"
          key={form.key('reference_number')}
          {...form.getInputProps('reference_number')}
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
        <DatePickerInput
          maxDate={new Date()}
          rightSection={<IconCalendar size={18} />}
          label="Transaction Date"
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

function ViewImages({ id }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const { data, isLoading, error, isFetching } = useQuery(
    ['transaction-images', id],
    () => useGetTransactionImage(id),
    {
      onSuccess: (res) => {
        if (res?.code === 200 && res?.response?.length > 0) {
          setSelectedImage(res?.response[0]);
        }
      },
    }
  );

  const handleDownload = () => {
    const imageUrl = `https://dev.arieslibre.my.id/api/v1/public/transaction/download/${id}/${selectedImage}`;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = selectedImage;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const dataNotFound = data?.response?.length === 0;
  const isPdf = (selectedImage || '').toLowerCase().endsWith('.pdf');

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
              src={
                isPdf
                  ? 'https://placehold.co/100x70/101113/FFF?text=pdf&font=lato'
                  : `https://dev.arieslibre.my.id/api/v1/public/transaction/download/${id}/${selectedImage}`
              }
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
            {data?.response?.map((item, i) => {
              const isPdf = item.toLowerCase().endsWith('.pdf');
              const itemImage = isPdf
                ? 'https://placehold.co/100x70/101113/FFF?text=pdf&font=lato'
                : `https://dev.arieslibre.my.id/api/v1/public/transaction/download/${id}/${item}`;
              return (
                <Image
                  onClick={() => setSelectedImage(item)}
                  style={{
                    cursor: 'pointer',
                    border:
                      selectedImage === item
                        ? '2px solid var(--mantine-color-red-5)'
                        : 'none',
                    transform:
                      selectedImage === item ? 'scale(1.2)' : 'scale(1)',
                    transition: 'transform 0.1s ease-out', // Ease-in transition for smooth scaling
                  }}
                  w={50}
                  h={50}
                  bg={'dark.8'}
                  fit="contain"
                  radius="sm"
                  src={itemImage}
                />
              );
            })}
          </Group>
        </>
      )}
    </Box>
  );
}

function FilterTransactions({
  setIsIncome,
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
      <Select
        placeholder="Select Type"
        data={[
          { label: 'Debit', value: 'Income' },
          { label: 'Credit', value: 'Outcome' },
        ]}
        onChange={setIsIncome}
        clearable
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

function Transactions() {
  const [isIncome, setIsIncome] = useState(null);
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
    ['transactions', page, limit],
    () =>
      useGetTransactions({
        limit,
        page,
        ...(isIncome === 'Income' && { is_income: true }),
        ...(isIncome === 'Outcome' && { is_income: false }),
        ...(category && { category_id: category }),
        ...(subCategory && { sub_category_id: subCategory }),
        ...(rangeDates.every((el) => el !== null) && {
          start_date: `${moment(rangeDates[0]).format('YYYY-MM-DD')}T00:00:00Z`,
          end_date: `${moment(rangeDates[1]).format('YYYY-MM-DD')}T00:00:00Z`,
        }),
      }),
    {
      // onSuccess: () => {
      //   modals.closeAll();
      // },
    }
  );
  const { data: optionCategories, isLoading: isLoadingCategories } = useQuery(
    ['categories'],
    () => useGetOptionCategories()
  );

  const records = data?.response?.data.map((item) => ({
    id: item.id,
    amount: item.amount,
    current_balance: item.current_balance,
    is_income: item.list_category?.is_income,
    category: item.list_category?.name,
    sub_category: item.list_sub_category?.name,
    bank_name: item.list_account.bank_name,
    description: item.description,
    transaction_date: item.transaction_date,
    created_at: item.created_at,
    account_id: item.list_account.id,
    category_id: item.list_category?.id,
    sub_category_id: item.list_sub_category?.id,
    reference_number: item.reference_number,
    created_by: item.list_employee.email,
  }));

  const handleEditTransaction = (data) => {
    modals.open({
      title: 'Edit Transaction',
      centered: true,
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <AddAndEditTransaction data={data} refetchTransactions={refetch} />
      ),
    });
  };

  const handleAddTransaction = () => {
    modals.open({
      title: 'Add Transaction',
      centered: true,
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <AddAndEditTransaction refetchTransactions={refetch} />,
    });
  };

  const recordsCategory = [
    ...(isIncome === 'Income' || isIncome === null
      ? [
          {
            group: 'Debit',
            items: (optionCategories?.response || [])
              .filter((category) => category.is_income === true)
              .map(({ id, name }) => ({ value: id, label: name })),
          },
        ]
      : []),

    ...(isIncome === 'Outcome' || isIncome === null
      ? [
          {
            group: 'Credit',
            items: (optionCategories?.response || [])
              .filter((category) => category.is_income === false)
              .map(({ id, name }) => ({ value: id, label: name })),
          },
        ]
      : []),
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
      title: 'Filter Transactions',
      centered: true,
      size: 'xs',
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <Stack gap="md">
          <FilterTransactions
            setIsIncome={setIsIncome}
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
      <Group justify="space-between" mb="xl">
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
            <FilterTransactions
              setIsIncome={setIsIncome}
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
            onClick={handleAddTransaction}
            leftSection={<IconPlus size={18} />}
          >
            Transaction
          </Button>
        </Group>
      </Group>
      <Group gap="xs" mb="xs" ml="xs" justify="flex-end">
        <Text>Debit : </Text>
        {isLoading ? (
          <Skeleton h={24} w={150} />
        ) : (
          <Text fw={700} c="green">
            <NumberFormatter
              value={data?.response?.total_income || 0}
              prefix="Rp "
              decimalScale={2}
              thousandSeparator="."
              decimalSeparator=","
            />
          </Text>
        )}
        <Center>|</Center>
        <Text>Credit : </Text>
        {isLoading ? (
          <Skeleton h={24} w={150} />
        ) : (
          <Text fw={700} c="red">
            <NumberFormatter
              value={data?.response?.total_outcome || 0}
              prefix="Rp "
              decimalScale={2}
              thousandSeparator="."
              decimalSeparator=","
            />
          </Text>
        )}
        <Center>|</Center>
        <Text>Balance : </Text>
        {isLoading ? (
          <Skeleton h={24} w={150} />
        ) : (
          <Text fw={700} c="blue">
            <NumberFormatter
              value={data?.response?.current_balance || 0}
              prefix="Rp "
              decimalScale={2}
              thousandSeparator="."
              decimalSeparator=","
            />
          </Text>
        )}
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
              accessor: 'is_income',
              title: 'Type',
              width: 100,
              render: ({ is_income }) => (
                <Badge
                  variant="outline"
                  radius="xl"
                  color={is_income ? 'green' : 'red'}
                >
                  {is_income ? 'Debit' : 'Credit'}
                </Badge>
              ),
            },
            {
              accessor: 'transaction_date',
              title: 'Transaction Date',
              noWrap: true,
              render: ({ transaction_date }) => (
                <Text>{moment(transaction_date).format('YYYY-MM-DD')}</Text>
              ),
            },
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
            // {
            //   accessor: 'current_balance',
            //   title: 'Balance',
            //   noWrap: true,
            //   render: ({ current_balance }) => (
            //     <NumberFormatter
            //       value={current_balance}
            //       prefix="Rp "
            //       decimalScale={2}
            //       thousandSeparator="."
            //       decimalSeparator=","
            //     />
            //   ),
            // },
            // {
            //   accessor: 'transaction_date',
            //   title: 'Date Transaction',
            //   noWrap: true,
            //   render: ({ transaction_date }) => (
            //     <Text>{moment(transaction_date).format('YYYY-MM-DD')}</Text>
            //   ),
            // },
            {
              accessor: 'reference_number',
              ...(sizeContainer !== 'fluid' && { width: 150, ellipsis: true }),
            },
            {
              accessor: 'description',
              ...(sizeContainer !== 'fluid' && { width: 250, ellipsis: true }),
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
                  <Tooltip label="Edit Transaction">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="blue"
                      onClick={() => handleEditTransaction(data)}
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

export default Transactions;
