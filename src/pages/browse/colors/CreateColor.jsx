import { useState } from 'react';
import { ArrowLeft, Tag, Info, Palette } from 'lucide-react';
import TextInputWithIcon from '../../../components/TextInputWithIcon';
import SelectWithIcon from '../../../components/SelectWithIcon';
import TextAreaWithIcon from '../../../components/TextAreaWithIcon';
import { useTranslation } from 'react-i18next';
const CreateColor = ({ setViewMode }) => {
  const [oFormData, setFormData] = useState({
    name: '',
    hexCode: '#000000',
    status: 'active',
    description: ''
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!oFormData.name.trim()) {
      newErrors.name =  t('productSetup.createColor.errors.nameRequired');
    }
    if (!oFormData.hexCode) {
      newErrors.hexCode =  t('productSetup.createColor.errors.hexCodeRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Form submitted:', oFormData);
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => setViewMode('list')}
          className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">{t('productSetup.createColor.createTitle')}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          {/* Color Name */}
          <div className="w-full md:w-1/2">
            <TextInputWithIcon
              label={t('productSetup.createColor.nameLabel')}
              id="name"
              name="name"
              value={oFormData.name}
              onChange={handleInputChange}
              placeholder={t('productSetup.createColor.namePlaceholder')}
              error={oErrors.name && t('productSetup.createColor.errors.nameRequired')}
              Icon={Tag}
            />
          </div>
          {/* Color Code */}
          <div className="w-full md:w-1/2 mt-4 md:mt-0">
            <TextInputWithIcon
              label={t('productSetup.createColor.hexCodeLabel')}
              id="hexCode"
              name="hexCode"
              value={oFormData.hexCode}
              onChange={handleInputChange}
              placeholder={t('productSetup.createColor.hexCodePlaceholder')}
              error={oErrors.hexCode}
              Icon={Palette}
              inputSlot={
                <input
                  type="color"
                  id="colorPicker"
                  name="hexCode"
                  value={oFormData.hexCode}
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
            {/* Status */}
            <SelectWithIcon
              label={t('productSetup.createColor.statusLabel')}
              id="status"
              name="status"
              value={oFormData.status}
              onChange={handleInputChange}
              options={[
                { value: 'active', label: t('productSetup.createColor.status.active') },
                { value: 'inactive', label: t('productSetup.createColor.status.inactive') }
              ]}
              Icon={Tag}
              error={oErrors.status}
            />
          </div>
          {/* Description */}
          <div className="w-full md:w-1/2 mt-4 md:mt-0">
            <TextAreaWithIcon
              label={t('productSetup.createColor.descriptionLabel')}
              name="description"
              value={oFormData.description}
              onChange={handleInputChange}
              placeholder={t('productSetup.createColor.descriptionPlaceholder')}
              icon={Info}
            />
          </div>
        </div>
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="btn-cancel"
          >
            {t('productSetup.createColor.createButton')}
          </button>
          <button
            type="submit"
            className="btn-secondry"
          >
            {t('productSetup.createColor.cancelButton')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateColor; 