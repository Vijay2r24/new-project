import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Toolbar from "../../components/Toolbar";
import Pagination from "../../components/Pagination";
import ActionButtons from "../../components/ActionButtons";
import { useTranslation } from "react-i18next";
import { apiGet, apiDelete, apiPost } from "../../utils/ApiUtils.jsx";
import {
  GETPRODUCTDETAILS,
  DELETE_PRODUCT_WITH_IMAGES,
  UPDATE_PRODUCT_STATUS,
} from "../../contants/apiRoutes";
import { Switch } from "@headlessui/react";
import { useTitle } from "../../context/TitleContext";
import { ITEMS_PER_PAGE, STATUS } from "../../contants/constants.jsx";
import { fetchResource, updateStatusById } from "../../store/slices/allDataSlice.jsx";
import FullscreenErrorPopup from "../../components/FullscreenErrorPopup";
import { ToastContainer } from "react-toastify";
import noImage from "../../../assets/images/missing-pictur.jpg";
import { showEmsg } from "../../utils/ShowEmsg.jsx";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const getStatusBadgeClass = (status) => {
  if (status === "active") return "status-active";
  if (status === "out-of-stock") return "status-inactive";
  return "status-active";
};

const getTotalStock = (inventory) => {
  if (!Array.isArray(inventory) || inventory.length === 0) {
    return 0;
  }
  return inventory.reduce((total, item) => total + (item.Quantity || 0), 0);
};

const getFirstImage = (productVariantImages) => {
  if (Array.isArray(productVariantImages) && productVariantImages.length > 0) {
    const sortedImages = productVariantImages.sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
    );
    return sortedImages[0].documentUrl;
  }
  return noImage;
};

const getStoreName = (inventory) => {
  if (Array.isArray(inventory) && inventory.length > 0) {
    const storeNames = [
      ...new Set(inventory.map((item) => item.StoreName).filter(Boolean)),
    ];
    return storeNames.join(", ") || "N/A";
  }
  return "N/A";
};

