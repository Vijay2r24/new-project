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
import { useTranslation } from "react-i18next";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import NotFoundMessage from "../../components/NotFoundMessage";
import { apiGet, apiPatch, apiPut } from "../../utils/ApiUtils";
import {
  GETORDER_BYID_API,
  UPDATE_ORDER_ITEM_HISTORY,
} from "../../contants/apiRoutes";
import SelectWithIcon from "../../components/SelectWithIcon";
import TextAreaWithIcon from "../../components/TextAreaWithIcon";
import StatusBadge from "./StatusBadge";
import { showEmsg } from "../../utils/ShowEmsg";
import { useTitle } from "../../context/TitleContext";
import { STATUS } from "../../contants/constants";
import Loader from "../../components/Loader";
import { hideLoaderWithDelay } from "../../utils/loaderUtils";
import BackButton from "../../components/BackButton";
import { fetchResource } from "../../store/slices/allDataSlice";
import OrderItemHistoryDialog from "./OrderItemHistoryDialog";
import { FaHistory } from "react-icons/fa";
import { GET_ORDER_ITEM_HISTORY_BY_ID } from "../../contants/apiRoutes";

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
  const [historyData, setHistoryData] = useState([]);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  // Get order statuses from Redux store
  const {
    data: orderStatusData,
    loading: orderStatusLoading,
    error: orderStatusError,
  } = useSelector((state) => state.allData.resources.orderStatuses || {});

  useEffect(() => {
    // Fetch order statuses if not already loaded
    if (!orderStatusData) {
      dispatch(fetchResource({ key: "orderStatuses" }));
    }
  }, [dispatch, orderStatusData]);

  useEffect(() => {
    if (location.state?.orderItem) {
      setHighlightedItemId(
        location.state.orderItem.orderItemId || location.state.orderItem.id
      );
    }
  }, [location.state]);

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

  // Function to get next available statuses based on current status
  const getNextStatusOptions = useCallback(
    (currentStatus) => {
      // If we don't have order status data, return empty array
      if (!orderStatusArray.length) return [];

      // Find the current status in the order status array
      const currentStatusObj = orderStatusArray.find(
        (status) =>
          status.OrderStatus.toLowerCase() === currentStatus.toLowerCase()
      );

      if (!currentStatusObj) return [];

      // This is a simplified approach - return all statuses except the current one
      return orderStatusArray
        .filter(
          (status) =>
            status.OrderStatus.toLowerCase() !== currentStatus.toLowerCase()
        )
        .map((status) => status.OrderStatus);
    },
    [orderStatusArray]
  );

  const openEditDialog = (orderItemId) => {
    // find item by OrderItemID
    const item = nOrder.orderItems.find((i) => i.OrderItemID === orderItemId);

    if (!item) return; // safety check

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
        const data = oResponse.data.data;

        // Take first payment if exists
        const payment = data.payment?.[0] || {};

        // Map API response
        const mappedOrder = {
          orderId: data.OrderID,
          orderRefId: data.OrderRefID,
          orderDate: data.OrderDate,
          totalAmount: parseFloat(payment.Amount || 0),
          customer: {
            name: `${data.CustomerDetails?.FirstName || ""} ${
              data.CustomerDetails?.LastName || ""
            }`.trim(),
            email: data.CustomerDetails?.Email,
            phone: data.CustomerDetails?.PhoneNumber,
          },
          delivery: {
            address: data.address
              ? `${data.address.AddressLine1 || ""} ${
                  data.address.AddressLine2 || ""
                }`.trim() || "N/A"
              : "N/A",
            city: data.address?.CityName,
            state: data.address?.StateName,
            country: data.address?.CountryName,
            zipCode: data.address?.ZipCode || "",
          },
          orderItems: data.orderItems.map((item, index) => ({
            id: item.OrderItemID || `item-${index}`,
            OrderItemID: item.OrderItemID, // Make sure this is included
            name: item.ProductName,
            sku: item.SKU,
            image: item.orderItemImage?.[0]?.documentUrl || null,
            price: parseFloat(item.SellingPrice || item.MRP || 0),
            quantity: item.Quantity,
            status: item.OrderStatus || "Pending",
            // Use payment data from the API response
            paymentMethod: payment.PaymentTypeName || "N/A",
            paymentStatus: payment.PaymentStatusName,
            PaymentTypeName:payment.PaymentTypeName,
            paymentDate: payment.PaymentDate || data.OrderDate,
          })),
          total: data.orderItems.reduce((sum, item) => {
            return (
              sum +
              parseFloat(item.SellingPrice || item.MRP || 0) *
                parseInt(item.Quantity || 1)
            );
          }, 0),
          // Also include payment array at root level for backward compatibility
          payment: data.payment || [],
        };

        setOrder(mappedOrder);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    },
    []
  );
  const fetchOrderItemHistory = useCallback(
    async (orderItemId, setHistory, setLoading, setError) => {
      const token = localStorage.getItem("token");
      try {
        const oResponse = await apiGet(
          `${GET_ORDER_ITEM_HISTORY_BY_ID}/${orderItemId}`,
          {},
          token
        );

        const data = oResponse.data.data;

        const mappedHistory = data.map((item) => ({
          orderItemHistoryId: item.OrderItemHistoryID,
          orderStatus: item.OrderStatus,
          remarks: item.Remarks,
          changedOn: item.ChangedOn,
          hexCode: item.HexCode,
        }));

        setHistory(mappedHistory);
      } catch (error) {
        console.error("Failed to fetch order item history:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleOpenHistory = (id) => {
    fetchOrderItemHistory(id, setHistoryData, setLoading, setError);
    setOpen(true);
  };

  useEffect(() => {
    fetchDataRef.current = () => {
      fetchOrderDetails(orderId, setOrder, setLoading, t);
    };

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
      // orderItemId: oEditingItem?.id,
      OrderStatusID: sEditedStatusId,
      Remarks: sEditedRemarks,
    };

    const token = localStorage.getItem("token");

    try {
      const oResponse = await apiPatch(
        `${UPDATE_ORDER_ITEM_HISTORY}/${oEditingItem?.id}`,
        payload,
        token,
        false
      );

      if (oResponse?.data?.status === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(oResponse.data.message, STATUS.SUCCESS);
        if (fetchDataRef.current) await fetchDataRef.current();
        closeEditDialog();
      } else {
        showEmsg(oResponse.data.message, STATUS.ERROR);
      }
    } catch (error) {
      showEmsg(error?.response?.data?.message || t("API_ERROR"), STATUS.ERROR);
    }

    hideLoaderWithDelay(setbSubmitting);
  }, [oEditingItem?.id, sEditedStatusId, sEditedRemarks, orderId, t]);

  // Get next status options for the editing item
  const getNextStatusOptionsForItem = useCallback(() => {
    if (!oEditingItem || !orderStatusArray.length) return [];

    const currentStatus = oEditingItem.status;
    const currentStatusObj = orderStatusArray.find(
      (status) => status.OrderStatus === currentStatus
    );

    if (!currentStatusObj) return [];

    const currentSortOrder = currentStatusObj.SortOrder;

    return orderStatusArray
      .filter(
        (status) =>
          status &&
          typeof status.OrderStatusID !== "undefined" &&
          typeof status.OrderStatus !== "undefined" &&
          status.SortOrder > currentSortOrder // Only show statuses with higher sort order
      )
      .map((status) => ({
        value: status.OrderStatusID.toString(),
        label: status.OrderStatus,
        color: status.Colour?.HexCode || "#000000",
      }));
  }, [oEditingItem, orderStatusArray]);

  const orderStatusOptions = getNextStatusOptionsForItem();

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
                              .toUpperCase()
                              .slice(0, 2)
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
                      <p className="text-caption print:text-[10px]">
                        {nOrder.delivery
                          ? `${nOrder.delivery.city || ""}, ${
                              nOrder.delivery.state || ""
                            } ${nOrder.delivery.zipCode || ""}`
                          : "N/A"}
                      </p>
                      <p className="text-caption print:text-[10px]">
                        {nOrder.delivery?.country || ""}
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
                    {t("VIEW_ORDER.PAYMENT_STATUS")}
                  </span>
                  <span className="text-sm font-medium print:text-xs">
                    {nOrder?.orderItems?.[0]?.paymentStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm print:text-xs">
                    {t("VIEW_ORDER.PAYMENT_TYPE")}
                  </span>
                  <span className="text-sm font-medium print:text-xs">
                    {nOrder?.orderItems?.[0]?.PaymentTypeName || "N/A"}
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
                      {t("VIEW_ORDER.ORDER_DATE_TIME")}
                    </span>
                    <div className="flex items-center text-sm text-gray-900 font-medium print:text-xs">
                      <Clock className="h-4 w-4 mr-1.5 text-gray-500 print:hidden" />
                      {nOrder.orderDate
                        ? `${new Date(
                            nOrder.orderDate
                          ).toLocaleDateString()} ${new Date(
                            nOrder.orderDate
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
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
                        className="px-6 py-3 text-center text-xs font-medium text-caption uppercase tracking-wider print:px-3 print:py-2 print:text-xs"
                      >
                        {t("COMMON.STATUS")}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-caption uppercase tracking-wider print:px-3 print:py-2 print:text-xs"
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
                              <div className="text-xs text-gray-500 print:text-[10px] truncate max-w-[100px]">
                                {t("COMMON.QUANTITY")}: {item.quantity}
                              </div>

                              {highlightedItemId === item.id && (
                                <div className="mt-1">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    <Check className="h-3 w-3 mr-1" />
                                    {t("VIEW_ORDER.HIGHLIGHTED")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 print:px-3 print:py-2 print:text-xs">
                          ₹{item.price?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap mt-4 text-sm text-gray-800 print:px-3 print:py-2 print:text-xs text-center flex items-center justify-center">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium print:px-3 print:py-2 print:text-xs">
                          <div className="flex items-center justify-center gap-3 print:gap-1">
                            <button
                              className="text-blue-600 hover:text-blue-800 print:hidden"
                              title="Edit"
                              onClick={() => openEditDialog(item.OrderItemID)} // pass only ID
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                handleOpenHistory(item.OrderItemID);
                              }}
                              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm transition"
                            >
                              <FaHistory className="text-gray-600 text-lg" />
                            </button>
                          </div>
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
                      ₹{nOrder.totalAmount}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("COMMON.CURRENT_STATUS")}
                </label>
                <div className="p-2 bg-gray-100 rounded-md">
                  <StatusBadge status={oEditingItem.status} />
                </div>
              </div>
              <div>
                <SelectWithIcon
                  label={t("COMMON.NEXT_STATUS")}
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
                className="btn-primary"
                onClick={handleSaveChanges}
                disabled={!sEditedStatusId}
              >
                {t("COMMON.SAVE")}
              </button>
            </div>
          </div>
        </div>
      )}
      <OrderItemHistoryDialog
        open={open}
        onClose={() => setOpen(false)}
        historyData={historyData}
      />
    </div>
  );
};

export default OrderView;
