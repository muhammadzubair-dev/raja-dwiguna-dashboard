import {
  ActionIcon,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Fieldset,
  Flex,
  Grid,
  Group,
  NumberFormatter,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import React, { useState } from 'react';
import useSizeContainer from '../../helpers/useSizeContainer';
import { DatePickerInput } from '@mantine/dates';
import {
  IconCalendar,
  IconEdit,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import {
  useGetClients,
  useGetInvoiceNumber,
  useGetOptionAccounts,
  useGetOptionCategories,
  useGetOptionClients,
  usePostInvoice,
} from '../../helpers/apiHelper';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import moment from 'moment';
import ErrorMessage from '../../components/ErrorMessage';
import { notificationSuccess } from '../../helpers/notificationHelper';

function AddAndEditItem({ data, setItems }) {
  const isAdd = data ? false : true;

  const form = useForm({
    mode: 'controlled',
    initialValues: {
      description: data?.description || '',
      quantity: data?.quantity || '',
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
    setItems((prev) =>
      isAdd
        ? [
            ...prev,
            {
              ...values,
              id: Date.now(),
              amount: values.quantity * values.unit_price,
            },
          ]
        : prev.map((item) =>
            item.id === data.id ? { ...item, ...values } : item
          )
    );
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
        <NumberInput
          allowNegative={false}
          withAsterisk
          allowDecimal={false}
          label="Quantity"
          key={form.key('quantity')}
          {...form.getInputProps('quantity')}
        />
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

function DeleteItem({ data, setItems }) {
  const handleDelete = () => {
    setItems((prev) => prev.filter((item) => item.id !== data.id));
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

function FormInvoices({ data }) {
  const navigate = useNavigate();
  const sizeContainer = useSizeContainer((state) => state.sizeContainer);
  const [invoiceDate, setInvoiceDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [items, setItems] = useState([]);
  const form = useForm({
    mode: 'controlled',
    initialValues: {
      reference_number: data?.reference_number || '',
      client_id: data?.client_id || '',
      account_id: data?.account_id || null,
      category_id: data?.category_id || null,
      sub_category_id: data?.sub_category_id || null,
      invoice_date: data?.invoice_date || null,
      due_date: data?.due_date || null,
      total: data?.total || '',
      notes: data?.notes || '',
      list_invoice_item: data?.list_invoice_item || [],
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
  } = useMutation(usePostInvoice, {
    onSuccess: () => {
      notificationSuccess(`Invoice Added successfully`);
      navigate('/invoices');
    },
  });

  const handleSave = (values) => {
    const body = {
      ...values,
      reference_number: dataIN?.response,
      invoice_date: `${moment(values.invoice_date).format(
        'YYYY-MM-DD'
      )}T00:00:00Z`,
      due_date: `${moment(values.due_date).format('YYYY-MM-DD')}T00:00:00Z`,
      total: items.reduce((total, item) => total + item.amount, 0),
      list_invoice_item: items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.amount,
      })),
    };
    mutate(body);
  };

  const handleAddItem = () => {
    modals.open({
      title: 'Add Item',
      centered: true,
      radius: 'md',
      size: 'xs',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <AddAndEditItem setItems={setItems} />,
    });
  };

  const handleEditItem = (data) => {
    modals.open({
      title: 'Edit Item',
      centered: true,
      radius: 'md',
      size: 'xs',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <AddAndEditItem data={data} setItems={setItems} />,
    });
  };

  const handleDeleteItem = (data) => {
    modals.open({
      title: 'Delete Item',
      centered: true,
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: <DeleteItem data={data} setItems={setItems} />,
    });
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
                disabled={isLoadingClients}
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
                    disabled
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <DatePickerInput
                    minDate={new Date()}
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
                    disabled={!form.values.invoice_date}
                    minDate={new Date(form.values.invoice_date)}
                    rightSection={<IconCalendar size={18} />}
                    label="Due Date"
                    key={form.key('due_date')}
                    {...form.getInputProps('due_date')}
                    // value={dueDate}
                    // onChange={setDueDate}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
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
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
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
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    withAsterisk
                    disabled={
                      isLoadingCategories || recordsSubCategory?.length === 0
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
              <Textarea autosize minRows={5} label="Additional Notes" />
            </Fieldset>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 12 }}>
            <Fieldset mb="md" legend={<Title order={4}>Invoice Items</Title>}>
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
              <DataTable
                columns={[
                  { accessor: 'id', hidden: true },
                  {
                    accessor: 'index',
                    title: 'No',
                    textAlign: 'center',
                    width: 40,
                    render: (record) => items.indexOf(record) + 1,
                  },
                  { accessor: 'description' },
                  { accessor: 'quantity' },
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
                ]}
                records={items}
              />
              <Group mb="sm" mt="xl" justify="flex-end">
                <Box w={300}>
                  <Group justify="space-between">
                    <Text>Subtotal</Text>
                    <NumberFormatter
                      value={items.reduce((acc, item) => acc + item.amount, 0)}
                      prefix="Rp "
                      decimalScale={2}
                      thousandSeparator="."
                      decimalSeparator=","
                    />
                  </Group>
                  <Group justify="space-between">
                    <Text>Tax (0%)</Text>
                    <Text>Rp 0</Text>
                  </Group>
                  <Divider my="md" />
                  <Group justify="space-between">
                    <Title order={4}>Total</Title>

                    <Title order={4}>
                      <NumberFormatter
                        value={items.reduce(
                          (acc, item) => acc + item.amount,
                          0
                        )}
                        prefix="Rp "
                        decimalScale={2}
                        thousandSeparator="."
                        decimalSeparator=","
                      />
                    </Title>
                  </Group>
                </Box>
              </Group>
            </Fieldset>
          </Grid.Col>
        </Grid>
        <Group justify="flex-end">
          <Button type="submit" loading={isLoadingInvoice}>
            Submit
          </Button>
        </Group>
        {errorInvoice && (
          <Group justify="flex-end">
            <ErrorMessage message={errorInvoice?.message} />
          </Group>
        )}
      </form>
    </Container>
  );
}

export default FormInvoices;
