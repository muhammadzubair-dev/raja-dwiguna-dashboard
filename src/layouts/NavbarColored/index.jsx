import { Code, Flex, Group } from '@mantine/core';
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
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const data = [
  { link: '/', label: 'Dashboard', icon: IconDashboard },
  { link: '/users', label: 'Users', icon: IconUsers },
  { link: '/transactions', label: 'Transactions', icon: IconCashRegister },
];

function NavbarColored() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const links = data.map((item) => {
    const isActive = currentPath === item.link ? true : undefined;
    return (
      <a
        className={classes.link}
        data-active={isActive}
        key={item.label}
        onClick={(event) => {
          event.preventDefault();
          navigate(item.link);
        }}
      >
        <item.icon className={classes.linkIcon} stroke={1.5} />
        <span>{item.label}</span>
      </a>
    );
  });

  return (
    <Flex>
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
          {/* <a
            href="#"
            className={classes.link}
            onClick={(event) => event.preventDefault()}
          >
            <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
            <span>Change account</span>
          </a> */}

          <a
            href="#"
            className={classes.link}
            onClick={(event) => {
              event.preventDefault();
              navigate('login');
            }}
          >
            <IconLogout className={classes.linkIcon} stroke={1.5} />
            <span>Logout</span>
          </a>
        </div>
      </nav>
      <Outlet />
    </Flex>
  );
}

export default NavbarColored;
