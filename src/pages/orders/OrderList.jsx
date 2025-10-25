import React, { useEffect, useState, useCallback } from "react";
import { Download } from "lucide-react"
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Toolbar from "../../components/Toolbar";
import ExportPanel from "../../components/ExportPanel";
import Pagination from "../../components/Pagination";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../utils/ApiUtils";
import { GETALLORDERS_API } from "../../contants/apiRoutes";
import { useTitle } from "../../context/TitleContext";
import { DATE_FORMAT_OPTIONS, LOCALES, STATUS } from "../../contants/constants";
import Loader from "../../components/Loader";
import { fetchResource } from "../../store/slices/allDataSlice";
import { exportOrderReport } from "../../store/slices/exportSlice";
import { showEmsg } from "../../utils/ShowEmsg";
import { ToastContainer } from "react-toastify";

const OrderList = () => {
  const [sSearchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const [sFilterStatus, setFilterStatus] = useState("all");
  const [bShowFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sViewMode, setViewMode] = useState("table");
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [aOrders, setOrders] = useState([]); // Changed from aProductRows to aOrders
  const [nTotalRecords, setTotalRecords] = useState(0);
  const [sTotalPages, setTotalPages] = useState("");
  const [nProductsPerPage, setProductsPerPage] = useState(10);
  const [bFilterLoading, setFilterLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Redux hooks
  const dispatch = useDispatch();
  const { paymentStatus, loadingPaymentStatus } = useSelector((state) => ({
    paymentStatus: state.allData.resources.paymentStatus?.data || [],
    loadingPaymentStatus: state.allData.resources.paymentStatus?.loading || false,
  }));

  const defaultFilters = {
    paymentStatus: "all",
    startDate: "",
    endDate: "",
  };

  const [oFilters, setFilters] = useState({
    ...defaultFilters,
  });

  const navigate = useNavigate();
  const { setTitle } = useTitle();
  const [sError, setError] = useState(null);
  const [bLoading, setLoading] = useState(true);

  // Fetch filter options from Redux on component mount
  useEffect(() => {
    dispatch(fetchResource({ key: "paymentStatus" }));
  }, [dispatch]);

  const handleClearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback(
    (e, filterName) => {
      if (initialLoadComplete) {
        setFilterLoading(true);
      }

      if (filterName === 'dateRange') {
        // Handle date range picker
        const dateValue = e.target.value;
        setFilters((prevFilters) => ({
          ...prevFilters,
          startDate: dateValue?.startDate || '',
          endDate: dateValue?.endDate || '',
        }));
      } else {
        // Handle other filters
        setFilters((prevFilters) => ({
          ...prevFilters,
          [filterName]: e.target.value,
        }));
      }
      setCurrentPage(1);
    },
    [initialLoadComplete]
  );

  const getPaymentStatusOptions = () => {
    // Show loading state while fetching
    if (loadingPaymentStatus) {
      return [{ value: "loading", label: t("COMMON.LOADING"), disabled: true }];
    }

    // Use Redux data when available
    if (paymentStatus && paymentStatus.length > 0) {
      const options = paymentStatus.map(status => ({
        value: status.PaymentStatusName,
        label: status.PaymentStatusName
      }));

      return [
        { value: "all", label: t("COMMON.ALL") },
        ...options
      ];
    }

    // Empty state if no data available
    return [{ value: "no-data", label: t("COMMON.NO_DATA_AVAILABLE"), disabled: true }];
  };

  const additionalFilters = [
    {
      label: t("ORDERS.FILTERS.PAYMENT_STATUS"),
      name: "paymentStatus",
      value: oFilters.paymentStatus,
      options: getPaymentStatusOptions(),
    },
    {
      label: "Date Range",
      name: "dateRange",
      value: { startDate: oFilters.startDate, endDate: oFilters.endDate },
      type: "date",
    },
  ];

  const formatOrderDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(LOCALES.ENGLISH_US, {
      year: DATE_FORMAT_OPTIONS.year,
      month: DATE_FORMAT_OPTIONS.month,
      day: DATE_FORMAT_OPTIONS.day
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat(LOCALES.ENGLISH_INDIA, {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const fetchData = useCallback(async () => {
    try {
      if (initialLoadComplete) {
        setFilterLoading(true);
      } else {
        setLoading(true);
      }

      const token = localStorage.getItem("token");
      const params = {
        searchText: sSearchTerm,
        pageNumber: nCurrentPage,
        pageSize: nProductsPerPage,
        paymentStatus:
          oFilters.paymentStatus !== "all" ? oFilters.paymentStatus : undefined,
        startDate: oFilters.startDate || undefined,
        endDate: oFilters.endDate || undefined,
      };

      const oResponse = await apiGet(GETALLORDERS_API, params, token);

      if (oResponse.data.status !== STATUS.SUCCESS.toLocaleUpperCase()) {
        setOrders([]);
        setTotalPages(0);
        setTotalRecords(0);
        setError(oResponse.data.message || t("ORDERS.NO_ORDERS_FOUND"));
      } else {
        const orders = oResponse.data.data || [];
        
        // Map orders directly without flattening order items
        const formattedOrders = orders.map((order) => ({
          orderId: order.OrderID,
          orderDate: order.OrderDate,
          formattedOrderDate: formatOrderDate(order.OrderDate),
          totalAmount: order.TotalAmount,
          formattedTotalAmount: formatCurrency(order.TotalAmount),
          totalQuantity: order.totalQuantity,
          totalOrderItems: order.totalOrderItems,
          paymentStatus: order.payment?.[0]?.PaymentStatusName || "N/A",
          customerName: `${order.FirstName} ${order.LastName}`.trim(),
          email: order.Email,
          phoneNumber: order.PhoneNumber,
          orderItems: order.orderItems || [], // Keep order items for reference if needed
          order: order, // Keep the full order object
        }));

        setOrders(formattedOrders);
        setTotalPages(oResponse.data.pagination?.totalPages || 0);
        setTotalRecords(oResponse.data.pagination?.totalRecords || 0);
        setError(null);
      }
    } catch (error) {
      setError(
        error?.response?.data?.message || t("COMMON.ERROR_FETCHING_DATA")
      );
      setTotalPages(0);
      setTotalRecords(0);
    } finally {
      setLoading(false);
      setFilterLoading(false);
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
    }
  }, [
    nCurrentPage,
    nProductsPerPage,
    sSearchTerm,
    oFilters,
    initialLoadComplete,
    t,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setTitle(t("ORDERS.TITLE"));
  }, [setTitle, t]);

  const getStatusColor = useCallback((status) => {
    const statusClasses = {
      Pending: "status-pending",
      Processing: "status-processing",
      Shipped: "status-shipped",
      Delivered: "status-delivered",
      Cancelled: "status-cancelled",
      Returned: "status-cancelled",
    };
    return statusClasses[status] || "status-default";
  }, []);

  const getPaymentStatusColor = useCallback((status) => {
    const statusClasses = {
      Pending: "status-pending",
      Completed: "status-delivered",
      Failed: "status-cancelled",
      Refunded: "status-cancelled",
      Processing: "status-processing",
    };
    return statusClasses[status] || "status-default";
  }, []);

  const handleViewOrder = useCallback(
    (order) => {
      // Navigate to order details with the full order data
      navigate(`/orders/${order.orderId}`, {
        state: {
          order: order.order, // This contains the full order data
        },
      });
    },
    [navigate]
  );

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, sTotalPages));
  }, [sTotalPages]);

  const handlePageClick = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [sSearchTerm, sFilterStatus]);

  const [bShowExportPanel, setShowExportPanel] = useState(false);
  const [oExportDate, setExportDate] = useState({ startDate: null, endDate: null });

  const handleExportOrders = useCallback(() => {
    setShowExportPanel(true);
  }, []);

  const handleConfirmExportOrders = useCallback(() => {
    dispatch(exportOrderReport({
      startDate: oExportDate.startDate,
      endDate: oExportDate.endDate
    }));
    setShowExportPanel(false);
  }, [dispatch, oExportDate]);

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-2">
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
        searchPlaceholder={t("ORDERS.SEARCH_PLACEHOLDER")}
        onClearFilters={handleClearFilters}
        onExport={handleExportOrders}
      />

      {bShowExportPanel && (
        <ExportPanel
          title={t("ORDERS.TITLE") + " – Date Range"}
          value={oExportDate}
          onChange={(val) => setExportDate(val)}
          onCancel={() => setShowExportPanel(false)}
          onConfirm={handleConfirmExportOrders}
          confirmLabel="Download"
        />
      )}

      {sViewMode === "table" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">
                    {t("ORDERS.TABLE.ORDER_NUMBER")}
                  </th>
                  <th className="table-head-cell">
                    {t("ORDERS.TABLE.ORDER_DATE")}
                  </th>
                  <th className="table-head-cell">
                    {t("ORDERS.TABLE.CUSTOMER_NAME")}
                  </th>
                  <th className="table-head-cell">
                    {t("ORDERS.TABLE.PHONE_NUMBER")}
                  </th>
                  <th className="table-head-cell">
                    {t("ORDERS.TABLE.PAYMENT_STATUS")}
                  </th>
                  <th className="table-head-cell">{t("COMMON.TOTAL_ORDER_ITEMS")}</th>
                  <th className="table-head-cell">{t("COMMON.ACTIONS")}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bFilterLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      <div className="flex justify-center">
                        <Loader size="small" />
                      </div>
                    </td>
                  </tr>
                ) : sError ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-600">
                      {sError}
                    </td>
                  </tr>
                ) : aOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-600">
                      {t("ORDERS.NO_ORDERS_FOUND")}
                    </td>
                  </tr>
                ) : (
                  aOrders.map((order) => (
                    <tr
                      key={order.orderId}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="table-cell">
                        <div className="text-caption font-semibold truncate max-w-[150px]">
                          {order.orderId}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-700">
                          {order.formattedOrderDate}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-700 truncate max-w-[200px]">
                          {order.customerName || "Unknown Customer"}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                          {order.email}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-700">
                          {order.phoneNumber || "N/A"}
                        </div>
                      </td>
                      <td className="table-cell text-center">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900 text-center">
                          {order.totalOrderItems}
                        </div>
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-[#5B45E0] hover:text-[#4c39c7] font-medium transition-colors duration-150"
                        >
                          {t("ORDERS.VIEW_DETAILS")}
                        </button>
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
          {bLoading ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              {t("COMMON.LOADING")}
            </div>
          ) : bFilterLoading ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader size="medium" />
            </div>
          ) : sError ? (
            <div className="col-span-full text-center py-8 text-gray-600">
              {sError}
            </div>
          ) : aOrders.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-600">
              {t("ORDERS.NO_ORDERS_FOUND")}
            </div>
          ) : (
            aOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold px-3 py-1 rounded-full border bg-gray-50 text-gray-700 border-gray-200">
                    {order.orderId.split("-")[0]}
                  </div>
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPaymentStatusColor(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="text-sm text-gray-600">
                  <strong>{t("ORDERS.TABLE.ORDER_DATE")}</strong> {order.formattedOrderDate}
                </div>

                <div className="mt-2">
                  <div className="text-base font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                    {order.customerName}
                  </div>
                  <div className="text-sm text-caption mt-1">
                    {order.email}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <strong>  {t("ORDERS.TABLE.PHONE_NUMBER")}</strong> {order.phoneNumber || "N/A"}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm font-semibold text-gray-900">
                      {order.formattedTotalAmount}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t("COMMON.TOTAL_ORDER_ITEMS")}: {order.totalOrderItems}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleViewOrder(order)}
                  className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 border border-[#5B45E0] text-[#5B45E0] rounded-lg font-medium hover:bg-[#5B45E0]/10 transition-colors duration-150"
                >
                  {t("ORDERS.VIEW_DETAILS")}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {aOrders.length > 0 && (
        <Pagination
          currentPage={nCurrentPage}
          totalPages={sTotalPages}
          totalItems={nTotalRecords}
          itemsPerPage={nProductsPerPage}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
          handlePageClick={handlePageClick}
        />
      )}
    </div>
  );
};

export default OrderList;