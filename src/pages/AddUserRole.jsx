import { useState, useEffect, useCallback } from "react";
import Loader from "../components/Loader";
import { useNavigate, useParams,useLocation } from "react-router-dom";
import TextwithIcone from "../components/TextInputWithIcon";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiGet, apiPost } from "../utils/ApiUtils";
import {
  GET_ALL_PERMISSIONS,
  CREATE_OR_UPDATE_ROLE,
  GET_ALL_PERMISSIONS_BY_ROLE_ID,
} from "../contants/apiRoutes";
import { showEmsg } from "../utils/ShowEmsg";
import { useTitle } from "../context/TitleContext";
import { STATUS,STATUS_DROPDOWN_OPTIONS } from "../contants/constants";
import BackButton from "../components/BackButton";
import { ToastContainer } from "react-toastify";
import SelectWithIcon from "../components/SelectWithIcon";
import { Tag } from "lucide-react";
const AddUserRole = () => {
  const [sRoleName, setRoleName] = useState("");
  const [oPermissionsByModule, setPermissionsByModule] = useState({});
  const [nError, setError] = useState(null);
  const [oErrors, setErrors] = useState({});
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [bSubmitting, setSubmitting] = useState(false);
  const [bIsActive, setIsActive] = useState(true);
  const { t } = useTranslation();
  const location = useLocation();
  const { roleId } = useParams();
  const { roleName, status } = location.state || {};
  const { setTitle, setBackButton } = useTitle();
  const navigate = useNavigate();

  useEffect(() => {
    setTitle(
      roleId
        ? t("CREATE_USER_ROLE.EDIT_USER_ROLE")
        : t("CREATE_USER_ROLE.ADD_USER_ROLE")
    );
    setBackButton(<BackButton onClick={() => window.history.back()} />);
    return () => {
      setBackButton(null);
      setTitle("");
    };
  }, [setTitle, setBackButton, t, roleId]);
  useEffect(() => {
    if (roleName) {
      setRoleName(roleName);
    }
    if (status !== undefined) {
      setIsActive(status === true); 
    }
  }, [roleName, status]);
  

  const fetchPermissions = useCallback(async () => {
    setLoadingPermissions(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      let permissionsArr = [];
      if (roleId) {
        const rolePermRes = await apiGet(
          `${GET_ALL_PERMISSIONS_BY_ROLE_ID}/${roleId}`,
          {},
          token
        );
        const roleData = rolePermRes?.data;
        if (roleData?.status === STATUS.SUCCESS.toUpperCase()) {
          if (Array.isArray(roleData.data?.result)) {
            permissionsArr = roleData.data.result;
          } else if (
            roleData.data?.data?.rows &&
            Array.isArray(roleData.data.data.rows)
          ) {
            permissionsArr = roleData.data.data.rows;
          } else if (roleData.data?.rows && Array.isArray(roleData.data.rows)) {
            permissionsArr = roleData.data.rows;
          } else if (Array.isArray(roleData.data)) {
            permissionsArr = roleData.data;
          }
        
          else if (Array.isArray(roleData.data?.permissions)) {
            permissionsArr = roleData.data.permissions;
            setRoleName(roleData.data.roleName || "");
            setIsActive(roleData.data.isActive !== undefined ? roleData.data.isActive : true);
          }
        }
      } else {
        const res = await apiGet(GET_ALL_PERMISSIONS, {}, token);
        const resData = res?.data;
        
        if (resData?.status === STATUS.SUCCESS.toUpperCase()) {
          if (Array.isArray(resData.data)) {
            permissionsArr = resData.data;
          } else if (Array.isArray(resData.data?.result)) {
            permissionsArr = resData.data.result;
          } else if (
            resData.data?.data?.rows &&
            Array.isArray(resData.data.data.rows)
          ) {
            permissionsArr = resData.data.data.rows;
          } else if (resData.data?.rows && Array.isArray(resData.data.rows)) {
            permissionsArr = resData.data.rows;
          } else if (Array.isArray(resData.result)) {
            permissionsArr = resData.result;
          }
        }
      }

      if (permissionsArr.length > 0) {
        const categorizedPermissions = {};
        permissionsArr.forEach((permission) => {
          const module = permission.Module || permission.PermissionModule||permission.module;
          const id = permission.PermissionID|| permission.ID||permission.permissionId;
          const name = permission.PermissionName || permission.Name||permission.permissionName;
          const isChecked = permission.IsChecked || false;
          
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
      } else {
        setPermissionsByModule({});
        setError(t("CREATE_USER_ROLE.NO_PERMISSIONS_FOUND"));
      }
    } catch (err) {
      const backendMessage = err?.response?.data?.message;
      setPermissionsByModule({});
      setError(backendMessage);
    } finally {
      setLoadingPermissions(false);
    }
  }, [roleId]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleCheckboxChange = useCallback((moduleName, permissionId) => {
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
  }, []);

  const handleSelectAllChange = useCallback((moduleName, isChecked) => {
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
  }, []);

  const handleClose = useCallback(() => {
    navigate("/userRoles");
  }, [navigate]);
  const validateRoleDataSubmit = useCallback(() => {
    const newErrors = {};
    if (!sRoleName) {
      newErrors.RoleNameError = t("CREATE_USER_ROLE.ROLE_ISREQUID");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length > 0;
  }, [sRoleName, t]);

  const handleStatusChange = (e) => {
    setIsActive(e.target.value === "true");
  };

  const handleSave = useCallback(
    async (event) => {
      event.preventDefault();
      if (!validateRoleDataSubmit()) {
        setSubmitting(true);
        const permissions = Object.values(oPermissionsByModule)
          .flat()
          .filter(permission => permission.IsChecked)
          .map((permission) => ({
          
            permissionId: permission.ID, 
            isChecked: true
          }));

        const userId = localStorage.getItem("userId");
        const tenantID = localStorage.getItem("tenantID");
      
        const roleData = {
          RoleName: sRoleName,
          IsActive: bIsActive,
          Permissions: permissions
        };
  
        // Add additional fields based on create vs update
        if (roleId) {
          // For update - include RoleID and UpdatedBy
          roleData.RoleID = roleId;
          roleData.UpdatedBy = userId;
        } else {
          // For create - include CreatedBy and TenantID
          roleData.CreatedBy = userId;
          roleData.TenantID = tenantID;
        }
  
        try {
          const token = localStorage.getItem("token");
          const res = await apiPost(CREATE_OR_UPDATE_ROLE, roleData, token);
          const resData = res?.data;
          if (resData?.status === STATUS.SUCCESS.toUpperCase()) {
            showEmsg(
              resData.message|| t("CREATE_USER_ROLE.SAVE_SUCCESS"),
              STATUS.SUCCESS,
              3000,
              () => {
                navigate("/userRoles");
              }
            );
          } else {
            showEmsg(resData?.message || t("COMMON.API_ERROR"), STATUS.ERROR);
          }
        } catch (err) {
          showEmsg(
            err.response?.data?.message || t("COMMON.API_ERROR"), 
            STATUS.ERROR
          );
        } finally {
          setSubmitting(false);
        }
      }
    },
    [
      validateRoleDataSubmit,
      oPermissionsByModule,
      roleId,
      sRoleName,
      bIsActive,
      t,
      navigate
    ]
  );

  if (nError) {
    return <div>{t("CREATE_USER_ROLE.FAILED_TO_FETCH_PERMISSIONS")}</div>;
  }

  const loaderOverlay = bSubmitting ? (
    <div className="global-loader-overlay">
      <Loader />
    </div>
  ) : null;
  return (
    <div className={`max-w-8xl mx-auto`}>
      <ToastContainer />
      {loaderOverlay}
      <div>
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <p className="text-gray-500 truncate">
              {t("CREATE_USER_ROLE.ADD_USER_ROLE_DESCRIPTION")}
            </p>
          </div>
        </div>
        <form onSubmit={handleSave}>
          <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
            <div className="w-full md:w-1/2">
              <TextwithIcone
                label={t("COMMON.ROLE")}
                type="text"
                value={sRoleName}
                onChange={(e) => {
                  setRoleName(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    RoleNameError: undefined,
                  }));
                }}
                placeholder={t("CREATE_USER_ROLE.ENTER_ROLE_NAME")}
                error={oErrors.RoleNameError}
                Icon={Shield}
              />
            </div>
            
            <div className="w-full md:w-1/2">
              <SelectWithIcon
                label={t("PRODUCT_SETUP.CREATE_BRAND.STATUS_LABEL")}
                id="IsActive"
                name="IsActive"
                value={bIsActive.toString()}
                onChange={handleStatusChange}
                options={STATUS_DROPDOWN_OPTIONS.map(opt => ({
                  value: opt.value,
                  label: t(opt.labelKey),
                }))}
                Icon={Tag}
                error={oErrors.IsActive}
              />
            </div>
          </div>
          <hr className="border-gray-300 my-4 mb-6" />
          {loadingPermissions ? (
            <div className="text-center py-8 truncate">
              {t("COMMON.LOADING")}
            </div>
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
                      <h2 className="text-lg font-bold truncate">
                        {moduleName}
                      </h2>
                      <label className="text-sm truncate">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={(e) =>
                            handleSelectAllChange(moduleName, e.target.checked)
                          }
                          className="mr-2 form-checkbox h-[12px] w-[12px] text-blue-600"
                        />
                        {t("CREATE_USER_ROLE.SELECT_ALL")}
                      </label>
                    </div>
                    <hr className="border-gray-300 my-4 mt-2 mb-4" />
                    {oPermissionsByModule[moduleName].map((permission) => (
                      <div
                        key={permission.ID}
                        className="flex items-center mb-2"
                      >
                        <label className="truncate">
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
              className="bg-gray-200 px-4 py-2 rounded shadow w-full sm:w-auto truncate"
              onClick={handleClose}
              type="button"
            >
              {t("COMMON.CANCEL")}
            </button>
            <button className="btn-primary truncate" type="submit">
              {roleId ? t("COMMON.UPDATE") : t("CREATE_USER_ROLE.SAVE_ROLE")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserRole;
