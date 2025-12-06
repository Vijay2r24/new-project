import { Routes, Route } from "react-router-dom";
import { TenantProvider } from "./Tenants/tenantsContext";
import Login from "./Pages/Login";
import LayoutWrapper from "./layout/layoutWrapper";
import Dashboard from "./DashBoard/dashBoard";
import TenantList from "./Tenants/tenantList";
import CreateTenant from "./Tenants/createTenant";
import TenantDetails from "./Tenants/tenantDetails";
import Users from "./Pages/Users";
import UserRolesList from "./Pages/UserRolesList";
import AddUser from "./Pages/AddUser";
import AddUserRole from "./Pages/AddUserRoles";
import ProfileDetails from "./Pages/ProfileDetails";
import ThemeSettings from "./Pages/ThemeSettings";
import SubscriptionUI from "./Tenants/Subscription";
import Subscription from "./Tenants/Subscription";
import PaymentDetails from "./Pages/payments/PaymentDetails";
import TenantSettings from "./Tenants/tenantSettings";
import Employees from "./Pages/EmployeeList";
import OrderList from "./Pages/OrdersList";
import ProductList from "./Pages/ProuctList";
import AddProductForm from "./Pages/AddProductForm";

function App() {
  return (
    <TenantProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register-tenant" element={<CreateTenant isPublic={true} />} />
        <Route path="/*" element={<LayoutWrapper><Routes>
          {/* Dashboard */}
          <Route path="layout" element={<Dashboard />} />
          <Route path="dashboard/dashboard" element={<Dashboard />} />
          {/* Tenants */}
          <Route path="/tenants/tenant-list" element={<TenantList />} />
        
          <Route path="/tenants/create" element={<CreateTenant />} />
           <Route path="/tenants/tenant-settings" element={<TenantSettings/>} />
           <Route path="/employees/employee-list" element={<Employees />} />

          <Route path="tenants/edit/:id" element={<CreateTenant />} />
          <Route path="tenants/details/:id" element={<TenantDetails />} />
          <Route path="tenants/tenant-settings" element={<TenantSettings />} />
          <Route path="tenants/subscription" element={<Subscription />} />
          <Route path="/orders/order-list" element={<OrderList />} />
          <Route path="/roles" element={<UserRolesList />} />
          <Route path="/addRole" element={<AddUserRole />} />
          <Route path="/products" element={<ProductList/>} />
          <Route path ="/AddProuct" element={<AddProductForm />} />
          {/* Payments */}
          <Route path="/pages/paymentdetails" element={<PaymentDetails/>} />
          {/* Profile */}
          <Route path="pages/profile-details" element={<ProfileDetails />} />
          {/* <Route path="pages/edit-profile/:id" element={<ProfileDetails />} /> */}
          {/* Users */}
          <Route path="users" element={<Users />} />
          <Route path="pages/users" element={<Users />} />
          <Route path="editUser/:id" element={<AddUser />} />
          <Route path="pages/editUser/:id" element={<AddUser />} />
          {/* User Roles */}
          <Route path="pages/userRolesList" element={<UserRolesList />} />
          <Route path="/addUser" element={<AddUser />} />
          <Route path="pages/addUserRole" element={<AddUserRole />} />
          {/* Theme Settings */}
          <Route path="pages/theme-settings" element={<ThemeSettings />} />
        

        </Routes>
        </LayoutWrapper>
        }
        />

      </Routes>
    </TenantProvider>
  );
}

export default App;
