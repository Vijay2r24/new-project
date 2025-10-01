
import { useState, useCallback, useEffect, useRef } from "react";
import {
  Plus,
  X,
  Upload,
  Tag,
  Hash,
  ShoppingBag,
  Layers,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import TextInputWithIcon from "../../components/TextInputWithIcon";
import SelectWithIcon from "../../components/SelectWithIcon";
import { useTranslation } from "react-i18next";
import { STATUS } from "../../contants/constants.jsx";
import { Tab } from "@headlessui/react";
import { useSelector, useDispatch } from "react-redux";
import { fetchResource } from "../../store/slices/allDataSlice.jsx";
import { apiPost, apiGet } from "../../utils/ApiUtils.jsx";
import {
  CREATE_OR_UPDATE_PRODUCT,
  GET_PRODUCT_BY_ID,
} from "../../contants/apiRoutes";
import { showEmsg } from "../../utils/ShowEmsg";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useTitle } from "../../context/TitleContext";
import BackButton from "../../components/BackButton.jsx";
import Loader from "../../components/Loader";
import { hideLoaderWithDelay } from "../../utils/loaderUtils";
import ImageCropperModal from "../../components/ImageCropperModal";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const AddProductForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setTitle, setBackButton } = useTitle();
  const [aVariants, setVariants] = useState([
    {
      attributes: [],
      Quantity: "",
      MRP: "",
      ProductDiscount: "",
      SellingPrice: "",
      StoreID: "",
      images: [],
    },
  ]);
  const [nSelectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [oFormData, setFormData] = useState({
    ProductName: "",
    ProductDescription: "",
    BrandID: "",
    CategoryID: "",
    StoreID: "",
    CreatedBy: "Admin",
    TenantID: localStorage.getItem("tenantID"),
    SpecificationTypeID: "",
  });
  const [aSpecifications, setSpecifications] = useState([
    {
      SpecificationTypeID: "",
      Value: "",
    },
  ]);
  const [oValidationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [cropperModal, setCropperModal] = useState({
    isOpen: false,
    image: "",
    variantIndex: null,
    originalFile: null,
  });
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );
  const productNameRef = useRef(null);
  const brandRef = useRef(null);
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
  const attributeTypes = useSelector(
    (state) => state.allData.resources.attributeTypes?.data || []
  );
  const attributes = useSelector(
    (state) => state.allData.resources.attributes?.data || []
  );
  const brands = useSelector(
    (state) => state.allData.resources.brands?.data || []
  );
  const categories = useSelector(
    (state) => state.allData.resources.categories?.data || []
  );
  const stores = useSelector(
    (state) => state.allData.resources.stores?.data || []
  );
  const specificationTypes = useSelector(
    (state) => state.allData.resources.specificationType?.data || []
  );

  useEffect(() => {
    dispatch(fetchResource({ key: "brands" }));
    dispatch(fetchResource({ key: "categories" }));
    dispatch(fetchResource({ key: "stores" }));
    dispatch(fetchResource({ key: "attributeTypes" }));
    dispatch(fetchResource({ key: "specificationType" }));
  }, [dispatch]);

  // Calculate SellingPrice based on MRP and ProductDiscount for a specific variant
  const calculateSellingPrice = (mrp, discount) => {
    const mrpValue = parseFloat(mrp) || 0;
    const discountValue = parseFloat(discount) || 0;
    if (mrpValue <= 0 || discountValue < 0) return "";
    return (mrpValue - (mrpValue * discountValue) / 100).toFixed(2);
  };

  // Update SellingPrice when MRP or ProductDiscount changes for a specific variant
  const updateVariantSellingPrice = (variantIndex, mrp, productDiscount) => {
    setVariants((prevVariants) => {
      const newVariants = [...prevVariants];
      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        SellingPrice: calculateSellingPrice(mrp, productDiscount),
      };
      return newVariants;
    });
  };

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
  
          if (response.data.status === STATUS.SUCCESS.toUpperCase()) {
            const product = response.data?.data;
  
            // Collect all unique attribute types and their values across all variants
            const attributeMap = {};
            product.Variants.forEach((variant) => {
              variant.Attributes?.forEach((attr) => {
                const attrTypeId = attr.AttributeTypeID;
                const valueId = attr.AttributeValueID;
                if (!attributeMap[attrTypeId]) {
                  attributeMap[attrTypeId] = {
                    AttributeTypeID: attrTypeId,
                    AttributeValueIDs: new Set(),
                  };
                }
                if (valueId) {
                  attributeMap[attrTypeId].AttributeValueIDs.add(valueId);
                }
              });
            });
  
            const transformedAttributes = Object.values(attributeMap).map(
              (attr) => ({
                ...attr,
                AttributeValueIDs: Array.from(attr.AttributeValueIDs),
              })
            );
  
            // Set basic product information in oFormData
            setFormData({
              ProductName: product.ProductName || "",
              ProductDescription: product.ProductDescription || "",
              BrandID: product.BrandID || "",
              CategoryID: product.CategoryID || "",
              StoreID: product.Variants[0]?.Inventory[0]?.StoreID || "",
              CreatedBy: product.CreatedBy || "Admin",
              TenantID: localStorage.getItem("tenantID") || "",
              SpecificationTypeID:
                product.ProductSpecification[0]?.SpecificatiobnTypeID || "",
            });
  
            // Set attributes
            setAAttributes(
              transformedAttributes.length > 0
                ? transformedAttributes
                : [{ AttributeTypeID: "", AttributeValueIDs: [] }]
            );
  
            // Set specifications
            const specifications = product.ProductSpecification.map((spec) => ({
              SpecificationTypeID: spec.SpecificatiobnTypeID || "",
              Value: spec.Value || "",
            }));
  
            setSpecifications(
              specifications.length > 0
                ? specifications
                : [{ SpecificationTypeID: "", Value: "" }]
            );
  
            // Set variants with MRP, SellingPrice, Inventory, and Images
            const variants = product.Variants.map((variant, idx) => ({
              VariantID: variant.VariantID,  
              attributes:
                variant.Attributes.map((attr) => ({
                  AttributeTypeID: attr.AttributeTypeID,
                  AttributeValueIDs: [attr.AttributeValueID],
                })) || [],
              Quantity: variant.Inventory[0]?.Quantity?.toString() || "",
              MRP: variant.MRP || "",
              SellingPrice: variant.SellingPrice || "",
              StoreID: variant.Inventory[0]?.StoreID || "",
              images: variant.ProductVariantImages.map((image, imgIdx) => ({
                id: `${image.documentId}-${imgIdx}`,
                file: null,
                preview: image.documentUrl,
                sortOrder: image.sortOrder || imgIdx + 1,
                documentId: image.documentId,
              })),
            }));
  
            setVariants(
              variants.length > 0
                ? variants
                : [
                    {
                      attributes: [],
                      Quantity: "",
                      MRP: "",
                      SellingPrice: "",
                      StoreID: "",
                      images: [],
                    },
                  ]
            );
                // Fetch attributes for each unique AttributeTypeID after setting attributes
                const uniqueTypeIDs = new Set(transformedAttributes.map(attr => attr.AttributeTypeID));
                uniqueTypeIDs.forEach(typeID => {
                  dispatch(fetchResource({ key: "attributes", params: { AttributeTypeID: typeID } }));
                });
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          showEmsg(t("PRODUCT_CREATION.FETCH_PRODUCT_FAILED"), STATUS.ERROR);
        }
      };
  
      fetchProduct();
    }
  }, [productId, t, dispatch]);
  
  useEffect(() => {
    setTitle(
      productId ? t("PRODUCTS.EDIT_PRODUCT") : t("PRODUCTS.ADD_NEW_PRODUCT")
    );
    setBackButton(<BackButton onClick={() => window.history.back()} />);
    return () => setBackButton(null);
  }, [setTitle, setBackButton, t, productId]);

  const [aAttributes, setAAttributes] = useState([
    { AttributeTypeID: "", AttributeValueIDs: [] },
  ]);

  const addAttributeRow = () => {
    setAAttributes((prev) => [...prev, { AttributeTypeID: "", AttributeValueIDs: [] }]);
  };

  const removeAttributeRow = (index) => {
    setAAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (index, field, value) => {
    setAAttributes((prev) =>
      prev.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      )
    );
    if (field === "AttributeTypeID") {
      setAAttributes((prev) =>
        prev.map((attr, i) =>
          i === index ? { ...attr, AttributeValueIDs: [] } : attr
        )
      );
      dispatch(
        fetchResource({
          key: "attributes",
          params: { AttributeTypeID: value },
        })
      );
    }
    setValidationErrors((prev) => ({
      ...prev,
      [`attr_${index}_${field}`]: undefined,
    }));
  };

  const generateVariants = (attributes) => {
    const filteredAttributes = attributes.filter(
      (attr) => attr.AttributeTypeID && attr.AttributeValueIDs.length > 0
    );
    if (filteredAttributes.length === 0) {
      return [
        {
          attributes: [],
          Quantity: "",
          MRP: "",
          ProductDiscount: "",
          SellingPrice: "",
          StoreID: oFormData.StoreID,
          images: [],
        },
      ];
    }
    const combine = ([first, ...rest]) => {
      if (!first) return [[]];
      const restCombs = combine(rest);
      return first.AttributeValueIDs.flatMap((val) =>
        restCombs.map((comb) => [
          { AttributeTypeID: first.AttributeTypeID, AttributeValueIDs: [val] },
          ...comb,
        ])
      );
    };
    const combos = combine(filteredAttributes);
    return combos.map((combo) => ({
      attributes: combo,
      Quantity: "",
      MRP: "",
      ProductDiscount: "",
      SellingPrice: "",
      StoreID: oFormData.StoreID,
      images: [],
    }));
  };

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
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((prevVariants) => {
      const newVariants = [...prevVariants];
      newVariants[index][field] = value;
      if (field === "MRP" || field === "ProductDiscount") {
        newVariants[index].SellingPrice = calculateSellingPrice(
          newVariants[index].MRP,
          newVariants[index].ProductDiscount
        );
      }
      return newVariants;
    });
    setValidationErrors((prev) => ({
      ...prev,
      [`variant_${index}_${field}`]: undefined,
    }));
  };

  const removeVariant = (index) => {
    setVariants((prevVariants) => {
      const newVariants = prevVariants.filter((_, i) => i !== index);
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
    if (nSelectedVariantIndex >= aVariants.length - 1) {
      setSelectedVariantIndex(Math.max(0, aVariants.length - 2));
    }
  };

  const onDrop = useCallback((acceptedFiles, variantIndex) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const imageUrl = URL.createObjectURL(file);
      setCropperModal({
        isOpen: true,
        image: imageUrl,
        variantIndex,
        originalFile: file,
      });
    }
  }, []);

  const handleCropComplete = (blob, variantIndex) => {
    if (blob) {
      const croppedUrl = URL.createObjectURL(blob);
      const generatedDocumentId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      setVariants((prevVariants) => {
        const newVariants = [...prevVariants];
        const currentImages = newVariants[variantIndex].images;
        const newSortOrder =
          currentImages.length > 0
            ? Math.max(...currentImages.map((img) => img.sortOrder)) + 1
            : 1;
        newVariants[variantIndex].images = [
          ...currentImages,
          {
            id: generatedDocumentId,
            file: new File([blob], `cropped-image-${Date.now()}.jpg`, {
              type: "image/jpeg",
            }),
            preview: croppedUrl,
            sortOrder: newSortOrder,
            documentId: generatedDocumentId,
          },
        ];
        return newVariants;
      });
      setValidationErrors((prev) => ({
        ...prev,
        [`variant_${variantIndex}_images`]: undefined,
      }));
    }
    if (cropperModal.image) {
      URL.revokeObjectURL(cropperModal.image);
    }
    setCropperModal({
      isOpen: false,
      image: "",
      variantIndex: null,
      originalFile: null,
    });
  };

  const removeImage = (variantIndex, imageIndex) => {
    setVariants((prevVariants) => {
      const newVariants = [...prevVariants];
      const previewUrl = newVariants[variantIndex].images[imageIndex].preview;
      if (typeof previewUrl === "string" && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      newVariants[variantIndex].images.splice(imageIndex, 1);

      if (newVariants[variantIndex].images.length === 0) {
        setValidationErrors((prev) => ({
          ...prev,
          [`variant_${variantIndex}_images`]: t("PRODUCT_CREATION.IMAGE_REQUIRED"),
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

  const SortableImage = ({ id, image, variantIndex, imageIndex }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative group"
        {...attributes}
        {...listeners}
      >
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
    );
  };

  const getVariantName = (variant) => {
    if (variant.attributes.length === 0) {
      return t("PRODUCT_CREATION.VARIANT");
    }
    return variant.attributes
      .map((attr) => {
        const valID = attr.AttributeValueIDs[0];
        const att = attributes.find(
          (a) =>
            (a.AttributeValueID || a.attributeValueID) === valID &&
            (a.AttributeTypeID || a.attributeTypeID) === attr.AttributeTypeID
        );
        return att
          ? `${att.Value || att.value}${att.Unit || att.unit ? ` (${att.Unit || att.unit})` : ""}`
          : "Unknown";
      })
      .join(" - ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Basic validation
    const errors = {};
    if (!oFormData.ProductName) errors.ProductName = t("PRODUCT_CREATION.PRODUCT_NAME_REQUIRED");
    if (!oFormData.BrandID) errors.BrandID = t("PRODUCT_CREATION.BRAND_ID_REQUIRED");
    if (!oFormData.CategoryID) errors.CategoryID = t("PRODUCT_CREATION.CATEGORY_ID_REQUIRED");
    if (!oFormData.StoreID) errors.StoreID = t("PRODUCT_CREATION.STORE_ID_REQUIRED");
    aVariants.forEach((variant, index) => {
      if (!variant.Quantity) errors[`variant_${index}_Quantity`] = t("PRODUCT_CREATION.QUANTITY_REQUIRED");
      if (!variant.MRP) errors[`variant_${index}_MRP`] = t("PRODUCT_CREATION.MRP_REQUIRED");
      if (!variant.SellingPrice) errors[`variant_${index}_SellingPrice`] = t("PRODUCT_CREATION.SELLING_PRICE_REQUIRED");
      if (variant.images.length === 0) errors[`variant_${index}_images`] = t("PRODUCT_CREATION.IMAGE_REQUIRED");
    });
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setSubmitting(false);
      return;
    }
    const specificationsData = aSpecifications
      .filter((spec) => spec.SpecificationTypeID && spec.Value)
      .map((spec) => ({
        SpecificationTypeID: spec.SpecificationTypeID,
        Value: spec.Value,
      }));
    const variantsData = aVariants.map((variant, variantIndex) => ({
      ...(productId && variant.VariantID && { ProductVariantID: variant.VariantID }),
      MRP: parseFloat(variant.MRP) || 0,
      SellingPrice: parseFloat(variant.SellingPrice) || 0,
      StoreID: variant.StoreID || oFormData.StoreID,
      Quantity: parseInt(variant.Quantity) || 0,
      IsActive: true,
      Attributes: variant.attributes,
      documentMetadata: variant.images.map((img, imgIndex) => {
        const metadata = {
          sortOrder: img.sortOrder || imgIndex + 1,
        };
    
        if (productId && img.documentId) {
          metadata.DocumentID = img.documentId;
        }
    
        if (img.file) {
          metadata.image = `images_${variantIndex}_${img.sortOrder}`;
        }
    
        return metadata;
      }),
    }));
    console.log(variantsData)
    const payload = {
      TenantID: oFormData.TenantID,
      ProductName: oFormData.ProductName,
      ProductDescription: oFormData.ProductDescription,
      BrandID: oFormData.BrandID,
      CategoryID: oFormData.CategoryID,
      IsActive: true,
      Specifications: specificationsData,
      Variants: variantsData,
      ...(productId && { ProductID: productId }),
    };
    const data = new FormData();
    data.append("data", JSON.stringify(payload));
    aVariants.forEach((variant, variantIndex) => {
      variant.images.forEach((img) => {
        if (img.file) {
          data.append(`images_${variantIndex}_${img.sortOrder}`, img.file);
        }
      });
    });
    try {
      const token = localStorage.getItem("token");
      const response = await apiPost(CREATE_OR_UPDATE_PRODUCT, data, token, true);
      const resData = response?.data;
      if (resData?.status === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(
          resData.MESSAGE ||
            (productId
              ? t("PRODUCT_CREATION.PRODUCT_UPDATED_SUCCESS")
              : t("PRODUCT_CREATION.PRODUCT_CREATED_SUCCESS")),
          STATUS.SUCCESS,
          3000,
          () => {
            navigate("/productList");
          }
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
    } finally {
      hideLoaderWithDelay(setSubmitting);
    }
  };

  const VariantImageUpload = ({ variantIndex }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => onDrop(files, variantIndex),
      accept: {
        "image/*": [".jpeg", ".jpg", ".png", ".webp"],
      },
      maxSize: 5242880,
      multiple: false,
    });
    return (
      <div className="mt-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
            ${isDragActive
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={({ active, over }) => {
              if (!over || active.id === over.id) return;
              setVariants((prevVariants) => {
                const newVariants = [...prevVariants];
                const images = newVariants[variantIndex].images;
                const oldIndex = images.findIndex((img) => img.id === active.id);
                const newIndex = images.findIndex((img) => img.id === over.id);
                const movedImages = arrayMove(images, oldIndex, newIndex);
                movedImages.forEach((img, idx) => {
                  img.sortOrder = idx + 1;
                });
                newVariants[variantIndex].images = movedImages;
                return newVariants;
              });
            }}
          >
            <SortableContext
              items={aVariants[variantIndex].images.map((img) => img.id)}
              strategy={rectSortingStrategy}
            >
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {aVariants[variantIndex].images.map((image, imageIndex) => (
                  <SortableImage
                    key={image.id}
                    id={image.id}
                    image={image}
                    variantIndex={variantIndex}
                    imageIndex={imageIndex}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    );
  };

  const addSpecificationRow = () => {
    setSpecifications((prev) => [
      ...prev,
      {
        SpecificationTypeID: "",
        Value: "",
      },
    ]);
  };

  const removeSpecificationRow = (index) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`spec_${index}_SpecificationTypeID`];
      delete newErrors[`spec_${index}_Value`];
      return newErrors;
    });
  };

  const handleSpecificationChange = (index, field, value) => {
    setSpecifications((prev) => {
      const newSpecs = [...prev];
      newSpecs[index][field] = value;
      return newSpecs;
    });
    setValidationErrors((prev) => ({
      ...prev,
      [`spec_${index}_${field}`]: undefined,
    }));
  };

  const loaderOverlay = submitting ? (
    <div className="global-loader-overlay">
      <Loader />
    </div>
  ) : null;

  return (
    <div className="min-h-screen">
      {loaderOverlay}
      <ToastContainer />
      {cropperModal.isOpen && (
        <ImageCropperModal
          key={cropperModal.image}
          image={cropperModal.image}
          onCropComplete={(blob) => handleCropComplete(blob, cropperModal.variantIndex)}
          onClose={() => {
            if (cropperModal.image?.startsWith("blob:")) {
              URL.revokeObjectURL(cropperModal.image);
            }
            setCropperModal({
              isOpen: false,
              image: "",
              variantIndex: null,
              originalFile: null,
            });
          }}
          aspectRatio={1}
          minWidth={500}
          minHeight={500}
          title={t("COMMON.CROP_IMAGE")}
          cancelText={t("COMMON.CANCEL")}
          saveText={t("COMMON.OK")}
        />
      )}
      <div className="max-w-8xl mx-auto">
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
                <div>
                  <TextInputWithIcon
                    label={t("PRODUCT_CREATION.PRODUCT_NAME")}
                    id="ProductName"
                    name="ProductName"
                    value={oFormData.ProductName}
                    onChange={handleInputChange}
                    placeholder={t("PRODUCT_CREATION.PRODUCT_NAME_PLACEHOLDER")}
                    Icon={Tag}
                    error={oValidationErrors.ProductName}
                    ref={productNameRef}
                  />
                </div>
                <div>
                  <SelectWithIcon
                    label={t("PRODUCT_CREATION.BRAND_ID")}
                    id="BrandID"
                    name="BrandID"
                    value={oFormData.BrandID}
                    onChange={handleInputChange}
                    options={brands.map((brand) => ({
                      value: brand.BrandID,
                      label: brand.BrandName,
                    }))}
                    Icon={Tag}
                    error={oValidationErrors.BrandID}
                    placeholder={t("PRODUCT_CREATION.BRAND_ID_PLACEHOLDER")}
                    ref={brandRef}
                  />
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
                    options={categories
                      .filter((category) => category.ParentCategoryID !== null && category.ParentCategoryID !== undefined)
                      .map((category) => ({
                        value: category.CategoryID,
                        label: category.CategoryName,
                      }))}
                    Icon={Tag}
                    error={oValidationErrors.CategoryID}
                    placeholder={t("PRODUCT_CREATION.CATEGORY_ID_PLACEHOLDER")}
                    ref={categoryRef}
                  />
                </div>
                <div>
                  <SelectWithIcon
                    label={t("COMMON.STORE")}
                    id="StoreID"
                    name="StoreID"
                    value={oFormData.StoreID}
                    onChange={handleInputChange}
                    options={stores.map((store) => ({
                      value: store.StoreID,
                      label: store.StoreName,
                    }))}
                    Icon={Tag}
                    error={oValidationErrors.StoreID}
                    placeholder={t("PRODUCT_CREATION.STORE_ID_PLACEHOLDER") || "Select store"}
                  />
                </div>
              </div>
              <div>
                <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Layers className="h-6 w-6 mr-3 text-custom-bg" />
                    {t("PRODUCT_SETUP.ATTRIBUTES.TITLE")}
                  </h2>
                  <button
                    type="button"
                    onClick={addAttributeRow}
                    className="btn-secondry inline-flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t("PRODUCT_CREATION.ADD_ATTRIBUTE")}</span>
                  </button>
                </div>
                <div className="p-8 space-y-6">
                  {aAttributes.map((attr, index) => (
                    <div
                      key={index}
                      id={`attr-container-${index}`}
                      className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
                    >
                      <div>
                        <SelectWithIcon
                          label={t("PRODUCT_CREATION.ATTRIBUTE_ID")}
                          id={`AttributeTypeID-${index}`}
                          name={`AttributeTypeID-${index}`}
                          value={attr.AttributeTypeID}
                          onChange={(e) => {
                            handleAttributeChange(index, "AttributeTypeID", e.target.value);
                          }}
                          options={attributeTypes
                            ?.filter((type) => type.IsActive)
                            .map((type) => ({
                              value: type.AttributeTypeID || type.attributeTypeID,
                              label: type.Name || type.name,
                            }))}
                          Icon={Hash}
                          error={oValidationErrors[`attr_${index}_AttributeTypeID`]}
                          placeholder={t("PRODUCT_CREATION.ATTRIBUTE_ID_PLACEHOLDER")}
                        />
                      </div>
                      <div className="flex items-end gap-4">
                        <SelectWithIcon
                          label={t("PRODUCT_CREATION.ATTRIBUTE_VALUES")}
                          id={`AttributeValueIDs-${index}`}
                          name={`AttributeValueIDs-${index}`}
                          value={attr.AttributeValueIDs || []}
                          onChange={(e) => {
                            const selectedValues = Array.isArray(e.target.value)
                              ? e.target.value
                              : [e.target.value].filter(Boolean);
                            handleAttributeChange(index, "AttributeValueIDs", selectedValues);
                          }}
                          options={attributes
                            .filter((attribute) => {
                              const typeId = attribute.AttributeTypeID || attribute.attributeTypeID;
                              return (
                                attribute.IsActive &&
                                String(typeId) === String(attr.AttributeTypeID)
                              );
                            })
                            .map((attribute) => ({
                              value: attribute.AttributeValueID || attribute.attributeValueID,
                              label: `${attribute.Value || attribute.value}${attribute.Unit || attribute.unit
                                  ? ` (${attribute.Unit || attribute.unit})`
                                  : ""
                                }`,
                            }))}
                          Icon={Layers}
                          error={oValidationErrors[`attr_${index}_AttributeValueIDs`]}
                          placeholder={t("PRODUCT_CREATION.ATTRIBUTE_VALUES_PLACEHOLDER")}
                          multiple
                          isDisabled={!attr.AttributeTypeID}
                        />
                        {aAttributes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAttributeRow(index)}
                            className="btn-cancel p-3 mb-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setVariants(generateVariants(aAttributes))}
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t("PRODUCT_CREATION.GENERATE_VARIANTS")}</span>
                  </button>
                </div>
              </div>
              <div>
                <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Tag className="h-6 w-6 mr-3 text-custom-bg" />
                    {t("PRODUCT_CREATION.SPECIFICATIONS")}
                  </h2>
                  <button
                    type="button"
                    onClick={addSpecificationRow}
                    className="btn-secondry inline-flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t("PRODUCT_CREATION.ADD_SPECIFICATION")}</span>
                  </button>
                </div>
                <div className="p-8 space-y-6">
                  {aSpecifications.map((spec, index) => (
                    <div
                      key={index}
                      id={`spec-container-${index}`}
                      className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
                    >
                      <div>
                        <SelectWithIcon
                          label={t("PRODUCT_SETUP.TABS.SPECIFICATION_TYPE")}
                          id={`SpecificationTypeID-${index}`}
                          name={`SpecificationTypeID-${index}`}
                          value={spec.SpecificationTypeID}
                          onChange={(e) =>
                            handleSpecificationChange(
                              index,
                              "SpecificationTypeID",
                              e.target.value
                            )
                          }
                          options={specificationTypes.map((specType) => ({
                            value: specType.SpecificationTypeID,
                            label: specType.Name,
                          }))}
                          Icon={Tag}
                          error={oValidationErrors[`spec_${index}_SpecificationTypeID`]}
                          placeholder={t("PRODUCT_CREATION.SPECIFICATION_TYPE_PLACEHOLDER")}
                        />
                      </div>
                      <div className="flex items-end gap-4">
                        <div className="flex-1">
                          <TextInputWithIcon
                            label={t("PRODUCT_CREATION.SPECIFICATION_VALUE")}
                            id={`SpecificationValue-${index}`}
                            name={`SpecificationValue-${index}`}
                            value={spec.Value}
                            onChange={(e) =>
                              handleSpecificationChange(index, "Value", e.target.value)
                            }
                            placeholder={t("PRODUCT_CREATION.SPECIFICATION_VALUE_PLACEHOLDER")}
                            Icon={Tag}
                            error={oValidationErrors[`spec_${index}_Value`]}
                          />
                        </div>
                        {aSpecifications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSpecificationRow(index)}
                            className="btn-cancel p-3 mb-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
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
                  placeholder={t("PRODUCT_CREATION.PRODUCT_DESCRIPTION_PLACEHOLDER")}
                  className={`h-32 mb-10 ${oValidationErrors.ProductDescription ? "border-red-500" : ""
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
                      ${selected
                        ? "border-custom-bg text-custom-bg"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`
                    }
                  >
                    {getVariantName(variant)} {index + 1}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <TextInputWithIcon
                          label={t("PRODUCT_CREATION.QUANTITY")}
                          id={`Quantity-${index}`}
                          name="Quantity"
                          value={variant.Quantity}
                          onChange={(e) =>
                            handleVariantChange(index, "Quantity", e.target.value)
                          }
                          placeholder={t("PRODUCT_CREATION.QUANTITY_PLACEHOLDER") || "Enter quantity"}
                          Icon={Hash}
                          error={oValidationErrors[`variant_${index}_Quantity`]}
                          ref={(el) => addVariantRef(`Quantity-${index}`, el)}
                        />
                      </div>
                      <div>
                        <TextInputWithIcon
                          label={t("PRODUCT_CREATION.MRP")}
                          id={`MRP-${index}`}
                          name="MRP"
                          value={variant.MRP}
                          onChange={(e) =>
                            handleVariantChange(index, "MRP", e.target.value)
                          }
                          placeholder={t("PRODUCT_CREATION.MRP_PLACEHOLDER") || "Enter MRP"}
                          Icon={() => (
                            <span
                              className="text-lg font-bold text-gray-400"
                              style={{ fontFamily: "inherit" }}
                            >
                              ₹
                            </span>
                          )}
                          error={oValidationErrors[`variant_${index}_MRP`]}
                          ref={(el) => addVariantRef(`MRP-${index}`, el)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                      <div>
                        <TextInputWithIcon
                          label={t("PRODUCT_CREATION.PRODUCT_DISCOUNT")}
                          id={`ProductDiscount-${index}`}
                          name="ProductDiscount"
                          value={variant.ProductDiscount}
                          onChange={(e) =>
                            handleVariantChange(index, "ProductDiscount", e.target.value)
                          }
                          placeholder={t("PRODUCT_CREATION.PRODUCT_DISCOUNT_PLACEHOLDER") || "Enter discount"}
                          Icon={Tag}
                          error={oValidationErrors[`variant_${index}_ProductDiscount`]}
                          ref={(el) => addVariantRef(`ProductDiscount-${index}`, el)}
                        />
                      </div>
                      <div>
                        <TextInputWithIcon
                          label={t("PRODUCT_CREATION.SELLING_PRICE")}
                          id={`SellingPrice-${index}`}
                          name="SellingPrice"
                          value={variant.SellingPrice}
                          onChange={(e) =>
                            handleVariantChange(index, "SellingPrice", e.target.value)
                          }
                          placeholder={t("PRODUCT_CREATION.SELLING_PRICE_PLACEHOLDER") || "Enter selling price"}
                          Icon={() => (
                            <span
                              className="text-lg font-bold text-gray-400"
                              style={{ fontFamily: "inherit" }}
                            >
                              ₹
                            </span>
                          )}
                          error={oValidationErrors[`variant_${index}_SellingPrice`]}
                          ref={(el) => addVariantRef(`SellingPrice-${index}`, el)}
                        />
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
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/productList")}
            >
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