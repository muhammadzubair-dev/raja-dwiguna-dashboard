import { fetchRequest } from './fetchHelper';

export const usePostLogin = async (body) => {
  return fetchRequest(`/auth/login`, 'POST', { body, withAuth: false });
};

export const usePostChangeAccountStatus = async (body) => {
  return fetchRequest(`/user-management/change-status`, 'POST', { body });
};

export const usePutUserRole = async (body) => {
  return fetchRequest(`/user-management/role`, 'PUT', { body });
};

export const useGetUsers = async (query) => {
  return fetchRequest(`/user-management/users`, 'GET', { query });
};

export const usePostAccount = async (body) => {
  return fetchRequest(`/user-management`, 'POST', { body });
};

export const useGetRoles = async (query) => {
  return fetchRequest(`/role`, 'GET', { query });
};

export const usePutRole = async (body) => {
  return fetchRequest(`/role`, 'PUT', { body });
};

export const usePostRole = async (body) => {
  return fetchRequest(`/role`, 'POST', { body });
};

export const usePutRolePermissions = async (body) => {
  return fetchRequest(`/role/permission`, 'PUT', { body });
};

export const useDeleteRole = async (body) => {
  return fetchRequest(`/role`, 'DELETE', { body });
};

export const useGetLogActivities = async (query) => {
  return fetchRequest(`/log-activity`, 'GET', { query });
};

export const useGetTransactions = async (query) => {
  return fetchRequest(`/finance/transaction`, 'GET', { query });
};

export const usePostTransaction = async (body) => {
  return fetchRequest(`/finance/transaction`, 'POST', { body });
};

export const usePutTransaction = async (body) => {
  return fetchRequest(`/finance/transaction`, 'PUT', { body });
};

export const useGetInvoices = async (query) => {
  return fetchRequest(`/finance/invoice`, 'GET', { query });
};

export const useGetInvoiceNumber = async () => {
  return fetchRequest(`/finance/invoice/get-number`, 'GET');
};

export const usePostInvoice = async (body) => {
  return fetchRequest(`/finance/invoice`, 'POST', { body });
};

export const usePutInvoice = async (body) => {
  return fetchRequest(`/finance/invoice`, 'PUT', { body });
};

export const useDeleteInvoice = async (body) => {
  return fetchRequest(`/finance/invoice`, 'DELETE', { body });
};

export const useGetCategories = async (query) => {
  return fetchRequest(`/finance/settings/category`, 'GET', { query });
};

export const usePostCategory = async (body) => {
  return fetchRequest(`/finance/settings/category`, 'POST', { body });
};

export const usePutCategory = async (body) => {
  return fetchRequest(`/finance/settings/category`, 'PUT', { body });
};

export const useDeleteCategory = async (body) => {
  return fetchRequest(`/finance/settings/category`, 'DELETE', { body });
};

export const useGetSubCategories = async (query) => {
  return fetchRequest(`/finance/settings/category/sub`, 'GET', { query });
};

export const usePostSubCategory = async (body) => {
  return fetchRequest(`/finance/settings/category/sub`, 'POST', { body });
};

export const usePutSubCategory = async (body) => {
  return fetchRequest(`/finance/settings/category/sub`, 'PUT', { body });
};

export const useDeleteSubCategory = async (body) => {
  return fetchRequest(`/finance/settings/category/sub`, 'DELETE', { body });
};

export const useGetAccountBank = async (query) => {
  return fetchRequest(`/finance/settings/account`, 'GET', { query });
};

export const usePostAccountBank = async (body) => {
  return fetchRequest(`/finance/settings/account`, 'POST', { body });
};

export const usePutAccountBank = async (body) => {
  return fetchRequest(`/finance/settings/account`, 'PUT', { body });
};

export const usePutChangeAStatusClient = async (body) => {
  return fetchRequest(`/finance/settings/client/change-status`, 'PUT', { body });
};

export const useGetClients = async (query) => {
  return fetchRequest(`/finance/settings/client`, 'GET', { query });
};

export const usePostClient = async (body) => {
  return fetchRequest(`/finance/settings/client`, 'POST', { body });
};

export const usePutClient = async (body) => {
  return fetchRequest(`/finance/settings/client`, 'PUT', { body });
};

export const useGetOptionCategories = async () => {
  return fetchRequest(`/options/transaction-category`, 'GET');
};

export const useGetOptionAccounts = async () => {
  return fetchRequest(`/options/account`, 'GET');
};

export const useGetOptionUsers = async () => {
  return fetchRequest(`/options/user`, 'GET');
};

export const useGetOptionModules = async () => {
  return fetchRequest(`/options/module`, 'GET');
};

export const useGetOptionRoles = async () => {
  return fetchRequest(`/options/role`, 'GET');
};

export const useGetOptionClients = async () => {
  return fetchRequest(`/options/client?status=true`, 'GET');
};

export const useGetDashboardIncome = async (query) => {
  return fetchRequest(`/dashboard/incoming`, 'GET', { query });
};

export const useGetDashboardOutcome = async (query) => {
  return fetchRequest(`/dashboard/outcoming`, 'GET', { query });
};

export const useGetDashboardBalance = async (query) => {
  return fetchRequest(`/dashboard/current-balance`, 'GET', { query });
};

export const useGetDashboardBarChart = async (query) => {
  return fetchRequest(`/dashboard/chart-default-three-month`, 'GET', { query });
};

export const useGetDashboardTopIncome = async (query) => {
  return fetchRequest(`/dashboard/top-incoming`, 'GET', { query });
};

export const useGetDashboardTopOutcome = async (query) => {
  return fetchRequest(`/dashboard/top-outcoming`, 'GET', { query });
};

export const usePostLogout = async () => {
  return fetchRequest(`/auth/logout`, 'POST');
};

export const usePostChangePassword = async (body) => {
  return fetchRequest(`/auth/change-password`, 'POST', { body });
};

export const usePostResetPassword = async (body) => {
  return fetchRequest(`/user-management/reset-password`, 'POST', { body });
};

export const useGetPrivileges = async () => {
  return fetchRequest(`/auth/privilege`, 'GET');
};
