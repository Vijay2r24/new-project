import { Routes, Route} from "react-router-dom";
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

const ProtectedRoute = ({ children }) => {
  return <Layout>{children}</Layout>;
};

const App = () => {
  return (
    <AllDataProvider>
      <TitleProvider>
        <LocationDataProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse"
              element={
                <ProtectedRoute>
                  <Browse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/editbrand/:id"
              element={
                <ProtectedRoute>
                  <CreateBrand />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/editcatagiry/:id"
              element={
                <ProtectedRoute>
                  <CreateCategory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/editattributetype/:id"
              element={
                <ProtectedRoute>
                  <CreateAttributeType />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/editcolor/:id"
              element={
                <ProtectedRoute>
                  <CreateColor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/editattribute/:id"
              element={
                <ProtectedRoute>
                  <CreateAttribute />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:orderId"
              element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/userRoles"
              element={
                <ProtectedRoute>
                  <UserRoles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/productList"
              element={
                <ProtectedRoute>
                  <ProductList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/banners-create"
              element={
                <ProtectedRoute>
                  <Bannerscreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Addproduct/:productId?"
              element={
                <ProtectedRoute>
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
                <ProtectedRoute>
                  <AddUserRole />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-UserRole/:roleId"
              element={
                <ProtectedRoute>
                  <AddUserRole />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stores"
              element={
                <ProtectedRoute>
                  <Stores />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-store"
              element={
                <ProtectedRoute>
                  <AddStore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editStore/:id"
              element={
                <ProtectedRoute>
                  <AddStore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-user"
              element={
                <ProtectedRoute>
                  <AddUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editUser/:id"
              element={
                <ProtectedRoute>
                  <AddUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />

            <Route
              path="/banners"
              element={
                <ProtectedRoute>
                  <Banners />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
          </Routes>
        </LocationDataProvider>
      </TitleProvider>
    </AllDataProvider>
  );
};

export default App;
