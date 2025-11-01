import { useEffect, useState } from "react";
import {
  CreditCard,
  Clock,
  DollarSign,
  Calendar,
  Hash,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  Building2,
  Smartphone,
  Truck,
  Wallet,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTitle } from "../../context/TitleContext";
import { useTranslation } from "react-i18next";
import BackButton from "../../components/BackButton";
import { apiGet } from "../../utils/ApiUtils";
import { GET_PAYMENT_BYID } from "../../contants/apiRoutes";
import { DATE_FORMAT_OPTIONS, STATUS } from "../../contants/constants";

const PaymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setBackButton, setTitle } = useTitle();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTitle(t("PAYMENTS.DETAILS_HEADING"));
    setBackButton(<BackButton onClick={() => navigate("/payments")} />);

    return () => {
      setBackButton(null);
      setTitle("");
    };
  }, [setBackButton, setTitle, t, navigate]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const response = await apiGet(`${GET_PAYMENT_BYID}/${id}`, {}, token);

        if (response?.data?.status === STATUS.SUCCESS.toUpperCase()) {
          setPayment(response.data.data);
        } else {
          setError(t("PAYMENTS.API_ERROR"));
        }
      } catch (err) {
        console.error("Error fetching payment details:", err);
        setError(t("PAYMENTS.FETCH_ERROR"));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPaymentDetails();
    }
  }, [id, token, t]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(
      "en-US",
      DATE_FORMAT_OPTIONS
    );
  };

  const formatAmount = (amount) => {
    return `₹${parseFloat(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })}`;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "success":
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case STATUS.PENDING:
        return <Clock className="w-4 h-4" />;
      case STATUS.SUCCESS:
        return <CheckCircle className="w-4 h-4" />;
      case STATUS.FAILURE:
      case STATUS.CANCELLED:
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    if (!method?.PaymentMethodName)
      return <Wallet className="w-5 h-5 text-gray-500" />;

    switch (method.PaymentMethodName.toLowerCase()) {
      case "netbanking":
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case "upi":
        return <Smartphone className="w-5 h-5 text-purple-600" />;
      case "card":
      case "credit card":
      case "debit card":
        return <CreditCard className="w-5 h-5 text-gray-600" />;
      case "cash on delivery":
      case "cod":
        return <Truck className="w-5 h-5 text-orange-600" />;
      default:
        return <Wallet className="w-5 h-5 text-green-600" />;
    }
  };

  const getPaymentMethodDisplayName = (method) => {
    return (
      method?.PaymentMethodName ||
      t("PAYMENTS.METHOD_NOT_SPECIFIED") ||
      "Payment Method Not Specified"
    );
  };

  const getPaymentMethodDescription = (method) => {
    const methodName = method?.PaymentMethodName;

    if (!methodName) {
      return (
        t("PAYMENTS.DEFAULT_DESCRIPTION") ||
        "Payment information will be updated"
      );
    }

    switch (methodName.toLowerCase()) {
      case "cash on delivery":
      case "cod":
        return (
          t("PAYMENTS.COD_DESCRIPTION") || "Pay when you receive your order"
        );
      case "netbanking":
        return (
          t("PAYMENTS.NETBANKING_DESCRIPTION") ||
          "Payment through internet banking"
        );
      case "upi":
        return t("PAYMENTS.UPI_DESCRIPTION") || "Unified Payments Interface";
      case "card":
      case "credit card":
      case "debit card":
        return t("PAYMENTS.CARD_DESCRIPTION") || "Credit/Debit card payment";
      default:
        return t("PAYMENTS.DEFAULT_DESCRIPTION") || "Payment method";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 text-red-700 p-3 rounded-lg">{error}</div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 text-red-700 p-3 rounded-lg">
          {t("PAYMENTS.NO_PAYMENT_FOUND")} {id}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {t("PAYMENTS.DETAILS_TITLE")}
            </h1>
            <p className="text-sm text-gray-600">
              {t("PAYMENTS.DETAILS_SUBTITLE")}
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-sm ${getStatusColor(
              payment.PaymentStatus.PaymentStatusName
            )}`}
          >
            {getStatusIcon(payment.PaymentStatus.PaymentStatusName)}
            {payment.PaymentStatus.PaymentStatusName}
          </div>
        </div>

        {/* Amount */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md p-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white rounded border border-gray-200">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {t("PAYMENTS.TRANSACTION_AMOUNT")}
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {formatAmount(payment.Amount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-green-600" />
          {t("PAYMENTS.ORDER_INFORMATION")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-2 p-3 bg-green-50 rounded-md border border-green-100">
            <Hash className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">
                {t("PAYMENTS.ORDER_ID")}
              </p>
              <p className="text-sm text-gray-600 font-mono">
                {payment.OrderID}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info & Method */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            {t("PAYMENTS.PAYMENT_INFORMATION")}
          </h2>
          <div className="space-y-3">
            {/* Payment ID */}
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-md">
              <Hash className="w-5 h-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {t("PAYMENTS.PAYMENT_ID")}
                </p>
                <p className="text-sm text-gray-600 font-mono">
                  {payment.PaymentID}
                </p>
              </div>
            </div>

            {/* Payment Ref */}
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-md">
              <Hash className="w-5 h-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {t("PAYMENTS.PAYMENT_REF")}
                </p>
                <p className="text-sm text-gray-600 font-mono">
                  {payment.PaymentRefID}
                </p>
              </div>
            </div>

            {/* Payment Date */}
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-md">
              <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {t("PAYMENTS.PAYMENT_DATE")}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(payment.PaymentDate)}
                </p>
              </div>
            </div>

            {/* Payment Attempts */}
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-md">
              <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {t("PAYMENTS.PAYMENT_ATTEMPTS")}
                </p>
                <p className="text-sm text-gray-600">
                  {payment.PaymentAttempts} {t("PAYMENTS.ATTEMPTS")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            {getPaymentMethodIcon(payment.PaymentMethod)}
            {t("PAYMENTS.PAYMENT_METHOD")}
          </h2>

          <div className="space-y-3">
            {/* Method Name with Description */}
            <div
              className={`p-3 rounded-md border ${
                payment.PaymentMethod
                  ? "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100"
                  : "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {getPaymentMethodIcon(payment.PaymentMethod)}
                <p className="text-sm font-medium text-gray-700">
                  {t("PAYMENTS.PAYMENT_METHOD")}
                </p>
              </div>
              <p className="text-base font-medium text-gray-900 mb-1">
                {getPaymentMethodDisplayName(payment.PaymentMethod)}
              </p>
              <p className="text-sm text-gray-600">
                {getPaymentMethodDescription(payment.PaymentMethod)}
              </p>
            </div>

            {/* Provider - Only show if PaymentType exists */}
            {payment.PaymentType?.PaymentTypeName && (
              <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-md border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-medium text-gray-700">
                    {t("PAYMENTS.PAYMENT_PROVIDER")}
                  </p>
                </div>
                <p className="text-base font-medium text-gray-900">
                  {payment.PaymentType.PaymentTypeName}
                </p>
              </div>
            )}

            {/* Additional Info for Cash on Delivery */}
            {payment.PaymentMethod?.PaymentMethodName?.toLowerCase().includes(
              "cash on delivery"
            ) && (
              <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-md border border-orange-100">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="w-5 h-5 text-orange-600" />
                  <p className="text-sm font-medium text-gray-700">
                    {t("PAYMENTS.DELIVERY_INFO") || "Delivery Information"}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  {t("PAYMENTS.COD_INSTRUCTIONS") ||
                    "Payment will be collected when your order is delivered"}
                </p>
              </div>
            )}

            {/* Masked Card Number - Only show if available */}
            {payment.MaskedCardNumber && (
              <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-md border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <p className="text-sm font-medium text-gray-700">
                    {t("PAYMENTS.CARD_NUMBER")}
                  </p>
                </div>
                <p className="text-base font-medium text-gray-900 font-mono">
                  {payment.MaskedCardNumber}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
