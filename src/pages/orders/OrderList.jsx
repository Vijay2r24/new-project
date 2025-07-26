import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../../components/Toolbar";
import Pagination from "../../components/Pagination";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../utils/ApiUtils";
import { GETALLORDERS_API } from "../../contants/apiRoutes";
import { useTitle } from "../../context/TitleContext";
import { STATUS } from "../../contants/constants";
import Loader from "../../components/Loader";

const OrderList = () => {
  const [sSearchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const [sFilterStatus, setFilterStatus] = useState("all");
  const [bShowFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sViewMode, setViewMode] = useState("table");
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [aProductRows, setProductRows] = useState([]);
  const [nTotalRecords, setTotalRecords] = useState(0);
  const [sTotalPages, setTotalPages] = useState("");
  const [nProductsPerPage, setProductsPerPage] = useState(10);
  const [bFilterLoading, setFilterLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const defaultFilters = {
    orderStatus: "all",
    paymentStatus: "all",
    startDate: "",
    endDate: "",
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const [oFilters, setFilters] = useState({
    ...defaultFilters,
  });

  const navigate = useNavigate();
  const { setTitle } = useTitle();
  const [sError, setError] = useState(null);
  const [bLoading, setLoading] = useState(true);

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

  const additionalFilters = [
    {
      label: t("ORDERS.FILTERS.ORDER_STATUS"),
      name: "orderStatus",
      value: oFilters.orderStatus,
      options: [
        { value: "all", label: t("COMMON.ALL") },
        { value: "Pending", label: t("ORDERS.FILTERS.PENDING") },
        { value: "Processing", label: t("ORDERS.FILTERS.PROCESSING") },
        { value: "Shipped", label: t("ORDERS.FILTERS.SHIPPED") },
        { value: "Delivered", label: t("ORDERS.FILTERS.DELIVERED") },
        { value: "Cancelled", label: t("ORDERS.FILTERS.CANCELLED") },
      ],
    },
    {
      label: t("ORDERS.FILTERS.PAYMENT_STATUS"),
      name: "paymentStatus",
      value: oFilters.paymentStatus,
      options: [
        { value: "all", label: t("COMMON.ALL") },
        { value: "PAID", label: t("ORDERS.FILTERS.PAID") },
        { value: "FAILED", label: t("ORDERS.FILTERS.FAILED") },
        { value: "PENDING", label: t("ORDERS.FILTERS.PENDING") },
        { value: "REFUNDED", label: t("ORDERS.FILTERS.REFUNDED") },
      ],
    },
    {
      label: t("ORDERS.FILTERS.START_DATE"),
      name: "startDate",
      value: oFilters.startDate,
      type: "date",
    },
    {
      label: t("ORDERS.FILTERS.END_DATE"),
      name: "endDate",
      value: oFilters.endDate,
      type: "date",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
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
          orderStatus:
            oFilters.orderStatus !== "all" ? oFilters.orderStatus : undefined,
          paymentStatus:
            oFilters.paymentStatus !== "all" ? oFilters.paymentStatus : undefined,
          startDate: oFilters.startDate || undefined,
          endDate: oFilters.endDate || undefined,
        };

        const oResponse = await apiGet(GETALLORDERS_API, params, token);
        if (oResponse.data.STATUS === STATUS.FAILURE.toUpperCase()) {
          setProductRows([]);
          setTotalPages(0);
          setTotalRecords(0);
          setError(oResponse.data.MESSAGE || t("ORDERS.NO_ORDERS_FOUND"));
        } else {
          const orders = oResponse.data.data.data || [];
          const allProductItems = orders.flatMap((order) => {
            if (Array.isArray(order.orderItems)) {
              return order.orderItems.map((item) => ({
                ...item,
                orderId: order.orderId,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
                customer: order.customer,
                orderDate: order.orderDate,
              }));
            } else if (order.orderItem) {
              return [
                {
                  ...order.orderItem,
                  orderId: order.orderId,
                  orderStatus: order.orderStatus,
                  paymentStatus: order.paymentStatus,
                  customer: order.customer,
                  orderDate: order.orderDate,
                },
              ];
            } else {
              return [];
            }
          });
          setProductRows(allProductItems);
          setTotalPages(
            Math.ceil(
              (oResponse.data.data.totalRecords || 0) / nProductsPerPage
            )
          );
          setTotalRecords(oResponse.data.data.totalRecords || 0);
          setError(null);
        }
      } catch (error) {
        setError(error?.response?.data?.MESSAGE);
        setTotalPages(0);
        setTotalRecords(0);
      } finally {
        setLoading(false);
        setFilterLoading(false);
        if (!initialLoadComplete) {
          setInitialLoadComplete(true);
        }
      }
    };

    fetchData();
  }, [nCurrentPage, nProductsPerPage, sSearchTerm, oFilters, initialLoadComplete]);

  useEffect(() => {
    setTitle(t("ORDERS.TITLE"));
  }, [setTitle, t]);

  const getStatusColor = (status) => {
    const statusClasses = {
      Pending: "status-pending",
      Processing: "status-processing",
      Shipped: "status-shipped",
      Delivered: "status-delivered",
      Cancelled: "status-cancelled",
    };
    return statusClasses[status] || "status-default";
  };

  const handleViewOrder = (order) => {
    navigate(`/orders/${order.orderId}`);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, sTotalPages));
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [sSearchTerm, sFilterStatus]);

  const handleExportOrders = () => {
    alert("Export All Orders functionality coming soon!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2">
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

      {sViewMode === "table" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            {bLoading ? (
              <div className="text-center py-8 text-gray-500">
                {t("COMMON.LOADING")}
              </div>
            ) : bFilterLoading ? (
              <div className="flex justify-center py-8">
                <Loader size="small" />
              </div>
            ) : sError ? (
              <div className="text-center py-8 text-gray-600">{sError}</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="table-head">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("ORDERS.TABLE.ORDER_NUMBER")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("ORDERS.TABLE.PRODUCT_NAME")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("COMMON.QUANTITY")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("COMMON.STATUS")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("COMMON.ACTIONS")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {aProductRows.map((productRow) => (
                    <tr
                      key={
                        productRow.orderItemId ||
                        productRow.id ||
                        productRow.orderId
                      }
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-caption font-semibold truncate max-w-[150px]">
                          {productRow.orderId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 truncate max-w-[200px]">
                          {productRow.product?.productName ||
                            "Unnamed Product"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 text-center">
                          {productRow.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(
                            productRow.orderStatus
                          )}`}
                        >
                          {productRow.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-secondary">
                        <button
                          onClick={() => handleViewOrder(productRow)}
                          className="text-[#5B45E0] hover:text-[#4c39c7] font-medium transition-colors duration-150"
                        >
                          {t("ORDERS.VIEW_DETAILS")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
          ) : (
            aProductRows.map((productRow) => (
              <div
                key={
                  productRow.orderItemId || productRow.id || productRow.orderId
                }
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold px-3 py-1 rounded-full border bg-gray-50 text-gray-700 border-gray-200">
                    {productRow.orderId.split("-")[0]}
                  </div>
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(
                      productRow.orderStatus
                    )}`}
                  >
                    {productRow.orderStatus}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-base font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                    {productRow.product?.productName}
                  </div>
                  <div className="text-sm text-caption mt-1">
                    {t("COMMON.QUANTITY")} : {productRow.quantity}
                  </div>
                </div>

                <button
                  onClick={() => handleViewOrder(productRow)}
                  className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 border border-[#5B45E0] text-[#5B45E0] rounded-lg font-medium hover:bg-[#5B45E0]/10 transition-colors duration-150"
                >
                  {t("ORDERS.VIEW_DETAILS")}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <Pagination
        currentPage={nCurrentPage}
        totalPages={sTotalPages}
        totalItems={nTotalRecords}
        itemsPerPage={nProductsPerPage}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        handlePageClick={handlePageClick}
      />
    </div>
  );
};

export default OrderList;