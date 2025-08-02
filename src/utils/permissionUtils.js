export function getPermissionCode(module, name) {
  try {
    const allPermissions = JSON.parse(localStorage.getItem('AllPermissions'));
    const rows = allPermissions?.data?.rows || [];
    const found = rows.find(
      perm =>
        perm.Module?.toLowerCase().trim() === module.toLowerCase().trim() &&
        perm.Name?.toLowerCase().trim() === name.toLowerCase().trim()
    );
    return found ? found.Code : null;
  } catch {
    return null;
  }
}
export function hasPermissionId(permissionCode) {
  try {
    const allPermissions = JSON.parse(localStorage.getItem('AllPermissions'));
    const permissionIDs = JSON.parse(localStorage.getItem('PermissionIDs'));
    const rows = allPermissions?.data?.rows || [];

    const matchingPermission = rows.find(p => p.Code === permissionCode);

    if (!matchingPermission) return false;

    return Array.isArray(permissionIDs) && permissionIDs.includes(matchingPermission.ID);
  } catch {
    return false;
  }
}
