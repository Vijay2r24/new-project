import { useState, useEffect } from "react";
import { Tag,Info } from "lucide-react";
import TextInputWithIcon from "../../../components/TextInputWithIcon";
import SelectWithIcon from "../../../components/SelectWithIcon";
import TextAreaWithIcon from "../../../components/TextAreaWithIcon";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../../utils/ApiUtils";
import { GET_ATTRIBUTE_BY_ID, CREATE_OR_UPDATE_ATTRIBUTE } from "../../../contants/apiRoutes";
import { showEmsg } from "../../../utils/ShowEmsg";
import {
  useAttributeTypes,
} from "../../../context/AllDataContext";
import { STATUS } from "../../../contants/constants";
import BackButton from '../../../components/BackButton';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const CreateAttribute = ({ setViewMode }) => {
  const { id: attributeId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!attributeId;
  const [oFormData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    TenantID: "1",
    status: "Active",
  });
  const { t } = useTranslation();
  const [oErrors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    data: aAttributeTypes = [],
    loading: attributeTypesLoading,
    error: attributeTypesError,
    fetch: fetchAttributeTypes,
  } = useAttributeTypes();

  useEffect(() => {
    if (isEditing && attributeId) {
      const fetchAttributeDetails = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await apiGet(
            `${GET_ATTRIBUTE_BY_ID}/${attributeId}`,
            {},
            token
          );
          if (
            response.data.STATUS === STATUS.SUCCESS.toUpperCase() &&
            response.data.data &&
            response.data.data.data
          ) {
            const attributeData = response.data.data.data;
            setFormData((prev) => ({
              ...prev,
              name: attributeData.AttributeName || "",
              type: attributeData.AttributeTypeID || "",
              description: attributeData.AttributeDescription || "",
              TenantID: attributeData.TenantID?.toString() || "1",
              status: attributeData.Status,
            }));
          } else {
            showEmsg(
              response.data.MESSAGE,
              STATUS.WARNING
            );
          }
        } catch (err) {
             console.error(err);
             const errorMessage =
               err?.response?.data?.MESSAGE || t("COMMON.API_ERROR");
             showEmsg(errorMessage, STATUS.ERROR);
           }
      };
      fetchAttributeDetails();
    }
  }, [attributeId, isEditing, t]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (oErrors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!oFormData.name.trim()) {
      newErrors.name = t("PRODUCT_SETUP.CREATE_ATTRIBUTES.NAME_REQUIRED");
    } else if (oFormData.name.trim().length < 2) {
      newErrors.name = t("PRODUCT_SETUP.CREATE_ATTRIBUTES.NAME_MIN_LENGTH");
    } else if (oFormData.name.trim().length > 50) {
      newErrors.name = t("PRODUCT_SETUP.CREATE_ATTRIBUTES.NAME_MAX_LENGTH");
    }

    if (!oFormData.type) {
      newErrors.type = t("PRODUCT_SETUP.CREATE_ATTRIBUTES.TYPE_REQUIRED");
    } else if (
      !aAttributeTypes.some((type) => String(type.attributeTypeID) === String(oFormData.type))
    ) {
      newErrors.type = t("PRODUCT_SETUP.CREATE_ATTRIBUTES.TYPE_INVALID");
    }

    if (!oFormData.description.trim()) {
      newErrors.description = t(
        "PRODUCT_SETUP.CREATE_ATTRIBUTES.DESCRIPTION_REQUIRED"
      );
    } else if (oFormData.description.trim().length > 250) {
      newErrors.description = t(
        "PRODUCT_SETUP.CREATE_ATTRIBUTES.DESCRIPTION_MAX_LENGTH"
      );
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      TenantID: parseInt(oFormData.TenantID, 10),
      AttributeName: oFormData.name,
      Status: oFormData.status,
      AttributeTypeID: oFormData.type,
      AttributeDescription: oFormData.description,
    };
    if (isEditing) {
      payload.AttributeID = attributeId;
      payload.UpdatedBy = t("COMMON.ADMIN");
    } else {
      payload.CreatedBy = t("COMMON.ADMIN");
    }

    const handleResponse = (response) => {
      if (response.data.STATUS === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(response.data.MESSAGE, STATUS.SUCCESS);
      } else {
        showEmsg(response.data.MESSAGE, STATUS.ERROR);
      }
    };

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const response = await apiPost(CREATE_OR_UPDATE_ATTRIBUTE, payload, token);
      handleResponse(response);
    } catch (err) {
      const errorMessage = err?.response?.data?.MESSAGE || t("COMMON.API_ERROR");
      showEmsg(errorMessage, STATUS.ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div>
      <ToastContainer />
      <div className="flex items-center mb-6">
        <BackButton onClick={() => navigate('/browse', { state: { fromAttributeEdit: true } })} />
        <h2 className="text-xl font-bold text-gray-900">
          {isEditing
            ? t("PRODUCT_SETUP.ATTRIBUTES.EDIT_TITLE")
            : t("PRODUCT_SETUP.CREATE_ATTRIBUTES.CREATE_TITLE")}
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            <TextInputWithIcon
              label={t("PRODUCT_SETUP.CREATE_ATTRIBUTES.NAME_LABEL")}
              id="name"
              name="name"
              value={oFormData.name}
              onChange={handleInputChange}
              placeholder={t("PRODUCT_SETUP.CREATE_ATTRIBUTES.NAME_PLACEHOLDER")}
              error={oErrors.name}
              Icon={Tag}
            />
          </div>
          <div className="w-full md:w-1/2 form-field-group">
            <SelectWithIcon
              label={t("PRODUCT_SETUP.CREATE_ATTRIBUTES.TYPE_LABEL")}
              id="type"
              name="type"
              value={oFormData.type}
              onChange={handleInputChange}
              options={[
                {
                  value: "",
                  label: attributeTypesLoading 
                    ? t("COMMON.LOADING") 
                    : attributeTypesError 
                    ? t("COMMON.ERROR_LOADING_TYPES")
                    : t("PRODUCT_SETUP.CREATE_ATTRIBUTES.SELECT_TYPE"),
                },
                ...aAttributeTypes.map((type) => ({
                  value: type.attributeTypeID,
                  label: type.name,
                })),
              ]}
              Icon={Tag}
              error={oErrors.type}
              disabled={attributeTypesLoading}
              onInputChange={(value) => fetchAttributeTypes({ searchText: value })}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            <SelectWithIcon
              label={t("COMMON.STATUS")}
              id="status"
              name="status"
              value={oFormData.status}
              onChange={handleInputChange}
              options={[
                { value: "Active", label: t("COMMON.ACTIVE") },
                { value: "Inactive", label: t("COMMON.INACTIVE") },
              ]}
              Icon={Tag}
              error={oErrors.status}
            />
          </div>
          <div className="w-full md:w-1/2">
            <TextAreaWithIcon
              label={t("COMMON.DESCRIPTION")}
              id="description"
              name="description"
              value={oFormData.description}
              onChange={handleInputChange}
              placeholder={t(
                "PRODUCT_SETUP.CREATE_ATTRIBUTES.DESCRIPTION_PLACEHOLDER"
              )}
              error={oErrors.description}
              icon={Info}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 form-actions">
          <BackButton onClick={() => navigate('/browse', { state: { fromAttributeEdit: true } })}  className="btn-cancel" >
            {t("COMMON.CANCEL")}
          </BackButton>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
             {isEditing
                ? t("COMMON.SAVE_BUTTON")
                :  t("PRODUCT_SETUP.CREATE_ATTRIBUTES.CREATE_BUTTON")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAttribute;
