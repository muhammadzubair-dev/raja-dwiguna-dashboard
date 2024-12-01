const BASE_URL = 'https://dev.arieslibre.my.id/api/v1';

const useFileUpload = async (endpoint, files) => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`files`, file);
  });

  let finalUrl = `${BASE_URL}${endpoint}`;

  const headers = new Headers();
  headers.append('Authorization', `Bearer ${localStorage.getItem('token')}`);

  const response = await fetch(finalUrl, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result; // Return the response to the caller
};

export default useFileUpload;
