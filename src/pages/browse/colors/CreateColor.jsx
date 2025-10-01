import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tag, Info, Palette } from "lucide-react";
import TextInputWithIcon from "../../../components/TextInputWithIcon";
import SelectWithIcon from "../../../components/SelectWithIcon";
import BackButton from "../../../components/BackButton";
import Loader from "../../../components/Loader";
import { ToastContainer } from "react-toastify";

import { CREATE_COLOUR } from "../../../contants/apiRoutes";
import { STATUS,STATUS_VALUES, STATUS_OPTIONS } from "../../../contants/constants";
import { apiPost } from "../../../utils/ApiUtils";
import { showEmsg } from "../../../utils/ShowEmsg";
import { hideLoaderWithDelay } from "../../../utils/loaderUtils";

const CreateColor = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const token = localStorage.getItem("token");
  const tenantID = localStorage.getItem("tenantID");
  const userId = localStorage.getItem("userId");

  const [oFormData, setFormData] = useState({
    TenantID: tenantID,
    Name: "",
    HexCode: "#000000",
    IsActive: true,
    RgbCode: "",
    CreatedBy: userId || "Admin",
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

  const handleInputChange = useCallback(
    (e) => {
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
    },
    [oErrors]
  );

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
      IsActive: oFormData.IsActive,
      CreatedBy: userId || "Admin",
    };

    try {
      const response = await apiPost(CREATE_COLOUR, payload, token);

      if (response.data.status === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(response.data.message, STATUS.SUCCESS, 3000, () => {
          navigate("/browse", { state: { fromColorEdit: true } })
        });
      } else {
        showEmsg(response.data.message, STATUS.WARNING);
      }
    } catch (err) {
      showEmsg(err?.response?.data?.MESSAGE || t("COMMON.API_ERROR"), STATUS.ERROR);
    } finally {
      hideLoaderWithDelay(setSubmitting);
    }
  };
 
  const statusOptions = STATUS_OPTIONS.filter(option => option.value !== STATUS_VALUES.ALL)
    .map(option => ({
      value: option.value,
      label: t(option.labelKey)
    }));
  const handleCancel = () =>
        navigate("/browse", { state: { fromColorEdit: true } });
  return (
    <div>
      {submitting && (
        <div className="global-loader-overlay">
          <Loader />
        </div>
      )}
      <ToastContainer />

      <div className="flex items-center mb-6">
        <BackButton onClick={handleCancel} />
        <h2 className="text-xl font-bold text-gray-900">
          {t("PRODUCT_SETUP.CREATE_COLOR.CREATE_TITLE")}
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
              options={statusOptions}
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
            {t("PRODUCT_SETUP.CREATE_COLOR.CREATE_BUTTON")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateColor;
