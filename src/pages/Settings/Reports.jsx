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
  Checkbox,
  Grid,
  Fieldset,
  Divider,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconDeviceFloppy,
  IconEdit,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
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
import formatSnake from '../../helpers/formatSnake';

const ProfitAndLoss = () => {
  const [profitAndLossIds, setProfitAndLossIds] = useState([]);

  const {
    data: dataTemplate,
    isLoading: isLoadingTemplate,
    error,
    refetch,
  } = useQuery(
    ['report-template'],
    () => useGetTemplate({ report_name: 'profit-and-loss' }),
    {
      onSuccess: (data) => {
        setProfitAndLossIds(
          data?.response?.flatMap((item) =>
            item.data.map((entry) => ({
              is_income: item.is_income,
              value: entry.sub_category_id,
            }))
          )
        );
      },
    }
  );

  const {
    mutate,
    isLoading: isLoadingPost,
    error: errorPost,
  } = useMutation(usePostTemplate, {
    onSuccess: () => {
      refetch();
      modals.closeAll();
      notificationSuccess(`Report Template updated successfully`);
    },
  });

  const { data: optionCategories, isLoading: isLoadingCategories } = useQuery(
    ['option-categories'],
    () => useGetOptionCategories()
  );

  const dataDebit = (optionCategories?.response || []).filter(
    (category) => category.is_income === true
  );
  const dataCredit = (optionCategories?.response || []).filter(
    (category) => category.is_income === false
  );

  const getIsIncome = (id) => {
    const category = optionCategories?.response?.find((category) =>
      category.list_transaction_sub_category.some((sub) => sub.id === id)
    );

    return category ? category.is_income : null;
  };

  const handleSave = () => {
    const body = profitAndLossIds.map((row, index) => {
      return {
        sub_category_id: row.value,
        index: index + 1,
        headers: row.is_income ? 'income' : 'operational-expenses',
        report_name: 'profit-and-loss',
      };
    });
    mutate({
      report_name: 'profit-and-loss',
      data: body,
    });
  };

  return (
    <Container fluid>
      <Checkbox.Group
        value={profitAndLossIds.map((item) => item.value)}
        onChange={(ids) =>
          setProfitAndLossIds(
            ids.map((id) => ({ value: id, is_income: getIsIncome(id) }))
          )
        }
      >
        <Title order={4} mb="sm">
          Income
        </Title>
        <Grid gutter="xs">
          {dataDebit.map((item) => (
            <Grid.Col key={item.id} span={3}>
              <Fieldset radius="md" legend={item.name}>
                <Stack gap="xs">
                  {item.list_transaction_sub_category.map((itemSub) => (
                    <Checkbox
                      value={itemSub.id}
                      key={itemSub.id}
                      label={formatSnake(itemSub.name)}
                    />
                  ))}
                </Stack>
              </Fieldset>
            </Grid.Col>
          ))}
        </Grid>
        <Divider my="lg" />
        <Title order={4} mb="sm">
          Operational Expenses
        </Title>
        <Grid gutter="xs">
          {dataCredit.map((item) => (
            <Grid.Col key={item.id} span={3}>
              <Fieldset radius="md" legend={item.name}>
                <Stack gap="xs">
                  {item.list_transaction_sub_category.map((itemSub) => (
                    <Checkbox
                      value={itemSub.id}
                      key={itemSub.id}
                      label={formatSnake(itemSub.name)}
                    />
                  ))}
                </Stack>
              </Fieldset>
            </Grid.Col>
          ))}
        </Grid>
      </Checkbox.Group>
      <Box>
        <Group justify="right" mt="lg">
          <Button
            loading={isLoadingPost}
            rightSection={<IconDeviceFloppy />}
            onClick={handleSave}
          >
            Save
          </Button>
        </Group>
        {errorPost && <ErrorMessage ta="right" error={errorPost?.message} />}
      </Box>
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
    <Accordion
      radius="md"
      mt="md"
      defaultValue="Profit And Loss"
      variant="contained"
    >
      {items}
    </Accordion>
  );
}

export default Reports;

const response = [
  {
    data: [
      {
        name: 'Lagu lama',
        sub_category_id: '665b23a6-ab1e-457c-9502-00b7178b7d07',
      },
    ],
    headers: 'income',
  },
  {
    data: [
      {
        name: 'Lagu lama',
        sub_category_id: '665b23a6-ab1e-457c-9502-poiuhyr45678',
      },
    ],
    headers: 'operational-expenses',
  },
];

const result = [
  '665b23a6-ab1e-457c-9502-00b7178b7d07',
  '665b23a6-ab1e-457c-9502-poiuhyr45678',
];

const body = [
  [
    {
      sub_category_id: '665b23a6-ab1e-457c-9502-00b7178b7d07',
      index: 1,
      headers: 'income',
      report_name: 'profit-and-loss',
    },
    {
      sub_category_id: '665b23a6-ab1e-457c-9502-poiuhyr45678',
      index: 2,
      headers: 'operational-expenses',
      report_name: 'profit-and-loss',
    },
  ],
];
