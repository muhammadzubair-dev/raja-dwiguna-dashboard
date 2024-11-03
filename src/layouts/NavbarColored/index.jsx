import { Code, Group } from '@mantine/core';
import {
  IconCashRegister,
  IconDashboard,
  IconLogout,
  IconSwitchHorizontal,
  IconUsers,
} from '@tabler/icons-react';
import { useState } from 'react';
import logoImage from '../../assets/logo-rds.png';
import classes from './index.module.css';

const data = [
  { link: '', label: 'Dashboard', icon: IconDashboard },
  { link: '', label: 'Transactions', icon: IconCashRegister },
  { link: '', label: 'Users', icon: IconUsers },
];

export function NavbarSimpleColored() {
  const [active, setActive] = useState('Billing');

  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <img height={50} src={logoImage} alt="logo" />
          <Code fw={700} className={classes.version}>
            v0.0.1
          </Code>
        </Group>
        {links}
      </div>

      <div className={classes.footer}>
        <a
          href="#"
          className={classes.link}
          onClick={(event) => event.preventDefault()}
        >
          <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
          <span>Change account</span>
        </a>

        <a
          href="#"
          className={classes.link}
          onClick={(event) => event.preventDefault()}
        >
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}
