import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTenant } from "./tenantsContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useTitle } from "../context/TitleContext";
import TextInputWithIcon from "../components/TextInputWithIcon";
import { User, Mail, MapPin, Globe, Hash, Store, Phone, Camera } from "lucide-react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import userProfile from "../../assets/images/userProfile.svg";

const CreateTenant = () => {
  const { t } = useTranslation();
  const { addTenant, updateTenant } = useTenant();
  const navigate = useNavigate();
  const { setTitle } = useTitle();
  const { state } = useLocation();
  const location = useLocation();
  const isPublic = location.pathname.includes("/public");

  const editingTenant = state?.tenant;

  const [activeTab, setActiveTab] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    setTitle(editingTenant ? "Edit Tenant" : "Create Tenant");
  }, [editingTenant]);

  const initialState = editingTenant
    ? { ...editingTenant }
    : {
      email: "",
      companyName: "",
      phone: "",
      countryCode: "",
      addressLine: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      monthly: false,
      yearly: false,
       status: "Active", 
    };

  const [formData, setFormData] = useState(initialState);
  const [profileImagePreview, setProfileImagePreview] = useState(
    editingTenant?.logo || null
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProfileImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePlanSelect = (planType, planName) => {
    setSelectedPlan({ type: planType, name: planName });
    setFormData({
      ...formData,
      monthly: planType === "monthly" ? planName : false,
      yearly: planType === "yearly" ? planName : false,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = [
      "email", "companyName", "phone",
      "countryCode", "addressLine", "city",
      "state", "country", "zipCode",
    ];

    for (let key of requiredFields) {
      if (!formData[key] || formData[key].trim() === "") {
        toast.error("Please fill all required fields before submitting!");
        return;
      }
    }

    if (!selectedPlan) {
      toast.error("Please select a subscription plan!");
      return;
    }

    const payload = {
      email: formData.email,
      companyName: formData.companyName,
      phone: formData.phone,
      countryCode: formData.countryCode,
      address: {
        addressLine: formData.addressLine,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode,
      },
      tenantName: formData.Name,
      logo: profileImagePreview,
        status: formData.status, 
      subscriptions: {
        monthly: formData.monthly,
        yearly: formData.yearly,
      },
    };

    if (editingTenant) {
      updateTenant(editingTenant.id, payload);
      toast.success("Tenant updated successfully!");
    } else {
      addTenant(payload);
      toast.success("Tenant Registered successfully!");
    }

    setTimeout(() => navigate("/tenants/tenant-list"), 800);
  };

  const isEditing = Boolean(editingTenant);

  const plans = [
    {
      id: 1,
      name: "Bronze",
      price: activeTab === "monthly" ? "₹499 / month" : "₹4,999 / year",
      features: [
        "Single Store",
        "Users (Cloud Access)",
        "Products & Inventory Management",
        "Limited Banners (5)",
        "Basic Push Notifications",
        "Basic OTP Notifications",
        "Basic Staff Notifications",
        "Basic Roles & Permissions"
      ],
    },
    {
      id: 2,
      name: "Silver",
      price: activeTab === "monthly" ? "₹999 / month" : "₹9,999 / year",
      features: [
        "Up to 5 Stores",
        "Customer Web Application (PWA)",
        "Admin Portal (PWA)",
        "Online Payment Gateway Integration (RazorPay)",
        "Staff Notifications with Approval",
        "Messaging & Push & OTP Notifications",
        "Medium Banners (15)",
        "Standard Roles & Permissions",
        "Basic Reporting & Analytics"
      ],
    },
    {
      id: 3,
      name: "Gold",
      price: activeTab === "monthly" ? "₹1,999 / month" : "₹19,999 / year",
      features: [
        "Unlimited Stores",
        "Mobile Application (Android / iOS)",
        "Advanced Role Approval Flow",
        "Advanced Push & Messaging & OTP Notifications",
        "Multiple Payment Gateways + Custom Integrations",
        "Unlimited Banners",
        "Custom Branding",
        "Priority 24/7 Support"
      ],
    },
  ];


  return (
    <div className={`${isPublic ? "public-container" : ""} space-y-8`}>

      <ToastContainer />

      <div className="mb-8">
        <p className="text-gray-600 text-sm">
          {isEditing ? "Edit tenant details below" : "Create a new tenant by entering the required details below"}
        </p>
      </div>

      <div className="flex items-center gap-6 mb-8 relative">
        <div className="relative" style={{ minWidth: 80, minHeight: 80 }}>
          <img
            src={profileImagePreview || userProfile}
            alt="Tenant Logo Preview"
            className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tenant Logo</label>

          <input id="tenant-image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

          <label
            htmlFor="tenant-image-upload"
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 transition-colors"
          >
            <Camera className="text-sm" />
            Upload
          </label>

          <p className="text-xs text-gray-500 mt-2">Upload a clear tenant logo or brand image.</p>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Store Information</h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInputWithIcon label="Company Name" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Enter company name" Icon={Store} />
            <TextInputWithIcon label="Company Email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter company email" Icon={Mail} />
            <TextInputWithIcon label="Phone" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone" Icon={Phone} />
          </div>
        </div>
      </div>

      {/* Address Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Address Information</h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInputWithIcon label="Country Code" id="countryCode" name="countryCode" value={formData.countryCode} onChange={handleChange} placeholder="Ex: +91" Icon={Globe} />
            <TextInputWithIcon label="Address Line" id="addressLine" name="addressLine" value={formData.addressLine} onChange={handleChange} placeholder="Enter address" Icon={MapPin} />
            <TextInputWithIcon label="City" id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Enter city" Icon={MapPin} />
            <TextInputWithIcon label="State" id="state" name="state" value={formData.state} onChange={handleChange} placeholder="Enter state" Icon={MapPin} />
            <TextInputWithIcon label="Country" id="country" name="country" value={formData.country} onChange={handleChange} placeholder="Enter country" Icon={Globe} />
            <TextInputWithIcon label="Zip Code" id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="Enter zip code" Icon={Hash} />
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex justify-between">
    <h2 className="text-lg font-semibold text-gray-900">Subscription Plans</h2>
  </div>

  <div className="p-4 bg-gradient-to-br from-white to-gray-50">
    {/* Toggle Buttons */}
    <div className="flex justify-center mb-6">
      <div className="bg-gray-200 p-1 rounded-full flex space-x-2">
        <button
          onClick={() => setActiveTab("monthly")}
          className={`px-5 py-1.5 rounded-full font-semibold ${
            activeTab === "monthly" ? "bg-blue-600 text-white" : "text-gray-600"
          }`}
        >
          Monthly
        </button>

        <button
          onClick={() => setActiveTab("yearly")}
          className={`px-5 py-1.5 rounded-full font-semibold ${
            activeTab === "yearly" ? "bg-blue-600 text-white" : "text-gray-600"
          }`}
        >
          Yearly
        </button>
      </div>
    </div>

    {/* Plans */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {plans.map((sub) => (
        <div
          key={sub.id}
          onClick={() => handlePlanSelect(activeTab, sub.name)}
          className={`cursor-pointer rounded-2xl overflow-hidden border shadow-md p-5 w-full h-full flex flex-col justify-between ${
            selectedPlan?.name === sub.name
              ? "border-blue-600 shadow-blue-400/40"
              : "border-gray-200"
          }`}
        >
          {/* Header */}
          <div
            className={`h-32 -mx-5 -mt-5 rounded-b-2xl flex justify-center items-center font-bold text-2xl text-white ${
              sub.name === "Bronze"
              ? "bg-gradient-to-r from-[#D9A066] to-[#C78848]" 
                : sub.name === "Silver"
                ? "bg-gradient-to-r from-[#BFBFBF] to-[#A6A6A6]" 
                : "bg-gradient-to-r from-[#FFD966] to-[#FFCC33]" 
            }`}
          >
            {sub.name}
          </div>

          {/* Price */}
          <p className="text-center text-4xl font-bold mt-4 text-gray-900">
            {sub.price}
          </p>

          {/* Features */}
          <ul className="mt-4 space-y-2 flex-1">
            {sub.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-gray-700">
                <span className="text-green-600 text-xl">✔</span>
                {feature}
              </li>
            ))}
          </ul>

          {/* Button */}
          <button
            className={`mt-5 w-full py-2 rounded-lg font-semibold ${
              selectedPlan?.name === sub.name
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {selectedPlan?.name === sub.name ? "Selected" : "Choose Plan"}
          </button>
        </div>
      ))}
    </div>
  </div>
</div>


      <button
        onClick={handleSubmit}
        disabled={!selectedPlan}
        className={`px-6 py-3 rounded-lg font-semibold transition ${selectedPlan ? "bg-custom-bg text-white hover:bg-bg-hover" : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
      >
        {isEditing ? "Update Tenant" : "Register"}
      </button>
    </div>
  );
};

export default CreateTenant;
