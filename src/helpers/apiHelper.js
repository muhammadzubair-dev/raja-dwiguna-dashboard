import { fetchRequest } from './fetchHelper';

export const useLogin = async (credentials) => {
  return fetchRequest(`/auth/login`, 'POST', credentials);
};
