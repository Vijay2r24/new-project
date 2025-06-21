import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import TextwithIcone from "../components/TextInputWithIcon";
import SelectwithIcone from "../components/SelectWithIcon";
import { Store, Shield, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiGet, apiPost } from '../utils/ApiUtils';
import { GetAllPermmissions, CreateOrUpdateRole, GetAllPermissionsByRoleId } from '../contants/apiRoutes';
import { useStores } from '../context/StoreContext';
import { showEmsg } from '../utils/ShowEmsg';
import { useTitle } from '../context/TitleContext';

const AddUserRole = () => {
  const [sRoleName, setRoleName] = useState('');
  const [sStoreId, setStoreId] = useState('0');
  const [oPermissionsByModule, setPermissionsByModule] = useState({});
  const [nError, setError] = useState(null);
  const [oErrors, setErrors] = useState({});
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const { t } = useTranslation();
  const { aStores, bLoading: bStoresLoading, sError: sStoresError } = useStores();
  const { Id } = useParams();
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle(t('createuserrole.add_user_role'));
    return () => setTitle('');
  }, [setTitle, t]);

  useEffect(() => {
    const fetchPermissions = async () => {
      setLoadingPermissions(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        let response;
        if (Id) {
          response = await apiGet(`${GetAllPermissionsByRoleId}/${Id}`, {}, token);
        } else {
          response = await apiGet(GetAllPermmissions, {}, token);
        }
        let permissionsArr = [];
        if (response.data && response.data.status === 'SUCCESS') {
          if (response.data.data && Array.isArray(response.data.data.rows)) {
            permissionsArr = response.data.data.rows;
          } else if (Array.isArray(response.data.result)) {
            permissionsArr = response.data.result;
          }
        }
        if (permissionsArr.length > 0) {
          const categorizedPermissions = {};
          permissionsArr.forEach((permission) => {
            const module = permission.Module || permission.PermissionModule;
            const id = permission.ID || permission.PermissionId;
            const name = permission.Name || permission.PermissionName;
            const isChecked = permission.IsChecked;
            if (!categorizedPermissions[module]) {
              categorizedPermissions[module] = [];
            }
            categorizedPermissions[module].push({
              ID: id,
              Name: name,
              IsChecked: isChecked,
            });
          });
          setPermissionsByModule(categorizedPermissions);
          if (Id && response.data.data && response.data.data.role) {
            setRoleName(response.data.data.role.RoleName || '');
            setStoreId(response.data.data.role.StoreID ? String(response.data.data.role.StoreID) : '0');
          }
        } else {
          setPermissionsByModule({});
          setError(response.data?.message || 'Failed to fetch permissions');
        }
      } catch (err) {
        setPermissionsByModule({});
        setError('Failed to fetch permissions');
      } finally {
        setLoadingPermissions(false);
      }
    };
    fetchPermissions();
  }, [Id]);

  const navigate = useNavigate();
  const handleCheckboxChange = (moduleName, permissionId) => {
    setPermissionsByModule((prevState) => {
      const updatedPermissions = { ...prevState };
      updatedPermissions[moduleName] = updatedPermissions[moduleName].map(
        (permission) =>
          permission.ID === permissionId
            ? { ...permission, IsChecked: !permission.IsChecked }
            : permission
      );
      return updatedPermissions;
    });
  };

  const handleSelectAllChange = (moduleName, isChecked) => {
    setPermissionsByModule((prevState) => {
      const updatedPermissions = { ...prevState };
      updatedPermissions[moduleName] = updatedPermissions[moduleName].map(
        (permission) => ({
          ...permission,
          IsChecked: isChecked,
        })
      );
      return updatedPermissions;
    });
  };

  const handleClose = () => {
    navigate("/addUserRole");
  };
  const handleSaveRole = (event) => {
    event.preventDefault();
  };

  if (nError) return <div>{nError}</div>;

  const storeOptions = aStores.map((store) => ({
    value: store.StoreID,
    label: store.StoreName,
  }));

  const handleStoreChange = (event) => {
    setStoreId(event.target.value);
    setErrors(prev => ({ ...prev, StoreIdError: undefined }));
  };
  const validateRoleDataSubmit = () => {
    const newErrors = {};
    if (sStoreId === "0") {
      newErrors.StoreIdError = t('createuserrole.storeIsrequid');
    }
    if (!sRoleName) {
      newErrors.RoleNameError = t('createuserrole.roleIsrequid');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length > 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!validateRoleDataSubmit()) {
      // Collect selected permissions robustly
      const selectedPermissions = Object.values(oPermissionsByModule)
        .flat()
        .filter(permission => permission.IsChecked)
        .map(permission => permission.ID || permission.PermissionId || permission.id);

      console.log('Selected permissions:', selectedPermissions);

      const roleData = {
        roleId: 0,
        roleName: sRoleName,
        storeId: sStoreId,
        permissions: selectedPermissions,
      };
      console.log('roleData:', roleData);

      try {
        const token = localStorage.getItem('token');
        await apiPost(CreateOrUpdateRole, roleData, token);
        handleSaveRole(event);
      } catch (err) {
        const msg = err?.response?.data?.message;
        showEmsg(msg, 'error');
      }
    }
  };

  return (
    <div
      className={`max-w-7xl mx-auto`}
    >
      <div>
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <p className="text-gray-500">
              {t('createuserrole.add_user_role_description')}
            </p>
          </div>
        </div>


        <form
          onSubmit={handleSave}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col items-center justify-center">
              <div className=" flex flex-col sm:flex-row justify-center items-center w-full ">
                <label className="block font-semibold mr-[14px]">
                  {t('createuserrole:store')}
                </label>
                {bStoresLoading ? (
                  <div className="text-gray-500">Loading stores...</div>
                ) : sStoresError ? (
                  <div className="text-red-500">{sStoresError}</div>
                ) : (
                  <SelectwithIcone
                    options={storeOptions}
                    value={sStoreId}
                    onChange={handleStoreChange}
                    placeholder={t('createuserrole.select_store')}
                    error={oErrors.StoreIdError}
                    Icon={Store}
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className=" flex flex-col sm:flex-row justify-center items-center w-full ">
                <label className="block font-semibold mr-[14px]">
                  {t('createuserrole.role')}
                </label>
                <TextwithIcone
                  type="text"
                  value={sRoleName}
                  onChange={(e) => { setRoleName(e.target.value); setErrors(prev => ({ ...prev, RoleNameError: undefined })); }}
                  placeholder={t('createuserrole.enter_role_name')}
                  error={oErrors.RoleNameError}
                  Icon={Shield}
                />
              </div>
            </div>
          </div>
          <hr className="border-gray-300 my-4 mb-6" />
          {loadingPermissions ? (
            <div className="text-center py-8">Loading permissions...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.keys(oPermissionsByModule).map((moduleName) => {
                const isAllSelected = oPermissionsByModule[moduleName].every(
                  (permission) => permission.IsChecked
                );

                return (
                  <div
                    key={moduleName}
                    className="border p-4 rounded-lg shadow bg-[#e5efff]"
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-bold">{moduleName}</h2>
                      <label className="text-sm">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={(e) =>
                            handleSelectAllChange(moduleName, e.target.checked)
                          }
                          className="mr-2 form-checkbox h-[12px] w-[12px] text-blue-600"
                        />
                        {t('createuserrole:select_all')}
                      </label>
                    </div>
                    <hr className="border-gray-300 my-4 mt-2 mb-4" />
                    {oPermissionsByModule[moduleName].map((permission) => (
                      <div key={permission.ID} className="flex items-center mb-2">
                        <label>
                          <input
                            type="checkbox"
                            checked={permission.IsChecked}
                            onChange={() =>
                              handleCheckboxChange(moduleName, permission.ID)
                            }
                            className="mr-2 form-checkbox h-[12px] w-[12px] text-blue-600"
                          />
                          {permission.Name}
                        </label>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-10 flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              className="bg-gray-200 px-4 py-2 rounded shadow w-full sm:w-auto"
              onClick={handleClose}
              type="button"
            >
              {t('createuserrole:close')}
            </button>
            <button
              className="btn-primary"
              type="submit"
            >
              {t('createuserrole.save_role')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserRole; 