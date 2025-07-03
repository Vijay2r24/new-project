import { useState, useEffect } from "react";
import { FiUpload } from "react-icons/fi";
import { MdOutlineCancel } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import TextInputWithIcon from '../components/TextInputWithIcon';
import SelectWithIcon from '../components/SelectWithIcon';
import { Tag, Layers, Users, DollarSign, Percent } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { useTitle } from '../context/TitleContext';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';

const BannerForm = () => {
  const { t } = useTranslation();
  const { setTitle, setBackButton } = useTitle();
  const navigate = useNavigate();

  const [oFormData, setFormData] = useState({
    BannerName: "",
    banners: [],
  });
  const [bShowInputField, setShowInputField] = useState(false);
  const [aSelectedCategories, setSelectedCategories] = useState([]);
  const [aSelectedBrands, setSelectedBrands] = useState([]);

  const [aCategories] = useState([
    { CategoryID: 1, CategoryName: 'Category 1' },
    { CategoryID: 2, CategoryName: 'Category 2' },
  ]);
  const [aBrands] = useState([
    { BrandID: 1, BrandName: 'Brand 1' },
    { BrandID: 2, BrandName: 'Brand 2' },
  ]);
  const [bLoading] = useState(false);

  useEffect(() => {
    setTitle(t('BANNER_FORM.UPLOAD_BANNER'));
    setBackButton(
      <BackButton onClick={() => navigate('/banners')} />
    );
    return () => {
      setBackButton(null);
      setTitle('');
    };
  }, [setTitle, setBackButton, t, navigate]);

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          banners: [
            ...prev.banners,
            {
              preview: reader.result,
              sequence: "",
              file,
              BannerImage: file,
              Brand: "",
              Category: "",
              banners: [],
            },
          ],
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategories([cat]);
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands([brand.BrandID]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen">
      <div className="flex items-center gap-3 mb-4">
        <p className="text-caption">{t('BANNER_FORM.CREATE_BANNER_DESCRIPTION')}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <TextInputWithIcon
          label={t('BANNER_FORM.BANNER_NAME')}
          id="bannerName"
          name="BannerName"
          value={oFormData.BannerName}
          onChange={e => setFormData(prev => ({ ...prev, BannerName: e.target.value }))}
          placeholder={t('BANNER_FORM.ENTER_BANNER_NAME')}
          Icon={Tag}
          required
        />
        <div className="flex flex-col space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-sm">{t('BANNER_FORM.UPLOAD_BANNERS_LABEL')}</label>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowInputField(true)}
            >
              <FaPlus aria-hidden="true" className="icon" />
              <span>{t('BANNER_FORM.ADD_BANNER_IMAGE')}</span>
            </button>
          </div>
          {oFormData.banners?.map((banner, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 border p-4 rounded-md"
            >
              <div className="relative w-40 h-40 group overflow-hidden border rounded-md flex-shrink-0">
                {banner.preview ? (
                  <img
                    src={banner.preview}
                    alt={`${t('BANNER_FORM.UPLOAD_BANNER')} ${index + 1}`}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200">
                    <p className="text-gray-500">{t('BANNER_FORM.NO_IMAGE')}</p>
                  </div>
                )}
              </div>

              {banner.preview && (
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInputWithIcon
                    label={t('BANNER_FORM.SEQUENCE_NUMBER')}
                    id={`sequence_${index}`}
                    name="sequence"
                    value={banner.sequence}
                    onChange={e => setFormData(prev => {
                      const updatedBanners = [...prev.banners];
                      updatedBanners[index].sequence = e.target.value;
                      return { ...prev, banners: updatedBanners };
                    })}
                    placeholder={t('BANNER_FORM.ENTER_SEQUENCE_NUMBER')}
                    Icon={Layers}
                  />
                  <SelectWithIcon
                    label={t('COMMON.CATEGORY')}
                    id={`category_${index}`}
                    name="category"
                    value={aSelectedCategories[0]?.CategoryID || ''}
                    onChange={e => handleCategoryChange(aCategories.find(cat => cat.CategoryID === Number(e.target.value)))}
                    options={aCategories.map(cat => ({ value: cat.CategoryID, label: cat.CategoryName }))}
                    Icon={Layers}
                  />
                  <SelectWithIcon
                    label={t('COMMON.BRAND')}
                    id={`brand_${index}`}
                    name="brand"
                    value={aSelectedBrands[0] || ''}
                    onChange={e => handleBrandChange(aBrands.find(b => b.BrandID === Number(e.target.value)))}
                    options={aBrands.map(b => ({ value: b.BrandID, label: b.BrandName }))}
                    Icon={Users}
                  />
                  <SelectWithIcon
                    label={t('COMMON.GENDER')}
                    id={`gender_${index}`}
                    name="gender"
                    value={banner.gender || ''}
                    onChange={e => setFormData(prev => {
                      const updatedBanners = [...prev.banners];
                      updatedBanners[index].gender = e.target.value;
                      return { ...prev, banners: updatedBanners };
                    })}
                    options={[
                      { value: '', label: t('BANNER_FORM.SELECT_GENDER') },
                      { value: 'Male', label: t('COMMON.MALE') },
                      { value: 'Female', label: t('COMMON.FEMALE') },
                      { value: 'Unisex', label: t('COMMON.UNISEX') }
                    ]}
                    Icon={Users}
                  />
                  <TextInputWithIcon
                    label={t('BANNER_FORM.DISCOUNT_PERCENTAGE')}
                    id={`discount_${index}`}
                    name="discount"
                    value={banner.discount || ''}
                    onChange={e => setFormData(prev => {
                      const updatedBanners = [...prev.banners];
                      updatedBanners[index].discount = e.target.value;
                      return { ...prev, banners: updatedBanners };
                    })}
                    placeholder={t('BANNER_FORM.ENTER_DISCOUNT_PERCENTAGE')}
                    Icon={Percent}
                  />
                  <TextInputWithIcon
                    label={t('COMMON.PRICE')}
                    id={`price_${index}`}
                    name="price"
                    value={banner.price || ''}
                    onChange={e => setFormData(prev => {
                      const updatedBanners = [...prev.banners];
                      updatedBanners[index].price = e.target.value;
                      return { ...prev, banners: updatedBanners };
                    })}
                    placeholder={t('BANNER_FORM.ENTER_PRICE')}
                    Icon={DollarSign}
                  />
                  <div className="flex items-end">
                    <button
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          banners: prev.banners.filter((_, i) => i !== index),
                        }))
                      }
                      className="flex items-center space-x-1 mt-6 ml-2 text-red hover:text-white border border-red-600 hover:bg-red-600 transition-colors duration-200 px-2 py-1 rounded"
                      type="button"
                    >
                      <MdOutlineCancel aria-hidden="true" className="h-4 w-4" />
                      <span>{t('COMMON.DELETE')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {bShowInputField && (
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="bannerUpload"
                className="flex items-center justify-center border-dashed border-2 border-gray-300 p-4 rounded-md cursor-pointer mb-6"
              >
                <FiUpload size={30} className="text-gray-400 mr-2" />
                <span className="text-gray-700 text-sm">{t('BANNER_FORM.CHOOSE_IMAGE')}</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => { handleBannerUpload(e); setShowInputField(false); }}
                className="hidden"
                id="bannerUpload"
              />
            </div>
          )}
        </div>
        <div className="flex justify-end mt-8 gap-4">
          <button
            type="submit"
            className="btn-secondry"
            disabled={bLoading}
          >
            {t('COMMON.SUBMIT')}
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn-cancel ml-4"
          >
            {t('COMMON.CANCEL')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BannerForm;