export function getPermissionCode(module, name) {
  try {
    const allPermissions = JSON.parse(localStorage.getItem('AllPermissions'));
    const rows = allPermissions?.data?.rows || [];
    const found = rows.find(
      perm => perm.Module === module && perm.Name === name
    );
    return found ? found.Code : null;
  } catch {
    return null;
  }
} 