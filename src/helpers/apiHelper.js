import { fetchRequest } from './fetchHelper';

export const usePostLogin = async (body) => {
  return fetchRequest(`/auth/login`, 'POST', { body, withAuth: false });
};

export const usePostChangeAccountStatus = async (body) => {
  return fetchRequest(`/user-management/change-status`, 'POST', { body });
};

export const useGetUsers = async (query) => {
  return fetchRequest(`/user-management/users`, 'GET', { query });
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

export const useGetOptionCategories = async () => {
  return fetchRequest(`/options/transaction-category`, 'GET');
};

export const useGetOptionAccounts = async () => {
  return fetchRequest(`/options/account`, 'GET');
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
