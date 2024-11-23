const BASE_URL = 'https://dev.arieslibre.my.id/api/v1';

// fetchHelper.js
export const fetchRequest = async (path, method = 'GET', options = {}) => {
  const { query, body, withAuth = true } = options;

  let url = `${BASE_URL}${path}`;

  // If there are query parameters, append them to the URL for GET requests
  if (method === 'GET' && query) {
    const queryString = new URLSearchParams(query).toString();
    url = `${url}?${queryString}`;
  }

  // Prepare the request headers
  const headers = {
    'Content-Type': 'application/json',
  };

  // If withAuth is true, attach the Authorization header
  if (withAuth) {
    const token = localStorage.getItem('token'); // Example, replace with your token retrieval logic
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Prepare options for the fetch request
  const fetchOptions = {
    method,
    headers,
  };

  // If the method is not GET and we have a body, add it to the options
  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);

    if (path !== '/auth/login' && response.status === 401) {
      localStorage.removeItem('privileges');
      localStorage.removeItem('token');
      setTimeout(() => {
        window.location.replace('/');
      }, 500);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || 'Something went wrong');
    }

    return response.json(); // Return the parsed JSON response
  } catch (error) {
    throw new Error(error.message || 'Network error');
  }
};
