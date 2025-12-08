import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Users,
  Globe,
  Navigation,
  Hash,
  Shield,
} from "lucide-react";
import TextInputWithIcon from "../components/TextInputWithIcon";
import SelectWithIcon from "../components/SelectWithIcon";
import PhoneInputWithIcon from "../components/PhoneInputWithIcon";
import { useTranslation } from "react-i18next";
import { FaCamera, FaTimes } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import userProfile from "../../assets/images/userProfile.svg";
import BackButton from "../components/BackButton";
import { useTitle } from "../context/TitleContext";
import { GENDER_OPTIONS } from "../contants/constants";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddUser = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { setTitle, setBackButton } = useTitle();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    role: "",
    streetAddress: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPersonalInfoEditable, setIsPersonalInfoEditable] = useState(!id);
  const [isAddressInfoEditable, setIsAddressInfoEditable] = useState(!id);

  // Role options - must match Users component
  const roleOptions = [
    { value: "Admin", label: "Admin" },
    { value: "HR", label: "HR" },
    { value: "User", label: "User" },
  ];

  // Dummy data for dropdowns
  const mockCountries = [
    { CountryID: 1, CountryName: "USA" },
    { CountryID: 2, CountryName: "India" },
    { CountryID: 3, CountryName: "UK" },
  ];
  const mockStates = [
    { StateID: 1, StateName: "California" },
    { StateID: 2, StateName: "New York" },
    { StateID: 3, StateName: "Texas" },
    { StateID: 4, StateName: "Maharashtra" },
    { StateID: 5, StateName: "Karnataka" },
  ];
  const mockCities = [
    { CityID: 1, CityName: "New York" },
    { CityID: 2, CityName: "Los Angeles" },
    { CityID: 3, CityName: "Chicago" },
    { CityID: 4, CityName: "Mumbai" },
    { CityID: 5, CityName: "Bangalore" },
  ];
  
  const genderOptions = GENDER_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }));

  // Helper: Generate new UserID
  const generateNewUserId = (existingUsers) => {
    if (!existingUsers || existingUsers.length === 0) return "U001";
    
    // Extract numeric part from existing UserIDs
    const userIds = existingUsers.map(user => {
      const match = user.UserID?.match(/U(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    
    const maxId = Math.max(...userIds, 0);
    const newId = maxId + 1;
    return `U${String(newId).padStart(3, '0')}`;
  };

  // Load user data when editing
  useEffect(() => {
    if (id) {
      try {
        const storedUsers = JSON.parse(localStorage.getItem("usersList"));
        
        if (storedUsers && storedUsers.length > 0) {
          // Find user by UserID (format: "U001") or numeric id
          const foundUser = storedUsers.find(
            (u) => String(u.UserID) === String(id) || String(u.id) === String(id)
          );

          if (foundUser) {
            setFormData({
              firstName: foundUser.FirstName || "",
              lastName: foundUser.LastName || "",
              email: foundUser.Email || "",
              phone: foundUser.PhoneNumber || "",
              gender: foundUser.Gender || "",
              role: foundUser.RoleName || "",
              streetAddress: foundUser.Address || "",
              city: foundUser.City || "",
              state: foundUser.State || "",
              pincode: foundUser.Zipcode || "",
              country: foundUser.Country || "",
            });
            
            if (foundUser.ProfileImageUrl) {
              setProfileImagePreview(foundUser.ProfileImageUrl);
            }
          } else {
            toast.error("User not found");
            navigate("/users");
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
        toast.error("Failed to load user data");
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    setTitle(id ? t("USERS.EDIT_USER") : t("USERS.ADD_NEW_USER"));
    setBackButton(<BackButton />);
  }, [setTitle, setBackButton, t, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (phoneNumber) => {
    setFormData((prev) => ({ ...prev, phone: phoneNumber }));
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setProfileImagePreview(compressedBase64);
      } catch (error) {
        console.error("Image processing error", error);
        toast.error("Failed to process image");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get existing users from localStorage
      const existingUsers = JSON.parse(localStorage.getItem("usersList")) || [];
      
      if (id) {
        // UPDATE EXISTING USER
        const updatedUsers = existingUsers.map((user) => {
          if (String(user.UserID) === String(id)) {
            return {
              ...user,
              FirstName: formData.firstName,
              LastName: formData.lastName,
              Email: formData.email,
              PhoneNumber: formData.phone,
              Gender: formData.gender,
              RoleName: formData.role,
              Address: formData.streetAddress,
              City: formData.city,
              State: formData.state,
              Country: formData.country,
              Zipcode: formData.pincode,
              ProfileImageUrl: profileImagePreview || user.ProfileImageUrl || "",
              IsActive: user.IsActive !== undefined ? user.IsActive : true,
            };
          }
          return user;
        });

        localStorage.setItem("usersList", JSON.stringify(updatedUsers));
        toast.success("User updated successfully!", {
          position: "top-right",
          autoClose: 1500,
          onClose: () => {
            setIsSubmitting(false);
            navigate("/users");
          }
        });
      } else {
        // CREATE NEW USER
        const newUserId = generateNewUserId(existingUsers);
        const newUser = {
          UserID: newUserId,
          FirstName: formData.firstName,
          LastName: formData.lastName,
          Email: formData.email,
          PhoneNumber: formData.phone,
          Gender: formData.gender,
          RoleName: formData.role || "User",
          Address: formData.streetAddress,
          City: formData.city,
          State: formData.state,
          Country: formData.country,
          Zipcode: formData.pincode,
          ProfileImageUrl: profileImagePreview || "",
          IsActive: true,
        };

        const updatedUsers = [newUser, ...existingUsers];
        localStorage.setItem("usersList", JSON.stringify(updatedUsers));
        
        toast.success("User created successfully!", {
          position: "top-right",
          autoClose: 1500,
          onClose: () => {
            setIsSubmitting(false);
            navigate("/users");
          }
        });
      }
    } catch (error) {
      console.error("Save failed:", error);
      setIsSubmitting(false);
      if (error.name === "QuotaExceededError" || error.code === 22) {
        toast.error("Storage full! Image is too large.");
      } else {
        toast.error("Failed to save user.");
      }
    }
  };

  const handleCancel = () => {
    navigate("/users");
  };

  const toggleSectionEdit = (section) => {
    switch (section) {
      case "personal":
        setIsPersonalInfoEditable(!isPersonalInfoEditable);
        break;
      case "address":
        setIsAddressInfoEditable(!isAddressInfoEditable);
        break;
    }
  };

  const SectionHeader = ({ title, isEditable, onEditToggle, sectionKey }) => (
    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex justify-between items-center">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {id && !isEditable && (
        <button
          type="button"
          onClick={() => onEditToggle(sectionKey)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#FF5A5F] text-white hover:bg-[#e04a4f] transition-colors"
        >
          {t("COMMON.EDIT")}
        </button>
      )}
    </div>
  );

  const SectionFooter = ({ isEditable, onEditToggle, sectionKey }) =>
    id &&
    isEditable && (
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onEditToggle(sectionKey)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors"
        >
          {t("COMMON.CANCEL")}
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#FF5A5F] text-white hover:bg-[#e04a4f] transition-colors"
        >
          {t("COMMON.UPDATE")}
        </button>
      </div>
    );

  const DataField = ({ label, value, placeholder = "-", icon: Icon = User }) => (
    <div className="flex flex-col mb-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
        <Icon size={16} className="text-gray-500" />
        {label}
      </label>
      <div className="pl-6">
        <span className="text-gray-900 text-base font-medium align-middle">
          {value || <span className="text-gray-400 italic">{placeholder}</span>}
        </span>
      </div>
    </div>
  );

  const DataSelectField = ({
    label,
    value,
    options,
    placeholder = "-",
    icon: Icon = User,
  }) => {
    const displayValue =
      options.find((opt) => opt.value == value)?.label || value || "-";
    return (
      <div className="flex flex-col mb-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          <Icon size={16} className="text-gray-500" />
          {label}
        </label>
        <div className="pl-6">
          <span className="text-gray-900 text-base font-medium align-middle">
            {displayValue !== "-" ? (
              displayValue
            ) : (
              <span className="text-gray-400 italic">{placeholder}</span>
            )}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-8xl mx-auto pb-20">
      <ToastContainer />

      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <p className="text-gray-600 text-sm">
              {id ? t("USERS.EDIT_USER_DESCRIPTION") : t("USERS.DESCRIPTION")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-8 relative">
          <div className="relative" style={{ minWidth: 80, minHeight: 80 }}>
            <img
              src={profileImagePreview || userProfile}
              alt={t("ADD_USER.PROFILE_PREVIEW")}
              className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = userProfile;
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("ADD_USER.PROFILE_IMAGE")}
            </label>
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="profile-image-upload"
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors text-white bg-blue-600 hover:bg-blue-700 border border-blue-600"
            >
              <FaCamera className="text-sm" />
              {t("COMMON.UPLOAD")}
            </label>
            <p className="text-xs text-gray-500 mt-2">
              {t("ADD_USER.IMAGE_UPLOAD_NOTE")}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Personal Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <SectionHeader
              title={t("ADD_USER.PERSONAL_INFO")}
              isEditable={isPersonalInfoEditable}
              onEditToggle={toggleSectionEdit}
              sectionKey="personal"
            />
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isPersonalInfoEditable ? (
                  <TextInputWithIcon
                    label={t("ADD_USER.FIRST_NAME")}
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder={t("ADD_USER.ENTER_FIRST_NAME")}
                    Icon={User}
                    required={!id}
                  />
                ) : (
                  <DataField
                    label={t("ADD_USER.FIRST_NAME")}
                    value={formData.firstName}
                    icon={User}
                  />
                )}
                {isPersonalInfoEditable ? (
                  <TextInputWithIcon
                    label={t("ADD_USER.LAST_NAME")}
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder={t("ADD_USER.ENTER_LAST_NAME")}
                    Icon={User}
                  />
                ) : (
                  <DataField
                    label={t("ADD_USER.LAST_NAME")}
                    value={formData.lastName}
                    icon={User}
                  />
                )}
                {isPersonalInfoEditable ? (
                  <SelectWithIcon
                    label={t("ADD_USER.GENDER")}
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    options={genderOptions}
                    Icon={Users}
                    placeholder={t("ADD_USER.SELECT_GENDER")}
                  />
                ) : (
                  <DataSelectField
                    label={t("ADD_USER.GENDER")}
                    value={formData.gender}
                    options={genderOptions}
                    icon={Users}
                  />
                )}
                {isPersonalInfoEditable ? (
                  <SelectWithIcon
                    label={t("ADD_USER.ROLE")}
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    options={roleOptions}
                    Icon={Shield}
                    placeholder={t("ADD_USER.SELECT_ROLE")}
                    required={!id}
                  />
                ) : (
                  <DataSelectField
                    label={t("ADD_USER.ROLE")}
                    value={formData.role}
                    options={roleOptions}
                    icon={Shield}
                  />
                )}
                {isPersonalInfoEditable ? (
                  <TextInputWithIcon
                    label={t("COMMON.EMAIL_ADDRESS")}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("COMMON.ENTER_EMAIL_ADDRESS")}
                    Icon={Mail}
                    type="email"
                    required={!id}
                  />
                ) : (
                  <DataField
                    label={t("COMMON.EMAIL_ADDRESS")}
                    value={formData.email}
                    icon={Mail}
                  />
                )}
                {isPersonalInfoEditable ? (
                  <PhoneInputWithIcon
                    label={t("COMMON.PHONE_NUMBER")}
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder={t("COMMON.ENTER_PHONE_NUMBER")}
                    Icon={Phone}
                    defaultCountry="US"
                  />
                ) : (
                  <DataField
                    label={t("COMMON.PHONE_NUMBER")}
                    value={formData.phone}
                    icon={Phone}
                  />
                )}
              </div>
            </div>
            <SectionFooter
              isEditable={isPersonalInfoEditable}
              onEditToggle={toggleSectionEdit}
              sectionKey="personal"
            />
          </div>

          {/* Address Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <SectionHeader
              title={t("ADD_USER.ADDRESS_INFO")}
              isEditable={isAddressInfoEditable}
              onEditToggle={toggleSectionEdit}
              sectionKey="address"
            />
            <div className="p-6 space-y-6">
              {isAddressInfoEditable ? (
                <TextInputWithIcon
                  label={t("COMMON.STREET_ADDRESS")}
                  id="streetAddress"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  placeholder={t("COMMON.ENTER_STREET_ADDRESS")}
                  Icon={MapPin}
                />
              ) : (
                <DataField
                  label={t("COMMON.STREET_ADDRESS")}
                  value={formData.streetAddress}
                  icon={MapPin}
                />
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isAddressInfoEditable ? (
                  <SelectWithIcon
                    label={t("COMMON.COUNTRY")}
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    options={mockCountries.map((c) => ({
                      value: c.CountryName,
                      label: c.CountryName,
                    }))}
                    Icon={Globe}
                    placeholder={t("COMMON.SELECT_COUNTRY")}
                  />
                ) : (
                  <DataSelectField
                    label={t("COMMON.COUNTRY")}
                    value={formData.country}
                    options={mockCountries.map((c) => ({
                      value: c.CountryName,
                      label: c.CountryName,
                    }))}
                    icon={Globe}
                  />
                )}
                {isAddressInfoEditable ? (
                  <SelectWithIcon
                    label={t("COMMON.STATE")}
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    options={mockStates.map((s) => ({
                      value: s.StateName,
                      label: s.StateName,
                    }))}
                    Icon={Navigation}
                    placeholder={t("COMMON.SELECT_STATE")}
                  />
                ) : (
                  <DataSelectField
                    label={t("COMMON.STATE")}
                    value={formData.state}
                    options={mockStates.map((s) => ({
                      value: s.StateName,
                      label: s.StateName,
                    }))}
                    icon={Navigation}
                  />
                )}
                {isAddressInfoEditable ? (
                  <SelectWithIcon
                    label={t("COMMON.CITY")}
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    options={mockCities.map((c) => ({
                      value: c.CityName,
                      label: c.CityName,
                    }))}
                    Icon={Building}
                    placeholder={t("COMMON.SELECT_CITY")}
                  />
                ) : (
                  <DataSelectField
                    label={t("COMMON.CITY")}
                    value={formData.city}
                    options={mockCities.map((c) => ({
                      value: c.CityName,
                      label: c.CityName,
                    }))}
                    icon={Building}
                  />
                )}
                {isAddressInfoEditable ? (
                  <TextInputWithIcon
                    label={t("COMMON.PINCODE")}
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder={t("ADD_USER.ENTER_PINCODE")}
                    Icon={Hash}
                  />
                ) : (
                  <DataField
                    label={t("COMMON.PINCODE")}
                    value={formData.pincode}
                    icon={Hash}
                  />
                )}
              </div>
            </div>
            <SectionFooter
              isEditable={isAddressInfoEditable}
              onEditToggle={toggleSectionEdit}
              sectionKey="address"
            />

            {/* Main Bottom Submit Button */}
            <div className="mt-12 pt-8 border-t border-gray-200 bg-gray-50 px-6 pb-6">
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  <FaTimes className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (!id &&
                      (!formData.firstName.trim() ||
                        !formData.email.trim() ||
                        !formData.role.trim()))
                  }
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#FF5A5F] text-white hover:bg-[#e04a4f] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {id ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      {id ? "Update User" : "Create User"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddUser;