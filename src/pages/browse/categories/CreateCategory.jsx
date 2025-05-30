import { useState } from 'react';
import { ArrowLeft, Tag, Info, CheckCircle, Image } from 'lucide-react';
import TextInputWithIcon from '../../../components/TextInputWithIcon';
import SelectWithIcon from '../../../components/SelectWithIcon';
import { useTranslation } from 'react-i18next';
import TextAreaWithIcon from '../../../components/TextAreaWithIcon';
const CreateCategory = ({ setViewMode }) => {
  const [oFormData, setFormData] = useState({
    name: '',
    image: null,
    status: 'active',
    description: '',
    parentCategory: ''
  });

  const [oErrors, setErrors] = useState({});
  const { t } = useTranslation();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
          image: t("productSetup.createCategory.imageError")
        }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!oFormData.name.trim()) {
      newErrors.name = t("productSetup.createCategory.nameError");
    }
    if (!oFormData.image) {
      newErrors.image = t("productSetup.createCategory.imageRequired");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  };

  return (
    <div className="w-full min-h-screen">
      <div className="flex items-center mb-6">
        <button
          onClick={() => setViewMode('list')}
          className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">{t("productSetup.createCategory.createTitle")}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            {/* Category Name */}
            <TextInputWithIcon
              label={t("productSetup.createCategory.nameLabel")}
              id="name"
              name="name"
              value={oFormData.name}
              onChange={handleInputChange}
              placeholder={t("productSetup.createCategory.namePlaceholder")}
              error={oErrors.name}
              Icon={Tag}
            />
          </div>
          {/* Parent Category */}
          <div className="w-full md:w-1/2">
            <SelectWithIcon
              label={t("productSetup.createCategory.parentLabel")}
              id="parentCategory"
              name="parentCategory"
              value={oFormData.parentCategory}
              onChange={handleInputChange}
              options={[
                { value: '', label: t("productSetup.createCategory.selectParent") },
              ]}
              Icon={Tag}
              error={oErrors.parentCategory}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:space-x-4">

          {/* Category Image */}
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("productSetup.createCategory.imageLabel")}
            </label>
            <div
              className={`relative group rounded-xl border-2 ${oErrors.image ? 'border-red-300' : 'border-gray-200'} border-dashed transition-all duration-200 hover:border-custom-bg bg-gray-50 hover:bg-gray-50/50`}
            >
              <div className="p-6">
                <div className="space-y-3 text-center">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-white shadow-sm border border-gray-100">
                      <Image className="h-8 w-8 text-gray-400 group-hover:text-[#5B45E0] transition-colors duration-200" />
                    </div>
                  </div>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-[#5B45E0] hover:text-[#4c39c7] focus-within:outline-none"
                    >
                      <span>{t("productSetup.createCategory.uploadText")}</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">{t("productSetup.createCategory.dragDropText")}</p>
                  </div>
                  {oFormData.image && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-sm text-green-600 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        {oFormData.image.name}
                      </p>
                    </div>
                  )}
                  {oErrors.image && (
                    <p className="text-sm text-red-600 flex items-center justify-center">
                      <span className="mr-1">⚠️</span>
                      {oErrors.image}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            {/* Status */}
            <SelectWithIcon
              label={t("productSetup.createCategory.statusLabel")}
              id="status"
              name="status"
              value={oFormData.status}
              onChange={handleInputChange}
              options={[
                { value: 'active', label: t('common.active') },
                { value: 'inactive', label: t('common.inactive') }
              ]}
              Icon={Tag}
              error={oErrors.status}
            />
          </div>
        </div>
        {/* Description */}
        <div>
          <TextAreaWithIcon
            label={t("productSetup.createCategory.descriptionLabel")}
            name="description"
            value={oFormData.description}
            onChange={handleInputChange}
            placeholder={t("productSetup.createCategory.descriptionPlaceholder")}
            icon={Info}
          />
        </div>
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="btn-cancel"
          >
            {t("productSetup.createCategory.cancelButton")}
          </button>
          <button
            type="submit"
            className="btn-secondry"
          >
            {t("productSetup.createCategory.createButton")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory; 