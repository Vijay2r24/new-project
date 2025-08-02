import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  X,
  Package,
  Truck,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Clock,
  Phone,
  Mail,
  Edit,
  Building,
  Check,
} from "lucide-react";
import { useParams, useLocation } from "react-router-dom";
import NotFoundMessage from "../../components/NotFoundMessage";
import { useTranslation } from "react-i18next";
import { apiGet, apiPut } from "../../utils/ApiUtils";
import {
  GETORDER_BYID_API,
  UPDATE_ORDER_ITEM_STATUS,
} from "../../contants/apiRoutes";
import SelectWithIcon from "../../components/SelectWithIcon";
import TextAreaWithIcon from "../../components/TextAreaWithIcon";
import StatusBadge from "./StatusBadge";
import { useOrderStatuses } from "../../context/AllDataContext";
import { showEmsg } from "../../utils/ShowEmsg";
import { ToastContainer } from "react-toastify";
import { useTitle } from "../../context/TitleContext";
import { STATUS } from "../../contants/constants";
import Loader from "../../components/Loader";
import { hideLoaderWithDelay } from "../../utils/loaderUtils";
import BackButton from "../../components/BackButton";

const OrderView = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [nOrder, setOrder] = useState(null);
  const [bLoading, setLoading] = useState(true);
  const [nError, setError] = useState(null);
  const { t } = useTranslation();
  const { setTitle, setBackButton } = useTitle();
  const [bSubmitting, setbSubmitting] = useState(false);
  const [bShowEditDialog, setShowEditDialog] = useState(false);
  const [oEditingItem, setEditingItem] = useState(null);
  const [sEditedStatus, setEditedStatus] = useState("");
  const [sEditedRemarks, setEditedRemarks] = useState("");
  const [sEditedStatusId, setEditedStatusId] = useState(null);
  const [highlightedItemId, setHighlightedItemId] = useState(null);

  // Get the order item from navigation state if available
  useEffect(() => {
    if (location.state?.orderItem) {
      setHighlightedItemId(
        location.state.orderItem.orderItemId || location.state.orderItem.id
      );
    }
  }, [location.state]);

  const {
    data: orderStatusData,
    loading: orderStatusLoading,
    error: orderStatusError,
    fetch: fetchOrderStatuses,
  } = useOrderStatuses();

  const getOrderStatusArray = useCallback(() => {
    if (!orderStatusData) return [];
    if (Array.isArray(orderStatusData)) return orderStatusData;
    if (
      orderStatusData.data &&
      orderStatusData.data.data &&
      Array.isArray(orderStatusData.data.data.rows)
    ) {
      return orderStatusData.data.data.rows;
    }
    if (orderStatusData.data && Array.isArray(orderStatusData.data.rows)) {
      return orderStatusData.data.rows;
    }
    if (orderStatusData.rows && Array.isArray(orderStatusData.rows)) {
      return orderStatusData.rows;
    }
    if (orderStatusData && typeof orderStatusData === "object")
      return [orderStatusData];
    return [];
  }, [orderStatusData]);

  const orderStatusArray = useMemo(
    () => getOrderStatusArray(),
    [getOrderStatusArray]
  );

  useEffect(() => {
    fetchOrderStatuses();
  }, []);

  const openEditDialog = (item) => {
    setEditingItem(item);
    const currentStatus = orderStatusArray.find(
      (status) => status.OrderStatus === item.status
    );
    setEditedStatus(item.status || "");
    setEditedStatusId(currentStatus?.StatusID || null);
    setEditedRemarks("");
    setShowEditDialog(true);
  };

  const closeEditDialog = () => {
    setShowEditDialog(false);
    setEditingItem(null);
    setEditedStatus("");
    setEditedStatusId(null);
    setEditedRemarks("");
  };

  const fetchDataRef = useRef();
  const fetchOrderDetails = useCallback(
    async (orderId, setOrder, setLoading, t) => {
      const token = localStorage.getItem("token");
      try {
        const oResponse = await apiGet(
          `${GETORDER_BYID_API}/${orderId}`,
          {},
          token
        );
        const data = oResponse.data.data.data;

        const mappedOrder = {
          orderId: data.orderId,
          orderDate: data.orderDate,
          totalAmount: data.totalAmount,
          customer: {
            name: data.customerDetails?.name,
            email: data.customerDetails?.email,
            phone: data.customerDetails?.phoneNumber,
          },
          delivery: {
            address: `${data.address?.addressLine1}, ${data.address?.addressLine2}`,
            city: data.address?.city,
            state: data.address?.state,
            country: data.address?.country,
          },
          orderItems: data.orderItems.map((item) => ({
            id: item.orderItemId,
            name: item.product?.productName,
            sku: item.product?.productId,
            image: item.product?.images?.[0] || null,
            price: parseFloat(item.price),
            quantity: item.quantity,
            status: item.product?.orderHistory?.status || null,
            paymentMethod: item.product?.payments?.[0]?.paymentMethod || "N/A",
            paymentStatus: item.product?.payments?.[0]?.paymentStatus || "N/A",
            paymentDate: item.product?.payments?.[0]?.paymentDate || "N/A",
          })),
        };

        setOrder(mappedOrder);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchDataRef.current = () =>
      fetchOrderDetails(orderId, setOrder, setLoading, t);
    fetchDataRef.current();

    setTitle(t("VIEW_ORDER.ORDER_DETAILS"));
    setBackButton(<BackButton onClick={() => window.history.back()} />);

    return () => {
      setBackButton(null);
      setTitle("");
    };
  }, [orderId, setTitle, setBackButton, t, fetchOrderDetails]);

  const handleSaveChanges = useCallback(async () => {
    setbSubmitting(true);

    const payload = {
      orderItemId: oEditingItem?.id,
      statusId: sEditedStatusId,
      remarks: sEditedRemarks,
    };

    const token = localStorage.getItem("token");

    try {
      const oResponse = await apiPut(
        `${UPDATE_ORDER_ITEM_STATUS}/${orderId}`,
        payload,
        token,
        false
      );

      if (oResponse?.data?.STATUS === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(oResponse.data.MESSAGE, STATUS.SUCCESS);
        if (fetchDataRef.current) await fetchDataRef.current();
        closeEditDialog();
      } else {
        showEmsg(oResponse.data.MESSAGE, STATUS.ERROR);
      }
    } catch (error) {
      showEmsg(error?.response?.data?.MESSAGE || t("API_ERROR"), STATUS.ERROR);
    }

    hideLoaderWithDelay(setbSubmitting);
  }, [
    oEditingItem?.id,
    sEditedStatusId,
    sEditedRemarks,
    orderId,
    t,
    showEmsg,
    closeEditDialog,
    fetchDataRef,
    hideLoaderWithDelay,
    setbSubmitting,
  ]);

  if (bLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-caption text-lg">
          {t("VIEW_ORDER.LOADING_ORDER_DETAILS")}
        </div>
      </div>
    );
  }

  if (nError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red text-lg">
          {t("VIEW_ORDER.ERROR_LOADING_ORDER_DETAILS")}
          {nError.message}
        </div>
      </div>
    );
  }

  if (!nOrder) {
    return <NotFoundMessage message={t("VIEW_ORDER.ORDER_NOT_FOUND")} />;
  }

  const orderStatusOptions = orderStatusArray
    .filter(
      (status) =>
        status &&
        typeof status.StatusID !== "undefined" &&
        typeof status.OrderStatus !== "undefined"
    )
    .map((status) => ({
      value: status.StatusID.toString(),
      label: status.OrderStatus,
    }));

  const loaderOverlay = bSubmitting ? (
    <div className="global-loader-overlay">
      <Loader />
    </div>
  ) : null;

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-2 print:bg-white">
      {loaderOverlay}
      <ToastContainer />
      <div>
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <p className="text-gray-500">
              {t("VIEW_ORDER.ORDER_NUMBER")}
              {nOrder.orderId || nOrder.id}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1 print:gap-4">
          <div className="lg:col-span-1 flex flex-col gap-6 print:gap-4">
            <div className="rounded-lg p-6 bg-white shadow-sm border border-gray-100 print:rounded-none print:shadow-none print:border print:p-4">
              <div>
                <div className="flex items-center space-x-3 mb-4 print:mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg print:hidden">
                    <User className="h-5 w-5 text-blue-700" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 print:text-base">
                    {t("VIEW_ORDER.CUSTOMER_DETAILS")}
                  </h4>
                </div>
                <div className="space-y-3 text-gray-700 print:space-y-2 print:text-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center print:h-8 print:w-8 print:bg-gray-100">
                      <span className="text-sm font-medium text-blue-600 print:text-caption print:text-xs">
                        {nOrder.customer?.name
                          ? nOrder.customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "?"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 print:text-xs">
                        {nOrder.customer?.name || "N/A"}
                      </p>
                      <p className="text-caption print:text-[10px]">
                        {t("VIEW_ORDER.CUSTOMER")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500 print:hidden" />
                    <p className="text-sm print:text-xs">
                      {nOrder.customer?.email || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500 print:hidden" />
                    <p className="text-sm print:text-xs">
                      {nOrder.customer?.phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100 print:rounded-none print:shadow-none print:border print:p-4">
              <div>
                <div className="flex items-center space-x-3 mb-4 print:mb-3">
                  <div className="p-2 bg-green-100 rounded-lg print:hidden">
                    <MapPin className="h-5 w-5 text-green-700" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 print:text-base">
                    {t("VIEW_ORDER.DELIVERY_INFORMATION")}
                  </h4>
                </div>
                <div className="space-y-3 text-gray-700 print:space-y-2 print:text-gray-800">
                  <div className="flex items-start space-x-3">
                    <Building className="h-4 w-4 text-gray-500 mt-1 print:hidden" />
                    <div>
                      <p className="text-sm print:text-xs">
                        {nOrder.delivery?.address || "N/A"}
                      </p>
                      <p className="text-caption print:text-[10px]">
                        {nOrder.delivery
                          ? `${nOrder.delivery.city}, ${nOrder.delivery.state} ${nOrder.delivery.zipCode}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Truck className="h-4 w-4 text-gray-500 mt-1 print:hidden" />
                    <div>
                      <p className="text-sm print:text-xs">
                        {t("VIEW_ORDER.STANDARD_DELIVERY")}
                      </p>
                      <p className="text-caption print:text-[10px]">
                        2-4 Business Days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg p-6 bg-white shadow-sm border border-gray-100 print:rounded-none print:shadow-none print:border print:p-4">
              <div className="flex items-center space-x-3 mb-4 print:mb-3">
                <div className="p-2 bg-yellow-100 rounded-lg print:hidden">
                  <CreditCard className="h-5 w-5 text-yellow-700" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 print:text-base">
                  {t("VIEW_ORDER.PAYMENT_INFORMATION")}
                </h4>
              </div>
              <div className="space-y-3 text-gray-700 print:space-y-2 print:text-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm print:text-xs">
                    {t("VIEW_ORDER.PAYMENT_METHOD")}
                  </span>
                  <span className="text-sm font-medium print:text-xs">
                    {nOrder?.orderItems?.[0]?.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm print:text-xs">
                    {t("VIEW_ORDER.PAYMENT_STATUS")}
                  </span>
                  <span className="text-sm font-medium print:text-xs">
                    {nOrder?.orderItems?.[0]?.paymentStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm print:text-xs">
                    {t("VIEW_ORDER.PAYMENT_DATE")}
                  </span>
                  <span className="text-sm font-medium print:text-xs">
                    {new Date(
                      nOrder?.orderItems?.[0]?.paymentDate
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6 print:gap-4">
            <div className="hidden bg-white lg:block rounded-lg p-6 shadow-sm border border-gray-100 print:rounded-none print:shadow-none print:border print:p-4">
              <div>
                <div className="flex items-center space-x-3 mb-4 print:mb-3">
                  <div className="p-2 bg-[#5B45E0]/10 rounded-lg print:hidden">
                    <Package className="h-5 w-5 text-[#5B45E0]" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 print:text-base">
                    {t("VIEW_ORDER.ORDER_SUMMARY")}
                  </h4>
                </div>
                <div className="space-y-3 bg-white print:space-y-2 text-gray-700 print:text-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm print:text-xs">
                      {t("VIEW_ORDER.ORDER_DATE")}
                    </span>
                    <div className="flex items-center text-sm text-gray-900 font-medium print:text-xs">
                      <Calendar className="h-4 w-4 mr-1.5 text-gray-500 print:hidden" />
                      {nOrder.orderDate
                        ? new Date(nOrder.orderDate).toLocaleDateString()
                        : ""}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm print:text-xs">
                      {t("VIEW_ORDER.ORDER_TIME")}
                    </span>
                    <div className="flex items-center text-sm text-gray-900 font-medium print:text-xs">
                      <Clock className="h-4 w-4 mr-1.5 text-gray-500 print:hidden" />
                      {nOrder.orderDate
                        ? new Date(nOrder.orderDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </div>
                  </div>
                  <div className="flex items-center justify-between font-medium border-t border-gray-100 pt-3 mt-3 print:border-gray-200 print:pt-2 print:mt-2">
                    <span className="text-base text-gray-900 print:text-sm">
                      {t("VIEW_ORDER.TOTAL_AMOUNT")}
                    </span>
                    <span className="text-lg font-bold text-[#5B45E0] print:text-base">
                      ₹{nOrder.totalAmount || ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg shadow-sm border border-gray-100 print:rounded-none print:shadow-none print:border print:p-4">
              <div className="px-6 py-4 border-b border-gray-200 print:px-3 print:py-2 print:border-b print:border-gray-300">
                <h4 className="text-lg font-semibold text-gray-900 print:text-base">
                  {t("VIEW_ORDER.ORDER_ITEMS")}
                </h4>
              </div>
              <div className="overflow-x-auto print:overflow-visible">
                <table className="min-w-full divide-y divide-gray-200 print:text-sm print:divide-gray-300">
                  <thead className="bg-gray-100 print:bg-white">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-caption uppercase tracking-wider print:px-3 print:py-2 print:text-xs"
                      >
                        {t("SIDEBAR.PRODUCTS")}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-caption uppercase tracking-wider print:px-3 print:py-2 print:text-xs"
                      >
                        {t("COMMON.PRICE")}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-caption uppercase tracking-wider print:px-3 print:py-2 print:text-xs"
                      >
                        {t("COMMON.QUANTITY")}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-caption uppercase tracking-wider print:px-3 print:py-2 print:text-xs"
                      >
                        {t("COMMON.STATUS")}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-caption uppercase tracking-wider print:px-3 print:py-2 print:text-xs"
                      >
                        {t("COMMON.ACTIONS")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 print:divide-gray-300">
                    {nOrder.orderItems.map((item) => (
                      <tr
                        key={item?.id || item?.sku || item?.name}
                        className={
                          highlightedItemId === item.id
                            ? "bg-blue-50 transition-colors duration-200 relative"
                            : "hover:bg-gray-50 transition-colors duration-200"
                        }
                        ref={(el) => {
                          if (highlightedItemId === item.id && el) {
                            setTimeout(() => {
                              el.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                            }, 500);
                          }
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap print:px-3 print:py-2">
                          <div className="flex items-center print:block">
                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 print:hidden">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
                                  {t("VIEW_ORDER.NO_IMAGE")}
                                </div>
                              )}
                            </div>
                            <div className="ml-4 print:ml-0">
                              <div className="text-sm font-medium text-gray-900 print:text-xs">
                                {(item.name?.split(" ").slice(0, 2).join(" ") ||
                                  "N/A") +
                                  (item.name?.split(" ").length > 2
                                    ? "..."
                                    : "")}
                              </div>
                              {highlightedItemId === item.id && (
                                <div className="mt-1">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    <Check className="h-3 w-3 mr-1" />
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 print:px-3 print:py-2 print:text-xs">
                          ₹{item.price?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-800 print:px-3 print:py-2 print:text-xs">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 print:px-3 print:py-2 print:text-xs">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3 print:px-3 print:py-2 print:text-xs print:space-x-1">
                          <button
                            className="text-blue-600 hover:text-blue-800 print:hidden"
                            title="Edit"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 print:bg-white">
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-3 text-left text-base font-semibold text-gray-900 print:px-3 print:py-2 print:text-sm"
                      >
                        {t("VIEW_ORDER.SUBTOTAL")}
                      </td>
                      <td
                        colSpan="2"
                        className="px-6 py-3 text-right text-base font-semibold text-gray-900 print:px-3 print:py-2 print:text-sm"
                      >
                        ₹{nOrder.total?.toFixed(2) || ""}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-3 text-left text-base font-semibold text-gray-900 print:px-3 print:py-2 print:text-sm"
                      >
                        {t("VIEW_ORDER.SHIPPING")}
                      </td>
                      <td
                        colSpan="2"
                        className="px-6 py-3 text-right text-base font-semibold text-gray-900 print:px-3 print:py-2 print:text-sm"
                      >
                        ₹0.00
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-3 text-left text-base font-semibold text-gray-900 print:px-3 print:py-2 print:text-sm"
                      >
                        {t("VIEW_ORDER.TAX")}
                      </td>
                      <td
                        colSpan="2"
                        className="px-6 py-3 text-right text-base font-semibold text-gray-900 print:px-3 print:py-2 print:text-sm"
                      >
                        ₹0.00
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-3 text-left text-lg font-bold text-gray-900 print:px-3 print:py-2 print:text-base"
                      >
                        {t("VIEW_ORDER.TOTAL_AMOUNT")}
                      </td>
                      <td
                        colSpan="2"
                        className="px-6 py-3 text-right text-lg font-bold text-[#5B45E0] print:px-3 print:py-2 print:text-base"
                      >
                        ₹{nOrder.totalAmount || ""}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div className="lg:hidden rounded-lg p-6 shadow-sm border border-gray-100 print:rounded-none print:shadow-none print:border print:p-4">
              <div>
                <div className="flex items-center space-x-3 mb-4 print:mb-3">
                  <div className="p-2 bg-[#5B45E0]/10 rounded-lg print:hidden">
                    <Package className="h-5 w-5 text-[#5B45E0]" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 print:text-base">
                    {t("VIEW_ORDER.ORDER_SUMMARY")}
                  </h4>
                </div>
                <div className="space-y-3 print:space-y-2 text-gray-700 print:text-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm print:text-xs">
                      {t("VIEW_ORDER.ORDER_DATE")}
                    </span>
                    <div className="flex items-center text-sm text-gray-900 font-medium print:text-xs">
                      <Calendar className="h-4 w-4 mr-1.5 text-gray-500 print:hidden" />
                      {nOrder.orderDate
                        ? new Date(nOrder.orderDate).toLocaleDateString()
                        : ""}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm print:text-xs">
                      {t("VIEW_ORDER.ORDER_ITEMS")}
                    </span>
                    <div className="flex items-center text-sm text-gray-900 font-medium print:text-xs">
                      <Clock className="h-4 w-4 mr-1.5 text-gray-500 print:hidden" />
                      {nOrder.orderDate
                        ? new Date(nOrder.orderDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </div>
                  </div>
                  <div className="flex items-center justify-between font-medium border-t border-gray-100 pt-3 mt-3 print:border-gray-200 print:pt-2 print:mt-2">
                    <span className="text-base text-gray-900 print:text-sm">
                      {t("VIEW_ORDER.TOTAL_AMOUNT")}
                    </span>
                    <span className="text-lg font-bold text-[#5B45E0] print:text-base">
                      ₹{nOrder.total?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {bShowEditDialog && oEditingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {t("VIEW_ORDER.EDIT_ORDER_ITEM")}
              </h3>
              <button
                onClick={closeEditDialog}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <SelectWithIcon
                  label={t("COMMON.STATUS")}
                  id="orderStatus"
                  name="orderStatus"
                  value={
                    sEditedStatusId !== null ? sEditedStatusId.toString() : ""
                  }
                  onChange={(e) => {
                    const selectedStatusId = e.target.value;
                    const selectedStatus = orderStatusArray.find(
                      (status) => status.StatusID === parseInt(selectedStatusId)
                    );
                    setEditedStatusId(parseInt(selectedStatusId));
                    setEditedStatus(selectedStatus?.OrderStatus || "");
                  }}
                  options={orderStatusOptions}
                  Icon={Truck}
                />
              </div>
              <div>
                <TextAreaWithIcon
                  label={t("VIEW_ORDER.REMARKS")}
                  name="remarks"
                  value={sEditedRemarks}
                  onChange={(e) => setEditedRemarks(e.target.value)}
                  rows="3"
                  icon={Edit}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={closeEditDialog}
              >
                {t("COMMON.CANCEL")}
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleSaveChanges}
              >
                {t("COMMON.SAVE")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderView;
