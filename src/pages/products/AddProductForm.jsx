import { useState, useCallback } from 'react';
import { Plus, Trash2, X, Upload, Package, Tag, DollarSign, Hash, Users, Info, ShoppingBag, Palette, Layers, ArrowLeft } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import TextInputWithIcon from '../../components/TextInputWithIcon';
import SelectWithIcon from '../../components/SelectWithIcon';
import TextAreaWithIcon from '../../components/TextAreaWithIcon';
import { useTranslation } from 'react-i18next';
const AddProductForm = () => {
  const [aVariants, setVariants] = useState([{
    ColourID: '',
    AttributeValues: [],
    Quantity: '',
    SellingPrice: '',
    images: []
  }]);
  const [oFormData, setFormData] = useState({
    AttributeTypeID: '',
    ProductName: '',
    ProductDescription: '',
    BrandID: '',
    CategoryID: '',
    MRP: '',
    ProductDiscount: '',
    Gender: '',
    CreatedBy: 'Admin'
  });
  const { t } = useTranslation();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...aVariants];
    if (field === 'AttributeValues') {
      newVariants[index][field] = value.split(',').map(v => v.trim());
    } else {
      newVariants[index][field] = value;
    }
    setVariants(newVariants);
  };

  const oAddVariant = () => {
    setVariants([...aVariants, {
      ColourID: '',
      AttributeValues: [],
      Quantity: '',
      SellingPrice: '',
      images: []
    }]);
  };

  const removeVariant = (index) => {
    setVariants(aVariants.filter((_, i) => i !== index));
  };

  const onDrop = useCallback((acceptedFiles, variantIndex) => {
    const newVariants = [...aVariants];
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    newVariants[variantIndex].images = [...newVariants[variantIndex].images, ...newImages];
    setVariants(newVariants);
  }, [aVariants]);

  const removeImage = (variantIndex, imageIndex) => {
    const newVariants = [...aVariants];
    URL.revokeObjectURL(newVariants[variantIndex].images[imageIndex].preview);
    newVariants[variantIndex].images.splice(imageIndex, 1);
    setVariants(newVariants);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = {
      ...oFormData,
      Variants: aVariants.map(variant => ({
        ...variant,
        images: variant.images.map(img => img.file)
      }))
    };
  };

  const VariantImageUpload = ({ variantIndex }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => onDrop(files, variantIndex),
      accept: {
        'image/*': ['.jpeg', '.jpg', '.png', '.webp']
      },
      maxSize: 5242880
    });

    return (
      <div className="mt-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
            ${isDragActive
              ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 hover:shadow-md'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-blue-50 rounded-2xl">
              <Upload className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-sm text-gray-600">
              {isDragActive ? (
                <p className="font-medium text-blue-600 text-base">{t('productCreation.dropImagesHere')}</p>
              ) : (
                <p className="text-base">{t('productCreation.dragDropOrClick')}</p>
              )}
            </div>
          </div>
        </div>

        {aVariants[variantIndex].images.length > 0 && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {aVariants[variantIndex].images.map((image, imageIndex) => (
              <div key={imageIndex} className="relative group">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-md">
                  <img
                    src={image.preview}
                    alt={`Variant ${variantIndex + 1} - Image ${imageIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(variantIndex, imageIndex)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 shadow-lg transform hover:scale-110"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{t('productCreation.addNewProduct')}</h1>
          </div>
          <p className="text-gray-500">{t('productCreation.createNewStoreDescription')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Product Information */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ShoppingBag className="h-6 w-6 mr-3 text-custom-bg" />
                {t('productCreation.basicInformation')}
              </h2>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <TextInputWithIcon
                      label={t('productCreation.productName')}
                      id="ProductName"
                      name="ProductName"
                      value={oFormData.ProductName}
                      onChange={handleInputChange}
                      placeholder={t('productCreation.productNamePlaceholder') || "Enter product name"}
                      Icon={Tag}
                      required
                    />
                  </div>
                  <div>
                    <TextInputWithIcon
                      label={t('productCreation.attributeId')}
                      id="AttributeTypeID"
                      name="AttributeTypeID"
                      value={oFormData.AttributeTypeID}
                      onChange={handleInputChange}
                      placeholder={t('productCreation.attributeIdPlaceholder') || "Enter attribute type ID"}
                      Icon={Hash}
                      required
                    />
                  </div>
                  <div>
                    <TextInputWithIcon
                      label={t('productCreation.brandId')}
                      id="BrandID"
                      name="BrandID"
                      value={oFormData.BrandID}
                      onChange={handleInputChange}
                      placeholder={t('productCreation.brandIdPlaceholder') || "Enter brand ID"}
                      Icon={Tag}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <TextInputWithIcon
                      label={t('productCreation.mrp')}
                      id="MRP"
                      name="MRP"
                      value={oFormData.MRP}
                      onChange={handleInputChange}
                      placeholder={t('productCreation.mrpPlaceholder') || "Enter MRP"}
                      Icon={DollarSign}
                      required
                    />
                  </div>
                  <div>
                    <TextInputWithIcon
                      label={t('productCreation.productDiscount')}
                      id="ProductDiscount"
                      name="ProductDiscount"
                      value={oFormData.ProductDiscount}
                      onChange={handleInputChange}
                      placeholder={t('productCreation.productDiscountPlaceholder') || "Enter discount (e.g., 20%)"}
                      Icon={Tag}
                      required
                    />
                  </div>
                  <div>
                    <SelectWithIcon
                      label={t('productCreation.gender')}
                      id="Gender"
                      name="Gender"
                      value={oFormData.Gender}
                      onChange={handleInputChange}
                      options={[
                        { value: 'Male', label: t('productCreation.male') },
                        { value: 'Female', label: t('productCreation.female') },
                        { value: 'Other', label: t('productCreation.other') },
                      ]}
                      Icon={Users}
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <TextAreaWithIcon
                  label={t('productCreation.productDescription')}
                  name="description"
                  value={oFormData.ProductDescription}
                  onChange={handleInputChange}
                  placeholder={t('productCreation.productDescriptionPlaceholder')}
                  icon={Info}
                />
              </div>
            </div>

          </div>

          {/* Variants Section */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
            <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-teal-50 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Palette className="h-6 w-6 mr-3 text-custom-bg" />
               {t('productCreation.productVariants')}
              </h2>
            </div>
            <div className="p-8 space-y-8">
              {aVariants.map((variant, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">{t('productCreation.variant')}{index + 1}</h3>
                    {aVariants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextInputWithIcon
                      label={t('productCreation.colourID')}
                      id={`ColourID-${index}`}
                      name="ColourID"
                      value={variant.ColourID}
                      onChange={(e) => handleVariantChange(index, 'ColourID', e.target.value)}
                      placeholder={t('productCreation.colouridPlaceholder')}
                      Icon={Palette}
                      required
                    />
                    <div>
                      <label htmlFor={`AttributeValues-${index}`} className="block text-sm font-medium text-gray-700 mb-2">Attribute Values (comma-separated)</label>
                      <TextInputWithIcon
                        id={`AttributeValues-${index}`}
                        name={t('productCreation.attributeValues')}
                        value={variant.AttributeValues.join(',')}
                        onChange={(e) => handleVariantChange(index, 'AttributeValues', e.target.value)}
                        placeholder={t('productCreation.attributeValuesPlaceholder')}
                        Icon={Layers}
                        required
                      />
                    </div>
                    <TextInputWithIcon
                      label={t('productCreation.quantity')}
                      id={`Quantity-${index}`}
                      name="Quantity"
                      type="number"
                      value={variant.Quantity}
                      onChange={(e) => handleVariantChange(index, 'Quantity', e.target.value)}
                      placeholder={t('productCreation.quantityPlaceholder')}
                      Icon={Package}
                      required
                    />
                    <TextInputWithIcon
                      label={t('productCreation.sellingPrice')}
                      id={`SellingPrice-${index}`}
                      name="SellingPrice"
                      type="number"
                      value={variant.SellingPrice}
                      onChange={(e) => handleVariantChange(index, 'SellingPrice', e.target.value)}
                      placeholder={t('productCreation.sellingPricePlaceholder')}
                      Icon={DollarSign}
                      required
                    />
                  </div>

                  <VariantImageUpload variantIndex={index} />

                </div>
              ))}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={oAddVariant}
                  className="btn-primary"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {t('productCreation.addAnotherVariant')}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-secondry "
            >
               {t('productCreation.addProduct')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm; 