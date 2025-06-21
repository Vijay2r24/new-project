import { useState, useCallback, useEffect, useRef } from 'react';
import { Plus, X, Upload, Tag, DollarSign, Hash, Users, ShoppingBag, Palette, Layers, ArrowLeft } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import TextInputWithIcon from '../../components/TextInputWithIcon';
import SelectWithIcon from '../../components/SelectWithIcon';
import { useTranslation } from 'react-i18next';
import { Tab } from '@headlessui/react';
import { useAttributeTypes } from '../../context/AttributeTypeContext';
import { useBrands } from '../../context/BrandContext';
import { useCategories } from '../../context/CategoryContext';
import { useAttributes } from '../../context/AttributeContext';
import { useColors } from '../../context/ColorContext';
import { apiPost, apiGet, apiPut } from '../../utils/ApiUtils.jsx';
import { createproductWithImages, GET_PRODUCT_BY_ID, updateProductWithImages } from '../../contants/apiRoutes';
import { showEmsg } from '../../utils/ShowEmsg';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useTitle } from '../../context/TitleContext';

const AddProductForm = () => {
  const { productId } = useParams();
  const { setTitle } = useTitle();
  const [aVariants, setVariants] = useState([{
    ColourID: '',
    AttributeValues: [],
    Quantity: '',
    SellingPrice: '',
    images: []
  }]);
  const [nSelectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [oFormData, setFormData] = useState({
    AttributeTypeID: '',
    ProductName: '',
    ProductDescription: '',
    BrandID: '',
    CategoryID: '',
    MRP: '',
    ProductDiscount: '',
    Gender: '',
    CreatedBy: 'Admin',
    TraitType: ''
  });
  const [oValidationErrors, setValidationErrors] = useState({});

  // Refs for form fields
  const productNameRef = useRef(null);
  const attributeTypeRef = useRef(null);
  const brandRef = useRef(null);
  const mrpRef = useRef(null);
  const productDiscountRef = useRef(null);
  const genderRef = useRef(null);
  const categoryRef = useRef(null);
  const productDescriptionRef = useRef(null);
  const variantRefs = useRef(new Map());

  const addVariantRef = (id, el) => {
    if (el) {
      variantRefs.current.set(id, el);
    } else {
      variantRefs.current.delete(id);
    }
  };

  const { t } = useTranslation();
  const { aAttributeTypes, bLoading: bLoadingAttributeTypes, sError: sErrorAttributeTypes } = useAttributeTypes();
  const { aBrands, bLoading: bLoadingBrands, sError: sErrorBrands } = useBrands();
  const { aCategories, bLoading: bLoadingCategories, sError: sErrorCategories } = useCategories();
  const { aAttributes, bLoading: bLoadingAttributes, sError: sErrorAttributes } = useAttributes();
  const { aColors, bLoading: bLoadingColors, sError: sErrorColors } = useColors();

  useEffect(() => {
    if (productId && !bLoadingAttributeTypes && !bLoadingBrands && !bLoadingCategories && !bLoadingAttributes && !bLoadingColors) {
      const fetchProduct = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await apiGet(`${GET_PRODUCT_BY_ID}/${productId}`, {}, token);
          if (response.data.status === 'SUCCESS') {
            const product = response.data.data;
            setFormData({
              AttributeTypeID: '',
              ProductName: product.productName,
              ProductDescription: product.productDescription,
              BrandID: product.brandId,
              CategoryID: product.subCategoryId,
              MRP: product.MRP,
              ProductDiscount: product.productDiscount,
              Gender: product.gender,
              CreatedBy: product.createdBy || 'Admin',
              TraitType: product.TraitType || ''
            });
            if (product.variants && product.variants.length > 0 && product.variants[0].attributes) {
              const firstAttributeKey = Object.keys(product.variants[0].attributes)[0];
              if (firstAttributeKey && aAttributeTypes.length > 0) {
                const matchingAttributeType = aAttributeTypes.find(type => type.Name === firstAttributeKey);
                if (matchingAttributeType) {
                  setFormData(prev => ({ ...prev, AttributeTypeID: matchingAttributeType.AttributeTypeID }));
                }
              }
            }

            const fetchedVariants = product.variants.map(variant => {
              const attributeValuesFromAPI = Object.values(variant.attributes); // Get all attribute values as an array
              const attributeIds = attributeValuesFromAPI.map(attrName => {
                const matchingAttribute = aAttributes.find(attr => attr.AttributeName === attrName);
                return matchingAttribute ? matchingAttribute.AttributeID : '';
              }).filter(id => id !== ''); // Filter out any empty IDs

              return {
                ColourID: variant.colourId,
                AttributeValues: attributeIds, // Assign the array of IDs
                Quantity: variant.quantity,
                SellingPrice: variant.price,
                images: variant.images.map(image => ({
                  file: null,
                  preview: image
                }))
              };
            });
            setVariants(fetchedVariants);
          } else {
            console.error('Failed to fetch product:', response.data.message);
            showEmsg(`Failed to fetch product: ${response.data.message || 'Unknown error'}`, 'error');
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          showEmsg('An error occurred while fetching the product.', 'error');
        }
      };
      fetchProduct();
    }
  }, [productId, aAttributeTypes, aBrands, aCategories, aAttributes, aColors, bLoadingAttributeTypes, bLoadingBrands, bLoadingCategories, bLoadingAttributes, bLoadingColors]);

  useEffect(() => {
    setTitle(productId ? t('productCreation.editProduct') : t('productCreation.addProduct'));
  }, [setTitle, t, productId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error for this field when it changes
    setValidationErrors(prev => ({
      ...prev,
      [name]: undefined
    }));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...aVariants];
    if (field === 'AttributeValues') {
      newVariants[index][field] = Array.isArray(value) ? value : value.split(',').map(v => v.trim());
    } else {
      newVariants[index][field] = value;
    }
    setVariants(newVariants);
    // Clear validation error for this variant field when it changes
    setValidationErrors(prev => ({
      ...prev,
      [`variant_${index}_${field}`]: undefined
    }));
  };

  const oAddVariant = () => {
    setVariants([...aVariants, {
      ColourID: '',
      AttributeValues: [],
      Quantity: '',
      SellingPrice: '',
      images: []
    }]);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`variant_${aVariants.length}_`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  const removeVariant = (index) => {
    setVariants(aVariants.filter((_, i) => i !== index));
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`variant_${index}_`)) {
          delete newErrors[key];
        }
      });
      for (let i = index + 1; i <= aVariants.length - 1; i++) {
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith(`variant_${i}_`)) {
            const newKey = key.replace(`variant_${i}_`, `variant_${i - 1}_`);
            newErrors[newKey] = newErrors[key];
            delete newErrors[key];
          }
        });
      }
      return newErrors;
    });
  };

  const onDrop = useCallback((acceptedFiles, variantIndex) => {
    const newVariants = [...aVariants];
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    newVariants[variantIndex].images = [...newVariants[variantIndex].images, ...newImages];
    setVariants(newVariants);
    setValidationErrors(prev => ({ ...prev, [`variant_${variantIndex}_images`]: undefined }));
  }, [aVariants]);

  const removeImage = (variantIndex, imageIndex) => {
    const newVariants = [...aVariants];
    URL.revokeObjectURL(newVariants[variantIndex].images[imageIndex].preview);
    newVariants[variantIndex].images.splice(imageIndex, 1);
    setVariants(newVariants);
    if (newVariants[variantIndex].images.length === 0) {
      setValidationErrors(prev => ({
        ...prev,
        [`variant_${variantIndex}_images`]: t('productCreation.imageRequired') // Assuming you have this translation
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let firstErrorField = '';

    const addError = (field, message) => {
      if (!errors[field]) {
        errors[field] = message;
        if (!firstErrorField) firstErrorField = field;
      }
    };
    if (!oFormData.ProductName) addError('ProductName', t('productCreation.productNameRequired'));
    if (!oFormData.AttributeTypeID) addError('AttributeTypeID', t('productCreation.attributeIdRequired'));
    if (!oFormData.BrandID) addError('BrandID', t('productCreation.brandIdRequired'));
    if (!oFormData.MRP) addError('MRP', t('productCreation.mrpRequired'));
    else if (isNaN(oFormData.MRP) || parseFloat(oFormData.MRP) <= 0) addError('MRP', t('productCreation.mrpInvalid'));
    if (!oFormData.ProductDiscount && oFormData.ProductDiscount !== 0) addError('ProductDiscount', t('productCreation.productDiscountRequired'));
    else if (isNaN(oFormData.ProductDiscount) || parseFloat(oFormData.ProductDiscount) < 0 || parseFloat(oFormData.ProductDiscount) > 100) addError('ProductDiscount', t('productCreation.productDiscountInvalid'));
    if (!oFormData.Gender) addError('Gender', t('productCreation.genderRequired'));
    if (!oFormData.CategoryID) addError('CategoryID', t('productCreation.categoryIdRequired'));
    if (!oFormData.ProductDescription) addError('ProductDescription', t('productCreation.productDescriptionRequired'));
    aVariants.forEach((variant, index) => {
      if (!variant.ColourID) addError(`variant_${index}_ColourID`, t('productCreation.colourIdRequired'));
      if (!variant.AttributeValues || variant.AttributeValues.length === 0) addError(`variant_${index}_AttributeValues`, t('productCreation.attributeValuesRequired'));
      if (!variant.Quantity && variant.Quantity !== 0) addError(`variant_${index}_Quantity`, t('productCreation.quantityRequired'));
      else if (isNaN(variant.Quantity) || parseInt(variant.Quantity) < 0) addError(`variant_${index}_Quantity`, t('productCreation.quantityInvalid'));
      if (!variant.SellingPrice && variant.SellingPrice !== 0) addError(`variant_${index}_SellingPrice`, t('productCreation.sellingPriceRequired'));
      else if (isNaN(variant.SellingPrice) || parseFloat(variant.SellingPrice) <= 0) addError(`variant_${index}_SellingPrice`, t('productCreation.sellingPriceInvalid'));
      if (!variant.images || variant.images.length === 0) addError(`variant_${index}_images`, t('productCreation.imageRequired'));
    });

    setValidationErrors(errors);
    return firstErrorField;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const firstInvalidField = validateForm();
    if (firstInvalidField) {
      showEmsg(t('productCreation.validationError'), 'error');
      const refMap = {
        ProductName: productNameRef,
        AttributeTypeID: attributeTypeRef,
        BrandID: brandRef,
        MRP: mrpRef,
        ProductDiscount: productDiscountRef,
        Gender: genderRef,
        CategoryID: categoryRef,
        ProductDescription: productDescriptionRef,
      };

      if (refMap[firstInvalidField] && refMap[firstInvalidField].current) {
        refMap[firstInvalidField].current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (firstInvalidField.startsWith('variant_')) {
        const parts = firstInvalidField.split('_');
        const index = parseInt(parts[1]);
        const fieldName = parts[2];
        const variantId = `${fieldName}-${index}`;
        setSelectedVariantIndex(index);
        setTimeout(() => {
          const variantFieldRef = variantRefs.current.get(variantId);
          if (variantFieldRef) {
            variantFieldRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            const imageUploadContainer = document.getElementById(`variant-image-upload-${index}`);
            if (imageUploadContainer) {
              imageUploadContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }, 100);
      }
      return;
    }

    const token = localStorage.getItem("token");
    const selectedCategory = aCategories.find(cat => cat.CategoryID === oFormData.CategoryID);
    const categoryName = selectedCategory ? selectedCategory.CategoryName : '';

    const data = new FormData();
    const variantsData = aVariants.map((variant) => {
      const sellingPrice = parseFloat(oFormData.MRP) - (parseFloat(oFormData.MRP) * parseFloat(oFormData.ProductDiscount || 0)) / 100;
      return {
        ColourID: variant.ColourID,
        AttributeValues: variant.AttributeValues,
        Quantity: parseInt(variant.Quantity) || 0,
        SellingPrice: sellingPrice
      };
    });
    data.append("Data", JSON.stringify({
      AttributeTypeID: oFormData.AttributeTypeID,
      ProductName: oFormData.ProductName,
      ProductDescription: oFormData.ProductDescription,
      ProductDiscount: oFormData.ProductDiscount,
      Gender: oFormData.Gender,
      CategoryID: oFormData.CategoryID,
      CategoryName: categoryName,
      BrandID: oFormData.BrandID,
      MRP: oFormData.MRP,
      CreatedBy: "Admin",
      TenantID: 1,
      Variants: variantsData,
      ...(productId && { ProductID: productId })
    }));
    aVariants.forEach((variant, variantIndex) => {
      variant.images.forEach((img) => {
        if (img.file) { // Only append new files
          data.append(`images_${variantIndex + 1}`, img.file);
        }
      });
    });

    try {
      const response = productId
        ? await apiPut(`${updateProductWithImages}/${productId}`, data, token, true)
        : await apiPost(createproductWithImages, data, token, true);

      if (response.data.status === 'SUCCESS') {
        showEmsg(`Product ${productId ? 'updated' : 'created'} successfully!`, 'success');
      } else {
        showEmsg(`Failed to ${productId ? 'update' : 'create'} product: ${response.data.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error(`Error ${productId ? 'updating' : 'creating'} product:`, error);
      showEmsg(`An error occurred while ${productId ? 'updating' : 'creating'} the product.`, 'error');
    }
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
        <ToastContainer />
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
            <p className="text-gray-500">
              {productId
                ? t('productCreation.editProductDescription')
                : t('productCreation.createNewStoreDescription')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
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
                      error={oValidationErrors.ProductName}
                      ref={productNameRef}
                    />
                  </div>
                  <div>
                    <SelectWithIcon
                      label={t('productCreation.attributeId')}
                      id="AttributeTypeID"
                      name="AttributeTypeID"
                      value={oFormData.AttributeTypeID}
                      onChange={handleInputChange}
                      options={aAttributeTypes.map(type => ({
                        value: type.AttributeTypeID,
                        label: type.Name
                      }))}
                      Icon={Hash}
                      loading={bLoadingAttributeTypes}
                      error={oValidationErrors.AttributeTypeID || sErrorAttributeTypes}
                      placeholder={t('productCreation.attributeIdPlaceholder') || "Select attribute type"}
                      ref={attributeTypeRef}
                    />
                  </div>
                  <div>
                    <SelectWithIcon
                      label={t('productCreation.brandId')}
                      id="BrandID"
                      name="BrandID"
                      value={oFormData.BrandID}
                      onChange={handleInputChange}
                      options={aBrands.map(brand => ({
                        value: brand.BrandID,
                        label: brand.BrandName
                      }))}
                      Icon={Tag}
                      loading={bLoadingBrands}
                      error={oValidationErrors.BrandID || sErrorBrands}
                      placeholder={t('productCreation.brandIdPlaceholder') || "Select brand"}
                      ref={brandRef}
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
                      error={oValidationErrors.MRP}
                      ref={mrpRef}
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
                      error={oValidationErrors.ProductDiscount}
                      ref={productDiscountRef}
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
                      error={oValidationErrors.Gender}
                      ref={genderRef}
                    />
                  </div>
                </div>
              </div>
              <div>
                <SelectWithIcon
                  label={t('productCreation.categoryId')}
                  id="CategoryID"
                  name="CategoryID"
                  value={oFormData.CategoryID}
                  onChange={handleInputChange}
                  options={aCategories.map(category => ({
                    value: category.CategoryID,
                    label: category.CategoryName
                  }))}
                  Icon={Tag}
                  loading={bLoadingCategories}
                  error={oValidationErrors.CategoryID || sErrorCategories}
                  placeholder={t('productCreation.categoryIdPlaceholder') || "Select category"}
                  ref={categoryRef}
                />
              </div>
              <div>
                <label htmlFor="ProductDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('productCreation.productDescription')}
                </label>
                <ReactQuill
                  theme="snow"
                  value={oFormData.ProductDescription}
                  onChange={(value) => handleInputChange({ target: { name: 'ProductDescription', value } })}
                  placeholder={t('productCreation.productDescriptionPlaceholder') || "Enter product description"}
                  className={`h-32 mb-10 ${oValidationErrors.ProductDescription ? 'border-red-500' : ''}`}
                  ref={productDescriptionRef}
                />
                {oValidationErrors.ProductDescription && (
                  <p className="text-red-500 text-sm mt-1 mb-2">{oValidationErrors.ProductDescription}</p>
                )}
              </div>
            </div>
          </div>

          {/* Product Variant Information */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Layers className="h-6 w-6 mr-3 text-custom-bg" />
                {t('productCreation.variantInformation')}
              </h2>
              <button
                type="button"
                onClick={oAddVariant}
                className="btn-secondry inline-flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>{t('productCreation.addNewVariant')}</span>
              </button>
            </div>
            <Tab.Group selectedIndex={nSelectedVariantIndex} onChange={setSelectedVariantIndex}>
              <Tab.List className="flex flex-wrap border-b border-gray-200 bg-gray-50 p-4">
                {aVariants.map((variant, index) => (
                  <Tab
                    key={index}
                    className={({ selected }) =>
                      `px-6 py-3 text-sm font-medium leading-5 border-b-2 outline-none
                      ${selected
                        ? 'border-custom-bg text-custom-bg'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`
                    }
                  >
                    {t('productCreation.variant')} {index + 1}
                    {aVariants.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent tab change on delete
                          removeVariant(index);
                        }}
                        className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        <X className="h-4 w-4 inline-block align-middle" />
                      </button>
                    )}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels className="p-8">
                {aVariants.map((variant, index) => (
                  <Tab.Panel key={index}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-6">
                        <div>
                          <SelectWithIcon
                            label={t('productCreation.colourId')}
                            id={`ColourID-${index}`}
                            name="ColourID"
                            value={variant.ColourID}
                            onChange={(e) => handleVariantChange(index, 'ColourID', e.target.value)}
                            options={aColors.map(color => ({
                              value: color.ColourID,
                              label: `${color.Name}`
                            }))}
                            Icon={Palette}
                            loading={bLoadingColors}
                            error={oValidationErrors[`variant_${index}_ColourID`] || sErrorColors}
                            placeholder={t('productCreation.colourIdPlaceholder') || "Select colour"}
                            ref={el => addVariantRef(`ColourID-${index}`, el)}
                          />
                        </div>
                        <div>
                          <SelectWithIcon
                            label={t('productCreation.attributeValues')}
                            id={`AttributeValues-${index}`}
                            name="AttributeValues"
                            value={variant.AttributeValues}
                            onChange={(e) => handleVariantChange(index, 'AttributeValues', e.target.value)}
                            options={aAttributes.map(attribute => ({
                              value: attribute.AttributeID,
                              label: `${attribute.AttributeName}`
                            }))}
                            Icon={Layers}
                            loading={bLoadingAttributes}
                            error={oValidationErrors[`variant_${index}_AttributeValues`] || sErrorAttributes}
                            placeholder={t('productCreation.attributeValuesPlaceholder') || "Select attribute values"}
                            multiple
                            ref={el => addVariantRef(`AttributeValues-${index}`, el)}
                          />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <TextInputWithIcon
                            label={t('productCreation.quantity')}
                            id={`Quantity-${index}`}
                            name="Quantity"
                            value={variant.Quantity}
                            onChange={(e) => handleVariantChange(index, 'Quantity', e.target.value)}
                            placeholder={t('productCreation.quantityPlaceholder') || "Enter quantity"}
                            Icon={Hash}
                            error={oValidationErrors[`variant_${index}_Quantity`]}
                            ref={el => addVariantRef(`Quantity-${index}`, el)}
                          />
                        </div>
                        <div>
                          <TextInputWithIcon
                            label={t('productCreation.sellingPrice')}
                            id={`SellingPrice-${index}`}
                            name="SellingPrice"
                            value={variant.SellingPrice}
                            onChange={(e) => handleVariantChange(index, 'SellingPrice', e.target.value)}
                            placeholder={t('productCreation.sellingPricePlaceholder') || "Enter selling price"}
                            Icon={DollarSign}
                            error={oValidationErrors[`variant_${index}_SellingPrice`]}
                            ref={el => addVariantRef(`SellingPrice-${index}`, el)}
                          />
                        </div>
                      </div>
                    </div>
                    <VariantImageUpload variantIndex={index} />
                    {oValidationErrors[`variant_${index}_images`] && (
                      <p className="text-red-500 text-sm mt-1 mb-2">{oValidationErrors[`variant_${index}_images`]}</p>
                    )}
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
            <div id={`variant-image-upload-${nSelectedVariantIndex}`} />
          </div>
          <div className="flex justify-end space-x-4 mb-8">
            <button type="button" className="btn-cancel">
              {t('productCreation.cancel')}
            </button>
            <button type="submit" className="btn-primary">
              {productId ? t('productCreation.saveChanges') : t('productCreation.saveProduct')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm; 