import { useState, useEffect } from "react";
import { Tag, Info, Hash } from "lucide-react";
import TextInputWithIcon from "../../../components/TextInputWithIcon";
import TextAreaWithIcon from "../../../components/TextAreaWithIcon";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { apiPost, apiGet} from "../../../utils/ApiUtils";
import {
  GET_ATTRIBUTE_TYPE_BY_ID,
  CREATE_OR_UPDATE_ATTRIBUTE_TYPE,
} from "../../../contants/apiRoutes";
import { showEmsg } from "../../../utils/ShowEmsg";
import { STATUS } from "../../../contants/constants";
import BackButton from "../../../components/BackButton";
import SelectWithIcon from "../../../components/SelectWithIcon";
import { ToastContainer } from "react-toastify";

const CreateAttributeType = () => {
  const { id: attributeTypeId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!attributeTypeId;

  const [oFormData, setFormData] = useState({
    AttributeTypeName: "",
    Code: "",
    AttributeTypeDescription: "",
    Status: true,
    TenantID: localStorage.getItem('tenantID'),
  });

  const [oErrors, setErrors] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    if (isEditing && attributeTypeId) {
      const fetchAttributeTypeDetails = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await apiGet(
            `${GET_ATTRIBUTE_TYPE_BY_ID}/${attributeTypeId}`,
            {},
            token
          );
          if (
            response.data.STATUS === STATUS.SUCCESS.toUpperCase() &&
            response.data.data &&
            response.data.data.data
          ) {
            const attributeTypeData = response.data.data.data;
            setFormData((prev) => ({
              ...prev,
              AttributeTypeName: attributeTypeData.Name || "",
              Code: attributeTypeData.Code || "",
              AttributeTypeDescription:
                attributeTypeData.AttributeTypeDescription || "",
              Status: attributeTypeData.Status === "Active",
            }));
          } else {
            showEmsg(
              response.data.MESSAGE ||
                t("PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.FETCH_ERROR"),
              STATUS.ERROR
            );
          }
        } catch (err) {
          const errorMessage =
            err?.response?.data?.MESSAGE || t("COMMON.API_ERROR");
          showEmsg(errorMessage, STATUS.ERROR);
        }
      };
      fetchAttributeTypeDetails();
    }
  }, [attributeTypeId, isEditing, t]);

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

    if (!oFormData.AttributeTypeName.trim()) {
      newErrors.AttributeTypeName = t(
        "PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.NAME_REQUIRED"
      );
    }
    if (!oFormData.Code.trim()) {
      newErrors.Code = t("PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.CODE_REQUIRED");
    }
    if (!oFormData.AttributeTypeDescription.trim()) {
      newErrors.AttributeTypeDescription = t(
        "PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.DESCRIPTION_REQUIRED"
      );
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let response;
      let payload;
      const userId = localStorage.getItem('userId');

      if (isEditing) {
        payload = {
          AttributeTypeID: attributeTypeId,
          TenantID: oFormData.TenantID,
          Name: oFormData.AttributeTypeName,
          Code: oFormData.Code,
          AttributeTypeDescription: oFormData.AttributeTypeDescription,
          Status: oFormData.Status ? "Active" : "Inactive",
          UpdatedBy: userId,
        };
      } else {
        payload = {
          TenantID: oFormData.TenantID,
          Name: oFormData.AttributeTypeName,
          Code: oFormData.Code,
          AttributeTypeDescription: oFormData.AttributeTypeDescription,
          Status: oFormData.Status ? "Active" : "Inactive",
          CreatedBy: userId,
        };
      }

      response = await apiPost(CREATE_OR_UPDATE_ATTRIBUTE_TYPE, payload, token);

      if (response.data.STATUS === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(
          response.data.MESSAGE,
          STATUS.SUCCESS,
          3000,
          async () => {
            navigate('/browse', { state: { fromAttributeTypeEdit: true } });
          }
        );
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

  return (
    <div>
      {isEditing && <ToastContainer />}
      <div className="flex items-center mb-6">
        <BackButton
          onClick={() =>
            navigate("/browse", { state: { fromAttributeTypeEdit: true } })
          }
        />
        <h2 className="text-xl font-bold text-gray-900">
          {isEditing
            ? t("PRODUCT_SETUP.ATTRIBUTE_TYPE.EDIT_TITLE")
            : t("PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.CREATE_TITLE")}
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            {/* Name */}
            <TextInputWithIcon
              label={t("PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.NAME_LABEL")}
              id="AttributeTypeName"
              name="AttributeTypeName"
              value={oFormData.AttributeTypeName}
              onChange={handleInputChange}
              placeholder={t(
                "PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.NAME_PLACEHOLDER"
              )}
              error={oErrors.AttributeTypeName}
              Icon={Tag}
            />
          </div>
          <div className="w-full md:w-1/2">
            {/* Code */}
            <TextInputWithIcon
              label="Code"
              id="Code"
              name="Code"
              value={oFormData.Code}
              onChange={handleInputChange}
              placeholder="Enter attribute code"
              error={oErrors.Code}
              Icon={Hash}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            {/* Status */}
            <SelectWithIcon
              label={t("PRODUCT_SETUP.CREATE_BRAND.STATUS_LABEL")}
              id="Status"
              name="Status"
              value={oFormData.Status}
              onChange={handleInputChange}
              options={[
                { value: true, label: t("COMMON.ACTIVE") },
                { value: false, label: t("COMMON.INACTIVE") },
              ]}
              Icon={Tag}
              error={oErrors.Status}
            />
          </div>
          <div className="w-full md:w-1/2">
            {/* Description */}
            <TextAreaWithIcon
              label={t("COMMON.DESCRIPTION")}
              id="AttributeTypeDescription"
              name="AttributeTypeDescription"
              value={oFormData.AttributeTypeDescription}
              onChange={handleInputChange}
              placeholder={t(
                "PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.DESCRIPTION_PLACEHOLDER"
              )}
              error={oErrors.AttributeTypeDescription}
              icon={Info}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() =>
              navigate("/browse", { state: { fromAttributeTypeEdit: true } })
            }
            className="btn-cancel"
          >
            {t("COMMON.CANCEL")}
          </button>
          <button type="submit" className="btn-primary">
            {isEditing
              ? t("COMMON.SAVE_BUTTON")
              : t("PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.CREATE_BUTTON")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAttributeType;
