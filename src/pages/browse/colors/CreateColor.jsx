import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Tag, Info, Palette } from "lucide-react";
import TextInputWithIcon from "../../../components/TextInputWithIcon";
import SelectWithIcon from "../../../components/SelectWithIcon";
import BackButton from "../../../components/BackButton";
import Loader from "../../../components/Loader";
import { ToastContainer } from "react-toastify";

import {
  CREATE_COLOUR,
  GET_COLOUR_BY_ID,
  UPDATE_COLOUR,
} from "../../../contants/apiRoutes";
import { STATUS } from "../../../contants/constants";
import { apiPost, apiGet, apiPut } from "../../../utils/ApiUtils";
import { showEmsg } from "../../../utils/ShowEmsg";
import { hideLoaderWithDelay } from "../../../utils/loaderUtils";

const CreateColor = () => {
  const { id: colorId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isEditing = !!colorId;
  const token = localStorage.getItem("token");
  const tenantID = localStorage.getItem("tenantID");
  const userId = localStorage.getItem("userId");

  const [oFormData, setFormData] = useState({
    TenantID: tenantID,
    Name: "",
    HexCode: "#000000",
    IsActive: true,
    RgbCode: "",
    CreatedBy: "Admin",
    UpdatedBy: "Admin",
  });

  const [oErrors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const hexToRgb = (hex) => {
    if (!hex || typeof hex !== "string") return "";
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
  };

  useEffect(() => {
    const fetchColorDetails = async () => {
      try {
        const response = await apiGet(`${GET_COLOUR_BY_ID}/${colorId}`, {}, token);
        const colorData = response?.data?.data?.data;

        if (response.data.STATUS === STATUS.SUCCESS.toUpperCase() && colorData) {
          setFormData((prev) => ({
            ...prev,
            Name: colorData.Name || "",
            HexCode: colorData.HexCode || "#000000",
            IsActive: colorData.Status === "Active",
            RgbCode: colorData.RgbCode || "",
            UpdatedBy: "Admin",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch color details", err);
      }
    };

    if (isEditing && colorId) fetchColorDetails();
  }, [colorId, isEditing, token]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
      ...(name === "HexCode" && { RgbCode: hexToRgb(value) }),
    }));

    if (oErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }, [oErrors]);

  const validateForm = () => {
    const errors = {};
    if (!oFormData.Name.trim()) {
      errors.Name = t("PRODUCT_SETUP.CREATE_COLOR.ERRORS.NAME_REQUIRED");
    }
    if (!oFormData.HexCode.trim()) {
      errors.HexCode = t("PRODUCT_SETUP.CREATE_COLOR.ERRORS.HEX_CODE_REQUIRED");
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    setSubmitting(true);
    const payload = {
      Name: oFormData.Name,
      HexCode: oFormData.HexCode,
      RgbCode: oFormData.RgbCode,
      TenantID: oFormData.TenantID,
      ...(isEditing
        ? { Status: oFormData.IsActive ? "Active" : "Inactive", UpdatedBy: userId }
        : { IsActive: oFormData.IsActive, CreatedBy: userId }),
    };

    try {
      const apiCall = isEditing
        ? apiPut(`${UPDATE_COLOUR}/${colorId}`, payload, token)
        : apiPost(CREATE_COLOUR, payload, token);

      const response = await apiCall;

      if (response.data.STATUS === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(response.data.MESSAGE, STATUS.SUCCESS, 3000, () => {
          navigate("/browse", { state: { fromColorEdit: true } });
        });
      } else {
        showEmsg(response.data.MESSAGE, STATUS.WARNING);
      }
    } catch (err) {
      showEmsg(err?.response?.data?.MESSAGE || t("COMMON.API_ERROR"), STATUS.ERROR);
    } finally {
      hideLoaderWithDelay(setSubmitting);
    }
  };

  const handleCancel = () =>
    navigate("/browse", { state: { fromColorEdit: true } });

  return (
    <div>
      {submitting && <div className="global-loader-overlay"><Loader /></div>}
      {isEditing && <ToastContainer />}

      <div className="flex items-center mb-6">
        <BackButton onClick={handleCancel} />
        <h2 className="text-xl font-bold text-gray-900">
          {isEditing
            ? t("PRODUCT_SETUP.CREATE_COLOR.EDIT_TITLE")
            : t("PRODUCT_SETUP.CREATE_COLOR.CREATE_TITLE")}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            <TextInputWithIcon
              label={t("PRODUCT_SETUP.CREATE_COLOR.NAME_LABEL")}
              id="Name"
              name="Name"
              value={oFormData.Name}
              onChange={handleInputChange}
              placeholder={t("PRODUCT_SETUP.CREATE_COLOR.NAME_PLACEHOLDER")}
              error={oErrors.Name}
              Icon={Tag}
            />
          </div>
          <div className="w-full md:w-1/2 mt-4 md:mt-0">
            <TextInputWithIcon
              label={t("PRODUCT_SETUP.CREATE_COLOR.HEX_CODE_LABEL")}
              id="HexCode"
              name="HexCode"
              value={oFormData.HexCode}
              onChange={handleInputChange}
              placeholder={t("PRODUCT_SETUP.CREATE_COLOR.HEX_CODE_PLACEHOLDER")}
              error={oErrors.HexCode}
              Icon={Palette}
              inputSlot={
                <input
                  type="color"
                  name="HexCode"
                  value={oFormData.HexCode}
                  onChange={handleInputChange}
                  className="h-10 w-10 rounded-lg border border-gray-200 cursor-pointer"
                  style={{ minWidth: 40, minHeight: 40, padding: 0 }}
                />
              }
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            <SelectWithIcon
              label={t("PRODUCT_SETUP.CREATE_COLOR.STATUS_LABEL")}
              id="IsActive"
              name="IsActive"
              value={oFormData.IsActive}
              onChange={handleInputChange}
              options={[
                { value: true, label: t("COMMON.ACTIVE") },
                { value: false, label: t("COMMON.INACTIVE") },
              ]}
              Icon={Tag}
              error={oErrors.IsActive}
            />
          </div>
          <div className="w-full md:w-1/2 mt-4 md:mt-0">
            <TextInputWithIcon
              label="RGB Code"
              id="RgbCode"
              name="RgbCode"
              value={oFormData.RgbCode}
              onChange={handleInputChange}
              placeholder="e.g., rgb(255, 0, 0)"
              error={oErrors.RgbCode}
              Icon={Info}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={handleCancel} className="btn-cancel">
            {t("COMMON.CANCEL")}
          </button>
          <button type="submit" className="btn-primary">
            {isEditing
              ? t("COMMON.SAVE_BUTTON")
              : t("PRODUCT_SETUP.CREATE_COLOR.CREATE_BUTTON")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateColor;
