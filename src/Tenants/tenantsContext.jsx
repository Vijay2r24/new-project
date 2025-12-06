import { createContext, useContext, useState } from "react";

const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
  const [tenants, setTenants] = useState([]);

  // ADD TENANT — ensure unique ID always
  const addTenant = (tenant) => {
    const newTenant = {
      ...tenant,
      id: tenant.id ? String(tenant.id) : String(Date.now()), // SAFE ID
    };

    setTenants((prev) => [...prev, newTenant]);
  };

  // UPDATE TENANT
  const updateTenant = (updatedTenant) => {
    setTenants((prev) =>
      prev.map((t) =>
        String(t.id) === String(updatedTenant.id) ? updatedTenant : t
      )
    );
  };

  return (
    <TenantContext.Provider value={{ tenants, addTenant, updateTenant }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
