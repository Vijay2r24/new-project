import { useState, useEffect, useCallback } from "react";
import Loader from "../components/Loader";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import TextwithIcone from "../components/TextInputWithIcon";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTitle } from "../context/TitleContext";
import { COLORS, STATUS_DROPDOWN_OPTIONS } from "../contants/constants";
import BackButton from "../components/BackButton";
import { ToastContainer } from "react-toastify";
import SelectWithIcon from "../components/SelectWithIcon";
import { Tag } from "lucide-react";
import FloatingFooter from "../components/FloatingFooter";

const AddUserRole = () => {
  const [sRoleName, setRoleName] = useState("");
  const [oPermissionsByModule, setPermissionsByModule] = useState({});
  const [nError, setError] = useState(null);
  const [oErrors, setErrors] = useState({});
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [bSubmitting, setSubmitting] = useState(false);
  const [bIsActive, setIsActive] = useState(true);
  const { t } = useTranslation();
  const location = useLocation();
  const { roleId } = useParams();
  const { roleName, status } = location.state || {};
  const { setTitle, setBackButton } = useTitle();
  const navigate = useNavigate();

  // Dummy permissions data
  const dummyPermissions = [
    // User Management Permissions
    {
      Module: "User Management",
      PermissionID: "UM001",
      PermissionName: "View Users",
      IsChecked: true
    },
    {
      Module: "User Management",
      PermissionID: "UM002",
      PermissionName: "Create User",
      IsChecked: false
    },
    {
      Module: "User Management",
      PermissionID: "UM003",
      PermissionName: "Edit User",
      IsChecked: false
    },
    {
      Module: "User Management",
      PermissionID: "UM004",
      PermissionName: "Delete User",
      IsChecked: false
    },
    {
      Module: "User Management",
      PermissionID: "UM005",
      PermissionName: "Change User Status",
      IsChecked: false
    },
    {
      Module: "User Management",
      PermissionID: "UM006",
      PermissionName: "Assign Roles",
      IsChecked: false
    },
    {
      Module: "User Management",
      PermissionID: "UM007",
      PermissionName: "Export Users",
      IsChecked: false
    },
    {
      Module: "User Management",
      PermissionID: "UM008",
      PermissionName: "Import Users",
      IsChecked: false
    },

    // Product Management Permissions
    {
      Module: "Product Management",
      PermissionID: "PM001",
      PermissionName: "View Products",
      IsChecked: true
    },
    {
      Module: "Product Management",
      PermissionID: "PM002",
      PermissionName: "Create Product",
      IsChecked: false
    },
    {
      Module: "Product Management",
      PermissionID: "PM003",
      PermissionName: "Edit Product",
      IsChecked: false
    },
    {
      Module: "Product Management",
      PermissionID: "PM004",
      PermissionName: "Delete Product",
      IsChecked: false
    },
    {
      Module: "Product Management",
      PermissionID: "PM005",
      PermissionName: "Manage Inventory",
      IsChecked: false
    },
    {
      Module: "Product Management",
      PermissionID: "PM006",
      PermissionName: "Manage Categories",
      IsChecked: false
    },
    {
      Module: "Product Management",
      PermissionID: "PM007",
      PermissionName: "Manage Brands",
      IsChecked: false
    },
    {
      Module: "Product Management",
      PermissionID: "PM008",
      PermissionName: "Manage Pricing",
      IsChecked: false
    },
    {
      Module: "Product Management",
      PermissionID: "PM009",
      PermissionName: "Export Products",
      IsChecked: false
    },
    {
      Module: "Product Management",
      PermissionID: "PM010",
      PermissionName: "Import Products",
      IsChecked: false
    },

    // Order Management Permissions
    {
      Module: "Order Management",
      PermissionID: "OM001",
      PermissionName: "View Orders",
      IsChecked: true
    },
    {
      Module: "Order Management",
      PermissionID: "OM002",
      PermissionName: "Create Order",
      IsChecked: false
    },
    {
      Module: "Order Management",
      PermissionID: "OM003",
      PermissionName: "Edit Order",
      IsChecked: false
    },
    {
      Module: "Order Management",
      PermissionID: "OM004",
      PermissionName: "Cancel Order",
      IsChecked: false
    },
    {
      Module: "Order Management",
      PermissionID: "OM005",
      PermissionName: "Process Order",
      IsChecked: false
    },
    {
      Module: "Order Management",
      PermissionID: "OM006",
      PermissionName: "View Order History",
      IsChecked: false
    },
    {
      Module: "Order Management",
      PermissionID: "OM007",
      PermissionName: "Manage Shipping",
      IsChecked: false
    },
    {
      Module: "Order Management",
      PermissionID: "OM008",
      PermissionName: "Manage Returns",
      IsChecked: false
    },
    {
      Module: "Order Management",
      PermissionID: "OM009",
      PermissionName: "Generate Invoices",
      IsChecked: false
    },
    {
      Module: "Order Management",
      PermissionID: "OM010",
      PermissionName: "Export Orders",
      IsChecked: false
    },

    // Employee Management Permissions
    {
      Module: "Employee Management",
      PermissionID: "EM001",
      PermissionName: "View Employees",
      IsChecked: true
    },
    {
      Module: "Employee Management",
      PermissionID: "EM002",
      PermissionName: "Create Employee",
      IsChecked: false
    },
    {
      Module: "Employee Management",
      PermissionID: "EM003",
      PermissionName: "Edit Employee",
      IsChecked: false
    },
    {
      Module: "Employee Management",
      PermissionID: "EM004",
      PermissionName: "Delete Employee",
      IsChecked: false
    },
    {
      Module: "Employee Management",
      PermissionID: "EM005",
      PermissionName: "Manage Employee Status",
      IsChecked: false
    },
    {
      Module: "Employee Management",
      PermissionID: "EM006",
      PermissionName: "View Employee Details",
      IsChecked: false
    },
    {
      Module: "Employee Management",
      PermissionID: "EM007",
      PermissionName: "Assign Departments",
      IsChecked: false
    },
    {
      Module: "Employee Management",
      PermissionID: "EM008",
      PermissionName: "Manage Shifts",
      IsChecked: false
    },
    {
      Module: "Employee Management",
      PermissionID: "EM009",
      PermissionName: "View Attendance",
      IsChecked: false
    },
    {
      Module: "Employee Management",
      PermissionID: "EM010",
      PermissionName: "Manage Leaves",
      IsChecked: false
    },
    {
      Module: "Employee Management",
      PermissionID: "EM011",
      PermissionName: "Export Employee Data",
      IsChecked: false
    },

    // Analytics & Reports Permissions
    {
      Module: "Analytics & Reports",
      PermissionID: "AR001",
      PermissionName: "View Dashboard",
      IsChecked: true
    },
    {
      Module: "Analytics & Reports",
      PermissionID: "AR002",
      PermissionName: "Sales Reports",
      IsChecked: false
    },
    {
      Module: "Analytics & Reports",
      PermissionID: "AR003",
      PermissionName: "Inventory Reports",
      IsChecked: false
    },
    {
      Module: "Analytics & Reports",
      PermissionID: "AR004",
      PermissionName: "Employee Reports",
      IsChecked: false
    },
    {
      Module: "Analytics & Reports",
      PermissionID: "AR005",
      PermissionName: "Customer Reports",
      IsChecked: false
    },
    {
      Module: "Analytics & Reports",
      PermissionID: "AR006",
      PermissionName: "Export Reports",
      IsChecked: false
    },

    // System Settings Permissions
    {
      Module: "System Settings",
      PermissionID: "SS001",
      PermissionName: "Manage Roles",
      IsChecked: false
    },
    {
      Module: "System Settings",
      PermissionID: "SS002",
      PermissionName: "Manage Permissions",
      IsChecked: false
    },
    {
      Module: "System Settings",
      PermissionID: "SS003",
      PermissionName: "System Configuration",
      IsChecked: false
    },
    {
      Module: "System Settings",
      PermissionID: "SS004",
      PermissionName: "Backup & Restore",
      IsChecked: false
    },
    {
      Module: "System Settings",
      PermissionID: "SS005",
      PermissionName: "Audit Logs",
      IsChecked: false
    },

    // Customer Management Permissions
    {
      Module: "Customer Management",
      PermissionID: "CM001",
      PermissionName: "View Customers",
      IsChecked: true
    },
    {
      Module: "Customer Management",
      PermissionID: "CM002",
      PermissionName: "Create Customer",
      IsChecked: false
    },
    {
      Module: "Customer Management",
      PermissionID: "CM003",
      PermissionName: "Edit Customer",
      IsChecked: false
    },
    {
      Module: "Customer Management",
      PermissionID: "CM004",
      PermissionName: "Delete Customer",
      IsChecked: false
    },
    {
      Module: "Customer Management",
      PermissionID: "CM005",
      PermissionName: "Customer Support",
      IsChecked: false
    },
    {
      Module: "Customer Management",
      PermissionID: "CM006",
      PermissionName: "Loyalty Programs",
      IsChecked: false
    },

    // Store Management Permissions
    {
      Module: "Store Management",
      PermissionID: "SM001",
      PermissionName: "View Stores",
      IsChecked: true
    },
    {
      Module: "Store Management",
      PermissionID: "SM002",
      PermissionName: "Create Store",
      IsChecked: false
    },
    {
      Module: "Store Management",
      PermissionID: "SM003",
      PermissionName: "Edit Store",
      IsChecked: false
    },
    {
      Module: "Store Management",
      PermissionID: "SM004",
      PermissionName: "Delete Store",
      IsChecked: false
    },
    {
      Module: "Store Management",
      PermissionID: "SM005",
      PermissionName: "Store Inventory",
      IsChecked: false
    },
    {
      Module: "Store Management",
      PermissionID: "SM006",
      PermissionName: "Store Reports",
      IsChecked: false
    }
  ];

  // Check if the current role is an admin role (case-insensitive)
  const isAdminRole = useCallback(() => {
    const adminRoleNames = ["admin", "administrator"];
    return adminRoleNames.includes(sRoleName?.toLowerCase().trim());
  }, [sRoleName]);

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

  useEffect(() => {
    // Load permissions from dummy data
    setLoadingPermissions(true);
    try {
      // If editing a role, check if it's an admin role
      if (roleId && roleName) {
        const isAdmin = adminRoleNames.includes(roleName.toLowerCase().trim());
        if (isAdmin) {
          // For admin role, set all permissions to checked
          const adminPermissions = dummyPermissions.map(permission => ({
            ...permission,
            IsChecked: true
          }));
          const categorizedPermissions = {};
          adminPermissions.forEach((permission) => {
            const module = permission.Module;
            if (!categorizedPermissions[module]) {
              categorizedPermissions[module] = [];
            }
            categorizedPermissions[module].push({
              ID: permission.PermissionID,
              Name: permission.PermissionName,
              IsChecked: permission.IsChecked,
            });
          });
          setPermissionsByModule(categorizedPermissions);
        } else {
          // For non-admin roles, use default dummy data
          categorizePermissions();
        }
      } else {
        // For new role creation, use default dummy data
        categorizePermissions();
      }
    } catch (err) {
      setPermissionsByModule({});
      setError("Failed to load permissions");
    } finally {
      setLoadingPermissions(false);
    }
  }, [roleId, roleName]);

  // Helper function to categorize permissions
  const categorizePermissions = () => {
    const categorizedPermissions = {};
    dummyPermissions.forEach((permission) => {
      const module = permission.Module;
      if (!categorizedPermissions[module]) {
        categorizedPermissions[module] = [];
      }
      categorizedPermissions[module].push({
        ID: permission.PermissionID,
        Name: permission.PermissionName,
        IsChecked: permission.IsChecked,
      });
    });
    setPermissionsByModule(categorizedPermissions);
  };

  const handleCheckboxChange = useCallback(
    (moduleName, permissionId) => {
      // Don't allow permission changes for admin roles
      if (isAdminRole()) {
        return;
      }

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
    },
    [isAdminRole]
  );

  const handleSelectAllChange = useCallback(
    (moduleName, isChecked) => {
      // Don't allow permission changes for admin roles
      if (isAdminRole()) {
        return;
      }

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
    },
    [isAdminRole]
  );

  const handleClose = useCallback(() => {
    navigate("/roles");
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
    // Don't allow status changes for admin roles
    if (isAdminRole()) {
      return;
    }
    setIsActive(e.target.value === "true");
  };

  const handleRoleNameChange = (e) => {
    // Don't allow role name changes for admin roles during edit
    if (roleId && isAdminRole()) {
      return;
    }
    setRoleName(e.target.value);
    setErrors((prev) => ({
      ...prev,
      RoleNameError: undefined,
    }));
  };

  const handleSave = useCallback(
    async (event) => {
      event.preventDefault();
      if (!validateRoleDataSubmit()) {
        setSubmitting(true);

        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Show success message
          alert(roleId 
            ? "Role updated successfully!" 
            : "Role created successfully!");
          
          // Navigate back to roles list
          navigate("/roles");
        } catch (err) {
          alert("Failed to save role. Please try again.");
        } finally {
          setSubmitting(false);
        }
      }
    },
    [
      validateRoleDataSubmit,
      roleId,
      navigate,
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

  const isEditingAdmin = roleId && isAdminRole();

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer />
      {loaderOverlay}

      {/* Main Content Area */}
      <div className={`max-w-8xl mx-auto w-full flex-grow pb-24 px-4 lg:px-8`}>
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
                  onChange={handleRoleNameChange}
                  placeholder={t("CREATE_USER_ROLE.ENTER_ROLE_NAME")}
                  error={oErrors.RoleNameError}
                  Icon={Shield}
                  disabled={isEditingAdmin}
                />
              </div>

              <div className="w-full md:w-1/2">
                <SelectWithIcon
                  label={t("PRODUCT_SETUP.CREATE_BRAND.STATUS_LABEL")}
                  id="IsActive"
                  name="IsActive"
                  value={bIsActive.toString()}
                  onChange={handleStatusChange}
                  options={STATUS_DROPDOWN_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: t(opt.labelKey),
                  }))}
                  Icon={Tag}
                  error={oErrors.IsActive}
                  disabled={isEditingAdmin}
                />
              </div>
            </div>
            <hr className="border-gray-300 my-4 mb-6" />
            
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Role Permissions
              </h2>
              <p className="text-gray-600 text-sm">
                {isEditingAdmin ? 
                  "Admin role has all permissions enabled and cannot be modified." : 
                  "Select the permissions you want to assign to this role."}
              </p>
            </div>

            {loadingPermissions ? (
              <div className="text-center py-8">
                <div className="flex justify-center items-center">
                  <Loader className="h-8 w-8" />
                </div>
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
                      className={`border p-4 rounded-lg shadow ${
                        isEditingAdmin ? "bg-gray-100" : COLORS.GRAY_PRIMARY
                      }`}
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
                              handleSelectAllChange(
                                moduleName,
                                e.target.checked
                              )
                            }
                            className={`mr-2 form-checkbox h-[12px] w-[12px] ${
                              isEditingAdmin
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-blue-600"
                            }`}
                            disabled={isEditingAdmin}
                          />
                          Select All
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
                              className={`mr-2 form-checkbox h-[12px] w-[12px] ${
                                isEditingAdmin
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-blue-600"
                              }`}
                              disabled={isEditingAdmin}
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
          </form>
        </div>
      </div>

      <FloatingFooter
        onCancel={handleClose}
        onSubmit={handleSave}
        isSubmitting={bSubmitting}
        isEditMode={!!roleId}
      />
    </div>
  );
};

export default AddUserRole;