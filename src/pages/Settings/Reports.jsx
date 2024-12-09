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
import classes from './Report.module.css';

const ProfitAndLoss = () => {
  const [income, setIncome] = useState([]);
  const [costOfGoodsSold, setCostOfGoodsSold] = useState([]);
  const [operationalExpenses, setOperationalExpenses] = useState([]);

  const {
    isLoading: isLoadingTemplate,
    error: errorTemplate,
    refetch,
  } = useQuery(
    ['report-template-profit-and-loss'],
    () => useGetTemplate({ report_name: 'profit-and-loss' }),
    {
      onSuccess: (data) => {
        if (data?.response.length > 0) {
          const getData = (headers) => {
            const findHeaders = data?.response.find(
              (item) => item.headers === headers
            );
            const dataHeaders = findHeaders?.data || [];
            return dataHeaders.map((item) => item.category_id);
          };

          setIncome(getData('income'));
          setCostOfGoodsSold(getData('cost-of-goods-sold'));
          setOperationalExpenses(getData('operational-expenses'));
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

  const dataCategories = (optionCategories?.response || []).reduce(
    (result, category) => {
      let mapData = result.find(
        (item) => item.group === (category.is_income ? 'Debit' : 'Credit')
      );

      if (!mapData) {
        mapData = {
          group: category.is_income ? 'Debit' : 'Credit',
          items: [],
        };
        result.push(mapData);
      }

      mapData.items.push({ value: category.id, label: category.name });
      return result;
    },
    []
  );

  const handleSave = () => {
    const incomeBody = income.map((item) => ({
      category_id: item,
      headers: 'income',
    }));
    const costOfGoodsSoldBody = costOfGoodsSold.map((item) => ({
      category_id: item,
      headers: 'cost-of-goods-sold',
    }));
    const operationalExpensesBody = operationalExpenses.map((item) => ({
      category_id: item,
      headers: 'operational-expenses',
    }));

    const body = [
      ...incomeBody,
      ...costOfGoodsSoldBody,
      ...operationalExpensesBody,
    ].map((item, index) => ({
      ...item,
      index: index + 1,
      report_name: 'profit-and-loss',
    }));

    mutate({
      report_name: 'profit-and-loss',
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

  const optionsIncome = filterOptions([
    ...costOfGoodsSold,
    ...operationalExpenses,
  ]);
  const optionsCostOfGoodsSold = filterOptions([
    ...operationalExpenses,
    ...income,
  ]);
  const optionsOperationalExpenses = filterOptions([
    ...costOfGoodsSold,
    ...income,
  ]);

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
            Income
          </Title>
          <MultiSelect
            size="md"
            mb="xl"
            searchable
            placeholder="Select Income"
            data={optionsIncome}
            value={income}
            onChange={setIncome}
          />
          <Title order={4} mb="sm">
            Cost of Goods Sold
          </Title>
          <MultiSelect
            size="md"
            mb="xl"
            searchable
            placeholder="Select Cost of Goods Sold"
            data={optionsCostOfGoodsSold}
            value={costOfGoodsSold}
            onChange={setCostOfGoodsSold}
          />
          <Title order={4} mb="sm">
            Operational Expenses
          </Title>
          <MultiSelect
            size="md"
            mb="xl"
            searchable
            placeholder="Select Operational Expenses"
            data={optionsOperationalExpenses}
            value={operationalExpenses}
            onChange={setOperationalExpenses}
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
            return dataHeaders.map((item) => item.category_id);
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

  const dataCategories = (optionCategories?.response || []).reduce(
    (result, category) => {
      let mapData = result.find(
        (item) => item.group === (category.is_income ? 'Debit' : 'Credit')
      );

      if (!mapData) {
        mapData = {
          group: category.is_income ? 'Debit' : 'Credit',
          items: [],
        };
        result.push(mapData);
      }

      mapData.items.push({ value: category.id, label: category.name });
      return result;
    },
    []
  );

  const handleSave = () => {
    const operationalBody = operational.map((item) => ({
      category_id: item,
      headers: 'operational-activities',
    }));
    const investmentBody = investment.map((item) => ({
      category_id: item,
      headers: 'investment-activities',
    }));
    const fundingBody = funding.map((item) => ({
      category_id: item,
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
    <Box p={{ base: 'sm', md: 'xl' }}>
      <Accordion
        radius="md"
        defaultValue="Profit And Loss"
        classNames={classes}
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
    </Box>
  );
}

export default Reports;
