import { notifications } from '@mantine/notifications';

export const notificationSuccess = (message) =>
  notifications.show({
    color: 'green',
    title: 'Success !!',
    autoClose: 5000,
    message,
  });

export const notificationError = (message) =>
  notifications.show({
    color: 'red',
    title: 'Error !!',
    autoClose: 5000,
    message,
  });
