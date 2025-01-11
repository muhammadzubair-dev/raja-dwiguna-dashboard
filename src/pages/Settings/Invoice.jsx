import {
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  NumberInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { IconNumber62Small, IconPencil } from '@tabler/icons-react';
import moment from 'moment';
import React from 'react';
import { useMutation, useQuery } from 'react-query';
import ErrorMessage from '../../components/ErrorMessage';
import {
  useGetInvoiceSettings,
  usePostInvoiceSettings,
} from '../../helpers/apiHelper';
import { notificationSuccess } from '../../helpers/notificationHelper';

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
      contact_person_name: data?.contact_person_name || '',
    },

    validate: {
      with_holding_tax_percentage: (value) =>
        String(value).trim().length > 0 ? null : 'WHT is required',
      value_added_tax_percentage: (value) =>
        String(value).trim().length > 0 ? null : 'VAT is required',
      contact_person: (value) =>
        String(value).trim().length > 0
          ? null
          : 'Contact Person Number is required',
      position: (value) =>
        value.trim().length > 0 ? null : 'Position is required',
      name: (value) => (value.trim().length > 0 ? null : 'Name is required'),
      contact_person_name: (value) =>
        value.trim().length > 0 ? null : 'Contact Person Name is required',
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
        <TextInput
          withAsterisk
          label="Contact Name"
          key={form.key('contact_person_name')}
          {...form.getInputProps('contact_person_name')}
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
      size: 'sm',
      radius: 'md',
      overlayProps: { backgroundOpacity: 0.55, blur: 5 },
      children: (
        <AddAndEditInvoice data={data?.response} refetchInvoice={refetch} />
      ),
    });
  };

  const records = data?.response;

  return (
    <Card withBorder p="0" radius="sm" mt="xl">
      <Group justify="center">
        <Box w="100%" maw={1000} py="md">
          {/* Name */}
          {/* <Divider mt="xl" /> */}
          <Flex justify="space-between" gap="lg" p="lg">
            <Text>Name</Text>
            <Text>{records?.name || '-'}</Text>
          </Flex>
          <Divider />

          {/* Position */}
          <Flex justify="space-between" gap="lg" p="lg">
            <Text>Position</Text>
            <Text>{records?.position || '-'}</Text>
          </Flex>
          <Divider />

          {/* contact_person */}
          <Flex justify="space-between" gap="lg" p="lg">
            <Text>Contact Person</Text>
            <Text>{records?.contact_person || '-'}</Text>
          </Flex>
          <Divider />

          {/* contact_person_name */}
          <Flex justify="space-between" gap="lg" p="lg">
            <Text>Contact Person Name</Text>
            <Text>{records?.contact_person_name || '-'}</Text>
          </Flex>
          <Divider />

          {/* with_holding_tax_percentage */}
          <Flex justify="space-between" gap="lg" p="lg">
            <Text>Holding Tax Percentage</Text>
            <Text>{records?.with_holding_tax_percentage || 0} %</Text>
          </Flex>
          <Divider />

          {/* value_added_tax_percentage */}
          <Flex justify="space-between" gap="lg" p="lg">
            <Text>Value Added Percentage</Text>
            <Text>{records?.value_added_tax_percentage || 0} %</Text>
          </Flex>
          <Divider />

          {/* updated_at */}
          <Flex justify="space-between" gap="lg" p="lg">
            <Text>Updated At</Text>
            <Text>
              {records?.updated_at
                ? moment(records?.updated_at).format('YYYY-MM-DD HH:mm')
                : '-'}
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
