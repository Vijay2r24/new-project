
import { Navigate } from 'react-router-dom';
import Layout from '../layout/Layout';

const ProtectedRoute = ({ permissionCode, children }) => {
  let allowedCodes = [];
  try {
    const allPermissions = JSON.parse(localStorage.getItem('AllPermissions'));
    const userPermissionIDs = JSON.parse(localStorage.getItem('PermissionIDs')) || [];
    const allowed = (allPermissions?.data?.rows || []).filter(perm => userPermissionIDs.includes(perm.ID));
    allowedCodes = allowed.map(perm => perm.Code);
  } catch {}

  if (permissionCode && !allowedCodes.includes(permissionCode)) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <Layout>{children}</Layout>;
};

export default ProtectedRoute; 