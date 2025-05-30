import { useState } from 'react';
import { Tag, ArrowLeft } from 'lucide-react';
import TextInputWithIcon from '../../../components/TextInputWithIcon';
import SelectWithIcon from '../../../components/SelectWithIcon';
import { useTranslation } from 'react-i18next';
const CreateAttribute = ({ setViewMode }) => {
  const [oFormData, setFormData] = useState({
    name: '',
    type: '',
  });
  const { t } = useTranslation();
  const [oErrors, setErrors] = useState({});
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
      newErrors.name = 'Attribute name is required';
    }
    if (!oFormData.type) {
      newErrors.type = 'Attribute type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
        <h2 className="text-xl font-bold text-gray-900">{t('productSetup.createAttributes.createTitle')}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            <TextInputWithIcon
              label={t('productSetup.createAttributes.nameLabel')}
              id="name"
              name="name"
              value={oFormData.name}
              onChange={handleInputChange}
              placeholder={t('productSetup.createAttributes.namePlaceholder')}
              error={oErrors.name}
              Icon={Tag}
              required
            />
          </div>
          <div className="w-full md:w-1/2">
            <SelectWithIcon
              label={t('productSetup.createAttributes.typeLabel')}
              id="type"
              name="type"
              value={oFormData.type}
              onChange={handleInputChange}
              options={[
                { value: '', label: t('productSetup.createAttributes.selectType') },
              ]}
              Icon={Tag}
              error={oErrors.type}
              required
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
          {t('productSetup.createAttributes.createButton')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAttribute; 