import { useState, useEffect } from "react";
import { Tag, ArrowLeft, Info } from "lucide-react";
import TextInputWithIcon from "../../../components/TextInputWithIcon";
import SelectWithIcon from "../../../components/SelectWithIcon";
import TextAreaWithIcon from "../../../components/TextAreaWithIcon";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { showEmsg } from "../../../utils/ShowEmsg";
import {
  useAttributes,
  useAttributeTypes,
} from "../../../context/AllDataContext";
import { STATUS } from "../../../contants/constants";
import BackButton from '../../../components/BackButton';

const CreateAttribute = ({ setViewMode }) => {
  const { id: attributeId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!attributeId;
  const [oFormData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    TenantID: "1",
  });
  const { t } = useTranslation();
  const [oErrors, setErrors] = useState({});
  const {
    data: aAttributeTypes = [],
    loading: attributeTypesLoading,
    error: attributeTypesError,
  } = useAttributeTypes();
  const {
    create: createAttribute,
    update: updateAttribute,
    loading: isSubmitting,
    error: submissionError,
  } = useAttributes();

  useEffect(() => {
    if (isEditing && attributeId) {
      const fetchAttributeDetails = async () => {};
      fetchAttributeDetails();
    }
  }, [attributeId, isEditing]);

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
      !aAttributeTypes.some((type) => type.AttributeTypeID === oFormData.type)
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
      Name: oFormData.name,
      AttributeTypeID: oFormData.type,
      Description: oFormData.description,
    };

    const handleResponse = (response) => {
      if (response.status === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(response.message, STATUS.SUCCESS);
        navigate("/browse", { state: { fromAttributeEdit: true } });
      } else {
        showEmsg(response.message ,STATUS.ERROR);
      }
    };

    if (isEditing) {
      updateAttribute(attributeId, payload).then(handleResponse);
    } else {
      createAttribute(payload).then(handleResponse);
    }
  };

  return (
    <div>
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
                  label: t("PRODUCT_SETUP.CREATE_ATTRIBUTES.SELECT_TYPE"),
                },
                ...aAttributeTypes.map((type) => ({
                  value: type.AttributeTypeID,
                  label: type.Name,
                })),
              ]}
              Icon={Tag}
              error={oErrors.type}
            />
          </div>
        </div>
        <div className="w-full form-section">
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
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 form-actions">
          <BackButton onClick={() => navigate('/browse', { state: { fromAttributeEdit: true } })} className="btn-cancel" >
            {t("COMMON.CANCEL")}
          </BackButton>
          <button
            type="submit"
            className="btn-secondry"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEditing
                ? t("COMMON.SAVING")
                : t("COMMON.CREATING")
              : isEditing
              ? t("PRODUCT_SETUP.CREATE_ATTRIBUTES.SAVE_BUTTON")
              : t("PRODUCT_SETUP.CREATE_ATTRIBUTES.CREATE_BUTTON")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAttribute;
