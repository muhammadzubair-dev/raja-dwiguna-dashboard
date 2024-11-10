import { useState } from 'react';

// Custom hook to manage pagination state
const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const handlePageChange = (newPage) => {
    console.log('------------> ', newPage);
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    console.log('newLimit ------------> ', newLimit);
    setLimit(newLimit);
  };

  return {
    page,
    limit,
    handlePageChange,
    handleLimitChange,
  };
};

export default usePagination;