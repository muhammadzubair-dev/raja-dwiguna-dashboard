import { Container, Tabs } from '@mantine/core';
import React from 'react';
import useSizeContainer from '../../helpers/useSizeContainer';
import BankAccounts from './BankAccounts';
import Categories from './Categories';
import SubCategories from './SubCategories';
import Clients from './Clients';
import Reports from './Reports';

function Settings() {
  const sizeContainer = useSizeContainer((state) => state.sizeContainer);
  return (
    <Container
      size="xl"
      flex={1}
      fluid={sizeContainer === 'fluid'}
      p={{ base: 'md', md: 'xl' }}
    >
      <Tabs defaultValue="bank-account">
        <Tabs.List>
          <Tabs.Tab value="bank-account">Bank Accounts</Tabs.Tab>
          <Tabs.Tab value="categories">Categories</Tabs.Tab>
          <Tabs.Tab value="sub-categories">Sub Categories</Tabs.Tab>
          <Tabs.Tab value="clients">Clients</Tabs.Tab>
          <Tabs.Tab value="reports">Reports</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="bank-account" pt="xs">
          <BankAccounts />
        </Tabs.Panel>

        <Tabs.Panel value="categories" pt="xs">
          <Categories />
        </Tabs.Panel>

        <Tabs.Panel value="sub-categories" pt="xs">
          <SubCategories />
        </Tabs.Panel>

        <Tabs.Panel value="clients" pt="xs">
          <Clients />
        </Tabs.Panel>

        <Tabs.Panel value="reports" pt="xs">
          <Reports />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}

export default Settings;
