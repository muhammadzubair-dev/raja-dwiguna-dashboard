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

export const useGetCategories = async (query) => {
  return fetchRequest(`/finance/settings/category`, 'GET', { query });
};

export const useGetSubCategories = async (query) => {
  return fetchRequest(`/finance/settings/category/sub`, 'GET', { query });
};

export const useGetAccountBank = async (query) => {
  return fetchRequest(`/finance/settings/account`, 'GET', { query });
};
