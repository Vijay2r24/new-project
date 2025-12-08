import { useEffect, useState } from "react";
import Toolbar from "../components/Toolbar";
import ExportPanel from "../components/ExportPanel";
import Pagination from "../components/Pagination";
import ActionButtons from "../components/ActionButtons";
import Switch from "../components/Switch.jsx";
import FullscreenErrorPopup from "../components/FullscreenErrorPopup";
import { ToastContainer } from "react-toastify";
import noImage from "../../assets/images/missing-pictur.jpg";
import Loader from "../components/Loader";
import { products as initialProducts } from "../contants/mock-data.jsx";
import { useNavigate } from "react-router-dom";
import { useTitle } from "../context/TitleContext.jsx";
import { useTranslation } from "react-i18next";

const getStatusBadgeClass = (status) => {
  if (status === "active") return "status-active";
  if (status === "out-of-stock") return "status-inactive";
  return "status-active";
};

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const itemsPerPage = 10;
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterLoading, setFilterLoading] = useState(false);

  // Static filter options
  const categoryOptions = [
    { value: "all", label: "All" },
    { value: "electronics", label: "Electronics" },
    { value: "vouchers", label: "Vouchers" },
    { value: "coupons", label: "Coupons" },
    { value: "lifestyle", label: "Lifestyle" },
    { value: "travel", label: "Travel" },
    { value: "fashion", label: "Fashion" }
  ];

  const brandOptions = [
    { value: "all", label: "All" },
    { value: "Apple", label: "Apple" },
    { value: "Sony", label: "Sony" },
    { value: "Samsung", label: "Samsung" },
    { value: "Nike", label: "Nike" },
    { value: "Amazon", label: "Amazon" }
  ];

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
  ];

  const defaultFilters = {
    category: "all",
    brand: "all",
    status: "all",
  };
  const [filters, setFilters] = useState(defaultFilters);

  // State for products
  const [products, setProducts] = useState([]);

  // Load products from localStorage on component mount
  useEffect(() => {
    const loadProducts = () => {
      setLoading(true);
      try {
        const storedProducts = localStorage.getItem("productsList");
        if (storedProducts) {
          const parsedProducts = JSON.parse(storedProducts);
          setProducts(parsedProducts);
        } else {
          // Initialize with initial products
          localStorage.setItem("productsList", JSON.stringify(initialProducts));
          setProducts(initialProducts);
        }
      } catch (error) {
        console.error("Error loading products:", error);
        setProducts(initialProducts);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filter products based on search term and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = 
      filters.category === "all" || 
      product.category === filters.category;

    const matchesBrand = 
      filters.brand === "all" || 
      product.brand === filters.brand;

    const matchesStatus = 
      filters.status === "all" || 
      product.status === filters.status;

    return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
  });

  // Calculate pagination
  const totalItems = filteredProducts.length;
  const totalpages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, endIndex);

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const handleEdit = (productId) => {
    console.log("Edit product:", productId);
    navigate(`/addProduct/${productId}`);
  };

  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...filters,
      [filterName]: e.target.value,
    });
    setCurrentPage(1);
  };

  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportDate, setExportDate] = useState({ startDate: null, endDate: null });

  const handleExportProducts = () => {
    setShowExportPanel(true);
  };

  const handleConfirmExportProducts = () => {
    console.log("Exporting products with date range:", exportDate);
    setShowExportPanel(false);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalpages));
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const additionalFilters = [
    {
      label: "Category",
      name: "category",
      value: filters.category,
      options: categoryOptions,
      placeholder: "Select Category",
      searchable: false
    },
    {
      label: "Brand",
      name: "brand",
      value: filters.brand,
      options: brandOptions,
      placeholder: "Select Brand",
      searchable: false
    },
    {
      label: "Status",
      name: "status",
      value: filters.status,
      options: statusOptions,
      placeholder: "Select Status"
    },
  ];

  const [statusPopup, setStatusPopup] = useState({
    open: false,
    productId: null,
    newStatus: null,
  });

  const handleStatusChange = (productId, currentStatus) => {
    setStatusPopup({
      open: true,
      productId,
      newStatus: currentStatus === "active" ? "inactive" : "active"
    });
  };

  const handleStatusConfirm = () => {
    const updatedProducts = products.map(product => 
      product.id === statusPopup.productId 
        ? { ...product, status: statusPopup.newStatus }
        : product
    );
    
    setProducts(updatedProducts);
    
    // Update localStorage
    try {
      localStorage.setItem("productsList", JSON.stringify(updatedProducts));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
    
    console.log(`Status change confirmed for product ${statusPopup.productId} to ${statusPopup.newStatus}`);
    setStatusPopup({ open: false, productId: null, newStatus: null });
  };

  const handleStatusPopupClose = () => {
    setStatusPopup({ open: false, productId: null, newStatus: null });
  };

  useEffect(() => {
    setTitle(t("PRODUCTS.TITLE"));
  }, [setTitle, t]);

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen bg-gray-50">
      <ToastContainer />
      <Toolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showFilterDropdown={showFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        additionalFilters={additionalFilters}
        handleFilterChange={handleFilterChange}
        searchPlaceholder="Search products..."
        onClearFilters={handleClearFilters}
        onCreate={() => navigate("/addProduct")}
        onExport={handleExportProducts}
      />

      {showExportPanel && (
        <ExportPanel
          title="Export Products – Date Range"
          value={exportDate}
          onChange={(val) => setExportDate(val)}
          onCancel={() => setShowExportPanel(false)}
          onConfirm={handleConfirmExportProducts}
        />
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : viewMode === "table" ? (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">Product</th>
                  <th className="table-head-cell">Category</th>
                  <th className="table-head-cell">Brand</th>
                  <th className="table-head-cell">Status</th>
                  <th className="table-head-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filterLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <div className="flex justify-center">
                        <Loader size="small" />
                      </div>
                    </td>
                  </tr>
                ) : displayedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  displayedProducts.map((product) => (
                    <tr key={product.id} className="table-row text-left">
                      <td className="table-cell">
                        <div className="flex items-center justify-left p-2">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded object-cover"
                              src={product.image}
                              alt={product.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = noImage;
                              }}
                            />
                          </div>
                          <div className="ml-3">
                            <div
                              className="font-medium text-sm text-gray-900 ellipsis-text"
                              title={product.name}
                            >
                              {product.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell table-cell-text">
                        <div
                          className="ellipsis-text"
                          title={product.category}
                        >
                          {product.category}
                        </div>
                      </td>
                      <td className="table-cell table-cell-text">
                        {product.brand}
                      </td>
                      <td className="table-cell">
                        <Switch
                          checked={product.status === "active"}
                          onChange={() =>
                            handleStatusChange(product.id, product.status)
                          }
                        />
                      </td>
                      <td className="table-cell text-left font-medium align-middle">
                        <div className="flex justify-left items-left">
                          <ActionButtons
                            id={product.id}
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
          {filterLoading ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader size="medium" />
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No products found
            </div>
          ) : (
            displayedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                      product.status
                    )}`}
                  >
                    {product.status === "active" ? "Active" : "Inactive"}
                  </span>

                  <Switch
                    checked={product.status === "active"}
                    onChange={() =>
                      handleStatusChange(product.id, product.status)
                    }
                  />
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-shrink-0 h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
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
                      title={product.name}
                    >
                      {product.name}
                    </div>
                  </div>
                </div>
                <div
                  className="text-sm text-gray-900 mt-2 ellipsis-text"
                  title={product.category}
                >
                  <span className="font-medium">Category:</span> {product.category}
                </div>
                <div className="flex items-center justify-between border-t pt-2 mt-2">
                  <div>
                    Stock: {product.stock || 0}
                  </div>
                  <div>
                    Points: {product.points}
                  </div>
                </div>
                <ActionButtons
                  id={product.id}
                  onEdit={handleEdit}
                />
              </div>
            ))
          )}
        </div>
      )}
      {!loading && !error && totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalpages={totalpages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
          handlePageClick={handlePageClick}
        />
      )}

      {statusPopup.open && (
        <FullscreenErrorPopup
          title="Confirm Status Change"
          message={
            statusPopup.newStatus === "active"
              ? "Are you sure you want to activate this product?"
              : "Are you sure you want to deactivate this product?"
          }
          onClose={handleStatusPopupClose}
          onConfirm={handleStatusConfirm}
          isSubmitting={false}
        />
      )}
    </div>
  );
};

export default ProductList;