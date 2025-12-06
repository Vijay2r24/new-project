import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTenant } from "./tenantsContext";
import userProfile from "../../assets/images/userProfile.svg";
import { Pencil, X, Save, Camera, PaintBucket,Settings } from "lucide-react";
import TextInputWithIcon from "../components/TextInputWithIcon";
import { useTitle } from "../context/TitleContext";

// IMAGE IMPORTS


const TenantDetails = () => {
  const defaultColor = "#FF5A5F";
  const [primaryColor, setPrimaryColor] = useState(defaultColor);

  const { id } = useParams();
  const { tenants, updateTenant } = useTenant();
  const navigate = useNavigate();
  const { setTitle } = useTitle();

  useEffect(() => setTitle("Tenant Details"), [setTitle]);

  const tenant = tenants.find((t) => String(t.id) === String(id));
  if (!tenant) return <p className="p-6 text-red-500 text-lg">Tenant not found</p>;

  const [logo, setLogo] = useState(tenant.Logo || tenant.logo || tenant.profileUrl || userProfile);

  const [personal, setPersonal] = useState({
    name: tenant.Name || "",
    companyName: tenant.companyName || "",
    email: tenant.email || "",
    phone: tenant.phone || "",
  });

  const [address, setAddress] = useState({
    countryCode: tenant.countryCode || "",
    addressLine: tenant?.address?.addressLine || "",
    city: tenant?.address?.city || "",
    state: tenant?.address?.state || "",
    country: tenant?.address?.country || "",
    zipCode: tenant?.address?.zipCode || "",
  });

  const [portal, setPortal] = useState({
    customerPortal: tenant.customerPortal || "",
    adminPortal: tenant.adminPortal || "",
    gstNo: tenant.gstNo || "",
  });

  const [editPersonal, setEditPersonal] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [editPortal, setEditPortal] = useState(false);

  // ✅ Logo Upload + Alert + Context Update
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result);
    
      const updatedData = { ...tenant, Logo: reader.result };
      updateTenant(updatedData); // ✅ Update global context
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = (section) => {
    const updatedData = {
      ...tenant,
      Name: personal.name,
      companyName: personal.companyName,
      email: personal.email,
      phone: personal.phone,
      Logo: logo,
      primaryColor,
      customerPortal: portal.customerPortal,
      adminPortal: portal.adminPortal,
      gstNo: portal.gstNo,
      address: { ...address },
    };

    updateTenant(updatedData);

    if (section === "personal") setEditPersonal(false);
    if (section === "address") setEditAddress(false);
    if (section === "portal") setEditPortal(false);
  };
   const goToSettings = () => {
    navigate("/tenants/tenant-settings"); 
  };

  return (
    <>
      {/* HEADER PROFILE */}
       <div className="bg-white rounded-2xl shadow-sm border p-6 flex items-center justify-between mb-8">
      <div className="flex items-center gap-6">
        <div className="relative">
          <img
            src={logo || userProfile}
            alt="Tenant Logo"
            className="w-32 h-32 rounded-full object-cover border"
          />
          <label className="absolute bottom-1 right-1 bg-white border-2 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <Camera size={18} className="text-gray-700" />
          </label>
        </div>

        <div>
          <p className="text-gray-800 font-semibold text-xl">{personal.name}</p>
          <p className="text-gray-600 font-medium">Admin</p>
          <p className="text-gray-600">
            <strong>Company Name:</strong> {personal.companyName || "—"}
          </p>
        </div>
      </div>
<Settings
        size={28}
        className="text-gray-700 cursor-pointer hover:text-black"
        onClick={goToSettings}
      />
    </div>

      {/* PERSONAL + ADDRESS */}
      <div className="space-y-8">
        <SectionCard
          title="Store Information"
          editing={editPersonal}
          onEdit={() => setEditPersonal(true)}
          onCancel={() => setEditPersonal(false)}
          onUpdate={() => handleUpdate("personal")}
        >
          <EditableItem label="Company Name" value={personal.companyName} editing={editPersonal} onChange={(v) => setPersonal({ ...personal, companyName: v })} />
          <EditableItem label="Email" value={personal.email} editing={editPersonal} onChange={(v) => setPersonal({ ...personal, email: v })} />
          <EditableItem label="Phone" value={personal.phone} editing={editPersonal} onChange={(v) => setPersonal({ ...personal, phone: v })} />
        </SectionCard>

        <SectionCard
          title="Address Information"
          editing={editAddress}
          onEdit={() => setEditAddress(true)}
          onCancel={() => setEditAddress(false)}
          onUpdate={() => handleUpdate("address")}
        >
          <EditableItem label="Country Code" value={address.countryCode} editing={editAddress} onChange={(v) => setAddress({ ...address, countryCode: v })} />
          <EditableItem label="Address" value={address.addressLine} editing={editAddress} onChange={(v) => setAddress({ ...address, addressLine: v })} />
          <EditableItem label="City" value={address.city} editing={editAddress} onChange={(v) => setAddress({ ...address, city: v })} />
          <EditableItem label="State" value={address.state} editing={editAddress} onChange={(v) => setAddress({ ...address, state: v })} />
          <EditableItem label="Country" value={address.country} editing={editAddress} onChange={(v) => setAddress({ ...address, country: v })} />
          <EditableItem label="Zip Code" value={address.zipCode} editing={editAddress} onChange={(v) => setAddress({ ...address, zipCode: v })} />
        </SectionCard>
      </div>

    </>
  );
};

export default TenantDetails;

// REUSABLE COMPONENTS
const SectionCard = ({ title, children, editing, onEdit, onCancel, onUpdate }) => (
  <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
    <div className="flex items-center justify-between border-b pb-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {!editing && (
        <button className="px-4 py-1 bg-custom-bg text-white rounded-lg flex items-center gap-2" onClick={onEdit}>
          <Pencil size={18} /> Edit
        </button>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>

    {editing && (
      <div className="flex justify-end gap-3 border-t pt-4">
        <button className="px-5 py-2 border rounded-lg flex items-center gap-2" onClick={onCancel}>
          <X size={18} /> Cancel
        </button>
        <button className="px-5 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2" onClick={onUpdate}>
          <Save size={18} /> Update
        </button>
      </div>
    )}
  </div>
);

const EditableItem = ({ label, value, editing, onChange }) => (
  <div>
    <p className="text-sm text-gray-600">{label}</p>
    {editing ? (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border p-2 rounded-md"
      />
    ) : (
      <p className="font-medium text-gray-900">{value || "—"}</p>
    )}
  </div>
);
