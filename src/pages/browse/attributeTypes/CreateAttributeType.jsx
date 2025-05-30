import React, { useState } from 'react';
import { ArrowLeft, Tag, Info, Settings, Hash, Edit, Trash, } from 'lucide-react';
import TextInputWithIcon from '../../../components/TextInputWithIcon';
import SelectWithIcon from '../../../components/SelectWithIcon';
import { useTranslation } from 'react-i18next';
const CreateAttributeType = ({ setViewMode }) => {
  const [oFormData, setFormData] = useState({
    name: '',
    dataType: '',
    validation: '',
    description: '',
    required: false
  });

  const [oErrors, setErrors] = useState({});
  const { t } = useTranslation();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!oFormData.name.trim()) {
      newErrors.name = 'Attribute type name is required';
    }
    if (!oFormData.dataType) {
      newErrors.dataType = 'Data type is required';
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
        <h2 className="text-xl font-bold text-gray-900">{t('productSetup.createAttributeType.createTitle')}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            {/* Name */}
            <TextInputWithIcon
              label={t('productSetup.createAttributeType.nameLabel')}
              id="name"
              name="name"
              value={oFormData.name}
              onChange={handleInputChange}
              placeholder={t('productSetup.createAttributeType.namePlaceholder')}
              error={oErrors.name}
              Icon={Tag}
            />
          </div>
          <div className="w-full md:w-1/2">
            {/* Data Type */}
            <SelectWithIcon
              label={t('productSetup.createAttributeType.dataTypeLabel')}
              id="dataType"
              name="dataType"
              value={oFormData.dataType}
              onChange={handleInputChange}
              options={[
                { value: '', label: t('productSetup.createAttributeType.selectDataType') },
              ]}
              Icon={Settings}
              error={oErrors.dataType}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="btn-cancel"
          >
           {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="btn-secondry"
          >
            {t('productSetup.createAttributeType.createButton')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAttributeType; 