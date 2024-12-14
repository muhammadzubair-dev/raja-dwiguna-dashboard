import {
  ActionIcon,
  Box,
  Button,
  Card,
  Center,
  Divider,
  Flex,
  Group,
  NumberInput,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import React from 'react';
import { useMutation, useQuery } from 'react-query';
import {
  useGetInvoiceSettings,
  usePostInvoiceSettings,
} from '../../helpers/apiHelper';
import { modals } from '@mantine/modals';
import { notificationSuccess } from '../../helpers/notificationHelper';
import { useForm } from '@mantine/form';
import {
  IconNumber62Small,
  IconPencil,
  IconPercentage,
} from '@tabler/icons-react';
import ErrorMessage from '../../components/ErrorMessage';
import moment from 'moment';

function AddAndEditInvoice({ data, refetchInvoice }) {
  const isAdd = data ? false : true;

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      with_holding_tax_percentage: data?.with_holding_tax_percentage || 0,
      value_added_tax_percentage: data?.value_added_tax_percentage || 0,
      contact_person: data?.contact_person
        ? data?.contact_person.startsWith('62')
          ? data?.contact_person.slice(2)
          : data?.contact_person
        : '',
      position: data?.position || '',
      name: data?.name || '',
    },

    validate: {
      with_holding_tax_percentage: (value) =>
        String(value).trim().length > 0 ? null : 'Contact Person is required',
      value_added_tax_percentage: (value) =>
        String(value).trim().length > 0 ? null : 'Contact Person is required',
      contact_person: (value) =>
        String(value).trim().length > 0 ? null : 'Contact Person is required',
      position: (value) =>
        value.trim().length > 0 ? null : 'Position is required',
      name: (value) => (value.trim().length > 0 ? null : 'Name is required'),
    },
  });

  const { mutate, isLoading, error } = useMutation(usePostInvoiceSettings, {
    onSuccess: () => {
      refetchInvoice();
      modals.closeAll();
      notificationSuccess(`Invoice update successfully`);
    },
  });

  const handleSave = (values) => {
    const body = {
      ...values,
      contact_person: `62${values.contact_person}`,
    };

    mutate(body);
  };

  return (
    <form onSubmit={form.onSubmit(handleSave)}>
      <Stack gap="xs">
        <TextInput
          withAsterisk
          label="Name"
          key={form.key('name')}
          {...form.getInputProps('name')}
        />
        <TextInput
          withAsterisk
          label="Position"
          key={form.key('position')}
          {...form.getInputProps('position')}
        />
        <NumberInput
          leftSection={<IconNumber62Small size={26} />}
          allowNegative={false}
          withAsterisk
          allowDecimal={false}
          label="Contact Person"
          key={form.key('contact_person')}
          {...form.getInputProps('contact_person')}
        />
        <NumberInput
          suffix=" %"
          allowNegative={false}
          withAsterisk
          label="WHT percentage"
          key={form.key('with_holding_tax_percentage')}
          {...form.getInputProps('with_holding_tax_percentage')}
        />
        <NumberInput
          suffix=" %"
          allowNegative={false}
          withAsterisk
          label="VAT percentage"
          key={form.key('value_added_tax_percentage')}
          {...form.getInputProps('value_added_tax_percentage')}
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

function Invoice() {
  const { data, isLoading, error, refetch } = useQuery(
    ['invoice-settings'],
    () => useGetInvoiceSettings()
  );

  const handleUpdateInvoice = () => {
    modals.open({
      title: 'Update Invoice Settings',
      centered: true,
      size: 'xs',
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <AddAndEditInvoice data={data?.response} refetchInvoice={refetch} />
      ),
    });
  };

  const {
    name = '-',
    position = '-',
    contact_person = '-',
    with_holding_tax_percentage = 0,
    value_added_tax_percentage = 0,
    updated_at,
  } = data?.response;

  return (
    <Card withBorder p="0" radius="sm" mt="xl">
      <Group justify="center">
        <Box miw={1000} py="md">
          {/* Name */}
          {/* <Divider mt="xl" /> */}
          <Flex justify="space-between" gap="lg" p="lg">
            <Text>Name</Text>
            <Text>{name}</Text>
          </Flex>
          <Divider />

          {/* Position */}
          <Flex justify="space-between" gap="lg" p="lg">
            <Text>Position</Text>
            <Text>{position}</Text>
          </Flex>
          <Divider />

          {/* contact_person */}
          <Flex justify="space-between" gap="lg" p="lg">
            <Text>Contact Person</Text>
            <Text>{contact_person}</Text>
          </Flex>
          <Divider />

          {/* with_holding_tax_percentage */}
          <Flex justify="space-between" gap="lg" p="lg">
            <Text>Holding Tax Percentage</Text>
            <Text>{with_holding_tax_percentage} %</Text>
          </Flex>
          <Divider />

          {/* value_added_tax_percentage */}
          <Flex justify="space-between" gap="lg" p="lg">
            <Text>Value Added Percentage</Text>
            <Text>{value_added_tax_percentage} %</Text>
          </Flex>
          <Divider />

          {/* updated_at */}
          <Flex justify="space-between" gap="lg" p="lg">
            <Text>Updated At</Text>
            <Text>
              {updated_at ? moment(updated_at).format('YYYY-MM-DD HH:mm') : '-'}
            </Text>
          </Flex>
          <Divider />
          <Group justify="flex-end" my="sm">
            <Button
              onClick={handleUpdateInvoice}
              leftSection={<IconPencil size={18} />}
            >
              Update
            </Button>
          </Group>
        </Box>
      </Group>
    </Card>
  );
}

export default Invoice;
