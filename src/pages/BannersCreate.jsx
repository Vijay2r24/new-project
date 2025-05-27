import { useState } from "react";
import { FiUpload } from "react-icons/fi";
import { MdOutlineCancel } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import TextInputWithIcon from '../components/TextInputWithIcon';
import SelectWithIcon from '../components/SelectWithIcon';
import { Tag, Layers, Users, DollarSign, Percent } from 'lucide-react';

const BannerForm = () => {
  // Local state only, no API
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
    // No API call, just log the form data
    console.log('Form Data:', oFormData, aSelectedCategories, aSelectedBrands);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Banner</h2>
      <form onSubmit={handleSubmit}>
        {/* Banner Name */}
        <TextInputWithIcon
          label="Banner Name"
          id="bannerName"
          name="BannerName"
          value={oFormData.BannerName}
          onChange={e => setFormData(prev => ({ ...prev, BannerName: e.target.value }))}
          placeholder="Enter banner name"
          Icon={Tag}
          required
        />
        <div className="flex flex-col space-y-4 mt-4">
          {/* Label and Add Banner Button */}
          <div className="flex items-center justify-between">
            <label className="font-semibold">Upload Banners:</label>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowInputField(true)}
            >
              <FaPlus aria-hidden="true" className="icon" />
              <span>Add Banner Image</span>
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
                    alt={`Banner Preview ${index + 1}`}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200">
                    <p className="text-gray-500">No Image</p>
                  </div>
                )}
              </div>
              {/* Input Fields - Only show if an image is uploaded */}
              {banner.preview && (
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sequence Number */}
                  <TextInputWithIcon
                    label="Sequence Number"
                    id={`sequence_${index}`}
                    name="sequence"
                    value={banner.sequence}
                    onChange={e => setFormData(prev => {
                      const updatedBanners = [...prev.banners];
                      updatedBanners[index].sequence = e.target.value;
                      return { ...prev, banners: updatedBanners };
                    })}
                    placeholder="Enter sequence number"
                    Icon={Layers}
                  />
                  {/* Category Dropdown (single select for now) */}
                  <SelectWithIcon
                    label="Category"
                    id={`category_${index}`}
                    name="category"
                    value={aSelectedCategories[0]?.CategoryID || ''}
                    onChange={e => handleCategoryChange(aCategories.find(cat => cat.CategoryID === Number(e.target.value)))}
                    options={aCategories.map(cat => ({ value: cat.CategoryID, label: cat.CategoryName }))}
                    Icon={Layers}
                  />
                  {/* Brand Dropdown (single select for now) */}
                  <SelectWithIcon
                    label="Brand"
                    id={`brand_${index}`}
                    name="brand"
                    value={aSelectedBrands[0] || ''}
                    onChange={e => handleBrandChange(aBrands.find(b => b.BrandID === Number(e.target.value)))}
                    options={aBrands.map(b => ({ value: b.BrandID, label: b.BrandName }))}
                    Icon={Users}
                  />
                  {/* Gender Dropdown */}
                  <SelectWithIcon
                    label="Gender"
                    id={`gender_${index}`}
                    name="gender"
                    value={banner.gender || ''}
                    onChange={e => setFormData(prev => {
                      const updatedBanners = [...prev.banners];
                      updatedBanners[index].gender = e.target.value;
                      return { ...prev, banners: updatedBanners };
                    })}
                    options={[{ value: '', label: 'Select Gender' }, { value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Unisex', label: 'Unisex' }]}
                    Icon={Users}
                  />
                  {/* Discount */}
                  <TextInputWithIcon
                    label="Discount (%)"
                    id={`discount_${index}`}
                    name="discount"
                    value={banner.discount || ''}
                    onChange={e => setFormData(prev => {
                      const updatedBanners = [...prev.banners];
                      updatedBanners[index].discount = e.target.value;
                      return { ...prev, banners: updatedBanners };
                    })}
                    placeholder="Enter discount percentage"
                    Icon={Percent}
                  />
                  {/* Price */}
                  <TextInputWithIcon
                    label="Price"
                    id={`price_${index}`}
                    name="price"
                    value={banner.price || ''}
                    onChange={e => setFormData(prev => {
                      const updatedBanners = [...prev.banners];
                      updatedBanners[index].price = e.target.value;
                      return { ...prev, banners: updatedBanners };
                    })}
                    placeholder="Enter price"
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
                      <span>Delete</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          ))}
          {/* Input Field for New Banner */}
          {bShowInputField && (
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="bannerUpload"
                className="flex items-center justify-center border-dashed border-2 border-gray-300 p-4 rounded-md cursor-pointer mb-6"
              >
                <FiUpload size={30} className="text-gray-400 mr-2" />
                <span className="text-gray-700 text-sm">Choose Image</span>
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
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default BannerForm; 