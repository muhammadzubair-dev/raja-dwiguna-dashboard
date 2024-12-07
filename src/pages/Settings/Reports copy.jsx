import {
  Accordion,
  Box,
  Center,
  Paper,
  Stack,
  Title,
  Text,
  Container,
  Group,
  ActionIcon,
  Tooltip,
  Flex,
  Button,
  Select,
  TextInput,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import React, { useState } from 'react';
import {
  useGetOptionCategories,
  useGetTemplate,
  usePostTemplate,
} from '../../helpers/apiHelper';
import ErrorMessage from '../../components/ErrorMessage';
import { useMutation, useQuery } from 'react-query';
import { useForm } from '@mantine/form';
import { notificationSuccess } from '../../helpers/notificationHelper';

function DeleteProfitAndLose({ data, headers, selectedData, refetchData }) {
  const { mutate, isLoading, error } = useMutation(usePostTemplate, {
    onSuccess: () => {
      refetchData();
      modals.closeAll();
      notificationSuccess(`Report Template deleted successfully`);
    },
  });

  const handleDelete = () =>
    mutate({
      report_name: 'profit-and-loss',
      data: data
        .filter((item) => item.sub_category_id === selectedData.sub_category_id)
        .map((item) => {
          return {
            headers,
            index: item.index,
            sub_category_id: item.sub_category_id,
            report_name: 'profit-and-loss',
          };
        }),
    });

  return (
    <>
      <Text size="sm">
        Are you sure you want to delete template {selectedData.index} ?
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
const AddAndEditProfitAndLoss = ({
  data,
  dataIncome,
  dataOperationalExpenses,
  headers,
  selectedData,
  refetchData,
}) => {
  const form = useForm({
    mode: 'controlled',
    initialValues: {
      category_id: selectedData?.category_id || null,
      sub_category_id: selectedData?.sub_category_id || null,
    },
    validate: {
      category_id: (value) => (value ? null : 'Category is required'),
      sub_category_id: (value) => (value ? null : 'Sub Category is required'),
    },
  });

  const isAdd = !selectedData;

  form.watch('category_id', () => {
    form.setFieldValue('sub_category_id', null);
  });

  const { data: optionCategories, isLoading: isLoadingCategories } = useQuery(
    ['option-categories'],
    () => useGetOptionCategories()
  );

  const recordsCategory = [
    ...(headers === 'income'
      ? [
          {
            group: 'Credit',
            items: (optionCategories?.response || [])
              .filter((category) => category.is_income === true)
              .map(({ id, name }) => ({ value: id, label: name })),
          },
        ]
      : [
          {
            group: 'Debit',
            items: (optionCategories?.response || [])
              .filter((category) => category.is_income === false)
              .map(({ id, name }) => ({ value: id, label: name })),
          },
        ]),
  ];

  const findSubCategory = optionCategories?.response.find(
    ({ id }) => id === form.values?.category_id
  );

  const recordsSubCategory = findSubCategory?.list_transaction_sub_category
    .filter(
      (category) =>
        ![...dataIncome, ...dataOperationalExpenses].some(
          ({ sub_category_id }) => sub_category_id === category.id
        )
    )
    .map(({ id, name }) => ({
      value: id,
      label: name,
    }));

  const { mutate, isLoading, error } = useMutation(usePostTemplate, {
    onSuccess: () => {
      refetchData();
      modals.closeAll();
      notificationSuccess(
        `Report Template ${isAdd ? 'added' : 'updated'} successfully`
      );
    },
  });

  const handleSave = (values) => {
    mutate({
      report_name: 'profit-and-loss',
      data: isAdd
        ? [
            ...dataIncome.map((item) => ({
              headers: 'income',
              index: item.index,
              sub_category_id: item.sub_category_id,
              report_name: 'profit-and-loss',
            })),
            ...dataOperationalExpenses.map((item) => ({
              headers: 'operational-expenses',
              index: item.index,
              sub_category_id: item.sub_category_id,
              report_name: 'profit-and-loss',
            })),
            {
              headers,
              index: [...dataIncome, ...dataOperationalExpenses].length + 1,
              sub_category_id: values.sub_category_id,
              report_name: 'profit-and-loss',
            },
          ]
        : [
            ...dataIncome.map((item) => {
              if (item.sub_category_id === selectedData.sub_category_id) {
                return {
                  headers: 'income',
                  index: item.index,
                  sub_category_id: values.sub_category_id,
                  report_name: 'profit-and-loss',
                };
              }
              return {
                headers,
                index: item.index,
                sub_category_id: item.sub_category_id,
                report_name: 'profit-and-loss',
              };
            }),
            ...dataOperationalExpenses.map((item) => {
              if (item.sub_category_id === selectedData.sub_category_id) {
                return {
                  headers: 'operational-expenses',
                  index: item.index,
                  sub_category_id: values.sub_category_id,
                  report_name: 'profit-and-loss',
                };
              }
              return {
                headers,
                index: item.index,
                sub_category_id: item.sub_category_id,
                report_name: 'profit-and-loss',
              };
            }),
          ],
    });
  };

  return (
    <form onSubmit={form.onSubmit(handleSave)}>
      <Stack gap="xs">
        <TextInput
          value={
            isAdd
              ? [...dataIncome, ...dataOperationalExpenses].length + 1
              : selectedData.index
          }
          readOnly
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
};

const ProfitAndLoss = () => {
  const {
    data: dataTemplate,
    isLoading: isLoadingTemplate,
    error,
    refetch,
  } = useQuery(['report-template'], () =>
    useGetTemplate({ report_name: 'profit-and-loss' })
  );

  const dataIncome =
    dataTemplate?.response?.find(({ headers }) => headers === 'income') || [];
  const dataOperationalExpenses =
    dataTemplate?.response?.find(
      ({ headers }) => headers === 'operational-expenses'
    ) || [];

  const recordsIncome = dataIncome?.data || [];
  const recordsOperationalExpenses = dataOperationalExpenses?.data || [];
  const handleAddAndEditProfitAndLoss = (data, headers = 'income') => {
    const isAdd = !data;
    modals.open({
      title: `${isAdd ? 'Add' : 'Edit'} ${headers}`,
      centered: true,
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <AddAndEditProfitAndLoss
          data={
            headers === 'income' ? recordsIncome : recordsOperationalExpenses
          }
          dataIncome={recordsIncome}
          dataOperationalExpenses={recordsOperationalExpenses}
          selectedData={data}
          headers={headers}
          refetchData={refetch}
        />
      ),
    });
  };

  const handleDeleteProfitAndLoss = (data, headers = 'income') => {
    modals.open({
      title: `Delete ${headers}`,
      centered: true,
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <DeleteProfitAndLose
          data={
            headers === 'income' ? recordsIncome : recordsOperationalExpenses
          }
          dataIncome={recordsIncome}
          dataOperationalExpenses={recordsOperationalExpenses}
          selectedData={data}
          headers={headers}
          refetchData={refetch}
        />
      ),
    });
  };

  return (
    <Container>
      <DataTable
        mb="sm"
        verticalSpacing="lg"
        minHeight={180}
        fetching={isLoadingTemplate}
        noRecordsText={error ? `Error: ${error?.message}` : 'No records found'}
        columns={[
          { accessor: 'index', title: '#', width: 50, align: 'center' },
          { accessor: 'name', title: 'INCOME' },
          {
            accessor: '',
            title: (
              <Tooltip label="Add">
                <ActionIcon
                  size="sm"
                  variant="filled"
                  color="green"
                  onClick={() => handleAddAndEditProfitAndLoss()}
                >
                  <IconPlus size={16} />
                </ActionIcon>
              </Tooltip>
            ),
            textAlign: 'right',
            render: (data) => (
              <Group gap={4} justify="right" wrap="nowrap">
                <Tooltip label="Edit">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="blue"
                    onClick={() => handleAddAndEditProfitAndLoss(data)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Delete">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() => handleDeleteProfitAndLoss(data)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ),
          },
        ]}
        records={recordsIncome}
      />
      <DataTable
        mb="sm"
        verticalSpacing="lg"
        minHeight={180}
        fetching={isLoadingTemplate}
        noRecordsText={error ? `Error: ${error?.message}` : 'No records found'}
        columns={[
          { accessor: 'index', title: '#', width: 50, align: 'center' },
          { accessor: 'name', title: 'OPERATIONAL EXPENSES' },
          {
            accessor: '',
            title: (
              <Tooltip label="Add">
                <ActionIcon
                  size="sm"
                  variant="filled"
                  color="green"
                  onClick={() =>
                    handleAddAndEditProfitAndLoss(null, 'operational-expenses')
                  }
                >
                  <IconPlus size={16} />
                </ActionIcon>
              </Tooltip>
            ),
            textAlign: 'right',
            render: (data) => (
              <Group gap={4} justify="right" wrap="nowrap">
                <Tooltip label="Edit">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="blue"
                    onClick={() =>
                      handleAddAndEditProfitAndLoss(
                        data,
                        'operational-expenses'
                      )
                    }
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Delete">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() =>
                      handleDeleteProfitAndLoss(data, 'operational-expenses')
                    }
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ),
          },
        ]}
        records={recordsOperationalExpenses}
      />
    </Container>
  );
};

const groceries = [
  {
    emoji: '🍎',
    value: 'Cash Flow',
    description:
      'Crisp and refreshing fruit. Apples are known for their versatility and nutritional benefits. They come in a variety of flavors and are great for snacking, baking, or adding to salads.',
  },
  {
    emoji: '🍌',
    value: 'Profit And Loss',
    description: <ProfitAndLoss />,
  },
];

const items = groceries.map((item) => (
  <Accordion.Item key={item.value} value={item.value}>
    <Accordion.Control icon={item.emoji}>{item.value}</Accordion.Control>
    <Accordion.Panel>{item.description}</Accordion.Panel>
  </Accordion.Item>
));

function Reports() {
  return (
    <Accordion mt="md" defaultValue="Profit And Loss" variant="contained">
      {items}
    </Accordion>
  );
}

export default Reports;
