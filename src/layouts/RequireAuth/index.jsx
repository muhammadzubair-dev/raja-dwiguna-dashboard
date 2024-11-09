import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default RequireAuth;
