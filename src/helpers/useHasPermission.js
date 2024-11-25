import { useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';

function useHasPermission(module, menu) {
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const privileges = decoded.privilege;

  // Use useMemo to memoize the permission check to avoid recalculating on every render
  return useMemo(() => {
    // Find the module object from the privileges array
    const currentModule = privileges.find((item) => item.module === module);

    // Check if the user has permission for the specified menu in the current module
    return currentModule?.permission?.[menu];
  }, [privileges, module, menu]);
}

export default useHasPermission;
