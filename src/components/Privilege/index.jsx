import React from 'react';

import usePrivileges from '../../helpers/usePrivileges';
import NoAccess from '../../pages/NoAccess';

function Privilege({ children, module, menu }) {
  const privileges = usePrivileges((state) => state.privileges);
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
