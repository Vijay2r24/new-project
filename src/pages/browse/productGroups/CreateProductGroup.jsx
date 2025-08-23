import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tag } from "lucide-react";
import TextInputWithIcon from "../../../components/TextInputWithIcon";
import SelectWithIcon from "../../../components/SelectWithIcon";
import BackButton from "../../../components/BackButton";
import { CREATE_OR_UPDATE_PRODUCT_GROUP, GET_PRODUCT_GROUPBY_ID } from "../../../contants/apiRoutes";
import { apiPost, apiGet } from "../../../utils/ApiUtils";
import { showEmsg } from "../../../utils/ShowEmsg";
import { STATUS } from "../../../contants/constants";
import Loader from "../../../components/Loader";
import { ToastContainer } from "react-toastify";
import { hideLoaderWithDelay } from "../../../utils/loaderUtils";

const CreateProductGroup = () => {
  const { id: groupId } = useParams();
  const isEditing = Boolean(groupId);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    ProductGroupName: "",
    ProductGroupCode: "",
    IsActive: "Active",
    ProductGroupID: ""
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing) return;

    const fetchGroupDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await apiGet(`${GET_PRODUCT_GROUPBY_ID}/${groupId}`, {}, token);

        const group = res?.data?.data?.productGroup;
        if (res.data.STATUS === STATUS.SUCCESS.toUpperCase() && group) {
          setFormData({
            ProductGroupName: group.ProductGroupName || "",
            ProductGroupCode: group.ProductGroupCode || "",
            IsActive: group.IsActive ? "Active" : "Inactive",
            ProductGroupID: group.ProductGroupID || ""
          });
        }
      } catch {
        showEmsg(t("COMMON.API_ERROR"), STATUS.ERROR);
      }
    };

    fetchGroupDetails();
  }, [groupId, t]);

  const handleInputChange = ({ target: { name, value } }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ProductGroupName.trim()) {
      newErrors.ProductGroupName = t("PRODUCT_SETUP.CREATE_PRODUCT_GROUP.NAME_ERROR");
    }

    if (!formData.ProductGroupCode.trim()) {
      newErrors.ProductGroupCode = t("PRODUCT_SETUP.CREATE_PRODUCT_GROUP.CODE_ERROR");
    }

    if (!formData.IsActive) {
      newErrors.IsActive = t("PRODUCT_SETUP.CREATE_PRODUCT_GROUP.STATUS_INVALID");
    }

    return newErrors;
  };

  const preparePayload = () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const tenantID = parseInt(localStorage.getItem("tenantID"));

    const payload = {
      ProductGroupName: formData.ProductGroupName,
      ProductGroupCode: formData.ProductGroupCode,
      TenantID: tenantID,
      IsActive: formData.IsActive === "Active",
      CreatedBy: userId,
    };

    if (isEditing) {
      payload.UpdatedBy = userId;
      payload.ProductGroupID = groupId;
    }

    return { payload, token };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      const { payload, token } = preparePayload();
      const res = await apiPost(CREATE_OR_UPDATE_PRODUCT_GROUP, payload, token);

      if (res.data.STATUS === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(res.data.MESSAGE, STATUS.SUCCESS, 3000, () => {
          navigate("/browse", { state: { fromProductGroupEdit: true } });
        });
      } else {
        showEmsg(res.data.MESSAGE, STATUS.WARNING);
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.MESSAGE || t("COMMON.API_ERROR");
      showEmsg(errorMessage, STATUS.ERROR);
    } finally {
      hideLoaderWithDelay(setSubmitting);
    }
  };

  return (
    <div className="w-full min-h-screen">
      {submitting && <div className="global-loader-overlay"><Loader /></div>}
      <ToastContainer />

      <div className="flex items-center mb-6">
        <BackButton onClick={() => navigate("/browse", { state: { fromProductGroupEdit: true } })} />
        <h2 className="text-xl font-bold text-gray-900">
          {isEditing
            ? t("PRODUCT_SETUP.CREATE_PRODUCT_GROUP.EDIT_TITLE")
            : t("PRODUCT_SETUP.CREATE_PRODUCT_GROUP.CREATE_TITLE")}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            <TextInputWithIcon
              label={t("PRODUCT_SETUP.CREATE_PRODUCT_GROUP.NAME_LABEL")}
              id="ProductGroupName"
              name="ProductGroupName"
              value={formData.ProductGroupName}
              onChange={handleInputChange}
              placeholder={t("PRODUCT_SETUP.CREATE_PRODUCT_GROUP.NAME_PLACEHOLDER")}
              error={errors.ProductGroupName}
              Icon={Tag}
            />
          </div>
          <div className="w-full md:w-1/2">
            <TextInputWithIcon
              label={t("PRODUCT_SETUP.CREATE_PRODUCT_GROUP.CODE_LABEL")}
              id="ProductGroupCode"
              name="ProductGroupCode"
              value={formData.ProductGroupCode}
              onChange={handleInputChange}
              placeholder={t("PRODUCT_SETUP.CREATE_PRODUCT_GROUP.CODE_PLACEHOLDER")}
              error={errors.ProductGroupCode}
              Icon={Tag}
            />
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <SelectWithIcon
            label={t("PRODUCT_SETUP.CREATE_PRODUCT_GROUP.STATUS_LABEL")}
            id="IsActive"
            name="IsActive"
            value={formData.IsActive}
            onChange={handleInputChange}
            options={[
              { value: "Active", label: t("COMMON.ACTIVE") },
              { value: "Inactive", label: t("COMMON.INACTIVE") }
            ]}
            Icon={Tag}
            error={errors.IsActive}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={() => navigate("/product-groups")} className="btn-cancel">
            {t("COMMON.CANCEL")}
          </button>
          <button type="submit" className="btn-primary">
            {isEditing ? t("COMMON.SAVE_BUTTON") : t("PRODUCT_SETUP.CREATE_PRODUCT_GROUP.CREATE_BUTTON")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductGroup;
