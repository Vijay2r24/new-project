import { useState, useCallback, useEffect, useRef } from "react";
import {
  Plus,
  X,
  Upload,
  Tag,
  DollarSign,
  Hash,
  Users,
  ShoppingBag,
  Palette,
  Layers,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import TextInputWithIcon from "../../components/TextInputWithIcon";
import SelectWithIcon from "../../components/SelectWithIcon";
import { useTranslation } from "react-i18next";
import { STATUS } from "../../contants/constants.jsx";
import { Tab } from "@headlessui/react";
import {
  useAttributeTypes,
  useBrands,
  useCategories,
  useAttributes,
  useColors,
  useStores,
} from "../../context/AllDataContext";
import { apiPost, apiGet, apiPut } from "../../utils/ApiUtils.jsx";
import {
  CREATE_PRODUCT_WITH_IMAGES,
  GET_PRODUCT_BY_ID,
  UPDATE_PRODUCT_WITH_IMAGES,
} from "../../contants/apiRoutes";
import { showEmsg } from "../../utils/ShowEmsg";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useTitle } from "../../context/TitleContext";
import  BackButton from '../../components/BackButton.jsx';
const AddProductForm = () => {
  const { productId } = useParams();
  const { setTitle, setBackButton } = useTitle();
  const [aVariants, setVariants] = useState([
    {
      ColourID: "",
      AttributeValues: [],
      Quantity: "",
      SellingPrice: "",
      images: [],
    },
  ]);
  const [nSelectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [oFormData, setFormData] = useState({
    AttributeTypeID: "",
    ProductName: "",
    ProductDescription: "",
    BrandID: "",
    CategoryID: "",
    StoreID: "",
    MRP: "",
    ProductDiscount: "",
    Gender: "",
    CreatedBy: "Admin",
    TraitType: "",
  });
  const [oValidationErrors, setValidationErrors] = useState({});
  const [fetchedProduct, setFetchedProduct] = useState(null);

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
  const { data: aAttributeTypes, fetch: fetchAllAttributeTypes } = useAttributeTypes();
  const { data: aBrands, fetch: fetchAllBrands } = useBrands();
  const { data: aCategories, fetch: fetchAllCategories } = useCategories();
  const { data: aAttributes, fetch: fetchAllAttributes } = useAttributes();
  const { data: aColors, fetch: fetchAllColors } = useColors();
  const { data: aStores, fetch: fetchAllStores } = useStores();

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await apiGet(
            `${GET_PRODUCT_BY_ID}/${productId}`,
            {},
            token
          );
          if (response.data.STATUS === STATUS.SUCCESS.toUpperCase()) {
            const product = response.data?.data?.data;
            setFormData({
              AttributeTypeID: product.attributeTypeID,
              ProductName: product.productName,
              ProductID:productId,
              ProductDescription: product.productDescription,
              BrandID: product.brandId,
              CategoryID: product.subCategoryId,
              StoreID: product.storeId,
              MRP: product.MRP,
              ProductDiscount: typeof product.productDiscount === 'string' ? parseFloat(product.productDiscount.replace('%', '')) : product.productDiscount,
              Gender: product.gender || '',
              CreatedBy: product.createdBy || "Admin",
              TraitType: product.TraitType || "",
            });
            setFetchedProduct(product);
            if (
              product.variants &&
              product.variants.length > 0 &&
              product.variants[0].attributes
            ) {
              const firstAttributeKey = Object.keys(
                product.variants[0].attributes
              )[0];
              if (firstAttributeKey && aAttributeTypes.length > 0) {
                const matchingAttributeType = aAttributeTypes.find(
                  (type) => type.Name === firstAttributeKey
                );
                if (matchingAttributeType) {
                  setFormData((prev) => ({
                    ...prev,
                    AttributeTypeID: matchingAttributeType.AttributeTypeID,
                  }));
                }
              }
            }
          }
        } catch (error) {}
      };
      fetchProduct();
    }
  }, [productId]);

  useEffect(() => {
    if (fetchedProduct && aAttributes.length > 0) {
      const fetchedVariants = fetchedProduct.variants.map((variant) => {
        const attributeValuesFromAPI = Object.values(variant.attributes);
        const attributeIds = attributeValuesFromAPI
          .map((attrName) => {
            const matchingAttribute = aAttributes.find(
              (attr) => attr.AttributeName === attrName
            );
            return matchingAttribute ? matchingAttribute.AttributeID : "";
          })
          .filter((id) => id !== "");
        return {
          ColourID: variant.colourId,
          AttributeValues: attributeIds,
          Quantity: variant.quantity,
          SellingPrice: variant.price,
          images: variant.images.map((image) => ({
            file: null,
            preview: image,
          })),
        };
      });
      setVariants(fetchedVariants);
      setFetchedProduct(null); // Prevent re-running
    }
  }, [fetchedProduct, aAttributes]);

  useEffect(() => {
    setTitle(
      productId ? t("PRODUCTS.EDIT_PRODUCT") : t("PRODUCTS.ADD_NEW_PRODUCT")
    );
      setBackButton(<BackButton onClick={() =>window.history.back()} />);
    return () => setBackButton(null);
  }, [setTitle, setBackButton, t, productId]);

  useEffect(() => {
    fetchAllAttributeTypes();
    fetchAllBrands();
    fetchAllCategories();
    fetchAllColors();
    fetchAllStores();
  }, []);

  useEffect(() => {
    if (oFormData.AttributeTypeID) {
      fetchAllAttributes({ AttributeTypeID: oFormData.AttributeTypeID });
    }
  }, [oFormData.AttributeTypeID]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
    if (name === "AttributeTypeID") {
      fetchAllAttributes({ AttributeTypeID: value });
    }
  };

  const handleVariantChange = (index, field, value) => {
    setVariants(prevVariants => {
      const newVariants = [...prevVariants];
      if (field === "AttributeValues") {
        newVariants[index][field] = Array.isArray(value)
          ? value
          : value.split(",").map((v) => v.trim());
      } else {
        newVariants[index][field] = value;
      }
      return newVariants;
    });
    setValidationErrors((prev) => ({
      ...prev,
      [`variant_${index}_${field}`]: undefined,
    }));
  };

  const oAddVariant = () => {
    setVariants(prevVariants => {
      const newVariants = [
        ...prevVariants,
        {
          ColourID: "",
          AttributeValues: [],
          Quantity: "",
          SellingPrice: "",
          images: [],
        },
      ];
      
      // Clear validation errors for the new variant
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach((key) => {
          if (key.startsWith(`variant_${prevVariants.length}_`)) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
      
      return newVariants;
    });
  };

  const removeVariant = (index) => {
    setVariants(prevVariants => {
      const newVariants = prevVariants.filter((_, i) => i !== index);
      
      // Update validation errors
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach((key) => {
          if (key.startsWith(`variant_${index}_`)) {
            delete newErrors[key];
          }
        });
        for (let i = index + 1; i <= prevVariants.length - 1; i++) {
          Object.keys(newErrors).forEach((key) => {
            if (key.startsWith(`variant_${i}_`)) {
              const newKey = key.replace(`variant_${i}_`, `variant_${i - 1}_`);
              newErrors[newKey] = newErrors[key];
              delete newErrors[key];
            }
          });
        }
        return newErrors;
      });
      
      return newVariants;
    });
  };

  const onDrop = useCallback(
    (acceptedFiles, variantIndex) => {
      setVariants(prevVariants => {
        const newVariants = [...prevVariants];
        const newImages = acceptedFiles.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
        }));
        newVariants[variantIndex].images = [
          ...newVariants[variantIndex].images,
          ...newImages,
        ];
        return newVariants;
      });
      setValidationErrors((prev) => ({
        ...prev,
        [`variant_${variantIndex}_images`]: undefined,
      }));
    },
    [] // Remove aVariants dependency
  );

  const removeImage = (variantIndex, imageIndex) => {
    setVariants(prevVariants => {
      const newVariants = [...prevVariants];
      URL.revokeObjectURL(newVariants[variantIndex].images[imageIndex].preview);
      newVariants[variantIndex].images.splice(imageIndex, 1);
      
      // Check if no images remain after removal
      if (newVariants[variantIndex].images.length === 0) {
        setValidationErrors((prev) => ({
          ...prev,
          [`variant_${variantIndex}_images`]: t(
            "PRODUCT_CREATION.IMAGE_REQUIRED"
          ),
        }));
      } else {
        setValidationErrors((prev) => ({
          ...prev,
          [`variant_${variantIndex}_images`]: undefined,
        }));
      }
      
      return newVariants;
    });
  };

  const validateForm = () => {
    const errors = {};
    let firstErrorField = "";

    const addError = (field, message) => {
      if (!errors[field]) {
        errors[field] = message;
        if (!firstErrorField) firstErrorField = field;
      }
    };
    if (!oFormData.ProductName)
      addError("ProductName", t("PRODUCT_CREATION.PRODUCT_NAME_REQUIRED"));
    if (!oFormData.AttributeTypeID)
      addError("AttributeTypeID", t("PRODUCT_CREATION.ATTRIBUTE_ID_REQUIRED"));
    if (!oFormData.BrandID)
      addError("BrandID", t("PRODUCT_CREATION.BRAND_ID_REQUIRED"));
    if (!oFormData.MRP) addError("MRP", t("PRODUCT_CREATION.MRP_REQUIRED"));
    else if (isNaN(oFormData.MRP) || parseFloat(oFormData.MRP) <= 0)
      addError("MRP", t("PRODUCT_CREATION.MRP_INVALID"));
    if (!oFormData.ProductDiscount && oFormData.ProductDiscount !== 0)
      addError(
        "ProductDiscount",
        t("PRODUCT_CREATION.PRODUCT_DISCOUNT_REQUIRED")
      );
    else if (
      isNaN(oFormData.ProductDiscount) ||
      parseFloat(oFormData.ProductDiscount) < 0 ||
      parseFloat(oFormData.ProductDiscount) > 100
    )
      addError(
        "ProductDiscount",
        t("PRODUCT_CREATION.PRODUCT_DISCOUNT_INVALID")
      );
    if (!oFormData.Gender)
      addError("Gender", t("PRODUCT_CREATION.GENDER_REQUIRED"));
    if (!oFormData.CategoryID)
      addError("CategoryID", t("PRODUCT_CREATION.CATEGORY_ID_REQUIRED"));
    if (!oFormData.ProductDescription)
      addError(
        "ProductDescription",
        t("PRODUCT_CREATION.PRODUCT_DESCRIPTION_REQUIRED")
      );
    aVariants.forEach((variant, index) => {
      if (!variant.ColourID)
        addError(
          `variant_${index}_ColourID`,
          t("PRODUCT_CREATION.COLOUR_ID_REQUIRED")
        );
      if (!variant.AttributeValues || variant.AttributeValues.length === 0)
        addError(
          `variant_${index}_AttributeValues`,
          t("PRODUCT_CREATION.ATTRIBUTE_VALUES_REQUIRED")
        );
      if (!variant.Quantity && variant.Quantity !== 0)
        addError(
          `variant_${index}_Quantity`,
          t("PRODUCT_CREATION.QUANTITY_REQUIRED")
        );
      else if (isNaN(variant.Quantity) || parseInt(variant.Quantity) < 0)
        addError(
          `variant_${index}_Quantity`,
          t("PRODUCT_CREATION.QUANTITY_INVALID")
        );
      if (!variant.SellingPrice && variant.SellingPrice !== 0)
        addError(
          `variant_${index}_SellingPrice`,
          t("PRODUCT_CREATION.SELLING_PRICE_REQUIRED")
        );
      else if (
        isNaN(variant.SellingPrice) ||
        parseFloat(variant.SellingPrice) <= 0
      )
        addError(
          `variant_${index}_SellingPrice`,
          t("PRODUCT_CREATION.SELLING_PRICE_INVALID")
        );
      if (!variant.images || variant.images.length === 0)
        addError(
          `variant_${index}_images`,
          t("PRODUCT_CREATION.IMAGE_REQUIRED")
        );
    });

    setValidationErrors(errors);
    return firstErrorField;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const firstInvalidField = validateForm();
    if (firstInvalidField) {
      showEmsg(t("PRODUCT_CREATION.VALIDATION_ERROR"), STATUS.ERROR);
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
        refMap[firstInvalidField].current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else if (firstInvalidField.startsWith("variant_")) {
        const parts = firstInvalidField.split("_");
        const index = parseInt(parts[1]);
        const fieldName = parts[2];
        const variantId = `${fieldName}-${index}`;
        setSelectedVariantIndex(index);
        setTimeout(() => {
          const variantFieldRef = variantRefs.current.get(variantId);
          if (variantFieldRef) {
            variantFieldRef.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          } else {
            const imageUploadContainer = document.getElementById(
              `variant-image-upload-${index}`
            );
            if (imageUploadContainer) {
              imageUploadContainer.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }
        }, 100);
      }
      return;
    }

    const token = localStorage.getItem("token");
    const selectedCategory = aCategories.find(
      (cat) => cat.CategoryID === oFormData.CategoryID
    );
    const categoryName = selectedCategory ? selectedCategory.CategoryName : "";

    const data = new FormData();
    const variantsData = aVariants.map((variant) => {
      const sellingPrice =
        parseFloat(oFormData.MRP) -
        (parseFloat(oFormData.MRP) *
          parseFloat(oFormData.ProductDiscount || 0)) /
          100;
      return {
        ColourID: variant.ColourID,
        AttributeValues: variant.AttributeValues,
        Quantity: parseInt(variant.Quantity) || 0,
        SellingPrice: sellingPrice,
      };
    });
    data.append(
      "Data",
      JSON.stringify({
        AttributeTypeID: oFormData.AttributeTypeID,
        ProductName: oFormData.ProductName,
        ProductDescription: oFormData.ProductDescription,
        ProductDiscount: oFormData.ProductDiscount,
        Gender: oFormData.Gender,
        CategoryID: oFormData.CategoryID,
        StoreID: oFormData.StoreID,
        CategoryName: categoryName,
        BrandID: oFormData.BrandID,
        MRP: oFormData.MRP,
        CreatedBy: "Admin",
        TenantID: localStorage.getItem('tenantID'),
        Variants: variantsData,
        ...(productId && { ProductID: productId }),
      })
    );
    aVariants.forEach((variant, variantIndex) => {
      variant.images.forEach((img) => {
        if (img.file) {
          data.append(`images_${variantIndex}`, img.file);
        }
      });
    });

    try {
      const response = productId
        ? await apiPut(
            `${UPDATE_PRODUCT_WITH_IMAGES}/${productId}`,
            data,
            token,
            true
          )
        : await apiPost(CREATE_PRODUCT_WITH_IMAGES, data, token, true);

      const resData = response?.data;

      if (resData?.STATUS === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(
          resData.MESSAGE ||
            (productId
              ? t("PRODUCT_CREATION.PRODUCT_UPDATED_SUCCESS")
              : t("PRODUCT_CREATION.PRODUCT_CREATED_SUCCESS")),
          STATUS.SUCCESS
        );
      } else {
        showEmsg(
          resData?.MESSAGE ||
            (productId
              ? t("PRODUCT_CREATION.PRODUCT_UPDATE_FAILED")
              : t("PRODUCT_CREATION.PRODUCT_CREATE_FAILED")),
          STATUS.ERROR
        );
      }
    } catch (error) {
      const backendMessage = error?.response?.data?.MESSAGE;
      showEmsg(
        backendMessage || t("PRODUCT_CREATION.PRODUCT_SUBMIT_ERROR"),
        STATUS.ERROR
      );
    }
  };

  const VariantImageUpload = ({ variantIndex }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => onDrop(files, variantIndex),
      accept: {
        "image/*": [".jpeg", ".jpg", ".png", ".webp"],
      },
      maxSize: 5242880,
    });

    return (
      <div className="mt-4">
        <ToastContainer />
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
            ${
              isDragActive
                ? "border-blue-500 bg-blue-50 scale-[1.02] shadow-lg"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50 hover:shadow-md"
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-blue-50 rounded-2xl">
              <Upload className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-sm text-caption">
              {isDragActive ? (
                <p className="font-medium text-blue-600 text-base">
                  {t("PRODUCT_CREATION.DROP_IMAGES_HERE")}
                </p>
              ) : (
                <p className="text-base">
                  {t("PRODUCT_CREATION.DRAG_DROP_OR_CLICK")}
                </p>
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
                    alt={`Variant ${variantIndex + 1} - Image ${
                      imageIndex + 1
                    }`}
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
            <p className="text-gray-500">
              {productId
                ? t("PRODUCTS.EDIT_PRODUCT_DESCRIPTION")
                : t("PRODUCTS.CREATE_PRODUCT_DESCRIPTION")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ShoppingBag className="h-6 w-6 mr-3 text-custom-bg" />
                {t("COMMON.BASIC_INFORMATION")}
              </h2>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <TextInputWithIcon
                      label={t("PRODUCT_CREATION.PRODUCT_NAME")}
                      id="ProductName"
                      name="ProductName"
                      value={oFormData.ProductName}
                      onChange={handleInputChange}
                      placeholder={
                        t("PRODUCT_CREATION.PRODUCT_NAME_PLACEHOLDER")
                      }
                      Icon={Tag}
                      error={oValidationErrors.ProductName}
                      ref={productNameRef}
                    />
                  </div>
                  <div>
                    <SelectWithIcon
                      label={t("PRODUCT_CREATION.ATTRIBUTE_ID")}
                      id="AttributeTypeID"
                      name="AttributeTypeID"
                      value={oFormData.AttributeTypeID}
                      onChange={handleInputChange}
                      options={aAttributeTypes.map((type) => ({
                        value: type.attributeTypeID,
                        label: type.name,
                      }))}
                      Icon={Hash}
                      error={oValidationErrors.AttributeTypeID}
                      placeholder={t("PRODUCT_CREATION.ATTRIBUTE_ID_PLACEHOLDER")}
                      ref={attributeTypeRef}
                      onInputChange={(value) => fetchAllAttributeTypes({ searchText: value })}
                    />
                  </div>
                  <div>
                    <SelectWithIcon
                      label={t("PRODUCT_CREATION.BRAND_ID")}
                      id="BrandID"
                      name="BrandID"
                      value={oFormData.BrandID}
                      onChange={handleInputChange}
                      options={aBrands.map((brand) => ({
                        value: brand.BrandID,
                        label: brand.BrandName,
                      }))}
                      Icon={Tag}
                      error={oValidationErrors.BrandID}
                      placeholder={t("PRODUCT_CREATION.BRAND_ID_PLACEHOLDER")}
                      ref={brandRef}
                      onInputChange={(value) => fetchAllBrands({ searchText: value })}
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <TextInputWithIcon
                      label={t("PRODUCT_CREATION.MRP")}
                      id="MRP"
                      name="MRP"
                      value={oFormData.MRP}
                      onChange={handleInputChange}
                      placeholder={
                        t("PRODUCT_CREATION.MRP_PLACEHOLDER")
                      }
                      Icon={DollarSign}
                      error={oValidationErrors.MRP}
                      ref={mrpRef}
                    />
                  </div>
                  <div>
                    <TextInputWithIcon
                      label={t("PRODUCT_CREATION.PRODUCT_DISCOUNT")}
                      id="ProductDiscount"
                      name="ProductDiscount"
                      value={oFormData.ProductDiscount}
                      onChange={handleInputChange}
                      placeholder={
                        t("PRODUCT_CREATION.PRODUCT_DISCOUNT_PLACEHOLDER")
                      }
                      Icon={Tag}
                      error={oValidationErrors.ProductDiscount}
                      ref={productDiscountRef}
                    />
                  </div>
                  <div>
                    <SelectWithIcon
                      label={t("PRODUCT_CREATION.GENDER")}
                      id="Gender"
                      name="Gender"
                      value={oFormData.Gender}
                      onChange={handleInputChange}
                      options={[
                        { value: "Male", label: t("PRODUCT_CREATION.MALE") },
                        {
                          value: "Female",
                          label: t("PRODUCT_CREATION.FEMALE"),
                        },
                        { value: "Unisex", label: t("PRODUCT_CREATION.UNISEX") },
                        { value: "Other", label: t("PRODUCT_CREATION.OTHER") },
                      ]}
                      Icon={Users}
                      error={oValidationErrors.Gender}
                      ref={genderRef}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <SelectWithIcon
                    label={t("PRODUCT_CREATION.CATEGORY_ID")}
                    id="CategoryID"
                    name="CategoryID"
                    value={oFormData.CategoryID}
                    onChange={handleInputChange}
                    options={aCategories.map((category) => ({
                      value: category.CategoryID,
                      label: category.CategoryName,
                    }))}
                    Icon={Tag}
                    error={oValidationErrors.CategoryID}
                    placeholder={t("PRODUCT_CREATION.CATEGORY_ID_PLACEHOLDER")}
                    ref={categoryRef}
                    onInputChange={(value) => fetchAllCategories({ searchText: value })}
                  />
                </div>
                <div>
                  <SelectWithIcon
                    label={t("COMMON.STORE")}
                    id="StoreID"
                    name="StoreID"
                    value={oFormData.StoreID}
                    onChange={handleInputChange}
                    options={aStores.map((store) => ({
                      value: store.StoreID,
                      label: store.StoreName,
                    }))}
                    Icon={Tag}
                    error={oValidationErrors.StoreID}
                    placeholder={t("PRODUCT_CREATION.STORE_ID_PLACEHOLDER") || "Select store"}
                    onInputChange={(value) => fetchAllStores({ searchText: value })}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="ProductDescription"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("PRODUCT_CREATION.PRODUCT_DESCRIPTION")}
                </label>
                <ReactQuill
                  theme="snow"
                  value={oFormData.ProductDescription}
                  onChange={(value) =>
                    handleInputChange({
                      target: { name: "ProductDescription", value },
                    })
                  }
                  placeholder={
                    t("PRODUCT_CREATION.PRODUCT_DESCRIPTION_PLACEHOLDER")
                  }
                  className={`h-32 mb-10 ${
                    oValidationErrors.ProductDescription ? "border-red-500" : ""
                  }`}
                  ref={productDescriptionRef}
                />
                {oValidationErrors.ProductDescription && (
                  <p className="text-red-500 text-sm mt-1 mb-2">
                    {oValidationErrors.ProductDescription}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Layers className="h-6 w-6 mr-3 text-custom-bg" />
                {t("PRODUCT_CREATION.VARIANT_INFORMATION")}
              </h2>
              <button
                type="button"
                onClick={oAddVariant}
                className="btn-secondry inline-flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>{t("PRODUCT_CREATION.ADD_NEW_VARIANT")}</span>
              </button>
            </div>
            <Tab.Group
              selectedIndex={nSelectedVariantIndex}
              onChange={setSelectedVariantIndex}
            >
              <Tab.List className="flex flex-wrap border-b border-gray-200 bg-gray-50 p-4">
                {aVariants.map((variant, index) => (
                  <Tab
                    key={index}
                    className={({ selected }) =>
                      `px-6 py-3 text-sm font-medium leading-5 border-b-2 outline-none
                      ${
                        selected
                          ? "border-custom-bg text-custom-bg"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`
                    }
                  >
                    {t("PRODUCT_CREATION.VARIANT")} {index + 1}
                    {aVariants.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
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
                            label={t("PRODUCT_CREATION.COLOUR_ID")}
                            id={`ColourID-${index}`}
                            name="ColourID"
                            value={variant.ColourID}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "ColourID",
                                e.target.value
                              )
                            }
                            onInputChange={(value) => fetchAllColors({ searchText: value })}
                            options={aColors.map((color) => ({
                              value: color.ColourID,
                              label: `${color.Name}`,
                            }))}
                            Icon={Palette}
                            error={
                              oValidationErrors[`variant_${index}_ColourID`]
                            }
                            placeholder={
                              t("PRODUCT_CREATION.COLOUR_ID_PLACEHOLDER") ||
                              "Select colour"
                            }
                            ref={(el) => addVariantRef(`ColourID-${index}`, el)}
                          />
                        </div>
                        <div>
                          <SelectWithIcon
                            label={t("PRODUCT_CREATION.ATTRIBUTE_VALUES")}
                            id={`AttributeValues-${index}`}
                            name="AttributeValues"
                            value={variant.AttributeValues}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "AttributeValues",
                                e.target.value
                              )
                            }
                            options={aAttributes
                              .filter(attribute => attribute.AttributeTypeID === oFormData.AttributeTypeID)
                              .map(attribute => ({
                                value: attribute.AttributeID,
                                label: `${attribute.AttributeName}`,
                              }))}
                            Icon={Layers}
                            error={
                              oValidationErrors[
                                `variant_${index}_AttributeValues`
                              ]
                            }
                            placeholder={
                              t(
                                "PRODUCT_CREATION.ATTRIBUTE_VALUES_PLACEHOLDER"
                              ) || "Select attribute values"
                            }
                            multiple
                            ref={(el) =>
                              addVariantRef(`AttributeValues-${index}`, el)
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <TextInputWithIcon
                            label={t("PRODUCT_CREATION.QUANTITY")}
                            id={`Quantity-${index}`}
                            name="Quantity"
                            value={variant.Quantity}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "Quantity",
                                e.target.value
                              )
                            }
                            placeholder={
                              t("PRODUCT_CREATION.QUANTITY_PLACEHOLDER") ||
                              "Enter quantity"
                            }
                            Icon={Hash}
                            error={
                              oValidationErrors[`variant_${index}_Quantity`]
                            }
                            ref={(el) => addVariantRef(`Quantity-${index}`, el)}
                          />
                        </div>
                        <div>
                          <TextInputWithIcon
                            label={t("PRODUCT_CREATION.SELLING_PRICE")}
                            id={`SellingPrice-${index}`}
                            name="SellingPrice"
                            value={variant.SellingPrice}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "SellingPrice",
                                e.target.value
                              )
                            }
                            placeholder={
                              t("PRODUCT_CREATION.SELLING_PRICE_PLACEHOLDER") ||
                              "Enter selling price"
                            }
                            Icon={DollarSign}
                            error={
                              oValidationErrors[`variant_${index}_SellingPrice`]
                            }
                            ref={(el) =>
                              addVariantRef(`SellingPrice-${index}`, el)
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <VariantImageUpload variantIndex={index} />
                    {oValidationErrors[`variant_${index}_images`] && (
                      <p className="text-red-500 text-sm mt-1 mb-2">
                        {oValidationErrors[`variant_${index}_images`]}
                      </p>
                    )}
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
            <div id={`variant-image-upload-${nSelectedVariantIndex}`} />
          </div>
          <div className="flex justify-end space-x-4 mb-8">
            <button type="button" className="btn-cancel">
              {t("PRODUCT_CREATION.CANCEL")}
            </button>
            <button type="submit" className="btn-primary">
              {productId
                ? t("PRODUCT_CREATION.SAVE_CHANGES")
                : t("PRODUCT_CREATION.SAVE_PRODUCT")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
