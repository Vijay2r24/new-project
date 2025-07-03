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
import BackButton from '../../../components/BackButton';

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
          if (response.data.status === STATUS.SUCCESS.toUpperCase() && response.data.data) {
            const attributeTypeData = response.data.data;
            setFormData(prev => ({
              ...prev,
              AttributeTypeName: attributeTypeData.Name || '',
              Code: attributeTypeData.Code || '',
              AttributeTypeDescription: attributeTypeData.AttributeTypeDescription || '',
            }));
          } else {
            showEmsg(response.data.message || t('PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.FETCH_ERROR'), STATUS.ERROR);
          }
        } catch (err) {
          showEmsg(t('PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.FETCH_ERROR'), STATUS.ERROR);
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
      newErrors.AttributeTypeName = t('PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.NAME_REQUIRED');
    }
    if (!oFormData.Code.trim()) {
      newErrors.Code = t('PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.CODE_REQUIRED');
    }
    if (!oFormData.AttributeTypeDescription.trim()) {
      newErrors.AttributeTypeDescription = t('PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.DESCRIPTION_REQUIRED');
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

      if (response.data.status === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(response.data.message || t('PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.SUCCESS'), STATUS.SUCCESS);
        navigate('/browse', { state: { fromAttributeTypeEdit: true } });
      } else {
        showEmsg(response.data.message || t('PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.UNKNOWN_ERROR'), STATUS.ERROR);
      }
    } catch (err) {
      showEmsg(t('PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.UNEXPECTED_ERROR'), STATUS.ERROR);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <BackButton onClick={() => navigate('/browse', { state: { fromAttributeTypeEdit: true } })} />
        <h2 className="text-xl font-bold text-gray-900">{isEditing ? t("PRODUCT_SETUP.ATTRIBUTE_TYPE.EDIT_TITLE") : t("PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.CREATE_TITLE")}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            {/* Name */}
            <TextInputWithIcon
              label={t('PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.NAME_LABEL')}
              id="AttributeTypeName"
              name="AttributeTypeName"
              value={oFormData.AttributeTypeName}
              onChange={handleInputChange}
              placeholder={t('PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.NAME_PLACEHOLDER')}
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
              label={t('COMMON.DESCRIPTION')}
              id="AttributeTypeDescription"
              name="AttributeTypeDescription"
              value={oFormData.AttributeTypeDescription}
              onChange={handleInputChange}
              placeholder={t('PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.DESCRIPTION_PLACEHOLDER')}
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
           {t('COMMON.CANCEL')}
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            {isEditing ? t("PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.SAVE_BUTTON") : t("PRODUCT_SETUP.CREATE_ATTRIBUTE_TYPE.CREATE_BUTTON")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAttributeType; 
