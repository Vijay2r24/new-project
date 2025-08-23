import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../../components/Toolbar";
import Pagination from "../../components/Pagination";
import ActionButtons from "../../components/ActionButtons";
import { useTranslation } from "react-i18next";
import { apiGet, apiDelete } from "../../utils/ApiUtils.jsx";
import {
  GETPRODUCTDETAILS,
  DELETE_PRODUCT_WITH_IMAGES,
} from "../../contants/apiRoutes";
import { useTitle } from "../../context/TitleContext";
import { ITEMS_PER_PAGE, STATUS } from "../../contants/constants.jsx";
import {
  useCategories,
  useBrands,
  useStores,
} from "../../context/AllDataContext";
import FullscreenErrorPopup from "../../components/FullscreenErrorPopup";
import { ToastContainer } from "react-toastify";
import noImage from "../../../assets/images/missing-pictur.jpg";
import { showEmsg } from "../../utils/ShowEmsg.jsx";
import Loader from "../../components/Loader";

const getStatusBadgeClass = (status) => {
  if (status === "active") return "status-active";
  if (status === "out-of-stock") return "status-inactive";
  return "status-active";
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
  const [bFilterLoading, setFilterLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const { data: aCategories, fetch: fetchCategories } = useCategories();
  const { data: aBrands, fetch: fetchBrands } = useBrands();
  const { data: aStores, fetch: fetchStores } = useStores();

  useEffect(() => {
    if (bShowFilterDropdown) {
      fetchCategories();
      fetchBrands();
      fetchStores();
    }
  }, [bShowFilterDropdown]);

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

  const handleDelete = (productId) => {
    setDeletePopup({ open: true, productId });
  };

  const handleDeleteConfirm = async () => {
    const { productId } = deletePopup;
    try {
      const token = localStorage.getItem("token");
      const response = await apiDelete(
        `${DELETE_PRODUCT_WITH_IMAGES}/${productId}`,
        token
      );
      const backendMessage = response.data.MESSAGE;

      showEmsg(backendMessage, STATUS.SUCCESS);
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.productId !== productId)
      );
      setDeletePopup({ open: false, productId: null });
    } catch (err) {
      const errorMessage = err?.response?.data?.MESSAGE;
      showEmsg(errorMessage || t("COMMON.API_ERROR"), STATUS.ERROR);
      setDeletePopup({ open: false, productId: null });
    }
  };

  const handleDeletePopupClose = () => {
    setDeletePopup({ open: false, productId: null });
  };

  useEffect(() => {
    const fetchProducts = async () => {
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
          params.status = oFilters.status;
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

        if (resData?.STATUS === STATUS.SUCCESS.toUpperCase()) {
          const dataObj = resData.data || {};
          setProducts(Array.isArray(dataObj.data) ? dataObj.data : []);
          setTotalItems(dataObj.totalRecords || 0);
          setTotalPages(dataObj.totalPages || 0);
        } else {
          setError(resData?.MESSAGE);
        }
      } catch (err) {
        const backendMessage = err?.response?.data?.MESSAGE;
        setError(backendMessage);
      } finally {
        setLoading(false);
        setFilterLoading(false);
        if (!initialLoadComplete) {
          setInitialLoadComplete(true);
        }
      }
    };

    fetchProducts();
  }, [nCurrentPage, itemsPerPage, sSearchTerm, oFilters, t, initialLoadComplete]);

  useEffect(() => {
    setTitle(t("PRODUCTS.TITLE"));
  }, [setTitle, t]);

  const categoryOptions = [
    { value: "all", label: t("COMMON.ALL") },
    ...aCategories.map((cat) => ({
      value: cat.CategoryName,
      label: cat.CategoryName,
    })),
  ];

  const brandOptions = [
    { value: "all", label: t("COMMON.ALL") },
    ...aBrands.map((brand) => ({
      value: brand.BrandName,
      label: brand.BrandName,
    })),
  ];

  const storeOptions = [
    { value: "all", label: t("COMMON.ALL") },
    ...aStores.map((store) => ({
      value: store.StoreName,
      label: store.StoreName,
    })),
  ];

  const statusOptions = [
    { value: "all", label: t("COMMON.ALL") },
    { value: "Active", label: t("COMMON.ACTIVE") },
    { value: "Inactive", label: t("COMMON.INACTIVE") },
  ];

  const handleDropdownInputChange = (inputValue, filterName) => {
    if (filterName === "category") {
      if (inputValue && inputValue.trim() !== "") {
        fetchCategories({ searchText: inputValue });
      } else {
        fetchCategories();
      }
    } else if (filterName === "brand") {
      if (inputValue && inputValue.trim() !== "") {
        fetchBrands({ searchText: inputValue });
      } else {
        fetchBrands();
      }
    } else if (filterName === "store") {
      if (inputValue && inputValue.trim() !== "") {
        fetchStores({ searchText: inputValue });
      } else {
        fetchStores();
      }
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
      onInputChange: (inputValue) =>
        handleDropdownInputChange(inputValue, "category"),
    },
    {
      label: t("PRODUCT_SETUP.TABS.BRANDS"),
      name: "brand",
      value: oFilters.brand,
      options: brandOptions,
      placeholder: t("PRODUCT_SETUP.TABS.BRANDS"),
      searchable: true,
      searchPlaceholder: t("COMMON.SEARCH_BRAND"),
      onInputChange: (inputValue) =>
        handleDropdownInputChange(inputValue, "brand"),
    },
    {
      label: t("SIDEBAR.STORES"),
      name: "store",
      value: oFilters.store,
      options: storeOptions,
      placeholder: t("PRODUCT_SETUP.TABS.STORES"),
      searchable: true,
      searchPlaceholder: t("COMMON.SEARCH_STORE"),
      onInputChange: (inputValue) =>
        handleDropdownInputChange(inputValue, "store"),
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
        <div className="text-center py-8 text-gray-500">
          {t("COMMON.LOADING")}
        </div>
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
                  <th className="table-head-cell">
                    {t("PRODUCTS.STORE_NAME")}
                  </th>
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
                    <tr key={product.productId} className="table-row text-left">
                      <td className="table-cell">
                        <div className="flex items-center justify-left">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded object-cover"
                              src={product.variants[0]?.images[0] || noImage}
                              alt={product.productName}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = noImage;
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="table-cell table-cell-text">
                        <div
                          className="ellipsis-text"
                          title={product.subCategory}
                        >
                          {product.subCategory}
                        </div>
                      </td>

                      <td className="table-cell text-left table-cell-text">
                        ₹{parseFloat(product.MRP).toFixed(2)}
                      </td>

                      <td className="table-cell text-center table-cell-text">
                        {product.variants[0]?.quantity}
                      </td>

                      <td className="table-cell">
                        <span
                          className={`status-badge ${getStatusBadgeClass(
                            product.variants[0]?.quantity === 0
                              ? "inactive"
                              : "active"
                          )}`}
                        >
                          {(product.variants[0]?.quantity === 0
                            ? "inactive"
                            : "Active"
                          )
                            .split("-")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </span>
                      </td>

                      <td className="table-cell text-left table-cell-text">
                        <div
                          className="ellipsis-text"
                          title={product.storeName || "n/a"}
                        >
                          {product.storeName || "n/a"}
                        </div>
                      </td>
                      <td className="table-cell text-left font-medium align-middle">
                        <div className="flex justify-left items-left">
                          <ActionButtons
                            id={product.productId}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onMore={() => console.log("")}
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
                key={product.productId}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                      product.variants[0]?.quantity === 0
                        ? "inactive"
                        : "active"
                    )}`}
                  >
                    {(product.variants[0]?.quantity === 0
                      ? "inactive"
                      : "Active"
                    )
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-shrink-0 h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.variants[0]?.images[0] || noImage}
                      alt={product.productName}
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
                      title={product.productName}
                    >
                      {product.productName}
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
                    {t("PRODUCTS.STOCK")}: {product.variants[0]?.quantity}
                  </div>
                  <div>
                    {t("COMMON.PRICE")} ₹{product.MRP}
                  </div>
                </div>

                <ActionButtons
                  id={product.productId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onMore={() => console.log("")}
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

      {deletePopup.open && (
        <FullscreenErrorPopup
          title={t("PRODUCTS.CONFIRM_DELETE_TITLE")}
          message={t("PRODUCTS.CONFIRM_DELETE_MESSAGE")}
          onClose={handleDeletePopupClose}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default ProductList;