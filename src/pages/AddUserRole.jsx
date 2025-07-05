import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import TextwithIcone from "../components/TextInputWithIcon";
import SelectwithIcone from "../components/SelectWithIcon";
import { Store, Shield, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiGet, apiPost } from '../utils/ApiUtils';
import { GetAllPermmissions, CreateOrUpdateRole, GetAllPermissionsByRoleId } from '../contants/apiRoutes';
import { useStores } from '../context/AllDataContext';
import { showEmsg } from '../utils/ShowEmsg';
import { useTitle } from '../context/TitleContext';
import { STATUS } from '../contants/constants';
import BackButton from '../components/BackButton';

const AddUserRole = () => {
  const [sRoleName, setRoleName] = useState('');
  const [sStoreId, setStoreId] = useState('0');
  const [sStoreName, setStoreName] = useState('');
  const [oPermissionsByModule, setPermissionsByModule] = useState({});
  const [nError, setError] = useState(null);
  const [oErrors, setErrors] = useState({});
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const { t } = useTranslation();
  const { data: aStores = [], loading: bStoresLoading, error: sStoresError } = useStores();
  const { roleId } = useParams();
  const { setTitle, setBackButton } = useTitle();

  useEffect(() => {
    setTitle(t('CREATE_USER_ROLE.ADD_USER_ROLE'));
    setBackButton(
      <BackButton onClick={() => window.history.back()} />
    );
    return () => {
      setBackButton(null);
      setTitle('');
    };
  }, [setTitle, setBackButton, t]);

  useEffect(() => {
    const fetchPermissions = async () => {
      setLoadingPermissions(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        let oResponse;

        if (roleId) {
          oResponse = await apiGet(`${GetAllPermissionsByRoleId}/${roleId}`, {}, token);
        } else {
          oResponse = await apiGet(GetAllPermmissions, {}, token);
        }

        const resData = oResponse?.data;
        let permissionsArr = [];

        if (resData?.status === STATUS.SUCCESS.toUpperCase()) {
          if (resData.data?.rows && Array.isArray(resData.data.rows)) {
            permissionsArr = resData.data.rows;
          } else if (Array.isArray(resData.result)) {
            permissionsArr = resData.result;
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

          if (roleId && permissionsArr.length > 0) {
            const roleInfo = permissionsArr.find(p => p.RoleName && p.StoreID) || permissionsArr[0];
            setRoleName(roleInfo.RoleName || '');
            setStoreId(roleInfo.StoreID ? String(roleInfo.StoreID) : '0');
            setStoreName(roleInfo.StoreName || '');
          }
        } else {
          setPermissionsByModule({});
          setError(resData?.message || t('CREATE_USER_ROLE.FAILED_TO_FETCH_PERMISSIONS'));
        }
      } catch (err) {
        const backendMessage = err?.response?.data?.message;
        setPermissionsByModule({});
        setError(backendMessage || t('CREATE_USER_ROLE.FAILED_TO_FETCH_PERMISSIONS'));
      } finally {
        setLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, [roleId]);


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
    navigate("/userRoles");
  };
  const handleSaveRole = (event) => {
    event.preventDefault();
  };

  if (nError) return <div>{t('CREATE_USER_ROLE.FAILED_TO_FETCH_PERMISSIONS')}</div>;

  const storeOptions = aStores.map((store) => ({
    value: String(store.StoreID),
    label: store.StoreName,
  }));

  const handleStoreChange = (event) => {
    setStoreId(event.target.value);
    setErrors(prev => ({ ...prev, StoreIdError: undefined }));
  };
  const validateRoleDataSubmit = () => {
    const newErrors = {};
    if (sStoreId === "0") {
      newErrors.StoreIdError = t('CREATE_USER_ROLE.STORE_ISREQUID');
    }
    if (!sRoleName) {
      newErrors.RoleNameError = t('CREATE_USER_ROLE.ROLE_ISREQUID');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length > 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!validateRoleDataSubmit()) {
      const selectedPermissions = Object.values(oPermissionsByModule)
        .flat()
        .filter(permission => permission.IsChecked)
        .map(permission => permission.ID || permission.PermissionId || permission.id);

      const roleData = {
        roleId: roleId ? Number(roleId) : 0,
        roleName: sRoleName,
        storeId: sStoreId,
        permissions: selectedPermissions,
      };

      try {
        const token = localStorage.getItem('token');
        await apiPost(CreateOrUpdateRole, roleData, token);
        handleSaveRole(event);
      } catch (err) {
        const msg = err?.response?.data?.message;
        showEmsg(msg || t('CREATE_USER_ROLE.FAILED_TO_SAVE_ROLE'), 'error');
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
            <p className="text-gray-500">
              {t('CREATE_USER_ROLE.ADD_USER_ROLE_DESCRIPTION')}
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
                  {t('CREATE_USER_ROLE.SELECT_STORE')}
                </label>
                {bStoresLoading ? (
                  <div className="text-gray-500">{t('COMMON.LOADING')}</div>
                ) : sStoresError ? (
                  <div className="text-red-500">{sStoresError}</div>
                ) : (
                  <SelectwithIcone
                    options={storeOptions}
                    value={sStoreId}
                    onChange={handleStoreChange}
                    placeholder={t('CREATE_USER_ROLE.SELECT_STORE')}
                    error={oErrors.StoreIdError}
                    Icon={Store}
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className=" flex flex-col sm:flex-row justify-center items-center w-full ">
                <label className="block font-semibold mr-[14px]">
                  {t('COMMON.ROLE')}
                </label>
                <TextwithIcone
                  type="text"
                  value={sRoleName}
                  onChange={(e) => { setRoleName(e.target.value); setErrors(prev => ({ ...prev, RoleNameError: undefined })); }}
                  placeholder={t('CREATE_USER_ROLE.ENTER_ROLE_NAME')}
                  error={oErrors.RoleNameError}
                  Icon={Shield}
                />
              </div>
            </div>
          </div>
          <hr className="border-gray-300 my-4 mb-6" />
          {loadingPermissions ? (
            <div className="text-center py-8">{t('COMMON.LOADING')}</div>
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
                        {t('CREATE_USER_ROLE.SELECT_ALL')}
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
              {t('COMMON.CANCEL')}
            </button>
            <button
              className="btn-primary"
              type="submit"
            >
              {t('CREATE_USER_ROLE.SAVE_ROLE')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserRole; 