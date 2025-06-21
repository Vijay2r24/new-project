import { useState, useEffect } from 'react';
import { ArrowLeft, Tag, Info, Palette } from 'lucide-react';
import TextInputWithIcon from '../../../components/TextInputWithIcon';
import SelectWithIcon from '../../../components/SelectWithIcon';
import TextAreaWithIcon from '../../../components/TextAreaWithIcon';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { apiPost, apiGet, apiPut } from '../../../utils/ApiUtils';
import { createColour, getColourById, updateColour } from '../../../contants/apiRoutes';
import { showEmsg } from '../../../utils/ShowEmsg';

const CreateColor = () => {
  const { id: colorId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!colorId;
  const [oFormData, setFormData] = useState({
    TenantID: '1',
    Name: '',
    HexCode: '#000000',
    IsActive: true,
    RgbCode: '',
    CreatedBy: 'Admin',
    UpdatedBy: 'Admin'
  });

  const [oErrors, setErrors] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    if (isEditing && colorId) {
      const fetchColorDetails = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await apiGet(`${getColourById}/${colorId}`, {}, token);
          if (response.data.status === 'SUCCESS' && response.data.data) {
            const colorData = response.data.data;
            setFormData(prev => ({
              ...prev,
              Name: colorData.Name || '',
              HexCode: colorData.HexCode || '#000000',
              IsActive: colorData.IsActive === true,
              RgbCode: colorData.RgbCode || '',
              UpdatedBy: 'Admin'
            }));
          } else {
            console.error('Failed to fetch color details:', response.data);
            showEmsg(response.data.message || 'Failed to fetch color details', 'error');
          }
        } catch (err) {
          console.error('Error fetching color details:', err);
          showEmsg('An error occurred while fetching color details.', 'error');
        }
      };
      fetchColorDetails();
    }
  }, [colorId, isEditing]);

  const hexToRgb = (hex) => {
    if (!hex || typeof hex !== 'string') return '';
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (name === 'HexCode') {
      setFormData(prev => ({
        ...prev,
        RgbCode: hexToRgb(value)
      }));
    }
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

    if (!oFormData.Name.trim()) {
      newErrors.Name = t('productSetup.createColor.errors.nameRequired');
    }
    if (!oFormData.HexCode.trim()) {
      newErrors.HexCode = t('productSetup.createColor.errors.hexCodeRequired');
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
        // For update: TenantID is not sent, ColorID is part of the URL
        payload = {
          Name: oFormData.Name,
          HexCode: oFormData.HexCode,
          RgbCode: oFormData.RgbCode,
          UpdatedBy: oFormData.UpdatedBy,
        };
        response = await apiPut(`${updateColour}/${colorId}`, payload, token);
      } else {
        // For creation: TenantID, Name, HexCode, Status, RgbCode, CreatedBy
        payload = {
          TenantID: oFormData.TenantID,
          Name: oFormData.Name,
          HexCode: oFormData.HexCode,
          IsActive: oFormData.IsActive, // Assuming status is boolean IsActive
          RgbCode: oFormData.RgbCode,
          CreatedBy: oFormData.CreatedBy,
        };
        response = await apiPost(createColour, payload, token);
      }

      if (response.data.status === 'SUCCESS') {
        showEmsg(response.data.message || 'Operation successful!', 'success');
        navigate('/browse/colors', { state: { fromColorEdit: true } });
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
          onClick={() => navigate('/browse', { state: { fromColorEdit: true } })}
          className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">{isEditing ? t("productSetup.createColor.editTitle") : t("productSetup.createColor.createTitle")}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          {/* Color Name */}
          <div className="w-full md:w-1/2">
            <TextInputWithIcon
              label={t('productSetup.createColor.nameLabel')}
              id="Name"
              name="Name"
              value={oFormData.Name}
              onChange={handleInputChange}
              placeholder={t('productSetup.createColor.namePlaceholder')}
              error={oErrors.Name && t('productSetup.createColor.errors.nameRequired')}
              Icon={Tag}
            />
          </div>
          {/* Color Hex Code */}
          <div className="w-full md:w-1/2 mt-4 md:mt-0">
            <TextInputWithIcon
              label={t('productSetup.createColor.hexCodeLabel')}
              id="HexCode"
              name="HexCode"
              value={oFormData.HexCode}
              onChange={handleInputChange}
              placeholder={t('productSetup.createColor.hexCodePlaceholder')}
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
            {/* Status */}
            <SelectWithIcon
              label={t('productSetup.createColor.statusLabel')}
              id="IsActive"
              name="IsActive"
              value={oFormData.IsActive}
              onChange={handleInputChange}
              options={[
                { value: true, label: t('common.active') },
                { value: false, label: t('common.inactive') }
              ]}
              Icon={Tag}
              error={oErrors.IsActive}
            />
          </div>
          {/* RGB Code */}
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
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/browse/colors', { state: { fromColorEdit: true } })}
            className="btn-cancel"
          >
            {t('productSetup.createColor.cancelButton')}
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            {isEditing ? t("common.saveButton") : t("productSetup.createColor.createButton")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateColor; 