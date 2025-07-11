import { useState, useEffect } from "react";
import { ArrowLeft, Tag, Info, Palette } from "lucide-react";
import TextInputWithIcon from "../../../components/TextInputWithIcon";
import SelectWithIcon from "../../../components/SelectWithIcon";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { apiPost, apiGet, apiPut } from "../../../utils/ApiUtils";
import {
  CREATE_COLOUR,
  GET_COLOUR_BY_ID,
  UPDATE_COLOUR,
} from "../../../contants/apiRoutes";
import { showEmsg } from "../../../utils/ShowEmsg";
import { STATUS } from "../../../contants/constants";
import BackButton from "../../../components/BackButton";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const CreateColor = () => {
  const { id: colorId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!colorId;
  const [oFormData, setFormData] = useState({
    TenantID: "1",
    Name: "",
    HexCode: "#000000",
    IsActive: true,
    RgbCode: "",
    CreatedBy: "Admin",
    UpdatedBy: "Admin",
  });

  const [oErrors, setErrors] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    if (isEditing && colorId) {
      const fetchColorDetails = async () => {
        try {
          const token = localStorage.getItem("token");
          const oResponse = await apiGet(
            `${GET_COLOUR_BY_ID}/${colorId}`,
            {},
            token
          );
          if (
            oResponse.data.STATUS === STATUS.SUCCESS.toUpperCase() &&
            oResponse.data.data &&
            oResponse.data.data.data
          ) {
            const colorData = oResponse.data.data.data;
            setFormData((prev) => ({
              ...prev,
              Name: colorData.Name || "",
              HexCode: colorData.HexCode || "#000000",
              IsActive: colorData.Status === "Active",
              RgbCode: colorData.RgbCode || "",
              UpdatedBy: "Admin",
            }));
          } else {
          }
        } catch (err) {}
      };
      fetchColorDetails();
    }
  }, [colorId, isEditing]);

  const hexToRgb = (hex) => {
    if (!hex || typeof hex !== "string") return "";
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "HexCode") {
      setFormData((prev) => ({
        ...prev,
        RgbCode: hexToRgb(value),
      }));
    }
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

    if (!oFormData.Name.trim()) {
      newErrors.Name = t("PRODUCT_SETUP.CREATE_COLOR.ERRORS.NAME_REQUIRED");
    }
    if (!oFormData.HexCode.trim()) {
      newErrors.HexCode = t(
        "PRODUCT_SETUP.CREATE_COLOR.ERRORS.HEX_CODE_REQUIRED"
      );
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let oResponse;
      let payload;

      if (isEditing) {
        payload = {
          Name: oFormData.Name,
          HexCode: oFormData.HexCode,
          RgbCode: oFormData.RgbCode,
          Status: oFormData.IsActive ? "Active" : "Inactive",
          TenantID: 1,
        };
        oResponse = await apiPut(`${UPDATE_COLOUR}/${colorId}`, payload, token);
      } else {
        payload = {
          TenantID: oFormData.TenantID,
          Name: oFormData.Name,
          HexCode: oFormData.HexCode,
          IsActive: oFormData.IsActive,
          RgbCode: oFormData.RgbCode,
          CreatedBy: oFormData.CreatedBy,
        };
        oResponse = await apiPost(CREATE_COLOUR, payload, token);
      }

      if (oResponse.data.STATUS === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(oResponse.data.MESSAGE, STATUS.SUCCESS);
      } else {
        showEmsg(
          oResponse.data.MESSAGE,
          STATUS.WARNING
        );
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.MESSAGE || t("COMMON.API_ERROR");
      showEmsg(errorMessage, STATUS.ERROR);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="flex items-center mb-6">
        <BackButton
          onClick={() =>
            navigate("/browse", { state: { fromColorEdit: true } })
          }
        />
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
              error={
                oErrors.Name &&
                t("PRODUCT_SETUP.CREATE_COLOR.ERRORS.NAME_REQUIRED")
              }
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
                  id="colorPicker"
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
          <button
            type="button"
            onClick={() =>
              navigate("/browse", { state: { fromColorEdit: true } })
            }
            className="btn-cancel"
          >
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
