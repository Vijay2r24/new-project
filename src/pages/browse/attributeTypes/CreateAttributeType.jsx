import { useState, useEffect } from 'react';
import { ArrowLeft, Tag, Info, Hash } from 'lucide-react';
import TextInputWithIcon from '../../../components/TextInputWithIcon';
import TextAreaWithIcon from '../../../components/TextAreaWithIcon';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { apiPost, apiGet, apiPut } from '../../../utils/ApiUtils';
import { getAttributeTypeById, createOrUpdateAttributeType } from '../../../contants/apiRoutes';
import { showEmsg } from '../../../utils/ShowEmsg';
import { STATUS } from '../../../contants/constants';

const CreateAttributeType = () => {
  const { id: attributeTypeId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!attributeTypeId;

  const [oFormData, setFormData] = useState({
    AttributeTypeName: '',
    Code: '',
    AttributeTypeDescription: '',
    TenantID: '1',
  });

  const [oErrors, setErrors] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    if (isEditing && attributeTypeId) {
      const fetchAttributeTypeDetails = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await apiGet(`${getAttributeTypeById}/${attributeTypeId}`, {}, token);
          if (response.data.status === 'SUCCESS' && response.data.data) {
            const attributeTypeData = response.data.data;
            setFormData(prev => ({
              ...prev,
              AttributeTypeName: attributeTypeData.Name || '',
              Code: attributeTypeData.Code || '',
              AttributeTypeDescription: attributeTypeData.AttributeTypeDescription || '',
            }));
          } else {
            showEmsg(response.data.message || t('productSetup.createAttributeType.fetchError'), 'error');
          }
        } catch (err) {
          showEmsg(t('productSetup.createAttributeType.fetchError'), 'error');
        }
      };
      fetchAttributeTypeDetails();
    }
  }, [attributeTypeId, isEditing, t]);

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

    if (!oFormData.AttributeTypeName.trim()) {
      newErrors.AttributeTypeName = t('productSetup.createAttributeType.nameRequired');
    }
    if (!oFormData.Code.trim()) {
      newErrors.Code = t('productSetup.createAttributeType.codeRequired');
    }
    if (!oFormData.AttributeTypeDescription.trim()) {
      newErrors.AttributeTypeDescription = t('productSetup.createAttributeType.descriptionRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let response;
      let payload;

      if (isEditing) {
        payload = {
          AttributeTypeID: attributeTypeId,
          Name: oFormData.AttributeTypeName,
          Code: oFormData.Code,
          AttributeTypeDescription: oFormData.AttributeTypeDescription,
        };
        response = await apiPut(`${createOrUpdateAttributeType}/${attributeTypeId}`, payload, token);
      } else {
        payload = {
          TenantID: oFormData.TenantID,
          Name: oFormData.AttributeTypeName,
          Code: oFormData.Code,
          AttributeTypeDescription: oFormData.AttributeTypeDescription,
        };
        response = await apiPost(createOrUpdateAttributeType, payload, token);
      }

      if (response.data.status === STATUS.SUCCESS_1) {
        showEmsg(response.data.message || t('productSetup.createAttributeType.success'), 'success');
        navigate('/browse', { state: { fromAttributeTypeEdit: true } });
      } else {
        showEmsg(response.data.message || t('productSetup.createAttributeType.unknownError'), 'error');
      }
    } catch (err) {
      showEmsg(t('productSetup.createAttributeType.unexpectedError'), 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/browse', { state: { fromAttributeTypeEdit: true } })}
          className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">{isEditing ? t("productSetup.attributeType.editTitle") : t("productSetup.createAttributeType.createTitle")}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            {/* Name */}
            <TextInputWithIcon
              label={t('productSetup.createAttributeType.nameLabel')}
              id="AttributeTypeName"
              name="AttributeTypeName"
              value={oFormData.AttributeTypeName}
              onChange={handleInputChange}
              placeholder={t('productSetup.createAttributeType.namePlaceholder')}
              error={oErrors.AttributeTypeName}
              Icon={Tag}
            />
          </div>
          <div className="w-full md:w-1/2">
            {/* Code */}
            <TextInputWithIcon
              label="Code"
              id="Code"
              name="Code"
              value={oFormData.Code}
              onChange={handleInputChange}
              placeholder="Enter attribute code"
              error={oErrors.Code}
              Icon={Hash}
            />
          </div>
        </div>
        {/* Description */}
        <div className="w-full">
            <TextAreaWithIcon
              label={t('productSetup.createAttributeType.descriptionLabel')}
              id="AttributeTypeDescription"
              name="AttributeTypeDescription"
              value={oFormData.AttributeTypeDescription}
              onChange={handleInputChange}
              placeholder={t('productSetup.createAttributeType.descriptionPlaceholder')}
              error={oErrors.AttributeTypeDescription}
              icon={Info}
            />
          </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/browse', { state: { fromAttributeTypeEdit: true } })}
            className="btn-cancel"
          >
           {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            {isEditing ? t("productSetup.createAttributeType.saveButton") : t("productSetup.createAttributeType.createButton")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAttributeType; 
