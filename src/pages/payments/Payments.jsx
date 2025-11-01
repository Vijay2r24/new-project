import React, { useState, useEffect, useCallback } from "react";
import { Calendar, CreditCard, FileText, User, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Toolbar from "../../components/Toolbar";
import Pagination from "../../components/Pagination";
import { useTranslation } from "react-i18next";
import { useTitle } from "../../context/TitleContext";
import FullscreenErrorPopup from "../../components/FullscreenErrorPopup";
import { ToastContainer } from "react-toastify";
import { ITEMS_PER_PAGE, STATUS } from "../../contants/constants";
import { apiDelete, apiGet } from "../../utils/ApiUtils";
import Loader from "../../components/Loader";
import {
  getPermissionCode,
  hasPermissionId,
} from "../../utils/permissionUtils";
import { fetchResource } from "../../store/slices/allDataSlice";
import { GET_All_PAYMENTS } from "../../contants/apiRoutes";
import { exportPaymentReport } from "../../store/slices/exportSlice";
import ExportPanel from "../../components/ExportPanel";
import { showEmsg } from "../../utils/ShowEmsg.jsx";

const Payments = () => {
  const { t } = useTranslation();
  const { setBackButton, setTitle } = useTitle();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const [sSearchTerm, setSearchTerm] = useState("");
  const [bShowFilterDropdown, setShowFilterDropdown] = useState(false);

  const defaultFilters = {
    paymentStatus: "",
    paymentType: "",
    paymentMethod: "",
    startDate: "",
    endDate: "",
  };

  const [oFilters, setFilters] = useState(defaultFilters);
  const [bSubmitting, setSubmitting] = useState(false);
  const [bFilterLoading, setFilterLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [bShowExportPanel, setShowExportPanel] = useState(false);
  const [oExportDate, setExportDate] = useState({
    startDate: null,
    endDate: null,
  });

  const permissionIdForDelete = getPermissionCode(
    "Payment Management",
    "Delete Payment"
  );
  const hasDeletePermission = hasPermissionId(permissionIdForDelete);
  const paymentStatusOptions = useSelector(
    (state) =>
      state.allData.resources.paymentStatus?.data?.map((status) => ({
        value: status.PaymentStatusID,
        label: status.PaymentStatusName,
      })) || []
  );

  const paymentTypeOptions = useSelector(
    (state) =>
      state.allData.resources.paymentTypes?.data?.map((type) => ({
        value: type.PaymentTypeID,
        label: type.PaymentTypeName,
      })) || []
  );

  const paymentMethodOptions = useSelector(
    (state) =>
      state.allData.resources.paymentMethods?.data?.map((method) => ({
        value: method.PaymentMethodID,
        label: method.PaymentMethodName,
      })) || []
  );

  const aAdditionalFilters = [
    {
      label: t("COMMON.STATUS"),
      name: "paymentStatus",
      value: oFilters.paymentStatus,
      options: [
        { value: "", label: t("COMMON.ALL") },
        ...paymentStatusOptions.map((opt) => ({
          value: opt.label, // Use the name as value
          label: opt.label,
        })),
      ],
    },
    {
      label: t("PAYMENTS.TYPE"),
      name: "paymentType",
      value: oFilters.paymentType,
      options: [
        { value: "", label: t("COMMON.ALL") },
        ...paymentTypeOptions.map((opt) => ({
          value: opt.label, // Use the name as value
          label: opt.label,
        })),
      ],
    },
    {
      label: t("PAYMENTS.METHOD"),
      name: "paymentMethod",
      value: oFilters.paymentMethod,
      options: [
        { value: "", label: t("COMMON.ALL") },
        ...paymentMethodOptions.map((opt) => ({
          value: opt.label, // Use the name as value
          label: opt.label,
        })),
      ],
    },
    {
      label: t("COMMON.DATE_RANGE"),
      name: "dateRange",
      value: { startDate: oFilters.startDate, endDate: oFilters.endDate },
      type: "date",
    },
  ];

  const [deletePopup, setDeletePopup] = useState({
    open: false,
    paymentId: null,
  });

  const itemsPerPage = ITEMS_PER_PAGE;
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);

  const handleView = (paymentID) => {
    navigate(`/payment-details/${paymentID}`);
  };

  const handleDelete = (paymentId) => {
    if (!hasDeletePermission) {
      showEmsg(t("COMMON.NO_DELETE_PERMISSION"), STATUS.ERROR);
      return;
    }
    setDeletePopup({ open: true, paymentId });
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const handleExportPayments = useCallback(() => {
    setShowExportPanel(true);
  }, []);

  const handleConfirmExportPayments = useCallback(() => {
    dispatch(
      exportPaymentReport({
        startDate: oExportDate.startDate,
        endDate: oExportDate.endDate,
      })
    );
    setShowExportPanel(false);
  }, [dispatch, oExportDate]);

  const handleDeletePopupClose = () => {
    setDeletePopup({ open: false, paymentId: null });
  };

  const handleDeleteConfirm = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      await apiDelete(`/deletePayment/${deletePopup.paymentId}`, token);
      showEmsg(t("PAYMENTS.DELETE_SUCCESS"), STATUS.SUCCESS);
      setDeletePopup({ open: false, paymentId: null });
      await fetchPaymentsData();
    } catch (err) {
      showEmsg(
        err?.response?.data?.MESSAGE || t("COMMON.API_ERROR"),
        STATUS.ERROR
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilterChange = (e, filterName) => {
    if (initialLoadComplete) {
      setFilterLoading(true);
    }

    // Handle date range filter specifically
    if (filterName === "dateRange") {
      const { startDate, endDate } = e.target.value || {};
      setFilters((prev) => ({
        ...prev,
        startDate: startDate || "",
        endDate: endDate || "",
      }));
    } else {
      // Handle other filters
      const { name, value } = e.target;
      setFilters((prev) => ({
        ...prev,
        [filterName || name]: value,
      }));
    }

    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    console.log("Page clicked:", page); // Debug log
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const fetchPaymentsData = async () => {
    try {
      setPaymentsLoading(true);
      const token = localStorage.getItem("token");

      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        ...(sSearchTerm && { searchText: sSearchTerm }),
        ...(oFilters.paymentStatus && {
          paymentStatus: oFilters.paymentStatus,
        }),
        ...(oFilters.paymentType && { paymentType: oFilters.paymentType }),
        ...(oFilters.paymentMethod && {
          paymentMethod: oFilters.paymentMethod,
        }),
        ...(oFilters.startDate && { startDate: oFilters.startDate }),
        ...(oFilters.endDate && { endDate: oFilters.endDate }),
      };

      // remove empty keys
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === "") {
          delete params[key];
        }
      });

      const response = await apiGet(GET_All_PAYMENTS, params, token);

      if (response.data.status === STATUS.SUCCESS.toLocaleUpperCase()) {
        const list = response.data.data || [];
        setPayments(list);
        setTotalItems(response.data.pagination?.totalRecords || list.length);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchResource({ key: "paymentStatus" }));
    dispatch(fetchResource({ key: "paymentTypes" }));
    dispatch(fetchResource({ key: "paymentMethods" }));
  }, [dispatch]);

  useEffect(() => {
    console.log("Current page changed:", currentPage); // Debug log
    const loadPayments = async () => {
      setFilterLoading(true);
      await fetchPaymentsData();
      setFilterLoading(false);
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
    };

    loadPayments();
    setTitle(t("PAYMENTS.HEADING"));

    return () => {
      setBackButton(null);
      setTitle("");
    };
  }, [
    currentPage,
    itemsPerPage,
    sSearchTerm,
    oFilters.paymentStatus,
    oFilters.paymentType,
    oFilters.paymentMethod,
    oFilters.startDate,
    oFilters.endDate,
    setBackButton,
    setTitle,
    t,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sSearchTerm, oFilters]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen bg-gray-50">
      <ToastContainer />
      {bSubmitting && (
        <div className="global-loader-overlay">
          <Loader />
        </div>
      )}
      <Toolbar
        searchTerm={sSearchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showFilterDropdown={bShowFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        additionalFilters={aAdditionalFilters}
        handleFilterChange={handleFilterChange}
        searchPlaceholder={t("PAYMENTS.SEARCH_PLACEHOLDER")}
        onClearFilters={handleClearFilters}
        onExport={handleExportPayments}
        showCreateButton={false}
      />

      {bShowExportPanel && (
        <ExportPanel
          title={t("PAYMENTS.TITLE") + " – " + t("COMMON.DATE_RANGE")}
          value={oExportDate}
          onChange={(val) => setExportDate(val)}
          onCancel={() => setShowExportPanel(false)}
          onConfirm={handleConfirmExportPayments}
        />
      )}

      {viewMode === "table" ? (
        <div className="table-container overflow-hidden">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th scope="col" className="table-head-cell w-1/4">
                    {t("PAYMENTS.PAYMENT_DETAILS")}
                  </th>
                  <th scope="col" className="table-head-cell w-1/5">
                    {t("PAYMENTS.ORDER_INFO")}
                  </th>
                  <th
                    scope="col"
                    className="table-head-cell w-1/6 text-right pr-8"
                  >
                    <div className="flex justify-end items-center">
                      {t("PAYMENTS.AMOUNT")}
                    </div>
                  </th>
                  <th scope="col" className="table-head-cell w-1/6 pl-4">
                    {t("COMMON.STATUS")}
                  </th>
                  <th scope="col" className="table-head-cell w-1/6">
                    {t("COMMON.ACTIONS")}
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
                {bFilterLoading || paymentsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <div className="flex justify-center">
                        <Loader size="small" />
                      </div>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      {t("PAYMENTS.NO_PAYMENTS_FOUND")}
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.PaymentID} className="table-row">
                      <td className="table-cell w-1/4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4 min-w-0">
                            <div className="table-cell-text ellipsis-text">
                              {payment.PaymentRefID}
                            </div>
                            <div className="table-cell-subtext flex items-center">
                              <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="ellipsis-text">
                                {formatDate(payment.PaymentDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell w-1/5">
                        <div className="table-cell-text flex items-center">
                          <FileText className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{payment.OrderID}</span>
                        </div>
                        <div className="table-cell-subtext flex items-center">
                          <User className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0" />
                          <span className="truncate">
                            {payment.PaymentType?.PaymentTypeName || "N/A"}
                          </span>
                        </div>
                        {payment.PaymentMethod && (
                          <div className="table-cell-subtext flex items-center">
                            <CreditCard className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0" />
                            <span className="truncate">
                              {payment.PaymentMethod?.PaymentMethodName}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="table-cell w-1/6 text-right font-medium text-gray-900 pr-8">
                        <div className="flex justify-end">
                          {formatCurrency(payment.Amount)}
                        </div>
                      </td>
                      <td className="table-cell w-1/6 pl-4">
                        <span
                          className={`status-badge ${
                            payment.PaymentStatus?.PaymentStatusID === 1
                              ? "status-pending"
                              : payment.PaymentStatus?.PaymentStatusID === 2
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {payment.PaymentStatus?.PaymentStatusName}
                        </span>
                      </td>
                      <td className="table-cell w-1/6 text-left font-medium align-middle">
                        <button
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          title="View"
                          onClick={() => handleView(payment.PaymentID)}
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
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
          {bFilterLoading || paymentsLoading ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader size="medium" />
            </div>
          ) : payments.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              {t("PAYMENTS.NO_PAYMENTS_FOUND")}
            </div>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.PaymentID}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-xl transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0">
                    <CreditCard className="h-6 w-6 text-blue-600 mr-2 flex-shrink-0" />
                    <span className="font-semibold truncate">
                      {payment.PaymentRefID}
                    </span>
                  </div>
                  <span
                    className={`status-badge ${
                      payment.PaymentStatus?.PaymentStatusID === 1
                        ? "status-pending"
                        : payment.PaymentStatus?.PaymentStatusID === 2
                        ? "status-active"
                        : "status-inactive"
                    }`}
                  >
                    {payment.PaymentStatus?.PaymentStatusName}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center mb-1">
                    <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {formatDate(payment.PaymentDate)}
                    </span>
                  </div>
                  <div className="flex items-center mb-1">
                    <FileText className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">Order: {payment.OrderID}</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <CreditCard className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      Type: {payment.PaymentType?.PaymentTypeName || "N/A"}
                    </span>
                  </div>
                  {payment.PaymentMethod && (
                    <div className="flex items-center mb-1">
                      <CreditCard className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        Method: {payment.PaymentMethod?.PaymentMethodName}
                      </span>
                    </div>
                  )}
                  <div className="text-lg font-bold text-gray-900 text-right mt-2">
                    {formatCurrency(payment.Amount)}
                  </div>
                </div>
                <button
                  className="flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 mt-2"
                  onClick={() => handleView(payment.PaymentID)}
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {deletePopup.open && (
        <FullscreenErrorPopup
          open={deletePopup.open}
          message={t("PAYMENTS.DELETE_CONFIRM_MESSAGE")}
          onClose={handleDeletePopupClose}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          handlePrevPage={handlePrevPage} // Changed from onPrevPage
          handleNextPage={handleNextPage} // Changed from onNextPage
          handlePageClick={handlePageClick} // Changed from onPageClick
        />
      )}
    </div>
  );
};

export default Payments;
