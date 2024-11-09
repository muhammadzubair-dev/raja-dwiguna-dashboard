const BASE_URL = 'https://dev.arieslibre.my.id/api/v1';

// fetchHelper.js
export const fetchRequest = async (path, method = 'GET', body = null) => {
  const url = `${BASE_URL}${path}`;

  // Prepare options for the fetch request
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // If it's a POST, PUT, or DELETE request, we add the body
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || 'Something went wrong');
    }

    return response.json(); // Return the parsed JSON response
  } catch (error) {
    throw new Error(error.message || 'Network error');
  }
};
