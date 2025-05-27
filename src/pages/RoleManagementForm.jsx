import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
const RoleManagementForm = () => {
  const [sRoleName, setRoleName] = useState('');
  const [sStoreId, setStoreId] = useState('0');
  const [oPermissionsByModule, setPermissionsByModule] = useState({});
  const [nError, setError] = useState(null); // Keep for potential future use
  const [oErrors, setErrors] = useState({});
  const [aStores, setStores] = useState([]);

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
    navigate("/RoleUser"); // Navigate to the user roles list page (adjust if needed)
  };

  // Placeholder save handler (replace with actual API call later)
  const handleSaveRole = (event) => {
      event.preventDefault();
      console.log("Save Role clicked");
  };

  if (nError) return <div>{nError}</div>; // Keep nError display placeholder

  const storeOptions = aStores.map((store) => ({
    value: store.StoreID,
    label: store.StoreName,
  }));

  const handleStoreChange = (selectedOption) => {
    setStoreId(selectedOption.value);
    // Optional: Update errors state based on new storeId selection
     setErrors(prev => ({ ...prev, StoreIdError: undefined }));
  };

  // Simplified validation for UI example
   const validateRoleDataSubmit = () => {
      const newErrors = {};
      if (sStoreId === "0") {
        newErrors.StoreIdError = "Store Name is required.";
      }
      if (!sRoleName) {
        newErrors.RoleNameError = "Role Name is required.";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length > 0;
    };

    // Keep the JSX structure from AddRoleForm
  return (
    <div
    className={`main-container`}
  >
      <div className=" p-6 rounded-lg ">
        <h2 className="heading">Add/Edit User Role</h2> {/* Updated heading */}
        <hr className="border-gray-300 my-4 mb-4" />

        <form onSubmit={handleSaveRole}>
        <div className="mb-4 flex flex-col items-center justify-center">
          <div className=" flex flex-col sm:flex-row justify-center items-center w-full ">
            <label className="block font-semibold mr-[14px]">
              Store Name <span className="text-red-500">*</span>
            </label>
            <Select
              value={storeOptions.find((option) => option.value === sStoreId)}
              onChange={handleStoreChange}
              options={storeOptions}
              className={`w-full sm:w-1/2 border rounded-md ${
                oErrors.StoreIdError && sStoreId === "0"
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
           <div className="w-full sm:w-1/2 flex justify-center sm:mr-[294px] mt-1 mb-1 ">
            {oErrors.StoreIdError && sStoreId === "0" && (
              <p className="text-red-500 text-sm ">{oErrors.StoreIdError}</p>
            )}
          </div>
        </div>
        <div className="mb-4 flex flex-col items-center justify-center">
          <div className=" flex flex-col sm:flex-row justify-center items-center w-full ">
            <label className="block font-semibold mr-[14px]">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={sRoleName}
              onChange={(e) => {setRoleName(e.target.value); setErrors(prev => ({ ...prev, RoleNameError: undefined }));}}
              className={`border ${
                oErrors.RoleNameError && !sRoleName ? "border-red-500" : "border-gray-300"
              } p-2 w-full sm:w-1/2 rounded-md`}
              placeholder="Enter Role Name"
            />
          </div>
          <div className="w-full sm:w-1/2 flex justify-center sm:mr-[300px] mt-1 mb-1 ">
            {oErrors.RoleNameError && !sRoleName && (
              <p className="text-red-500 text-sm ">{oErrors.RoleNameError}</p>
            )}
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
                    Select All
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
            Close
          </button>
          <button
            className="bg-[#003375] text-white px-4 py-2 rounded shadow w-full sm:w-auto"
             onClick={(e) => {
              if (!validateRoleDataSubmit()) {
                handleSaveRole(e);
              }
            }}
            type="submit"
          >
            Save Role
          </button>
        </div>
         </form>
      </div>
    </div>
  );
};

export default RoleManagementForm; 