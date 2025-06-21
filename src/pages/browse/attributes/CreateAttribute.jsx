import { useState, useEffect } from 'react';
import { Tag, ArrowLeft,Info } from 'lucide-react';
import TextInputWithIcon from '../../../components/TextInputWithIcon';
import SelectWithIcon from '../../../components/SelectWithIcon';
import TextAreaWithIcon from '../../../components/TextAreaWithIcon';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { apiPost, apiGet, apiPut } from '../../../utils/ApiUtils';
import { getAttributeById, createOrUpdateAttribute } from '../../../contants/apiRoutes';
import { showEmsg } from '../../../utils/ShowEmsg';
import { useAttributeTypes } from '../../../context/AttributeTypeContext';

const CreateAttribute = ({ setViewMode }) => {
  const { id: attributeId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!attributeId;
  const [oFormData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    TenantID: '1',
  });
  const { t } = useTranslation();
  const [oErrors, setErrors] = useState({});
  const { aAttributeTypes, bLoading: attributeTypesLoading, sError: attributeTypesError } = useAttributeTypes();

  useEffect(() => {
    if (isEditing && attributeId) {
      const fetchAttributeDetails = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await apiGet(`${getAttributeById}/${attributeId}`, {}, token);
          if (response.data.status === 'SUCCESS' && response.data.data) {
            const attributeData = response.data.data;
            setFormData(prev => ({
              ...prev,
              name: attributeData.AttributeName || '',
              type: attributeData.AttributeTypeID || '',
              description: attributeData.Description || '',
            }));
          } else {
            console.error('Failed to fetch attribute details:', response.data);
            showEmsg(response.data.message || 'Failed to fetch attribute details', 'error');
          }
        } catch (err) {
          console.error('Error fetching attribute details:', err);
          showEmsg('An error occurred while fetching attribute details.', 'error');
        }
      };
      fetchAttributeDetails();
    }
  }, [attributeId, isEditing]);

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!oFormData.name.trim()) {
      newErrors.name = t('productSetup.createAttributes.nameRequired');
    } else if (oFormData.name.trim().length < 2) {
      newErrors.name = t('productSetup.createAttributes.nameMinLength');
    } else if (oFormData.name.trim().length > 50) {
      newErrors.name = t('productSetup.createAttributes.nameMaxLength');
    }

    if (!oFormData.type) {
      newErrors.type = t('productSetup.createAttributes.typeRequired');
    } else if (!aAttributeTypes.some(type => type.AttributeTypeID === oFormData.type)) {
      newErrors.type = t('productSetup.createAttributes.typeInvalid');
    }

    if (!oFormData.description.trim()) {
      newErrors.description = t('productSetup.createAttributes.descriptionRequired');
    } else if (oFormData.description.trim().length > 250) {
      newErrors.description = t('productSetup.createAttributes.descriptionMaxLength');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let response;
      let payload = {
        Name: oFormData.name,
        Type: oFormData.type,
        Description: oFormData.description,
      };

      if (isEditing) {
        payload.AttributeID = attributeId;
      } else {
        payload.TenantID = oFormData.TenantID;
      }

      response = await apiPost(createOrUpdateAttribute, payload, token);

      if (response.data.status === 'SUCCESS') {
        showEmsg(response.data.message || 'Operation successful!', 'success');
        navigate('/browse', { state: { fromAttributeEdit: true } });
      } else {
        console.error('API Error:', response.data);
        showEmsg(response.data.message || 'Unknown error', 'error');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      showEmsg('An unexpected error occurred.', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/browse', { state: { fromAttributeEdit: true } })}
          className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">{isEditing ? t("productSetup.attributes.editTitle") : t("productSetup.createAttributes.createTitle")}</h2>
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
            />
          </div>
          <div className="w-full md:w-1/2 form-field-group">
            <SelectWithIcon
              label={t('productSetup.createAttributes.typeLabel')}
              id="type"
              name="type"
              value={oFormData.type}
              onChange={handleInputChange}
              options={[
                { value: '', label: t('productSetup.createAttributes.selectType') },
                ...aAttributeTypes.map(type => ({ value: type.AttributeTypeID, label: type.Name }))
              ]}
              Icon={Tag}
              error={oErrors.type}
            />
          </div>
        </div>
        <div className="w-full form-section">
            <TextAreaWithIcon
              label={t('productSetup.createAttributes.descriptionLabel')}
              id="description"
              name="description"
              value={oFormData.description}
              onChange={handleInputChange}
              placeholder={t('productSetup.createAttributes.descriptionPlaceholder')}
              error={oErrors.description}
              icon={Info}
            />
          </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 form-actions">
          <button
            type="button"
            onClick={() => navigate('/browse', { state: { fromAttributeEdit: true } })}
            className="btn-cancel"
          >
              {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="btn-secondry"
          >
          {isEditing ? t("productSetup.createAttributes.saveButton") : t("productSetup.createAttributes.createButton")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAttribute; 