import { Container, Tabs, Text, Title } from '@mantine/core';
import React from 'react';
import BankAccounts from './BankAccounts';
import Categories from './Categories';
import SubCategories from './SubCategories';

function Settings() {
  return (
    <Container size="xl" flex={1} p={{ base: 'md', md: 'xl' }}>
      <Tabs defaultValue="bank-account">
        <Tabs.List>
          <Tabs.Tab value="bank-account">Bank Accounts</Tabs.Tab>
          <Tabs.Tab value="categories">Categories</Tabs.Tab>
          <Tabs.Tab value="sub-categories">Sub Categories</Tabs.Tab>
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
      </Tabs>
    </Container>
  );
}

export default Settings;
