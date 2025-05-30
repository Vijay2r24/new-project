import { useState } from "react";
import { FiUpload } from "react-icons/fi";
import { MdOutlineCancel } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import TextInputWithIcon from '../components/TextInputWithIcon';
import SelectWithIcon from '../components/SelectWithIcon';
import { Tag, Layers, Users, DollarSign, Percent } from 'lucide-react';
import { useTranslation } from "react-i18next";
const BannerForm = () => {
  const { t } = useTranslation();

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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('bannerform.upload_banner')}</h2>
      <form onSubmit={handleSubmit}>
        {/* Banner Name */}
        <TextInputWithIcon
          label={t('bannerform.banner_name')}
          id="bannerName"
          name="BannerName"
          value={oFormData.BannerName}
          onChange={e => setFormData(prev => ({ ...prev, BannerName: e.target.value }))}
          placeholder={t('bannerform.enter_banner_name')}
          Icon={Tag}
          required
        />
        <div className="flex flex-col space-y-4 mt-4">
          {/* Label and Add Banner Button */}
          <div className="flex items-center justify-between">
            <label className="font-semibold">{t('bannerform.upload_banners_label')}</label>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowInputField(true)}
            >
              <FaPlus aria-hidden="true" className="icon" />
              <span>{t('bannerform.add_banner_image')}</span>
            </button>
          </div>

          {/* Display Banners */}
          {oFormData.banners?.map((banner, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 border p-4 rounded-md"
            >
              {/* Banner Preview */}
              <div className="relative w-40 h-40 group overflow-hidden border rounded-md flex-shrink-0">
                {banner.preview ? (
                  <img
                    src={banner.preview}
                    alt={`${t('bannerform.upload_banner')} ${index + 1}`}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200">
                    <p className="text-gray-500">{t('bannerform.no_image')}</p>
                  </div>
                )}
              </div>

              {banner.preview && (
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sequence Number */}
                  <TextInputWithIcon
                    label={t('bannerform.sequence_number')}
                    id={`sequence_${index}`}
                    name="sequence"
                    value={banner.sequence}
                    onChange={e => setFormData(prev => {
                      const updatedBanners = [...prev.banners];
                      updatedBanners[index].sequence = e.target.value;
                      return { ...prev, banners: updatedBanners };
                    })}
                    placeholder={t('bannerform.enter_sequence_number')}
                    Icon={Layers}
                  />
                  {/* Category */}
                  <SelectWithIcon
                    label={t('bannerform.category')}
                    id={`category_${index}`}
                    name="category"
                    value={aSelectedCategories[0]?.CategoryID || ''}
                    onChange={e => handleCategoryChange(aCategories.find(cat => cat.CategoryID === Number(e.target.value)))}
                    options={aCategories.map(cat => ({ value: cat.CategoryID, label: cat.CategoryName }))}
                    Icon={Layers}
                  />
                  {/* Brand */}
                  <SelectWithIcon
                    label={t('bannerform.brand')}
                    id={`brand_${index}`}
                    name="brand"
                    value={aSelectedBrands[0] || ''}
                    onChange={e => handleBrandChange(aBrands.find(b => b.BrandID === Number(e.target.value)))}
                    options={aBrands.map(b => ({ value: b.BrandID, label: b.BrandName }))}
                    Icon={Users}
                  />
                  {/* Gender */}
                  <SelectWithIcon
                    label={t('bannerform.gender')}
                    id={`gender_${index}`}
                    name="gender"
                    value={banner.gender || ''}
                    onChange={e => setFormData(prev => {
                      const updatedBanners = [...prev.banners];
                      updatedBanners[index].gender = e.target.value;
                      return { ...prev, banners: updatedBanners };
                    })}
                    options={[
                      { value: '', label: t('bannerform.select_gender') },
                      { value: 'Male', label: t('bannerform.male') },
                      { value: 'Female', label: t('bannerform.female') },
                      { value: 'Unisex', label: t('bannerform.unisex') }
                    ]}
                    Icon={Users}
                  />
                  {/* Discount */}
                  <TextInputWithIcon
                    label={t('bannerform.discount_percentage')}
                    id={`discount_${index}`}
                    name="discount"
                    value={banner.discount || ''}
                    onChange={e => setFormData(prev => {
                      const updatedBanners = [...prev.banners];
                      updatedBanners[index].discount = e.target.value;
                      return { ...prev, banners: updatedBanners };
                    })}
                    placeholder={t('bannerform.enter_discount_percentage')}
                    Icon={Percent}
                  />
                  {/* Price */}
                  <TextInputWithIcon
                    label={t('bannerform.price')}
                    id={`price_${index}`}
                    name="price"
                    value={banner.price || ''}
                    onChange={e => setFormData(prev => {
                      const updatedBanners = [...prev.banners];
                      updatedBanners[index].price = e.target.value;
                      return { ...prev, banners: updatedBanners };
                    })}
                    placeholder={t('bannerform.enter_price')}
                    Icon={DollarSign}
                  />
                  {/* Delete Button */}
                  <div className="flex items-end">
                    <button
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          banners: prev.banners.filter((_, i) => i !== index),
                        }))
                      }
                      className="flex items-center space-x-1 mt-6 ml-2 text-red-600 hover:text-white border border-red-600 hover:bg-red-600 transition-colors duration-200 px-2 py-1 rounded"
                      type="button"
                    >
                      <MdOutlineCancel aria-hidden="true" className="h-4 w-4" />
                      <span>{t('bannerform.delete')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Upload New Banner */}
          {bShowInputField && (
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="bannerUpload"
                className="flex items-center justify-center border-dashed border-2 border-gray-300 p-4 rounded-md cursor-pointer mb-6"
              >
                <FiUpload size={30} className="text-gray-400 mr-2" />
                <span className="text-gray-700 text-sm">{t('bannerform.choose_image')}</span>
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
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="btn-secondry"
            disabled={bLoading}
          >
            {t('bannerform.submit')}
          </button>
        </div>
      </form>
    </div>
  );
  };

export default BannerForm; 