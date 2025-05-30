import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import TextwithIcone from "../components/TextInputWithIcon";
import SelectwithIcone from "../components/SelectWithIcon";
import { Store, Shield, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
const AddUserRole = () => {
  const [sRoleName, setRoleName] = useState('');
  const [sStoreId, setStoreId] = useState('0');
  const [oPermissionsByModule, setPermissionsByModule] = useState({});
  const [nError, setError] = useState(null);
  const [oErrors, setErrors] = useState({});
  const [aStores, setStores] = useState([]);
  const { t } = useTranslation();
  // Placeholder data for stores (replace with API fetch later)
  useEffect(() => {
    setStores([
      { StoreID: '1', StoreName: 'Global Store' },
      { StoreID: '2', StoreName: 'Main Branch' },
      { StoreID: '3', StoreName: 'Downtown Store' },
    ]);
    // Placeholder permissions structure (replace with API fetch later)
    setPermissionsByModule({
      'Products': [
        { ID: 1, Name: 'View Products', Module: 'Products', IsChecked: false },
        { ID: 2, Name: 'Edit Products', Module: 'Products', IsChecked: false },
      ],
      'Orders': [
        { ID: 3, Name: 'View Orders', Module: 'Orders', IsChecked: false },
        { ID: 4, Name: 'Manage Orders', Module: 'Orders', IsChecked: false },
      ],
    });
  }, []);

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

  const handleStoreChange = (selectedOption) => {
    setStoreId(selectedOption.value);
    setErrors(prev => ({ ...prev, StoreIdError: undefined }));
  };

  // Simplified validation for UI example
  const validateRoleDataSubmit = () => {
    const newErrors = {};
    if (sStoreId === "0") {
      newErrors.StoreIdError = t(createuserrole.storeIsrequid);
    }
    if (!sRoleName) {
      newErrors.RoleNameError =t(createuserrole.roleIsrequid) ;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length > 0;
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
            <h1 className="text-2xl font-bold text-gray-900">{t('createuserrole.add_user_role')}</h1>
          </div>
          <p className="text-gray-500">{t('createuserrole.add_user_role_description')}</p>
        </div>

        <form onSubmit={handleSaveRole}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Store Name Field */}
            <div className="flex flex-col items-center justify-center">
              <div className=" flex flex-col sm:flex-row justify-center items-center w-full ">
                <label className="block font-semibold mr-[14px]">
                  {t('createuserrole:store')}
                </label>
                <SelectwithIcone
                  options={storeOptions}
                  value={storeOptions.find((option) => option.value === sStoreId)}
                  onChange={handleStoreChange}
                  placeholder={t('createuserrole:select_store')}
                  Error={oErrors.StoreIdError && sStoreId === "0"}
                  Icon={Store}
                />
              </div>
              <div className="w-full sm:w-1/2 flex justify-center sm:mr-[294px] mt-1 mb-1 ">
                {oErrors.StoreIdError && sStoreId === "0" && (
                  <p className="text-red-500 text-sm ">{oErrors.StoreIdError}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className=" flex flex-col sm:flex-row justify-center items-center w-full ">
                <label className="block font-semibold mr-[14px]">
                 {t('createuserrole:role')}
                </label>
                <TextwithIcone
                  type="text"
                  value={sRoleName}
                  onChange={(e) => { setRoleName(e.target.value); setErrors(prev => ({ ...prev, RoleNameError: undefined })); }}
                  placeholder={t('createuserrole:enter_role_name')}
                  error={oErrors.RoleNameError && !sRoleName}
                  Icon={Shield}
                />
              </div>
              <div className="w-full sm:w-1/2 flex justify-center sm:mr-[300px] mt-1 mb-1 ">
                {oErrors.RoleNameError && !sRoleName && (
                  <p className="text-red-500 text-sm ">{oErrors.RoleNameError}</p>
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-300 my-4 mb-6" />

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
              onClick={(e) => {
                if (!validateRoleDataSubmit()) {
                  handleSaveRole(e);
                }
              }}
              type="submit"
            >
              {t('createuserrole:save_role')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserRole; 