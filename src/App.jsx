import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "./layout/Layout";
import Browse from "./pages/browse/Browse";
import Dashboard from "./pages/dashboard/Dashboard";
import Users from "./pages/Users";
import Orders from "./pages/orders/OrderList";
import AddUser from "./pages/AddUser";
import ProductList from "./pages/products/ProductList";
import Addproduct from "./pages/products/AddProductForm";
import ProfileDetails from "./pages/ProfileDetails";
import Stores from "./pages/Stores";
import AddStore from "./pages/AddStore";
import Notifications from "./pages/Notifications";
import Login from "./pages/Login";
import AddUserRole from "./pages/AddUserRole";
import Banners from "./pages/Banners";
import Bannerscreate from "./pages/BannersCreate";
import UserRoles from "../src/pages/UserRolesList";
import OrderDetailPage from "./pages/orders/OrderView";
import LocationDataProvider from "./context/LocationDataProvider";
import CreateBrand from "./pages/browse/brands/CreateBrand";
import CreateCategory from "./pages/browse/categories/CreateCategory";
import CreateAttributeType from "./pages/browse/attributeTypes/CreateAttributeType";
import CreateColor from "./pages/browse/colors/CreateColor";
import CreateAttribute from "./pages/browse/attributes/CreateAttribute";
import { TitleProvider } from "./context/TitleContext";
import { AllDataProvider } from "./context/AllDataContext";
import ProtectedRoute from './components/ProtectedRoute';
import NotAuthorized from './pages/NotAuthorized';
import { getPermissionCode } from './utils/permissionUtils';
import { useState, useEffect } from 'react';
import Loader from './components/Loader';


const dashboardPermission = getPermissionCode('Menu Management', 'Dashboard');
const ordersPermission = getPermissionCode('Menu Management', 'Orders');
const storesPermission = getPermissionCode('Menu Management', 'Stores');
const usersPermission = getPermissionCode('Menu Management', 'Users');
const userRolesPermission = getPermissionCode('Menu Management', 'UserRoles');
const bannersPermission = getPermissionCode('Menu Management', 'Banners');
const notificationsPermission = getPermissionCode('Menu Management', 'Notification');
const productsPermission = getPermissionCode('Menu Management', 'Products');
const addProductPermission = getPermissionCode('Menu Management', 'Products');
const editProductPermission = getPermissionCode('Menu Management', 'Products');
const addStorePermission = getPermissionCode('Menu Management', 'Stores');
const editStorePermission = getPermissionCode('Menu Management', 'Stores');
const addUserPermission = getPermissionCode('Menu Management', 'Users');
const editUserPermission = getPermissionCode('Menu Management', 'Users');
const addUserRolePermission = getPermissionCode('Menu Management', 'UserRoles');
const editUserRolePermission = getPermissionCode('Menu Management', 'UserRoles');
const bannersCreatePermission = getPermissionCode('Menu Management', 'Banners');
const orderDetailPermission = getPermissionCode('Menu Management', 'Orders');


const App = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600); // 600ms for smoothness
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
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute permissionCode={dashboardPermission}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse"
              element={
                <ProtectedRoute permissionCode={productsPermission}>
                  <Browse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/editbrand/:id"
              element={
                <ProtectedRoute permissionCode={productsPermission}>
                  <CreateBrand />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/editcatagiry/:id"
              element={
                <ProtectedRoute permissionCode={productsPermission}>
                  <CreateCategory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/editattributetype/:id"
              element={
                <ProtectedRoute permissionCode={productsPermission}>
                  <CreateAttributeType />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/editcolor/:id"
              element={
                <ProtectedRoute permissionCode={productsPermission}>
                  <CreateColor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/editattribute/:id"
              element={
                <ProtectedRoute permissionCode={productsPermission}>
                  <CreateAttribute />
                </ProtectedRoute>
              }
            />
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
            <Route
              path="/userRoles"
              element={
                <ProtectedRoute permissionCode={userRolesPermission}>
                  <UserRoles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/productList"
              element={
                <ProtectedRoute permissionCode={productsPermission}>
                  <ProductList />
                </ProtectedRoute>
              }
            />
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
                <ProtectedRoute>
                  <Bannerscreate />
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
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileDetails />
                </ProtectedRoute>
              }
            />
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

            <Route
              path="/banners"
              element={
                <ProtectedRoute permissionCode={bannersPermission}>
                  <Banners />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute permissionCode={notificationsPermission}>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/not-authorized"
              element={<NotAuthorized />}
            />
          </Routes>
        </LocationDataProvider>
      </TitleProvider>
    </AllDataProvider>
  );
};

export default App;
