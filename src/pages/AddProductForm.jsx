import { useState, useCallback } from "react";
import { Plus, X, Upload, Tag, ShoppingBag, ArrowLeft } from "lucide-react";
import { useDropzone } from "react-dropzone";
import TextInputWithIcon from "../components/TextInputWithIcon";
import SelectWithIcon from "../components/SelectWithIcon";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Loader from "../components/Loader";
import ImageCropperModal from "../components/ImageCropperModal";

// Static data
const staticBrands = [
  { BrandID: "1", BrandName: "Apple" },
  { BrandID: "2", BrandName: "Sony" },
  { BrandID: "3", BrandName: "Samsung" },
  { BrandID: "4", BrandName: "Nike" },
  { BrandID: "5", BrandName: "Amazon" },
];

const staticCategories = [
  { CategoryID: "1", CategoryName: "Electronics", ParentCategoryID: null },
  { CategoryID: "2", CategoryName: "Laptops", ParentCategoryID: "1" },
  { CategoryID: "3", CategoryName: "Phones", ParentCategoryID: "1" },
  { CategoryID: "4", CategoryName: "Fashion", ParentCategoryID: null },
  { CategoryID: "5", CategoryName: "Shoes", ParentCategoryID: "4" },
];

// Points configuration - define how points are calculated
const POINTS_CONFIG = {
  BASE_POINTS_PER_RUPEE: 1, // 1 point per ₹1 of MRP
  DISCOUNT_MULTIPLIER: 2, // Points multiplier for discounted products
};

const AddProductForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    ProductName: "",
    ProductDescription: "",
    BrandID: "",
    CategoryID: "",
    Quantity: "",
    MRP: "",
    ProductDiscount: "",
    CalculatedPoints: "", // Changed from SellingPrice to Points
  });
  
  const [images, setImages] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  const [cropperModal, setCropperModal] = useState({
    isOpen: false,
    image: "",
    originalFile: null,
  });

  // Calculate Points based on MRP and ProductDiscount
  const calculatePoints = (mrp, discount) => {
    const mrpValue = parseFloat(mrp) || 0;
    const discountValue = parseFloat(discount) || 0;
    
    if (mrpValue <= 0) return "";
    
    // Base points calculation: 1 point per rupee of MRP
    let basePoints = mrpValue * POINTS_CONFIG.BASE_POINTS_PER_RUPEE;
    
    // If there's a discount, apply multiplier to the discounted amount
    if (discountValue > 0) {
      const discountedPrice = mrpValue - (mrpValue * discountValue) / 100;
      basePoints = discountedPrice * POINTS_CONFIG.DISCOUNT_MULTIPLIER;
    }
    
    // Round to nearest whole number
    return Math.round(basePoints).toString();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate points if MRP or discount changes
      if (name === "MRP" || name === "ProductDiscount") {
        const mrp = name === "MRP" ? value : prev.MRP;
        const discount = name === "ProductDiscount" ? value : prev.ProductDiscount;
        updated.CalculatedPoints = calculatePoints(mrp, discount);
      }
      
      return updated;
    });
    
    setValidationErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const imageUrl = URL.createObjectURL(file);
      setCropperModal({
        isOpen: true,
        image: imageUrl,
        originalFile: file,
      });
    }
  }, []);

  const handleCropComplete = (blob) => {
    if (blob) {
      const croppedUrl = URL.createObjectURL(blob);
      const newImage = {
        id: Date.now().toString(),
        file: new File([blob], `cropped-image-${Date.now()}.jpg`, {
          type: "image/jpeg",
        }),
        preview: croppedUrl,
        sortOrder: images.length + 1,
      };
      
      setImages((prev) => [...prev, newImage]);
      setValidationErrors((prev) => ({
        ...prev,
        images: undefined,
      }));
    }
    
    if (cropperModal.image) {
      URL.revokeObjectURL(cropperModal.image);
    }
    
    setCropperModal({
      isOpen: false,
      image: "",
      originalFile: null,
    });
  };

  const removeImage = (imageIndex) => {
    setImages((prev) => {
      const newImages = [...prev];
      const image = newImages[imageIndex];

      if (typeof image.preview === "string" && image.preview.startsWith("blob:")) {
        URL.revokeObjectURL(image.preview);
      }

      newImages.splice(imageIndex, 1);
      return newImages;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Simple validation
    const errors = {};
    if (!formData.ProductName) errors.ProductName = "Product name is required";
    if (!formData.BrandID) errors.BrandID = "Brand is required";
    if (!formData.CategoryID) errors.CategoryID = "Category is required";
    if (!formData.Quantity) errors.Quantity = "Quantity is required";
    if (!formData.MRP) errors.MRP = "MRP is required";
    if (!formData.CalculatedPoints) errors.CalculatedPoints = "Points calculation failed";
    if (images.length === 0) errors.images = "At least one image is required";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setSubmitting(false);
      return;
    }

    // Prepare mock payload - removed StoreID, added Points
    const payload = {
      ProductName: formData.ProductName,
      BrandID: formData.BrandID,
      CategoryID: formData.CategoryID,
      ProductDescription: formData.ProductDescription,
      Quantity: parseInt(formData.Quantity),
      MRP: parseFloat(formData.MRP),
      ProductDiscount: formData.ProductDiscount ? parseFloat(formData.ProductDiscount) : 0,
      Points: parseInt(formData.CalculatedPoints), // Added points field
      Images: images.length,
    };

    console.log("Form submitted with data:", payload);
    console.log("Points Configuration:", POINTS_CONFIG);
    console.log("Calculated Points Breakdown:", {
      mrp: formData.MRP,
      discount: formData.ProductDiscount || 0,
      basePointsPerRupee: POINTS_CONFIG.BASE_POINTS_PER_RUPEE,
      discountMultiplier: POINTS_CONFIG.DISCOUNT_MULTIPLIER,
      finalPoints: formData.CalculatedPoints
    });
    
    // Simulate API call
    setTimeout(() => {
      alert("Product saved successfully with points system!");
      navigate("/productList");
      setSubmitting(false);
    }, 1500);
  };

  const ImageUpload = () => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
      maxSize: 5242880,
      multiple: false,
    });
    
    return (
      <div className="mt-4">
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
                  Drop images here
                </p>
              ) : (
                <p className="text-base">
                  Drag & drop or click to upload images
                </p>
              )}
            </div>
          </div>
        </div>
        
        {images.length > 0 && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, imageIndex) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-md">
                  <img
                    src={image.preview}
                    alt={`Product Image ${imageIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(imageIndex)}
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
          onCropComplete={handleCropComplete}
          onClose={() => {
            if (cropperModal.image?.startsWith("blob:")) {
              URL.revokeObjectURL(cropperModal.image);
            }
            setCropperModal({
              isOpen: false,
              image: "",
              originalFile: null,
            });
          }}
          aspectRatio={1}
          minWidth={500}
          minHeight={500}
          title="Crop Image"
          cancelText="Cancel"
          saveText="OK"
        />
      )}
      
      <div className="max-w-8xl mx-auto pb-20">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
           <p className="text-xl font-bold text-gray-900">Add Product Form</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ShoppingBag className="h-6 w-6 mr-3 text-blue-600" />
                Basic Information
              </h2>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <TextInputWithIcon
                    label="Product Name"
                    id="ProductName"
                    name="ProductName"
                    value={formData.ProductName}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    Icon={Tag}
                    error={validationErrors.ProductName}
                  />
                </div>
                
                <div>
                  <SelectWithIcon
                    label="Brand"
                    id="BrandID"
                    name="BrandID"
                    value={formData.BrandID}
                    onChange={handleInputChange}
                    options={staticBrands.map((brand) => ({
                      value: brand.BrandID,
                      label: brand.BrandName,
                    }))}
                    Icon={Tag}
                    error={validationErrors.BrandID}
                    placeholder="Select brand"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <SelectWithIcon
                    label="Category"
                    id="CategoryID"
                    name="CategoryID"
                    value={formData.CategoryID}
                    onChange={handleInputChange}
                    options={staticCategories
                      .filter((category) => category.ParentCategoryID)
                      .map((category) => ({
                        value: category.CategoryID,
                        label: category.CategoryName,
                      }))}
                    Icon={Tag}
                    error={validationErrors.CategoryID}
                    placeholder="Select category"
                  />
                </div>
                
                <div>
                  <TextInputWithIcon
                    label="Quantity"
                    name="Quantity"
                    value={formData.Quantity}
                    onChange={handleInputChange}
                    placeholder="Enter quantity"
                    Icon={() => (
                      <span className="text-lg font-bold text-gray-400">#</span>
                    )}
                    error={validationErrors.Quantity}
                  />
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label
                  htmlFor="ProductDescription"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Product Description
                </label>
                <textarea
                  value={formData.ProductDescription}
                  onChange={(e) =>
                    handleInputChange({
                      target: { name: "ProductDescription", value: e.target.value },
                    })
                  }
                  placeholder="Enter product description"
                  className="w-full h-32 border border-gray-300 rounded-lg p-3"
                  rows={5}
                />
              </div>
            </div>
          </div>
          
          {/* Product Details Section */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Tag className="h-6 w-6 mr-3 text-blue-600" />
                Product Pricing & Points
              </h2>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <TextInputWithIcon
                    label="MRP"
                    name="MRP"
                    value={formData.MRP}
                    onChange={handleInputChange}
                    placeholder="Enter MRP"
                    Icon={() => (
                      <span className="text-lg font-bold text-gray-400">₹</span>
                    )}
                    error={validationErrors.MRP}
                  />
                </div>
                
                <div>
                  <TextInputWithIcon
                    label="Discount %"
                    name="ProductDiscount"
                    value={formData.ProductDiscount}
                    onChange={handleInputChange}
                    placeholder="Enter discount %"
                    Icon={() => (
                      <span className="text-lg font-bold text-gray-400">%</span>
                    )}
                  />
                </div>
              </div>
              
              {/* Points Calculation Section */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">🎯</span> Points Calculation
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <TextInputWithIcon
                      label="Calculated Points"
                      name="CalculatedPoints"
                      value={formData.CalculatedPoints}
                      onChange={handleInputChange}
                      placeholder="Points will auto-calculate"
                      Icon={() => (
                        <span className="text-lg font-bold text-blue-600">⭐</span>
                      )}
                      error={validationErrors.CalculatedPoints}
                      readOnly
                      className="bg-white"
                    />
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Points Formula:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li className="flex items-center">
                        <span className="mr-2">•</span>
                        Base: {POINTS_CONFIG.BASE_POINTS_PER_RUPEE} point per ₹1 MRP
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">•</span>
                        With Discount: {POINTS_CONFIG.DISCOUNT_MULTIPLIER}x points on discounted price
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* Points Calculation Breakdown */}
                {formData.MRP && (
                  <div className="mt-4 text-sm text-gray-700">
                    <p className="font-medium mb-1">Calculation:</p>
                    {formData.ProductDiscount ? (
                      <div className="space-y-1">
                        <p>MRP: ₹{formData.MRP}</p>
                        <p>Discount: {formData.ProductDiscount}%</p>
                        <p>Discounted Price: ₹{(
                          parseFloat(formData.MRP) - 
                          (parseFloat(formData.MRP) * parseFloat(formData.ProductDiscount)) / 100
                        ).toFixed(2)}</p>
                        <p className="font-semibold">
                          Points = ₹{(
                            parseFloat(formData.MRP) - 
                            (parseFloat(formData.MRP) * parseFloat(formData.ProductDiscount)) / 100
                          ).toFixed(2)} × {POINTS_CONFIG.DISCOUNT_MULTIPLIER} = {formData.CalculatedPoints} points
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p>MRP: ₹{formData.MRP}</p>
                        <p className="font-semibold">
                          Points = ₹{formData.MRP} × {POINTS_CONFIG.BASE_POINTS_PER_RUPEE} = {formData.CalculatedPoints} points
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Product Images Section */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Upload className="h-6 w-6 mr-3 text-blue-600" />
                Product Images
              </h2>
            </div>
            
            <div className="p-8">
              <h4 className="text-md font-semibold text-gray-800 mb-3">
                Upload Product Images
              </h4>
              <ImageUpload />
              {validationErrors.images && (
                <p className="text-red-500 text-sm mt-2">
                  {validationErrors.images}
                </p>
              )}
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mb-8">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/productList")}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;