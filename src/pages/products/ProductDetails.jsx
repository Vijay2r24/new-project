import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../utils/ApiUtils";
import { GET_PRODUCT_BY_ID } from "../../contants/apiRoutes";
import { useTitle } from "../../context/TitleContext";
import BackButton from "../../components/BackButton";
import Loader from "../../components/Loader";
import { showEmsg } from "../../utils/ShowEmsg";
import { STATUS } from "../../contants/constants";
import {
  ArrowLeft,
  Package,
  Store,
  Tag,
  Info,
  Check,
  X,
  Image as ImageIcon,
  Grid,
  List,
  Eye,
  DollarSign,
  Percent,
  Edit2,
  IndianRupee,
} from "lucide-react";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setTitle, setBackButton } = useTitle();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("variants");
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    setTitle(`${t("PRODUCTS.PRODUCTS_DETAILS")}`);
    setBackButton(<BackButton onClick={() => navigate("/productList")} />);
    fetchProductDetails();
    return () => {
      setBackButton(null);
      setTitle("");
    };
  }, [productId, setTitle, setBackButton, t, navigate]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await apiGet(
        `${GET_PRODUCT_BY_ID}/${productId}`,
        {},
        token
      );

      if (response?.data?.status === STATUS.SUCCESS.toUpperCase()) {
        setProduct(response.data.data);
      } else {
        throw new Error(response?.data?.message || t("COMMON.API_ERROR"));
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || err?.message || t("COMMON.API_ERROR");
      setError(errorMessage);
      showEmsg(errorMessage, STATUS.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const getVariantAttributes = (variant) => {
    const attributes = {};
    variant.Attributes.forEach((attr) => {
      attributes[attr.Name] = {
        id: attr.AttributeValueID,
        value: attr.Value,
        unit: attr.Unit,
      };
    });
    return attributes;
  };

  const calculateDiscount = (mrp, sellingPrice) => {
    if (!mrp || !sellingPrice || parseFloat(mrp) <= parseFloat(sellingPrice))
      return 0;
    return Math.round((1 - parseFloat(sellingPrice) / parseFloat(mrp)) * 100);
  };

  const getTotalInventory = (variant) => {
    return (
      variant.Inventory?.reduce(
        (total, store) => total + parseInt(store.Quantity),
        0
      ) || 0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {t("COMMON.ERROR")}
          </h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/productList")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t("COMMON.BACK_TO_PRODUCTS")}
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{t("PRODUCTS.NOT_FOUND")}</p>
        </div>
      </div>
    );
  }

  const currentVariant = product.Variants[selectedVariant];
  const totalInventory = product.Variants.reduce(
    (total, variant) => total + getTotalInventory(variant),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="border-b border-gray-200 px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl font-bold text-custom-bg mb-2">
                  {product.ProductName}
                </h1>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Package className="h-4 w-4 mr-1" />
                    <span>
                      {product.BrandName} - {product.CategoryName}
                    </span>
                  </span>
                  <span className="flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    {t("PRODUCTS.PRODUCT_ID")}: {product.ProductID}
                  </span>
                  <span className="flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    <span>{product.IsActive ? "Active" : "Inactive"}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("variants")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === "variants"
                    ? "border-custom-bg text-custom-bg"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Grid className="h-4 w-4" />
                {t("PRODUCTS.VARIANTS")}
              </button>
              <button
                onClick={() => setActiveTab("inventory")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === "inventory"
                    ? "border-custom-bg text-custom-bg"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Store className="h-4 w-4" />
                {t("STORES.INVENTORY")}
              </button>
              <button
                onClick={() => setActiveTab("specs")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === "specs"
                    ? "border-custom-bg text-custom-bg"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Info className="h-4 w-4" />
                {t("PRODUCT_CREATION.SPECIFICATIONS")}
              </button>
            </nav>
          </div>

          {/* Variants Tab */}
          {activeTab === "variants" && (
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Variant Images & Details */}
                <div className="space-y-6">
                  {/* Main Image */}
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {currentVariant?.ProductVariantImages?.length > 0 ? (
                      <img
                        src={
                          currentVariant.ProductVariantImages[selectedImage]
                            ?.documentUrl
                        }
                        alt={`${product.ProductName} - ${currentVariant.VariantID}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/500x500?text=No+Image";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <ImageIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Images */}
                  {currentVariant?.ProductVariantImages?.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {currentVariant.ProductVariantImages.map(
                        (image, index) => (
                          <button
                            key={image.documentId}
                            onClick={() => setSelectedImage(index)}
                            className={`aspect-square bg-gray-100 rounded-md overflow-hidden border-2 ${
                              selectedImage === index
                                ? "border-custom-bg"
                                : "border-transparent"
                            }`}
                          >
                            <img
                              src={image.documentUrl}
                              alt={`${product.ProductName} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        )
                      )}
                    </div>
                  )}

                  {/* Current Variant Details */}
                  {currentVariant && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        {t("PRODUCTS.CURRENT_VARIANT_DETAILS")}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {t("PRODUCTS.VARIANTS_ID")}:
                          </span>
                          <span className="font-mono text-gray-900">
                            {currentVariant.VariantID}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {t(
                              "PRODUCT_SETUP.CREATE_PRODUCT_GROUP.STATUS_LABEL"
                            )}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              currentVariant.IsActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {currentVariant.IsActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        {Object.entries(
                          getVariantAttributes(currentVariant)
                        ).map(([attrName, attrValue]) => (
                          <div key={attrName} className="flex justify-between">
                            <span className="text-gray-600 capitalize">
                              {attrName}:
                            </span>
                            <span className="text-gray-900">
                              {attrValue.value}
                              {attrName.toLowerCase() === "color" &&
                                attrValue.unit && (
                                  <span
                                    className="ml-2 w-4 h-4 inline-block rounded-full border"
                                    style={{ backgroundColor: attrValue.unit }}
                                  ></span>
                                )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* All Variants Table */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {t("PRODUCTS.PRODUCT_VARIANTS")}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {t("PRODUCTS.TOTAL_VARIANTS")}: {product.Variants.length}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("PRODUCT_CREATION.SIZE")}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("PRODUCT_CREATION.VARIANT")}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("PRODUCT_CREATION.COLOUR_ID")}
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("PRODUCT_CREATION.MRP")}
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("PRODUCT_CREATION.SELLING_PRICE")}
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("BANNER_FORM.DISCOUNT_PERCENTAGE")}
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("PRODUCTS.TOTAL_STOCK")}
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("COMMON.ACTIONS")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {product.Variants.map((variant, index) => {
                          const attributes = getVariantAttributes(variant);
                          const discount = calculateDiscount(
                            variant.MRP,
                            variant.SellingPrice
                          );
                          const totalStock = getTotalInventory(variant);

                          return (
                            <tr
                              key={variant.VariantID}
                              className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                                selectedVariant === index
                                  ? "bg-blue-50 border-l-4 border-custom-bg"
                                  : ""
                              }`}
                              onClick={() => {
                                setSelectedVariant(index);
                                setSelectedImage(0);
                              }}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    {variant.ProductVariantImages?.[0]
                                      ?.documentUrl ? (
                                      <img
                                        className="h-10 w-10 rounded object-cover"
                                        src={
                                          variant.ProductVariantImages[0]
                                            .documentUrl
                                        }
                                        alt=""
                                      />
                                    ) : (
                                      <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                                        <ImageIcon className="h-5 w-5 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {t("PRODUCT_CREATION.VARIANT")}{" "}
                                      {index + 1}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {variant.VariantID.slice(-8)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {attributes.Size?.value || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-sm text-gray-900 mr-2">
                                    {attributes.Color?.value || "N/A"}
                                  </span>
                                  {attributes.Color?.unit && (
                                    <span
                                      className="w-4 h-4 rounded-full border inline-block"
                                      style={{
                                        backgroundColor: attributes.Color.unit,
                                      }}
                                      title={attributes.Color.unit}
                                    ></span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                ₹{parseFloat(variant.MRP).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                ₹{parseFloat(variant.SellingPrice).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                {discount > 0 ? (
                                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                                    {discount}%
                                  </span>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    totalStock > 0
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {totalStock}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <Eye className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inventory Summary */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("PRODUCTS.INVENTORY_SUMMARY")}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">
                        {t("PRODUCTS.TOTAL_VARIANTS")}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {product.Variants.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">
                        {t("PRODUCTS.TOTAL_STOCK")}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {totalInventory}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">
                        {t("PRODUCTS.LOW_STOCK_VARIANTS")}
                      </span>
                      <span className="text-sm font-semibold text-yellow-600">
                        {
                          product.Variants.filter(
                            (v) => getTotalInventory(v) < 10
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">
                        {t("PRODUCTS.OUT_OF_STOCK")}
                      </span>
                      <span className="text-sm font-semibold text-red-600">
                        {
                          product.Variants.filter(
                            (v) => getTotalInventory(v) === 0
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Inventory */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("PRODUCTS.STORE_INVENTORY")}
                  </h3>
                  {product.Variants.map((variant, index) => (
                    <div
                      key={variant.VariantID}
                      className="mb-6 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          {t("PRODUCT_CREATION.VARIANT")} {index + 1}
                          {(getVariantAttributes(variant).Size?.value ||
                            getVariantAttributes(variant).Color?.value) &&
                            " - "}
                          {getVariantAttributes(variant).Size?.value && (
                            <>
                              {getVariantAttributes(variant).Size.value}
                              {getVariantAttributes(variant).Color?.value &&
                                " / "}
                            </>
                          )}
                          {getVariantAttributes(variant).Color?.value}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {t("VIEW_ORDER.TABLE.TOTAL")}:{" "}
                          {getTotalInventory(variant)} {t("PRODUCTS.UNITS")}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {variant.Inventory.map((store, storeIndex) => (
                          <div
                            key={storeIndex}
                            className="flex items-center justify-between py-2"
                          >
                            <div className="flex items-center gap-3">
                              <Store className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900">
                                {store.StoreName}
                              </span>
                            </div>
                            <span
                              className={`text-sm font-semibold px-3 py-1 rounded-full ${
                                store.Quantity > 20
                                  ? "bg-green-100 text-green-800"
                                  : store.Quantity > 5
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {store.Quantity}{" "}
                              {t("DASHBOARD.PRODUCT_MODAL.IN_STOCK")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Specifications Tab */}
          {activeTab === "specs" && (
            <div className="p-6">
              {/* Specifications Section */}
              {product.ProductSpecification?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                    {t("PRODUCT_CREATION.SPECIFICATIONS")}
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {product.ProductSpecification.map((spec, index) => (
                      <div
                        key={index}
                        className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-base font-semibold text-gray-900">
                            {spec.Name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-600">
                            {spec.Value}
                          </span>
                          {spec.Unit && (
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                              {spec.Unit}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Product Info */}
              <div className="mb-8 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                  {t("PRODUCTS.ADDITIONAL_INFO")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Package className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        {t("PRODUCT_CREATION.BRAND_ID")}
                      </p>
                      <p className="text-gray-700 text-lg font-medium">
                        {product.BrandName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Tag className="h-6 w-6 text-green-600 flex-shrink-0" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        {t("COMMON.CATEGORY")}
                      </p>
                      <p className="text-gray-700 text-lg font-medium">
                        {product.CategoryName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <IndianRupee className="h-6 w-6 text-purple-600 flex-shrink-0" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        {t("PRODUCTS.PRICING_RANGE")}
                      </p>
                      <p className="text-gray-700 text-lg font-medium">
                        ₹
                        {Math.min(
                          ...product.Variants.map((v) =>
                            parseFloat(v.SellingPrice)
                          )
                        ).toLocaleString("en-IN")}{" "}
                        - ₹
                        {Math.max(
                          ...product.Variants.map((v) =>
                            parseFloat(v.SellingPrice)
                          )
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section - Moved to Last */}
              {product.ProductDescription && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                    {t("COMMON.DESCRIPTION")}
                  </h3>
                  <div
                    className="prose prose-gray max-w-none text-gray-700 bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
                    dangerouslySetInnerHTML={{
                      __html: product.ProductDescription,
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
