import { useState, useEffect, useCallback } from "react";
import { Tag, Info, Hash } from "lucide-react";
import TextInputWithIcon from "../../../components/TextInputWithIcon";
import TextAreaWithIcon from "../../../components/TextAreaWithIcon";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { apiPost, apiGet } from "../../../utils/ApiUtils";
import {
  GET_ATTRIBUTE_TYPE_BY_ID,
  CREATE_OR_UPDATE_ATTRIBUTE_TYPE,
} from "../../../contants/apiRoutes";
import { showEmsg } from "../../../utils/ShowEmsg";
import { STATUS } from "../../../contants/constants";
import BackButton from "../../../components/BackButton";
import SelectWithIcon from "../../../components/SelectWithIcon";
import { ToastContainer } from "react-toastify";
import Loader from "../../../components/Loader";
import { hideLoaderWithDelay } from "../../../utils/loaderUtils";

const CreateAttributeType = () => {
  const { id: attributeTypeId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(attributeTypeId);
  const { t } = useTranslation();

  const token = localStorage.getItem("token");
  const tenantID = localStorage.getItem("tenantID");
  const userId = localStorage.getItem("userId");

  const [formData, setFormData] = useState({
    AttributeTypeName: "",
    Code: "",
    AttributeTypeDescription: "",
    Status: true,
    TenantID: tenantID,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const navigateBack = useCallback(() => {
    navigate("/browse", { state: { fromAttributeTypeEdit: true } });
  }, [navigate]);

  const fetchAttributeTypeDetails = useCallback(async () => {
    try {
      const response = await apiGet(`${GET_ATTRIBUTE_TYPE_BY_ID}/${attributeTypeId}`, {}, token);
      const data = response?.data?.data?.data;

      if (response.data.STATUS === STATUS.SUCCESS.toUpperCase() && data) {
        setFormData({
          AttributeTypeName: data.Name || "",
          Code: data.Code || "",
          AttributeTypeDescription: data.AttributeTypeDescription || "",
          Status: data.Status === "Active",
          TenantID: tenantID,
        });
      } else {
        showEmsg(response.data.MESSAGE || t("PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.FETCH_ERROR"), STATUS.ERROR);
      }
    } catch (err) {
      showEmsg(err?.response?.data?.MESSAGE || t("COMMON.API_ERROR"), STATUS.ERROR);
    }
  }, [attributeTypeId, t, token, tenantID]);

  useEffect(() => {
    if (isEditing && attributeTypeId) {
      fetchAttributeTypeDetails();
    }
  }, [isEditing, attributeTypeId, fetchAttributeTypeDetails]);
 
  const handleInputChange = useCallback(({ target: { name, value, type, checked } }) => {
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  }, [errors]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.AttributeTypeName.trim()) newErrors.AttributeTypeName = t("PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.NAME_REQUIRED");
    if (!formData.Code.trim()) newErrors.Code = t("PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.CODE_REQUIRED");
    if (!formData.AttributeTypeDescription.trim()) newErrors.AttributeTypeDescription = t("PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.DESCRIPTION_REQUIRED");
    return newErrors;
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        TenantID: tenantID,
        Name: formData.AttributeTypeName,
        Code: formData.Code,
        AttributeTypeDescription: formData.AttributeTypeDescription,
        Status: formData.Status ? "Active" : "Inactive",
        ...(isEditing ? { AttributeTypeID: attributeTypeId, UpdatedBy: userId } : { CreatedBy: userId }),
      };

      const response = await apiPost(CREATE_OR_UPDATE_ATTRIBUTE_TYPE, payload, token);

      if (response.data.STATUS === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(response.data.MESSAGE, STATUS.SUCCESS, 3000, navigateBack);
      } else {
        showEmsg(response.data.MESSAGE, STATUS.WARNING);
      }
    } catch (err) {
      console.error(err);
      showEmsg(err?.response?.data?.MESSAGE || t("COMMON.API_ERROR"), STATUS.ERROR);
    } finally {
      hideLoaderWithDelay(setSubmitting);
    }
  }, [formData, isEditing, attributeTypeId, t, navigateBack, tenantID, token, userId]);

  return (
    <div>
      {submitting && <div className="global-loader-overlay"><Loader /></div>}
      {isEditing && <ToastContainer />}

      <div className="flex items-center mb-6">
        <BackButton onClick={navigateBack} />
        <h2 className="text-xl font-bold text-gray-900">
          {isEditing ? t("PRODUCT_SETUP.ATTRIBUTE_TYPE.EDIT_TITLE") : t("PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.CREATE_TITLE")}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            <TextInputWithIcon
              label={t("PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.NAME_LABEL")}
              id="AttributeTypeName"
              name="AttributeTypeName"
              value={formData.AttributeTypeName}
              onChange={handleInputChange}
              placeholder={t("PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.NAME_PLACEHOLDER")}
              error={errors.AttributeTypeName}
              Icon={Tag}
            />
          </div>
          <div className="w-full md:w-1/2">
            <TextInputWithIcon
              label="Code"
              id="Code"
              name="Code"
              value={formData.Code}
              onChange={handleInputChange}
              placeholder="Enter attribute code"
              error={errors.Code}
              Icon={Hash}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            <SelectWithIcon
              label={t("PRODUCT_SETUP.CREATE_BRAND.STATUS_LABEL")}
              id="Status"
              name="Status"
              value={formData.Status}
              onChange={handleInputChange}
              options={[
                { value: true, label: t("COMMON.ACTIVE") },
                { value: false, label: t("COMMON.INACTIVE") },
              ]}
              Icon={Tag}
              error={errors.Status}
            />
          </div>
          <div className="w-full md:w-1/2">
            <TextAreaWithIcon
              label={t("COMMON.DESCRIPTION")}
              id="AttributeTypeDescription"
              name="AttributeTypeDescription"
              value={formData.AttributeTypeDescription}
              onChange={handleInputChange}
              placeholder={t("PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.DESCRIPTION_PLACEHOLDER")}
              error={errors.AttributeTypeDescription}
              icon={Info}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={navigateBack} className="btn-cancel">
            {t("COMMON.CANCEL")}
          </button>
          <button type="submit" className="btn-primary">
            {isEditing ? t("COMMON.SAVE_BUTTON") : t("PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.CREATE_BUTTON")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAttributeType;