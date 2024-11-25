import React from 'react';
import { jwtDecode } from 'jwt-decode';
import NoAccess from '../../pages/NoAccess';

function Privilege({ children, module, menu }) {
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const privileges = decoded.privilege;
  // Find the module object from the privileges array
  const currentModule = privileges.find((item) => item.module === module);

  // Check if the user has permission for the specified menu in the current module
  const hasPermission = currentModule?.permission?.[menu];

  // Redirect to 404 if no permission, otherwise render children
  if (!hasPermission) {
    return <NoAccess />; // Return null while redirecting to avoid rendering anything
  }

  return <>{children}</>; // Render children if permission exists
}

export default Privilege;
