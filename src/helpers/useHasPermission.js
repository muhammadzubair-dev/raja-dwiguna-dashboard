import { useMemo } from 'react';
import usePrivileges from '../helpers/usePrivileges';

function useHasPermission(module, menu) {
  const privileges = usePrivileges((state) => state.privileges);

  // Use useMemo to memoize the permission check to avoid recalculating on every render
  return useMemo(() => {
    // Find the module object from the privileges array
    const currentModule = privileges.find((item) => item.module === module);

    // Check if the user has permission for the specified menu in the current module
    return currentModule?.permission?.[menu];
  }, [privileges, module, menu]);
}

export default useHasPermission;
