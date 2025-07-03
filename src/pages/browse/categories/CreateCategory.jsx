import { useState, useEffect } from 'react';
import { ArrowLeft, Tag, Info, CheckCircle, Image, X } from 'lucide-react';
import TextInputWithIcon from '../../../components/TextInputWithIcon';
import SelectWithIcon from '../../../components/SelectWithIcon';
import { useTranslation } from 'react-i18next';
import TextAreaWithIcon from '../../../components/TextAreaWithIcon';
import { useParams, useNavigate } from 'react-router-dom';
import { apiPost, apiGet, apiPut } from '../../../utils/ApiUtils';
import { createCategory, getCategoryById, updateCategoryById } from '../../../contants/apiRoutes';
import { useCategories } from '../../../context/AllDataContext';
import { ToastContainer } from 'react-toastify';
import { showEmsg } from '../../../utils/ShowEmsg';
import { STATUS } from '../../../contants/constants';
import BackButton from '../../../components/BackButton';

const CreateCategory = () => {
  const { id: categoryId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isEditing = !!categoryId;
  const categories = useCategories();
  const aCategories = categories.data || [];
  const bLoadingCategories = categories.loading;
  const sErrorCategories = categories.error;

  const [oFormData, setFormData] = useState({
    TenantID: '1',
    CategoryName: '',
    CategoryImage: null,
    IsActive: true,
    CategoryDescription: '',
    ParentCategoryID: '',
    CreatedBy: 'Admin',
    UpdatedBy: 'Admin',
    Heading: ''
  });

  const [oErrors, setErrors] = useState({});
  const [sImagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (isEditing && categoryId && !bLoadingCategories) {
      const fetchCategoryDetails = async () => {
        try {
          const token = localStorage.getItem("token");
          const oResponse = await apiGet(`${getCategoryById}/${categoryId}`, {}, token);
          if (oResponse.data.status === STATUS.SUCCESS.toUpperCase() && oResponse.data.Data) {
            const categoryData = oResponse.data.Data;
            setFormData(prev => ({
              ...prev,
              TenantID: categoryData.TenantID || '1',
              CategoryName: categoryData.CategoryName || '',
              CategoryImage: categoryData.CategoryImage || null,
              IsActive: categoryData.IsActive === true,
              CategoryDescription: categoryData.CategoryDescription || '',
              ParentCategoryID: categoryData.ParentCategoryID || '',
              CreatedBy: categoryData.CreatedBy || 'Admin',
              UpdatedBy: 'Admin',
              Heading: categoryData.Heading || ''
            }));
            if (categoryData.CategoryImage) {
              setImagePreview(categoryData.CategoryImage);
            }
          } else {
            showEmsg(t('PRODUCT_SETUP.CREATE_CATEGORY.UNKNOWN_ERROR'), STATUS.ERROR);
            setErrors(prev => ({ ...prev, api: t('PRODUCT_SETUP.CREATE_CATEGORY.UNKNOWN_ERROR') }));
          }
        } catch (err) {
          showEmsg(t('PRODUCT_SETUP.CREATE_CATEGORY.UNEXPECTED_ERROR'), STATUS.ERROR);
          setErrors(prev => ({ ...prev, api: t('PRODUCT_SETUP.CREATE_CATEGORY.UNEXPECTED_ERROR') }));
        }
      };
      fetchCategoryDetails();
    }
  }, [categoryId, isEditing, bLoadingCategories, t]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (oErrors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          CategoryImage: t("PRODUCT_SETUP.CREATE_CATEGORY.IMAGE_ERROR")
        }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        CategoryImage: file
      }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData(prev => ({ ...prev, CategoryImage: null }));
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    if (sImagePreview && sImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(sImagePreview);
    }
    setFormData(prev => ({ ...prev, CategoryImage: null }));
    setImagePreview(null);
    setErrors(prev => ({ ...prev, CategoryImage: '' })); 
  };

  useEffect(() => {
    return () => {
      if (sImagePreview && sImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(sImagePreview);
      }
    };
  }, [sImagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!oFormData.CategoryName.trim()) {
      newErrors.CategoryName = t("PRODUCT_SETUP.CREATE_CATEGORY.NAME_ERROR");
    }
    if (!oFormData.Heading.trim()) {
      newErrors.Heading = t('PRODUCT_SETUP.CREATE_CATEGORY.HEADING_REQUIRED');
    }
    if (!oFormData.CategoryImage && !isEditing) {
      newErrors.CategoryImage = t("PRODUCT_SETUP.CREATE_CATEGORY.IMAGE_REQUIRED");
    }

    if (!oFormData.ParentCategoryID && !isEditing) {
      newErrors.ParentCategoryID = t("PRODUCT_SETUP.CREATE_CATEGORY.PARENT_CATEGORY_REQUIRED");
    }

    if (oFormData.CategoryDescription.trim().length < 10) {
      newErrors.CategoryDescription = t("PRODUCT_SETUP.CREATE_CATEGORY.DESCRIPTION_MIN_LENGTH");
    }
    if (oFormData.CategoryDescription.trim().length > 500) {
      newErrors.CategoryDescription = t("PRODUCT_SETUP.CREATE_CATEGORY.DESCRIPTION_MAX_LENGTH");
    }

    if (typeof oFormData.IsActive !== 'boolean') {
      newErrors.IsActive = t("PRODUCT_SETUP.CREATE_CATEGORY.STATUS_INVALID");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append('TenantID', oFormData.TenantID);
    dataToSend.append('CategoryName', oFormData.CategoryName);
    dataToSend.append('IsActive', oFormData.IsActive ? 'true' : 'false');
    dataToSend.append('CategoryDescription', oFormData.CategoryDescription);
    dataToSend.append('Heading', oFormData.Heading);
    if (oFormData.ParentCategoryID) {
      dataToSend.append('ParentCategoryID', oFormData.ParentCategoryID);
    }

    if (oFormData.CategoryImage) {
      dataToSend.append('UploadCategoryImages', oFormData.CategoryImage);
      console.log("UploadCategoryImages",oFormData.CategoryImage)
    }

    try {
      const token = localStorage.getItem("token");
      let oResponse;
      if (isEditing) {
        oResponse = await apiPut(`${updateCategoryById}/${categoryId}`, dataToSend, token);
      } else {
        oResponse = await apiPost(createCategory, dataToSend, token);
      }

      if (oResponse.data.status === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(oResponse.data.message || t('COMMON.SAVE'), STATUS.SUCCESS);
        navigate('/browse/categories', { state: { fromCategoryEdit: true } });
      } else {
        showEmsg(oResponse.data.message || t('PRODUCT_SETUP.CREATE_CATEGORY.UNKNOWN_ERROR'), STATUS.ERROR);
        setErrors(prev => ({ ...prev, api: oResponse.data.message || t('PRODUCT_SETUP.CREATE_CATEGORY.UNKNOWN_ERROR') }));
      }
    } catch (err) {
      showEmsg(t('PRODUCT_SETUP.CREATE_CATEGORY.UNEXPECTED_ERROR'), STATUS.ERROR);
      setErrors(prev => ({ ...prev, api: t('PRODUCT_SETUP.CREATE_CATEGORY.UNEXPECTED_ERROR') }));
    }
  };

  return (
    <div className="w-full min-h-screen">
      <ToastContainer />
      <div className="flex items-center mb-6">
        <BackButton onClick={() => navigate('/browse', { state: { fromCategoryEdit: true } })} />
        <h2 className="text-xl font-bold text-gray-900">{isEditing ? t("PRODUCT_SETUP.CREATE_CATEGORY.EDIT_TITLE") : t("PRODUCT_SETUP.CREATE_CATEGORY.CREATE_TITLE")}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            <TextInputWithIcon
              label={t("PRODUCT_SETUP.CREATE_CATEGORY.NAME_LABEL")}
              id="CategoryName"
              name="CategoryName"
              value={oFormData.CategoryName}
              onChange={handleInputChange}
              placeholder={t("PRODUCT_SETUP.CREATE_CATEGORY.NAME_PLACEHOLDER")}
              error={oErrors.CategoryName}
              Icon={Tag}
            />
          </div>
          <div className="w-full md:w-1/2">
            <TextInputWithIcon
              label={t("COMMON.HEADING_LABEL") || t("COMMON.TITLE")}
              id="Heading"
              name="Heading"
              value={oFormData.Heading}
              onChange={handleInputChange}
              placeholder={t("PRODUCT_SETUP.CREATE_CATEGORY.HEADING_PLACE") || "Enter heading for the category"}
              error={oErrors.Heading}
              Icon={Info}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            <SelectWithIcon
              label={t("PRODUCT_SETUP.CREATE_CATEGORY.PARENT_LABEL")}
              id="ParentCategoryID"
              name="ParentCategoryID"
              value={oFormData.ParentCategoryID}
              onChange={handleInputChange}
              options={aCategories.map(cat => ({
                value: cat.CategoryID,
                label: cat.CategoryName
              }))}
              loading={bLoadingCategories}
              error={oErrors.ParentCategoryID || sErrorCategories}
              placeholder={t("PRODUCT_SETUP.CREATE_CATEGORY.SELECT_PARENT")}
              Icon={Tag}
            />
          </div>
          <div className="w-full md:w-1/2">
            <SelectWithIcon
              label={t("PRODUCT_SETUP.CREATE_CATEGORY.STATUS_LABEL")}
              id="IsActive"
              name="IsActive"
              value={oFormData.IsActive}
              onChange={handleInputChange}
              options={[
                { value: true, label: t('COMMON.ACTIVE') },
                { value: false, label: t('COMMON.INACTIVE') }
              ]}
              Icon={Tag}
              error={oErrors.IsActive}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("PRODUCT_SETUP.CREATE_CATEGORY.IMAGE_LABEL")}
            </label>
            <div
              className={`relative group rounded-xl border-2 ${oErrors.CategoryImage ? 'border-red-300' : 'border-gray-200'} border-dashed transition-all duration-200 hover:border-custom-bg bg-gray-50 hover:bg-gray-50/50`}
            >
              <div className="p-6">
                <div className="space-y-3 text-center">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-white shadow-sm border border-gray-100">
                      <Image className="h-8 w-8 text-gray-400 group-hover:text-[#5B45E0] transition-colors duration-200" />
                    </div>
                  </div>
                  <div className="flex text-sm text-muted justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-[#5B45E0] hover:text-[#4c39c7] focus-within:outline-none"
                    >
                      <span>{t("COMMON.UPLOAD")}</span>
                      <input
                        id="file-upload"
                        name="CategoryImage"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">{t("COMMON.DRAG_DROP_TEXT")}</p>
                  </div>
                  {sImagePreview && (
                    <div className="mt-4 flex justify-center relative group">
                      <img src={sImagePreview} alt="Category Preview" className="max-h-32 max-w-full rounded-md" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {oFormData.CategoryImage && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 mr-1.5 text-green-600" />
                      <p className="text-sm text-green-600 truncate">
                        {typeof oFormData.CategoryImage === 'string' ? oFormData.CategoryImage.split('/').pop() : oFormData.CategoryImage.name}
                      </p>
                    </div>
                  )}
                  {oErrors.CategoryImage && (
                    <p className="text-sm text-red flex items-center justify-center">
                      <span className="mr-1">⚠️</span>
                      {oErrors.CategoryImage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <TextAreaWithIcon
              label={t("COMMON.DESCRIPTION")}
              name="CategoryDescription"
              value={oFormData.CategoryDescription}
              onChange={handleInputChange}
              placeholder={t("PRODUCT_SETUP.CREATE_CATEGORY.DESCRIPTION_PLACEHOLDER")}
              icon={Info}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/browse/categories', { state: { fromCategoryEdit: true } })}
            className="btn-cancel"
          >
            {t("COMMON.CANCEL")}
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
             {isEditing ? t("COMMON.SAVE_BUTTON") : (t("PRODUCT_SETUP.CREATE_CATEGORY.CREATE_BUTTON"))}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory; 