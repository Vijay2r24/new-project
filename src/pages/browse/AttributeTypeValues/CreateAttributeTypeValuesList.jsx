import { useState, useEffect, useCallback } from "react";
import { Tag, Info } from "lucide-react";
import TextInputWithIcon from "../../../components/TextInputWithIcon";
import SelectWithIcon from "../../../components/SelectWithIcon";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchResource, clearResourceError } from "../../../store/slices/allDataSlice";
import { apiGet, apiPost } from "../../../utils/ApiUtils";
import {
  GET_ATTRIBUTE_BY_ID,
  CREATE_OR_UPDATE_ATTRIBUTE_VALUE,
} from "../../../contants/apiRoutes";
import { showEmsg } from "../../../utils/ShowEmsg";
import { STATUS, STATUS_VALUES, STATUS_OPTIONS } from "../../../contants/constants";
import BackButton from "../../../components/BackButton";
import { ToastContainer } from "react-toastify";
import Loader from "../../../components/Loader";
import { hideLoaderWithDelay } from "../../../utils/loaderUtils";

const CreateAttribute = () => {
  const { t } = useTranslation();
  const { id: attributeValueId } = useParams(); 
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditing = Boolean(attributeValueId);

  const tenantID = localStorage.getItem("tenantID");
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const [oFormData, setFormData] = useState({
    Value: "",
    Unit: "",
    AttributeTypeID: "",
    TenantID: tenantID,
    IsActive: STATUS_VALUES.BOOLEAN_ACTIVE,
  });

  const [oErrors, setErrors] = useState({});
  const [bSubmitting, setSubmitting] = useState(false);

  // Redux state for attribute types
  const attributeTypesState = useSelector((state) => state.allData.resources.attributeTypes);
  const aAttributeTypes = attributeTypesState?.data || [];
  const attributeTypesLoading = attributeTypesState?.loading || false;
  const attributeTypesError = attributeTypesState?.error;

  const goBackToBrowse = () => {
    navigate("/browse", { state: { fromAttributeEdit: true } });
  };

  const fetchAttributeDetails = useCallback(async () => {
    setSubmitting(true);
    try {
      const response = await apiGet(
        `${GET_ATTRIBUTE_BY_ID}/${attributeValueId}`,
        {},
        token
      );
      if (
        response.data.status === STATUS.SUCCESS.toUpperCase() &&
        response.data.data
      ) {
        const attributeData = response.data.data;
        setFormData((prev) => ({
          ...prev,
          Value: attributeData.Value || "",
          Unit: attributeData.Unit || "",
          AttributeTypeID: attributeData.AttributeTypeID || "",
          TenantID: tenantID,
          IsActive: attributeData.IsActive,
        }));
      } else {
        showEmsg(response.data.message || t("COMMON.ERROR"), STATUS.WARNING);
      }
    } catch (err) {
      console.error(err);
      showEmsg(
        err?.response?.data?.message || t("COMMON.API_ERROR"),
        STATUS.ERROR
      );
    } finally {
      hideLoaderWithDelay(setSubmitting);
    }
  }, [attributeValueId, token, tenantID, t]);

  useEffect(() => {
    // Fetch attribute types on component mount
    dispatch(fetchResource({ key: "attributeTypes", params: {} }));

    if (isEditing && attributeValueId) {
      fetchAttributeDetails();
    }

    // Cleanup errors on unmount
    return () => {
      if (attributeTypesError) {
        dispatch(clearResourceError("attributeTypes"));
      }
    };
  }, [dispatch, isEditing, attributeValueId, fetchAttributeDetails, attributeTypesError]);

  /** Input change */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (oErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /** Validation */
  const validateForm = () => {
    const errors = {};
    const { Value, AttributeTypeID } = oFormData;

    if (!Value?.trim()) {
      errors.Value = t("PRODUCT_SETUP.CREATE_ATTRIBUTES.NAME_REQUIRED");
    }
    if (!AttributeTypeID) {
      errors.AttributeTypeID = t("PRODUCT_SETUP.CREATE_ATTRIBUTES.TYPE_REQUIRED");
    }

    return errors;
  };

  /** Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    setSubmitting(true);

    const payload = {
      TenantID: tenantID,
      Value: oFormData.Value,
      Unit: oFormData.Unit,
      AttributeTypeID: oFormData.AttributeTypeID,
      IsActive: oFormData.IsActive,
      ...(isEditing
        ? { AttributeValueID: attributeValueId, UpdatedBy: userId }
        : { CreatedBy: userId }),
    };

    try {
      const response = await apiPost(CREATE_OR_UPDATE_ATTRIBUTE_VALUE, payload, token);
      if (response.data.status === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(response.data.message, STATUS.SUCCESS, 3000, goBackToBrowse);
      } else {
        showEmsg(response.data.message || t("COMMON.ERROR"), STATUS.ERROR);
      }
    } catch (err) {
      showEmsg(
        err?.response?.data?.message || t("COMMON.API_ERROR"),
        STATUS.ERROR
      );
    } finally {
      hideLoaderWithDelay(setSubmitting);
    }
  };

  // Prepare attribute types options with proper field mapping
  const attributeTypeOptions = [
    {
      value: "",
      label: attributeTypesLoading
        ? t("COMMON.LOADING")
        : attributeTypesError
        ? t("COMMON.ERROR")
        : t("PRODUCT_SETUP.CREATE_ATTRIBUTES.SELECT_TYPE"),
    },
    ...aAttributeTypes.map((type) => ({
      value: type.AttributeTypeID, 
      label: type.Name, 
    })),
  ];

  // Filter STATUS_OPTIONS to exclude the "ALL" option and map to component format
  const statusOptions = STATUS_OPTIONS.filter(option => option.value !== STATUS_VALUES.ALL)
    .map(option => ({
      value: option.value ? "Active" : "Inactive",
      label: t(option.labelKey)
    }));

  return (
    <div>
      {bSubmitting && (
        <div className="global-loader-overlay">
          <Loader />
        </div>
      )}

      <ToastContainer />

      <div className="flex items-center mb-6">
        <BackButton onClick={goBackToBrowse} />
        <h2 className="text-xl font-bold text-gray-900">
          {isEditing
            ? t("PRODUCT_SETUP.ATTRIBUTES.EDIT_TITLE")
            : t("PRODUCT_SETUP.CREATE_ATTRIBUTES.CREATE_TITLE")}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Value + Unit */}
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            <TextInputWithIcon
              label={t("PRODUCT_SETUP.CREATE_ATTRIBUTES.NAME_LABEL")}
              id="Value"
              name="Value"
              value={oFormData.Value}
              onChange={handleInputChange}
              placeholder={t("PRODUCT_SETUP.CREATE_ATTRIBUTES.NAME_PLACEHOLDER")}
              error={oErrors.Value}
              Icon={Tag}
            />
          </div>
          <div className="w-full md:w-1/2">
            <TextInputWithIcon
              label={t("COMMON.UNIT")}
              id="Unit"
              name="Unit"
              value={oFormData.Unit}
              onChange={handleInputChange}
              placeholder={t("COMMON.UNIT")}
              error={oErrors.Unit}
              Icon={Info}
            />
          </div>
        </div>

        {/* Attribute Type + Status */}
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            <SelectWithIcon
              label={t("PRODUCT_SETUP.CREATE_ATTRIBUTES.TYPE_LABEL")}
              id="AttributeTypeID"
              name="AttributeTypeID"
              value={oFormData.AttributeTypeID}
              onChange={handleInputChange}
              options={attributeTypeOptions}
              Icon={Tag}
              error={oErrors.AttributeTypeID}
              disabled={attributeTypesLoading}
              onInputChange={(value) => {
                if (value && value.length >= 2) {
                  dispatch(fetchResource({ 
                    key: "attributeTypes", 
                    params: { 
                      searchText: value
                    } 
                  }));
                } else if (!value) {
                  // Fetch all if search is cleared
                  dispatch(fetchResource({ 
                    key: "attributeTypes"
                  }));
                }
              }}
            />
          </div>

          <div className="w-full md:w-1/2">
            <SelectWithIcon
              label={t("COMMON.STATUS")}
              id="IsActive"
              name="IsActive"
              value={oFormData.IsActive ? "Active" : "Inactive"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  IsActive: e.target.value === "Active",
                }))
              }
              options={statusOptions}
              Icon={Tag}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <BackButton onClick={goBackToBrowse} className="btn-cancel">
            {t("COMMON.CANCEL")}
          </BackButton>
          <button type="submit" className="btn-primary" disabled={bSubmitting}>
            {isEditing ? t("COMMON.SAVE_BUTTON") :t("PRODUCT_SETUP.CREATE_ATTRIBUTES.CREATE_TITLE")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAttribute;