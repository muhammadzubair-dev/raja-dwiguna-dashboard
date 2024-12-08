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
  Loader,
  MultiSelect,
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
    isLoading: isLoadingTemplate,
    error: errorTemplate,
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

  const {
    data: optionCategories,
    isLoading: isLoadingCategories,
    error: errorCategories,
  } = useQuery(['option-categories'], () => useGetOptionCategories());

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
      {(isLoadingTemplate || isLoadingCategories) && (
        <Center h={300}>
          <Loader />
        </Center>
      )}

      {(errorTemplate || errorCategories) && (
        <Center h={300}>
          <ErrorMessage
            message={errorTemplate?.message || errorCategories?.message}
          />
        </Center>
      )}

      {optionCategories?.response && (
        <>
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
            {errorPost && (
              <ErrorMessage ta="right" error={errorPost?.message} />
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

const CashFlow = () => {
  const [operational, setOperational] = useState([]);
  const [investment, setInvestment] = useState([]);
  const [funding, setFunding] = useState([]);

  const {
    isLoading: isLoadingTemplate,
    error: errorTemplate,
    refetch,
  } = useQuery(
    ['report-template-cash-flow'],
    () => useGetTemplate({ report_name: 'cash-flow' }),
    {
      onSuccess: (data) => {
        if (data?.response.length > 0) {
          const getData = (headers) => {
            const findHeaders = data?.response.find(
              (item) => item.headers === headers
            );
            const dataHeaders = findHeaders?.data || [];
            return dataHeaders.map((item) => item.sub_category_id);
          };

          setOperational(getData('operational-activities'));
          setInvestment(getData('investment-activities'));
          setFunding(getData('funding-activities'));
        }
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

  const {
    data: optionCategories,
    isLoading: isLoadingCategories,
    error: errorCategories,
  } = useQuery(['option-categories'], () => useGetOptionCategories());

  const dataCategories = (optionCategories?.response || []).map((category) => ({
    group: `${category.name} (${category.is_income ? 'Debit' : 'Credit'})`,
    items: category.list_transaction_sub_category.map((sub) => ({
      value: sub.id,
      label: sub.name,
    })),
  }));

  const handleSave = () => {
    const operationalBody = operational.map((item) => ({
      sub_category_id: item,
      headers: 'operational-activities',
    }));
    const investmentBody = investment.map((item) => ({
      sub_category_id: item,
      headers: 'investment-activities',
    }));
    const fundingBody = funding.map((item) => ({
      sub_category_id: item,
      headers: 'funding-activities',
    }));

    const body = [...operationalBody, ...investmentBody, ...fundingBody].map(
      (item, index) => ({
        ...item,
        index: index + 1,
        report_name: 'cash-flow',
      })
    );

    mutate({
      report_name: 'cash-flow',
      data: body,
    });
  };

  const filterOptions = (valuesToRemove) => {
    return dataCategories
      .map((group) => {
        return {
          ...group,
          items: group.items.filter(
            (item) => !valuesToRemove.includes(item.value)
          ),
        };
      })
      .filter((group) => group.items.length > 0);
  };

  const optionsOperational = filterOptions([...investment, ...funding]);
  const optionsInvestment = filterOptions([...operational, ...funding]);
  const optionsFunding = filterOptions([...operational, ...investment]);

  return (
    <Container fluid>
      {(isLoadingTemplate || isLoadingCategories) && (
        <Center h={300}>
          <Loader />
        </Center>
      )}

      {(errorTemplate || errorCategories) && (
        <Center h={300}>
          <ErrorMessage
            message={errorTemplate?.message || errorCategories?.message}
          />
        </Center>
      )}

      {optionCategories?.response && (
        <>
          <Title order={4} mb="sm">
            Operational Activities
          </Title>
          <MultiSelect
            size="md"
            mb="xl"
            searchable
            placeholder="Select Sub Category"
            data={optionsOperational}
            value={operational}
            onChange={setOperational}
          />
          <Title order={4} mb="sm">
            Investment Activities
          </Title>
          <MultiSelect
            size="md"
            mb="xl"
            searchable
            placeholder="Select Sub Category"
            data={optionsInvestment}
            value={investment}
            onChange={setInvestment}
          />
          <Title order={4} mb="sm">
            Funding Activities
          </Title>
          <MultiSelect
            size="md"
            mb="xl"
            searchable
            placeholder="Select Sub Category"
            data={optionsFunding}
            value={funding}
            onChange={setFunding}
          />
          <Box mt="lg">
            <Group justify="right">
              <Button
                loading={isLoadingPost}
                rightSection={<IconDeviceFloppy />}
                onClick={handleSave}
              >
                Save
              </Button>
            </Group>
            {errorPost && (
              <ErrorMessage ta="right" error={errorPost?.message} />
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

function Reports() {
  return (
    <Accordion
      radius="md"
      mt="md"
      defaultValue="Profit And Loss"
      variant="contained"
    >
      {[
        {
          value: 'Cash Flow',
          description: <CashFlow />,
        },
        {
          value: 'Profit And Loss',
          description: <ProfitAndLoss />,
        },
      ].map((item) => (
        <Accordion.Item key={item.value} value={item.value}>
          <Accordion.Control>{item.value}</Accordion.Control>
          <Accordion.Panel>{item.description}</Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

export default Reports;
