import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import { TitleProvider } from "./context/TitleContext";
import { AllDataProvider } from "./context/AllDataContext";
import LocationDataProvider from "./context/LocationDataProvider";
import ProtectedRoute from './components/ProtectedRoute';
import NotAuthorized from './pages/NotAuthorized';
import { getPermissionCode } from './utils/permissionUtils';
import Loader from './components/Loader';

// 🔹 Lazy-loaded pages
const Layout = lazy(() => import("./layout/Layout"));
const Browse = lazy(() => import("./pages/browse/Browse"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Users = lazy(() => import("./pages/Users"));
const Orders = lazy(() => import("./pages/orders/OrderList"));
const AddUser = lazy(() => import("./pages/AddUser"));
const ProductList = lazy(() => import("./pages/products/ProductList"));
const Addproduct = lazy(() => import("./pages/products/AddProductForm"));
const ProfileDetails = lazy(() => import("./pages/ProfileDetails"));
const Stores = lazy(() => import("./pages/Stores"));
const AddStore = lazy(() => import("./pages/AddStore"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Login = lazy(() => import("./pages/Login"));
const AddUserRole = lazy(() => import("./pages/AddUserRole"));
const Banners = lazy(() => import("./pages/Banners"));
const Bannerscreate = lazy(() => import("./pages/BannersCreate"));
const UserRoles = lazy(() => import("../src/pages/UserRolesList"));
const OrderDetailPage = lazy(() => import("./pages/orders/OrderView"));
const CreateBrand = lazy(() => import("./pages/browse/brands/CreateBrand"));
const CreateCategory = lazy(() => import("./pages/browse/categories/CreateCategory"));
const CreateAttributeType = lazy(() => import("./pages/browse/attributeTypes/CreateAttributeType"));
const CreateColor = lazy(() => import("./pages/browse/colors/CreateColor"));
const CreateAttribute = lazy(() => import("./pages/browse/attributes/CreateAttribute"));
const CreateProductGroup = lazy(() => import("./pages/browse/productGroups/CreateProductGroup"));
const ActiveBanners = lazy(() => import("./pages/ActiveBannersWithSequence"));

// 🔹 Permission codes
const dashboardPermission = getPermissionCode('Dashboard Management', 'View Dashboard');
const ordersPermission = getPermissionCode('Order Management', 'View Orders');
const orderDetailPermission = getPermissionCode('Order Management', 'View Orders');
const storesPermission = getPermissionCode('Store Management', 'View Store');
const addStorePermission = getPermissionCode('Store Management', 'Add Store');
const editStorePermission = getPermissionCode('Store Management', 'Update Store');
const usersPermission = getPermissionCode('User Management', 'View User');
const addUserPermission = getPermissionCode('User Management', 'Add User');
const editUserPermission = getPermissionCode('User Management', 'Update user');
const userRolesPermission = getPermissionCode('Role Management', 'View Role');
const addUserRolePermission = getPermissionCode('Role Management', 'Add Role');
const editUserRolePermission = getPermissionCode('Role Management', 'Update Role');
const bannersPermission = getPermissionCode('Content Management', 'View Banners');
const bannersCreatePermission = getPermissionCode('Content Management', 'Create Banner');
const bannersEditPermission = getPermissionCode('Content Management', 'Update Banner');
const notificationsPermission = getPermissionCode('Content Management', 'Send Push Notification');
const productsPermission = getPermissionCode('Product Management', 'View Products');
const addProductPermission = getPermissionCode('Product Management', 'Create Product');
const editProductPermission = getPermissionCode('Product Management', 'Update Product');
const viewBrandPermission = getPermissionCode('Product Management', 'View Brands');
const updateBrandPermission = getPermissionCode('Product Management', 'Update Brand');
const viewCategoryPermission = getPermissionCode('Product Management', 'View Categories');
const updateCategoryPermission = getPermissionCode('Product Management', 'Update Category');
const viewAttributeTypePermission = getPermissionCode('Product Management', 'View Attribute Types');
const updateAttributeTypePermission = getPermissionCode('Product Management', 'Update Attribute Type');
const viewColorPermission = getPermissionCode('Product Management', 'View Colours');
const updateColorPermission = getPermissionCode('Product Management', 'Update Colour');
const viewAttributePermission = getPermissionCode('Product Management', 'View Attributes');
const updateAttributePermission = getPermissionCode('Product Management', 'Update Attribute');
const viewProductGroupPermission = getPermissionCode('Product Management', 'View Product Groups');
const updateProductGroupPermission = getPermissionCode('Product Management', 'Update Product Group');

const App = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <AllDataProvider>
      <TitleProvider>
        <LocationDataProvider>
          {loading && (
            <div className="global-loader-overlay">
              <Loader />
            </div>
          )}
          <Suspense fallback={<div className="global-loader-overlay"><Loader /></div>}>
            <Routes>
              <Route path="/" element={<Login />} />

              {/* Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute permissionCode={dashboardPermission}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Browse/Product Setup */}
              <Route
                path="/browse"
                element={
                  <ProtectedRoute permissionCode={productsPermission}>
                    <Browse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activeBanners"
                element={
                  <ProtectedRoute permissionCode={productsPermission}>
                    <ActiveBanners />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/browse/editbrand/:id"
                element={
                  <ProtectedRoute permissionCode={updateBrandPermission}>
                    <CreateBrand />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/browse/editcatagiry/:id"
                element={
                  <ProtectedRoute permissionCode={updateCategoryPermission}>
                    <CreateCategory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/browse/editattributetype/:id"
                element={
                  <ProtectedRoute permissionCode={updateAttributeTypePermission}>
                    <CreateAttributeType />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/browse/editcolor/:id"
                element={
                  <ProtectedRoute permissionCode={updateColorPermission}>
                    <CreateColor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/browse/editattribute/:id"
                element={
                  <ProtectedRoute permissionCode={updateAttributePermission}>
                    <CreateAttribute />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/browse/editgroup/:id"
                element={
                  <ProtectedRoute permissionCode={updateProductGroupPermission}>
                    <CreateProductGroup />
                  </ProtectedRoute>
                }
              />

              {/* Orders */}
              <Route
                path="/orders"
                element={
                  <ProtectedRoute permissionCode={ordersPermission}>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:orderId"
                element={
                  <ProtectedRoute permissionCode={orderDetailPermission}>
                    <OrderDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* User Roles */}
              <Route
                path="/userRoles"
                element={
                  <ProtectedRoute permissionCode={userRolesPermission}>
                    <UserRoles />
                  </ProtectedRoute>
                }
              />

              {/* Products */}
              <Route
                path="/productList"
                element={
                  <ProtectedRoute permissionCode={productsPermission}>
                    <ProductList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Addproduct"
                element={
                  <ProtectedRoute permissionCode={addProductPermission}>
                    <Addproduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-product/:productId?"
                element={
                  <ProtectedRoute permissionCode={editProductPermission}>
                    <Addproduct />
                  </ProtectedRoute>
                }
              />

              {/* Banners */}
              <Route
                path="/banners-create"
                element={
                  <ProtectedRoute permissionCode={bannersCreatePermission}>
                    <Bannerscreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/banners-edit/:bannerId?"
                element={
                  <ProtectedRoute permissionCode={bannersEditPermission}>
                    <Bannerscreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/banners"
                element={
                  <ProtectedRoute permissionCode={bannersPermission}>
                    <Banners />
                  </ProtectedRoute>
                }
              />

              {/* Profile */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileDetails />
                  </ProtectedRoute>
                }
              />

              {/* User Role Management */}
              <Route
                path="/addUserRole"
                element={
                  <ProtectedRoute permissionCode={addUserRolePermission}>
                    <AddUserRole />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-UserRole/:roleId"
                element={
                  <ProtectedRoute permissionCode={editUserRolePermission}>
                    <AddUserRole />
                  </ProtectedRoute>
                }
              />

              {/* Stores */}
              <Route
                path="/stores"
                element={
                  <ProtectedRoute permissionCode={storesPermission}>
                    <Stores />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-store"
                element={
                  <ProtectedRoute permissionCode={addStorePermission}>
                    <AddStore />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editStore/:id"
                element={
                  <ProtectedRoute permissionCode={editStorePermission}>
                    <AddStore />
                  </ProtectedRoute>
                }
              />

              {/* Users */}
              <Route
                path="/add-user"
                element={
                  <ProtectedRoute permissionCode={addUserPermission}>
                    <AddUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editUser/:id"
                element={
                  <ProtectedRoute permissionCode={editUserPermission}>
                    <AddUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute permissionCode={usersPermission}>
                    <Users />
                  </ProtectedRoute>
                }
              />

              {/* Notifications */}
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute permissionCode={notificationsPermission}>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              {/* Not Authorized */}
              <Route path="/not-authorized" element={<NotAuthorized />} />
            </Routes>
          </Suspense>
        </LocationDataProvider>
      </TitleProvider>
    </AllDataProvider>
  );
};

export default App;
