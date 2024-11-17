import { useState } from 'react';

/**
 * Custom hook to fetch an Excel file and download it
 * @param {string} url - The URL of the Excel file.
 * @param {object} [options] - Additional fetch options (e.g., headers, method).
 */
const BASE_URL = 'https://dev.arieslibre.my.id/api/v1';

const useDownloadExcel = (endpoint, options = {}) => {
  const { query, fileName = 'test', extension = 'xlsx' } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const downloadExcelFile = async () => {
    setLoading(true);
    setError(null);

    let finalUrl = `${BASE_URL}${endpoint}`;

    if (query) {
      const queryString = new URLSearchParams(query).toString();
      finalUrl = `${finalUrl}?${queryString}`;
    }

    console.log('======> ', finalUrl);

    try {
      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Check if the response is valid
      if (!response.ok) {
        throw new Error('Failed to fetch the file');
      }

      // Convert the response to a Blob
      const blob = await response.blob();

      // Create a temporary URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // Create a download link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.${extension}`; // Set default download filename
      link.click();

      // Clean up the object URL after the download
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    downloadExcelFile,
  };
};

export default useDownloadExcel;