const ProductList = () => {
  const [sSearchTerm, setSearchTerm] = useState("");
  const [sViewMode, setViewMode] = useState("table");
  const [nCurrentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation();
  const itemsPerPage = ITEMS_PER_PAGE;
  const navigate = useNavigate();
  const [bShowFilterDropdown, setShowFilterDropdown] = useState(false);
  const [aProducts, setProducts] = useState([]);
  const [bLoading, setLoading] = useState(true);
  const [sError, setError] = useState(null);
  const [nTotalItems, setTotalItems] = useState(0);
  const [nTotalPages, setTotalPages] = useState(0);
  const { setTitle } = useTitle();
  const [deletePopup, setDeletePopup] = useState({
    open: false,
    productId: null,
  });
  const [statusPopup, setStatusPopup] = useState({
    open: false,
    productId: null,
    newStatus: null,
  });
  const [bFilterLoading, setFilterLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [bSubmitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();

  // Fetch categories, brands, and stores from Redux
  const categories = useSelector(
    (state) => state.allData.resources.categories?.data || []
  );
  const brands = useSelector(
    (state) => state.allData.resources.brands?.data || []
  );
  const stores = useSelector(
    (state) => state.allData.resources.stores?.data || []
  );

  // Fetch categories, brands, and stores when filter dropdown is opened
  useEffect(() => {
    if (bShowFilterDropdown) {
      dispatch(fetchResource({ key: "categories" }));
      dispatch(fetchResource({ key: "brands" }));
      dispatch(fetchResource({ key: "stores" }));
    }
  }, [bShowFilterDropdown, dispatch]);

  const defaultFilters = {
    category: "all",
    brand: "all",
    store: "all",
    status: "all",
  };
  const [oFilters, setFilters] = useState(defaultFilters);

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const handleEdit = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  const fetchProducts = useCallback(async () => {
    try {
      if (initialLoadComplete) {
        setFilterLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const token = localStorage.getItem("token");
      const params = {
        pageNumber: nCurrentPage,
        pageSize: itemsPerPage,
        searchText: sSearchTerm,
      };
      if (oFilters.status && oFilters.status !== "all") {
        params.IsActive = oFilters.status.toLowerCase();
      }
      if (oFilters.category && oFilters.category !== "all") {
        params.categoryName = oFilters.category;
      }
      if (oFilters.brand && oFilters.brand !== "all") {
        params.brandName = oFilters.brand;
      }
      if (oFilters.store && oFilters.store !== "all") {
        params.storeName = oFilters.store;
      }

      const oResponse = await apiGet(GETPRODUCTDETAILS, params, token);
      const resData = oResponse?.data;
      if (resData?.status === STATUS.SUCCESS.toUpperCase()) {
        const rawProducts = Array.isArray(resData.data) ? resData.data : [];
        const transformedProducts = rawProducts.map((product) => {
          const firstVariant =
            product.Variants.find((v) => v.IsActive) || product.Variants[0] || {};
          return {
            ...product,
            subCategory: product.CategoryName,
            MRP: firstVariant.MRP || "0.00",
            quantity: getTotalStock(firstVariant.Inventory || []),
            storeName: getStoreName(firstVariant.Inventory || []),
            firstImage: getFirstImage(firstVariant.ProductVariantImages || []),
            status:
              product.IsActive && getTotalStock(firstVariant.Inventory || []) > 0
                ? "active"
                : "out-of-stock",
          };
        });
        setProducts(transformedProducts);
        setTotalItems(resData.pagination?.totalRecords || 0);
        setTotalPages(resData.pagination?.totalPages || 0);
      } else {
        setError(resData?.message || t("COMMON.API_ERROR"));
        setProducts([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (err) {
      const backendMessage = err?.response?.data?.message;
      setError(backendMessage || t("COMMON.API_ERROR"));
      setProducts([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
      setFilterLoading(false);
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
    }
  }, [nCurrentPage, itemsPerPage, sSearchTerm, oFilters, t, initialLoadComplete]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setTitle(t("PRODUCTS.TITLE"));
  }, [setTitle, t]);

  const categoryOptions = [
    { value: "all", label: t("COMMON.ALL") },
    ...categories.map((cat) => ({
      value: cat.CategoryName,
      label: cat.CategoryName,
    })),
  ];

  const brandOptions = [
    { value: "all", label: t("COMMON.ALL") },
    ...brands.map((brand) => ({
      value: brand.BrandName,
      label: brand.BrandName,
    })),
  ];

  const storeOptions = [
    { value: "all", label: t("COMMON.ALL") },
    ...stores.map((store) => ({
      value: store.StoreName,
      label: store.StoreName,
    })),
  ];

  const statusOptions = [
    { value: "all", label: t("COMMON.ALL") },
    { value: true, label: t("COMMON.ACTIVE") },
    { value: false, label: t("COMMON.INACTIVE") },
  ];

  const handleDropdownInputChange = (inputValue, filterName) => {
    if (filterName === "category") {
      dispatch(
        fetchResource({
          key: "categories",
          params: inputValue && inputValue.trim() !== "" ? { searchText: inputValue } : {},
        })
      );
    } else if (filterName === "brand") {
      dispatch(
        fetchResource({
          key: "brands",
          params: inputValue && inputValue.trim() !== "" ? { searchText: inputValue } : {},
        })
      );
    } else if (filterName === "store") {
      dispatch(
        fetchResource({
          key: "stores",
          params: inputValue && inputValue.trim() !== "" ? { searchText: inputValue } : {},
        })
      );
    }
  };

  const additionalFilters = [
    {
      label: t("PRODUCT_SETUP.TABS.CATEGORIES"),
      name: "category",
      value: oFilters.category,
      options: categoryOptions,
      placeholder: t("PRODUCT_SETUP.TABS.CATEGORIES"),
      searchable: true,
      searchPlaceholder: t("COMMON.SEARCH_CATEGORY"),
      onInputChange: (inputValue) => handleDropdownInputChange(inputValue, "category"),
    },
    {
      label: t("PRODUCT_SETUP.TABS.BRANDS"),
      name: "brand",
      value: oFilters.brand,
      options: brandOptions,
      placeholder: t("PRODUCT_SETUP.TABS.BRANDS"),
      searchable: true,
      searchPlaceholder: t("COMMON.SEARCH_BRAND"),
      onInputChange: (inputValue) => handleDropdownInputChange(inputValue, "brand"),
    },
    {
      label: t("SIDEBAR.STORES"),
      name: "store",
      value: oFilters.store,
      options: storeOptions,
      placeholder: t("PRODUCT_SETUP.TABS.STORES"),
      searchable: true,
      searchPlaceholder: t("COMMON.SEARCH_STORE"),
      onInputChange: (inputValue) => handleDropdownInputChange(inputValue, "store"),
    },
    {
      label: t("COMMON.STATUS"),
      name: "status",
      value: oFilters.status,
      options: statusOptions,
    },
  ];

  const handleFilterChange = (e, filterName) => {
    if (initialLoadComplete) {
      setFilterLoading(true);
    }
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, nTotalPages));
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [sSearchTerm, oFilters]);

  // --- Status Update Handlers ---
  const handleStatusChange = (productId, currentIsActive) => {
    // Open confirmation popup before updating status
    setStatusPopup({ open: true, productId, newStatus: !currentIsActive });
  };

  const handleStatusConfirm = async () => {
    if (setSubmitting) setSubmitting(true);
    const { productId, newStatus } = statusPopup;

    try {
      // Dispatch async status update request
      const result = await dispatch(
        updateStatusById({
          key: "products",
          id: productId,
          newStatus,
          apiRoute: UPDATE_PRODUCT_STATUS,
          idField: "ProductID",
        })
      ).unwrap();

      showEmsg(result.message, STATUS.SUCCESS);

      // Refetch updated list after successful status change
      const params = {
        pageNumber: nCurrentPage,
        pageSize: itemsPerPage,
        searchText: sSearchTerm,
      };
      if (oFilters.status && oFilters.status !== "all") {
        params.IsActive = oFilters.status;
      }
      await fetchProducts();
    } catch (err) {
      showEmsg(err?.message || t("COMMON.API_ERROR"), STATUS.ERROR);
    } finally {
      // Reset popup state and stop loader
      setStatusPopup({ open: false, productId: null, newStatus: null });
      hideLoaderWithDelay(setSubmitting);
    }
  };


  const handleStatusPopupClose = () => {
    setStatusPopup({ open: false, productId: null, newStatus: null });
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen bg-gray-50">
      <ToastContainer />
      <Toolbar
        searchTerm={sSearchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={sViewMode}
        setViewMode={setViewMode}
        showFilterDropdown={bShowFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        additionalFilters={additionalFilters}
        handleFilterChange={handleFilterChange}
        searchPlaceholder={t("PRODUCTS.SEARCH_PLACEHOLDER")}
        onClearFilters={handleClearFilters}
        onCreate={() => navigate("/Addproduct")}
      />
      {bLoading ? (
        <div className="text-center py-8 text-gray-500">{t("COMMON.LOADING")}</div>
      ) : sError ? (
        <div className="text-center py-8 text-red-500">{sError}</div>
      ) : sViewMode === "table" ? (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">{t("PRODUCTS.TITLE")}</th>
                  <th className="table-head-cell">{t("COMMON.CATEGORY")}</th>
                  <th className="table-head-cell">{t("COMMON.PRICE")}</th>
                  <th className="table-head-cell">{t("PRODUCTS.STOCK")}</th>
                  <th className="table-head-cell">{t("COMMON.STATUS")}</th>
                  <th className="table-head-cell">{t("PRODUCTS.STORE_NAME")}</th>
                  <th className="table-head-cell">{t("COMMON.ACTIONS")}</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {bFilterLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <div className="flex justify-center">
                        <Loader size="small" />
                      </div>
                    </td>
                  </tr>
                ) : aProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      {t("PRODUCTS.NO_PRODUCTS")}
                    </td>
                  </tr>
                ) : (
                  aProducts.map((product) => (
                    <tr key={product.ProductID} className="table-row text-left">
                      <td className="table-cell">
                      <Link
    to={`/productdetails/${product.ProductID}`}
    className="flex items-center justify-left hover:bg-gray-50 p-2 rounded transition"
  >
                        <div className="flex items-center justify-left">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded object-cover"
                              src={product.firstImage}
                              alt={product.ProductName}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = noImage;
                              }}
                            />
                          </div>
                          <div className="ml-3">
                            <div
                              className="font-medium text-sm text-gray-900 ellipsis-text"
                              title={product.ProductName}
                            >
                              {product.ProductName}
                            </div>
                          </div>
                        </div>
                        </Link>
                      </td>
                      <td className="table-cell table-cell-text">
                        <div className="ellipsis-text" title={product.subCategory}>
                          {product.subCategory}
                        </div>
                      </td>
                      <td className="table-cell text-left table-cell-text">
                        ₹{parseFloat(product.MRP).toFixed(2)}
                      </td>
                      <td className="table-cell text-center table-cell-text">
                        {product.quantity || 0}
                      </td>
                      <td className="table-cell">
                        <Switch
                          checked={product.IsActive}
                          onChange={() => handleStatusChange(product.ProductID, product.IsActive)}
                          className={`${product.IsActive ? "bg-green-500" : "bg-gray-300"
                            } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                        >
                          <span
                            className={`${product.IsActive ? "translate-x-6" : "translate-x-1"
                              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                          />
                        </Switch>
                      </td>
                      <td className="table-cell text-left table-cell-text">
                        <div className="ellipsis-text" title={product.storeName}>
                          {product.storeName}
                        </div>
                      </td>
                      <td className="table-cell text-left font-medium align-middle">
                        <div className="flex justify-left items-left">
                          <ActionButtons
                            id={product.ProductID}
                            onEdit={handleEdit}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bFilterLoading ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader size="medium" />
            </div>
          ) : aProducts.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              {t("PRODUCTS.NO_PRODUCTS")}
            </div>
          ) : (
            aProducts.map((product) => (
              <div
                key={product.ProductID}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                      product.status
                    )}`}
                  >
                    {product.status === "active" ? "Active" : "Out of Stock"}
                  </span>

                  {/* Status Switch */}
                  <Switch
                    checked={product.IsActive}
                    onChange={() => handleStatusChange(product.ProductID, product.IsActive)}
                    className={`${product.IsActive ? "bg-green-500" : "bg-gray-300"
                      } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                  >
                    <span
                      className={`${product.IsActive ? "translate-x-6" : "translate-x-1"
                        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                  </Switch>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-shrink-0 h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.firstImage}
                      alt={product.ProductName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = noImage;
                        e.target.classList.remove("object-cover");
                        e.target.classList.add("object-contain", "bg-white");
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div
                      className="text-sm font-medium text-gray-900 ellipsis-text"
                      title={product.ProductName}
                    >
                      {product.ProductName}
                    </div>
                  </div>
                </div>
                <div
                  className="text-sm text-gray-900 mt-2 ellipsis-text"
                  title={product.subCategory}
                >
                  <span className="font-medium">{t("COMMON.CATEGORY")}</span>{" "}
                  {product.subCategory}
                </div>
                <div className="flex items-center justify-between border-t pt-2 mt-2">
                  <div>
                    {t("PRODUCTS.STOCK")}: {product.quantity || 0}
                  </div>
                  <div>
                    {t("COMMON.PRICE")} ₹{parseFloat(product.MRP).toFixed(2)}
                  </div>
                </div>
                <ActionButtons
                  id={product.ProductID}
                  onEdit={handleEdit}
                />
              </div>
            ))
          )}
        </div>
      )}
      {!bLoading && !sError && nTotalItems > 0 && (
        <Pagination
          currentPage={nCurrentPage}
          totalPages={nTotalPages}
          totalItems={nTotalItems}
          itemsPerPage={itemsPerPage}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
          handlePageClick={handlePageClick}
        />
      )}

      {statusPopup.open && (
        <FullscreenErrorPopup
          title={t("PRODUCTS.CONFIRM_STATUS_TITLE")}
          message={
            statusPopup.newStatus
              ? t("PRODUCTS.CONFIRM_ACTIVATE_MESSAGE")
              : t("PRODUCTS.CONFIRM_DEACTIVATE_MESSAGE")
          }
          onClose={handleStatusPopupClose}
          onConfirm={handleStatusConfirm}
          isSubmitting={bSubmitting}
        />
      )}
    </div>
  );
};

export default ProductList;