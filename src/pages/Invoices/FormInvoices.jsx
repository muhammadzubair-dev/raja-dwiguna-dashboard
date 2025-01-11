import {
  ActionIcon,
  Box,
  Button,
  Container,
  Divider,
  Fieldset,
  Flex,
  Grid,
  Group,
  NumberFormatter,
  NumberInput,
  Radio,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import {
  IconCalendar,
  IconDownload,
  IconEdit,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import ErrorMessage from '../../components/ErrorMessage';
import UploadImage from '../../components/UploadImage';
import {
  useDeleteInvoiceImages,
  useGetFinanceInvoiceSettings,
  useGetInvoiceImages,
  useGetInvoiceNumber,
  useGetInvoiceTotalPaid,
  useGetOptionAccounts,
  useGetOptionCategories,
  useGetOptionClients,
  usePostInvoice,
  usePutInvoice,
} from '../../helpers/apiHelper';
import exportToPDF from '../../helpers/exportToPDF';
import {
  notificationError,
  notificationSuccess,
} from '../../helpers/notificationHelper';
import useFileUpload from '../../helpers/useUploadFile';
import PrintInvoice from './PrintInvoice';

function AddAndEditItem({ data, setItems, setItemsFromData }) {
  const isAdd = data ? false : true;

  const form = useForm({
    mode: 'controlled',
    initialValues: {
      description: data?.description || '',
      quantity: data?.quantity || '',
      unit_type: data?.unit_type || '',
      unit_price: data?.unit_price || '',
    },

    validate: {
      description: (value) =>
        value.trim().length > 0 ? null : 'Description is required',
      quantity: (value) =>
        String(value).trim().length > 0 ? null : 'Quantity is required',
      unit_price: (value) =>
        String(value).trim().length > 0 ? null : 'Unit Price is required',
    },
  });

  const handleSave = (values) => {
    values.amount = values.quantity * values.unit_price;
    if (data?.invoice_id) {
      setItemsFromData((prev) =>
        prev.map((item) => {
          return item.id === data.id
            ? {
                ...item,
                ...values,
              }
            : item;
        })
      );
    } else {
      setItems((prev) =>
        isAdd
          ? [
              ...prev,
              {
                ...values,
                id: Date.now(),
              },
            ]
          : prev.map((item) =>
              item.id === data.id
                ? {
                    ...item,
                    ...values,
                  }
                : item
            )
      );
    }
    modals.closeAll();
  };

  return (
    <form onSubmit={form.onSubmit(handleSave)}>
      <Stack gap="xs">
        <TextInput
          withAsterisk
          label="Description"
          key={form.key('description')}
          {...form.getInputProps('description')}
        />
        <Flex gap="xs">
          <NumberInput
            allowNegative={false}
            withAsterisk
            allowDecimal={false}
            label="Quantity"
            key={form.key('quantity')}
            {...form.getInputProps('quantity')}
          />
          <TextInput
            withAsterisk
            placeholder="m², kg, pcs, etc"
            label="Unit Type"
            key={form.key('unit_type')}
            {...form.getInputProps('unit_type')}
          />
        </Flex>
        <NumberInput
          allowNegative={false}
          withAsterisk
          prefix="Rp "
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          label="Unit Price"
          key={form.key('unit_price')}
          {...form.getInputProps('unit_price')}
        />
        <NumberInput
          allowNegative={false}
          withAsterisk
          disabled
          prefix="Rp "
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          label="Total Amount"
          value={form.values.quantity * form.values.unit_price}
        />
      </Stack>
      <Group justify="flex-end" mt="xl">
        <Button
          flex={1}
          fullWidth
          variant="outline"
          color="gray"
          onClick={() => modals.closeAll()}
        >
          Cancel
        </Button>
        <Button flex={1} fullWidth type="submit">
          Save
        </Button>
      </Group>
    </form>
  );
}

function DeleteItem({ data, setItems, setItemsFromData, setItemsDeleted }) {
  const handleDelete = () => {
    if (data?.invoice_id) {
      setItemsDeleted((prev) => [...prev, data.id]);
      setItemsFromData((prev) => prev.filter((item) => item.id !== data.id));
    } else {
      setItems((prev) => prev.filter((item) => item.id !== data.id));
    }
    modals.closeAll();
  };

  return (
    <>
      <Text size="sm">
        Are you sure you want to delete item with description '
        {data.description}' ?
      </Text>
      <Group justify="flex-end" mt="xl">
        <Button
          variant="outline"
          color="gray"
          onClick={() => modals.closeAll()}
        >
          Cancel
        </Button>
        <Button color="red" onClick={handleDelete}>
          Delete Item
        </Button>
      </Group>
    </>
  );
}

function DetailPayment({ data }) {
  return (
    <DataTable columns={[{ accessor: 'id', hidden: true }]} records={[data]} />
  );
}

function FormInvoices() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state?.data;
  const modeDetail = location.state?.mode === 'detail';
  const modeEditOnly = location.state?.mode === 'edit';
  const modeEdit = location.state?.mode === 'edit' || !modeDetail;
  const dataWithWHT = data?.with_holding_tax <= 0 ? 'no' : 'yes';
  const dataWithVAT = data?.value_added_tax <= 0 ? 'no' : 'yes';
  const isAdd = !data;
  const [itemsFromData, setItemsFromData] = useState(
    data?.list_invoice_item || []
  );
  const [itemsDeleted, setItemsDeleted] = useState([]);
  const [items, setItems] = useState([]);
  const [files, setFiles] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [withWHT, setWithWHT] = useState(dataWithWHT);
  const [withVAT, setWithVAT] = useState(dataWithVAT);
  const form = useForm({
    mode: 'controlled',
    initialValues: {
      reference_number: data?.reference_number || '',
      client_id: data?.client_id || '',
      account_id: data?.account_id || null,
      category_id: data?.category_id || null,
      sub_category_id: data?.sub_category_id || null,
      invoice_date: data?.invoice_date ? moment(data.invoice_date) : new Date(),
      due_date: data?.due_date ? moment(data.due_date) : null,
      // total: data?.total || '',
      notes: data?.notes || '',
      // list_invoice_item: data?.list_invoice_item || [],
    },
    validate: {
      // reference_number: (value) =>
      //   value ? null : 'Invoice Number is required',
      client_id: (value) => (value ? null : 'Client is required'),
      account_id: (value) => (value ? null : 'Bank Account is required'),
      category_id: (value) => (value ? null : 'Category is required'),
      sub_category_id: (value) => (value ? null : 'Sub Category is required'),
      invoice_date: (value) => (value ? null : 'Invoice Date is required'),
      due_date: (value) => (value ? null : 'Due Date is required'),
      // total: (value) =>
      //   String(value).trim().length > 0 ? null : 'Total is required',
      // notes: (value) => (value ? null : 'Notes is required'),
      // list_invoice_item: (value) =>
      //   value.length > 0 ? null : 'Item is required',
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
    ['invoice-images', data?.id],
    () => useGetInvoiceImages(data?.id),
    {
      enabled: !isAdd,
      onSuccess: (res) => {
        if (res?.response?.length > 0) {
          setFiles(
            res?.response.map(
              (item) =>
                `https://dev.arieslibre.my.id/api/v1/public/invoice/download/${data?.id}/${item}`
            )
          );
        }
      },
    }
  );

  const { data: optionAccounts, isLoading: isLoadingAccounts } = useQuery(
    ['option-accounts'],
    () => useGetOptionAccounts()
  );

  const { data: optionCategories, isLoading: isLoadingCategories } = useQuery(
    ['option-categories'],
    () => useGetOptionCategories()
  );

  const { data: optionClients, isLoading: isLoadingClients } = useQuery(
    ['option-clients'],
    () => useGetOptionClients()
  );

  const { data: dataIN, isLoading: isLoadingIN } = useQuery(
    ['invoice-number'],
    () => useGetInvoiceNumber()
  );

  const { data: dataTotalPaid, isLoading: isLoadingTotalPaid } = useQuery(
    ['total-paid', data?.reference_number],
    () => useGetInvoiceTotalPaid({ reference_number: data?.reference_number }),
    { enabled: !!data?.reference_number }
  );

  const { data: dataSettings, isLoading: isLoadingSettings } = useQuery(
    ['finance-invoice-settings'],
    () => useGetFinanceInvoiceSettings()
  );

  const settings = dataSettings?.response;
  const wht =
    withWHT === 'yes' ? settings?.with_holding_tax_percentage || 0 : 0;
  const vat = withVAT === 'yes' ? settings?.value_added_tax_percentage || 0 : 0;

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

  const recordsClient = optionClients?.response?.map(({ name, id }) => ({
    value: id,
    label: name,
  }));

  const findSubCategory = optionCategories?.response.find(
    ({ id }) => id === form.values?.category_id
  );

  const recordsSubCategory = findSubCategory?.list_transaction_sub_category.map(
    ({ id, name }) => ({
      value: id,
      label: name,
    })
  );

  const {
    mutate,
    isLoading: isLoadingInvoice,
    error: errorInvoice,
  } = useMutation(isAdd ? usePostInvoice : usePutInvoice, {
    onSuccess: async (res, variables) => {
      try {
        const containObject = files.some((url) => typeof url === 'object');
        if (files.length > 0 && containObject) {
          res = await useFileUpload(
            `/finance/invoice/upload/${variables.id}`,
            files.filter((file) => typeof file !== 'string')
          );
        }

        if (deletedFiles.length > 0) {
          res = await useDeleteInvoiceImages(variables.id, {
            files: deletedFiles,
          });
        }

        if (res?.code === 200) {
          notificationSuccess(
            `Invoice ${isAdd ? 'Added' : 'Updated'} successfully`
          );
          navigate('/invoices');
        }
      } catch (err) {
        notificationError(err.message);
        throw err;
      }
    },
  });

  const handleAddItem = () => {
    modals.open({
      title: 'Add Item',
      centered: true,
      radius: 'md',
      size: 'xs',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <AddAndEditItem
          setItems={setItems}
          setItemsFromData={setItemsFromData}
        />
      ),
    });
  };

  const handleEditItem = (item) => {
    // navigate('/invoice', { state: { data: item } });
    modals.open({
      title: 'Edit Item',
      centered: true,
      radius: 'md',
      size: 'xs',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <AddAndEditItem
          data={item}
          setItems={setItems}
          setItemsFromData={setItemsFromData}
        />
      ),
    });
  };

  const handleDeleteItem = (data) => {
    modals.open({
      title: 'Delete Item',
      centered: true,
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <DeleteItem
          data={data}
          setItems={setItems}
          setItemsFromData={setItemsFromData}
          setItemsDeleted={setItemsDeleted}
        />
      ),
    });
  };

  const totalItem = [...itemsFromData, ...items].reduce(
    (acc, item) => acc + item.quantity * item.unit_price,
    0
  );

  const handleSave = (values) => {
    const { invoice_date, due_date } = values;
    const total = [...itemsFromData, ...items].reduce(
      (total, item) => total + item.amount,
      0
    );

    if (total <= 0) {
      notificationError('Total must be greater than 0');
    } else {
      const body = {
        ...values,
        ...(isAdd && {
          id: uuidv4(),
          list_invoice_item: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            unit_type: item.unit_type,
            amount: item.amount,
          })),
        }),
        ...(!isAdd && {
          id: data?.id,
          delete_invoice_item: itemsDeleted,
          update_invoice_item: itemsFromData.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            unit_type: item.unit_type,
            amount: item.amount,
          })),
          insert_invoice_item: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            unit_type: item.unit_type,
            amount: item.amount,
          })),
        }),
        reference_number: dataIN?.response,
        invoice_date: `${moment(invoice_date).format('YYYY-MM-DD')}T00:00:00Z`,
        with_holding_tax: withWHT === 'yes' ? (total * wht) / 100 : 0,
        value_added_tax: withVAT === 'yes' ? (total * vat) / 100 : 0,
        with_holding_tax_percentage: withWHT === 'yes' ? wht : 0,
        value_added_tax_percentage: withVAT === 'yes' ? vat : 0,
        due_date: `${moment(due_date).format('YYYY-MM-DD')}T00:00:00Z`,
        total: total - (total * wht) / 100 - (total * vat) / 100,
      };
      mutate(body);
    }
  };

  return (
    <Container
      size="md"
      flex={1}
      // fluid={sizeContainer === 'fluid'}
      p={{ base: 'md', md: 'xl' }}
    >
      <form onSubmit={form.onSubmit(handleSave)}>
        <Grid>
          <Grid.Col span={{ base: 12, md: 12 }}>
            <Fieldset
              mb="md"
              legend={<Title order={4}>Client Information</Title>}
            >
              <Select
                withAsterisk
                readOnly={isLoadingClients || modeDetail}
                placeholder={isLoadingClients ? 'Loading...' : ''}
                label="Clients"
                data={recordsClient}
                searchable
                key={form.key('client_id')}
                {...form.getInputProps('client_id')}
              />
            </Fieldset>

            <Fieldset mb="md" legend={<Title order={4}>Invoice Details</Title>}>
              <Grid mb="md">
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput
                    flex={1}
                    label="Invoice Number"
                    value={dataIN?.response}
                    placeholder="Loading..."
                    disabled={isLoadingIN || modeDetail}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <DatePickerInput
                    readOnly={modeDetail}
                    // minDate={new Date()}
                    rightSection={<IconCalendar size={18} />}
                    label="Invoice Date"
                    key={form.key('invoice_date')}
                    {...form.getInputProps('invoice_date')}
                    // value={invoiceDate}
                    // onChange={(value) => {
                    //   setDueDate(null);
                    //   setInvoiceDate(value);
                    // }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <DatePickerInput
                    placeholder={
                      !form.values.invoice_date
                        ? 'Please fill Invoice date first'
                        : ''
                    }
                    readOnly={modeDetail}
                    disabled={!form.values.invoice_date}
                    minDate={new Date(form.values.invoice_date)}
                    rightSection={<IconCalendar size={18} />}
                    label="Due Date"
                    key={form.key('due_date')}
                    {...form.getInputProps('due_date')}
                    withAsterisk
                    // value={dueDate}
                    // onChange={setDueDate}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    withAsterisk
                    readOnly={isLoadingAccounts || modeDetail}
                    placeholder={isLoadingAccounts ? 'Loading...' : ''}
                    label="Bank Account"
                    data={recordsAccount}
                    searchable
                    key={form.key('account_id')}
                    {...form.getInputProps('account_id')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    withAsterisk
                    readOnly={isLoadingCategories || modeDetail}
                    placeholder={isLoadingCategories ? 'Loading...' : ''}
                    label="Category"
                    data={recordsCategory}
                    searchable
                    key={form.key('category_id')}
                    {...form.getInputProps('category_id')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    withAsterisk
                    readOnly={
                      isLoadingCategories ||
                      recordsSubCategory?.length === 0 ||
                      modeDetail
                    }
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
                </Grid.Col>
              </Grid>
              <Flex gap="xl" justify="space-between" maw={300}>
                <Radio.Group
                  name="wht"
                  label={`WHT 23 (${wht}%)`}
                  mb="lg"
                  value={withWHT}
                  onChange={setWithWHT}
                  withAsterisk
                >
                  <Group mt="xs">
                    <Radio
                      disabled={modeDetail || modeEditOnly}
                      value="yes"
                      label="Yes"
                    />
                    <Radio
                      disabled={modeDetail || modeEditOnly}
                      value="no"
                      label="No"
                    />
                  </Group>
                </Radio.Group>
                <Radio.Group
                  name="vat"
                  label={`VAT (${vat}%)`}
                  mb="lg"
                  value={withVAT}
                  onChange={setWithVAT}
                  withAsterisk
                >
                  <Group mt="xs">
                    <Radio
                      disabled={modeDetail || modeEditOnly}
                      value="yes"
                      label="Yes"
                    />
                    <Radio
                      disabled={modeDetail || modeEditOnly}
                      value="no"
                      label="No"
                    />
                  </Group>
                </Radio.Group>
              </Flex>

              <UploadImage
                disableActions={modeDetail}
                hasDownload={modeDetail}
                hImage={100}
                wImage={100}
                files={files}
                setFiles={setFiles}
                setDeletedFiles={setDeletedFiles}
                disableUpload={modeDetail}
              />
              <Textarea
                mt={5}
                autosize
                minRows={5}
                label="Additional Notes"
                readOnly={modeDetail}
                key={form.key('notes')}
                {...form.getInputProps('notes')}
              />
            </Fieldset>

            {dataTotalPaid && dataTotalPaid?.response?.payment > 0 && (
              <Fieldset mb="md" legend={<Title order={4}>List Payment</Title>}>
                <Stack>
                  <DataTable
                    columns={[
                      { accessor: 'id', hidden: true },
                      {
                        accessor: 'transaction_date',
                        render: ({ transaction_date }) =>
                          moment(transaction_date).format('YYYY-MM-DD'),
                      },
                      { accessor: 'description' },
                      {
                        accessor: 'amount',
                        noWrap: true,
                        textAlign: 'right',
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
                    ]}
                    records={dataTotalPaid?.response?.detail_payment || []}
                  />
                  <Group justify="flex-end" gap="xl">
                    <Text>Total Payment :</Text>
                    <NumberFormatter
                      value={dataTotalPaid?.response?.payment}
                      prefix="Rp "
                      decimalScale={2}
                      thousandSeparator="."
                      decimalSeparator=","
                    />
                  </Group>
                </Stack>
              </Fieldset>
            )}
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 12 }}>
            <Fieldset mb="md" legend={<Title order={4}>Invoice Items</Title>}>
              {modeEdit && (
                <Group mb="sm" justify="flex-end">
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<IconPlus size={18} />}
                    onClick={handleAddItem}
                  >
                    Item
                  </Button>
                </Group>
              )}
              <DataTable
                columns={[
                  // Standard columns
                  { accessor: 'id', hidden: true },
                  {
                    accessor: 'index',
                    title: 'No',
                    textAlign: 'center',
                    width: 40,
                    render: (record) =>
                      [...itemsFromData, ...items].indexOf(record) + 1,
                  },
                  { accessor: 'description' },
                  { accessor: 'quantity' },
                  { accessor: 'unit_type' },
                  {
                    accessor: 'unit_price',
                    noWrap: true,
                    render: ({ unit_price }) => (
                      <NumberFormatter
                        value={unit_price}
                        prefix="Rp "
                        decimalScale={2}
                        thousandSeparator="."
                        decimalSeparator=","
                      />
                    ),
                  },
                  {
                    accessor: 'amount',
                    noWrap: true,
                    textAlign: 'right',
                    render: ({ quantity, unit_price }) => (
                      <NumberFormatter
                        value={quantity * unit_price}
                        prefix="Rp "
                        decimalScale={2}
                        thousandSeparator="."
                        decimalSeparator=","
                      />
                    ),
                  },
                  ...(modeEdit
                    ? [
                        {
                          accessor: '',
                          render: (data) => (
                            <Group gap={4} justify="right" wrap="nowrap">
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                color="blue"
                                onClick={() => handleEditItem(data)}
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                color="red"
                                onClick={() => handleDeleteItem(data)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>
                          ),
                        },
                      ]
                    : []),
                ]}
                records={[...itemsFromData, ...items]}
              />
              <Group mb="sm" mt="xl" justify="flex-end">
                <Box w={300}>
                  <Group justify="space-between">
                    <Box>
                      <Text>Subtotal</Text>
                      {withVAT === 'yes' && <Text>VAT ({vat}%)</Text>}
                      {withWHT === 'yes' && <Text>WHT 23 ({wht}%)</Text>}
                    </Box>
                    <Flex direction={'column'} align={'flex-end'}>
                      <NumberFormatter
                        value={totalItem}
                        prefix="Rp "
                        decimalScale={2}
                        thousandSeparator="."
                        decimalSeparator=","
                      />
                      {withVAT === 'yes' && (
                        <Text>
                          (
                          <NumberFormatter
                            value={(totalItem * vat) / 100}
                            prefix="Rp "
                            decimalScale={2}
                            thousandSeparator="."
                            decimalSeparator=","
                          />
                          )
                        </Text>
                      )}

                      {withWHT === 'yes' && (
                        <Text>
                          (
                          <NumberFormatter
                            value={(totalItem * wht) / 100}
                            prefix="Rp "
                            decimalScale={2}
                            thousandSeparator="."
                            decimalSeparator=","
                          />
                          )
                        </Text>
                      )}
                    </Flex>
                  </Group>
                  {/* <Group justify="space-between">
                    <Text>VAT ({vat}%)</Text>
                    <Text>0</Text>
                  </Group> */}
                  {dataTotalPaid && dataTotalPaid?.response?.payment > 0 && (
                    <Group justify="space-between">
                      <Text>Paid</Text>

                      <Text>
                        (
                        <NumberFormatter
                          value={dataTotalPaid?.response?.payment}
                          prefix="Rp "
                          decimalScale={2}
                          thousandSeparator="."
                          decimalSeparator=","
                        />
                        )
                      </Text>
                    </Group>
                  )}
                  <Divider mt="md" mb="xs" />
                  <Group justify="space-between">
                    <Box>
                      <Title order={4}>Total</Title>
                    </Box>
                    <Flex direction="column" align="flex-end">
                      <Title order={4}>
                        <NumberFormatter
                          value={
                            totalItem -
                            (totalItem * wht) / 100 -
                            (totalItem * vat) / 100 -
                            (dataTotalPaid?.response?.payment || 0)
                          }
                          prefix="Rp "
                          decimalScale={2}
                          thousandSeparator="."
                          decimalSeparator=","
                        />
                      </Title>
                    </Flex>
                  </Group>
                </Box>
              </Group>
            </Fieldset>
          </Grid.Col>
        </Grid>
        <Group justify="flex-end">
          {modeDetail && (
            <Button
              color="green"
              loading={isLoadingInvoice}
              onClick={() => exportToPDF('invoice')}
              leftSection={<IconDownload size={16} />}
            >
              Export to PDF
            </Button>
          )}
          {modeEdit && (
            <Button type="submit" loading={isLoadingInvoice}>
              Submit
            </Button>
          )}
        </Group>
        {errorInvoice && (
          <Group justify="flex-end">
            <ErrorMessage message={errorInvoice?.message} />
          </Group>
        )}
      </form>
      <PrintInvoice data={data} />
    </Container>
  );
}

export default FormInvoices;
