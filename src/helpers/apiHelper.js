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
