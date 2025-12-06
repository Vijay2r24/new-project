import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import ExportPanel from "../components/ExportPanel";
import Pagination from "../components/Pagination";
import { useTranslation } from "react-i18next";
import { useTitle } from "../context/TitleContext";
import Loader from "../components/Loader";

const OrderList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setTitle } = useTitle();

    // State
    const [sSearchTerm, setSearchTerm] = useState("");
    const [sFilterStatus, setFilterStatus] = useState("all");
    const [sViewMode, setViewMode] = useState("table");
    const [nCurrentPage, setCurrentPage] = useState(1);
    const [nProductsPerPage, setProductsPerPage] = useState(10);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [bShowExportPanel, setShowExportPanel] = useState(false);
    const [oExportDate, setExportDate] = useState({ startDate: null, endDate: null });

    // New state for status update dialog
    const [oSelectedOrder, setSelectedOrder] = useState(null);
    const [bShowStatusDialog, setShowStatusDialog] = useState(false);
    const [sNewStatus, setNewStatus] = useState("");
    const [bUpdatingStatus, setUpdatingStatus] = useState(false);

    // Status options
    const statusOptions = [
        "Pending",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Returned",
        "Partially Delivered"
    ];

    const dummyOrders = [
        {
            orderId: "ORD001",
            formattedOrderDate: "2025-12-05, 10:30 AM",
            customerName: "John Doe",
            email: "john@example.com",
            phoneNumber: "9876543210",
            deliveryStatus: "Delivered",
            totalOrderItems: 3,
            totalAmount: "$245.99",
            shippingAddress: "123 Main St, New York, NY 10001",
            orderItems: [
                { OrderItemID: "OI001", ProductName: "Wireless Headphones", Quantity: 1, OrderStatus: "Delivered", Price: "$129.99" },
                { OrderItemID: "OI002", ProductName: "Phone Case", Quantity: 2, OrderStatus: "Delivered", Price: "$29.99" },
                { OrderItemID: "OI003", ProductName: "Screen Protector", Quantity: 1, OrderStatus: "Delivered", Price: "$15.99" },
            ],
        },
        {
            orderId: "ORD004",
            formattedOrderDate: "2025-12-02, 04:20 PM",
            customerName: "Emily Wilson",
            email: "emily@example.com",
            phoneNumber: "9871234567",
            deliveryStatus: "Pending",
            totalAmount: "$129.99",
            shippingAddress: "321 Elm St, Houston, TX 77001",
            totalOrderItems: 1,
            orderItems: [
                { OrderItemID: "OI010", ProductName: "Yoga Mat", Quantity: 1, OrderStatus: "Pending", Price: "$39.99" },
                { OrderItemID: "OI011", ProductName: "Resistance Bands", Quantity: 1, OrderStatus: "Pending", Price: "$24.99" },
                { OrderItemID: "OI012", ProductName: "Water Bottle", Quantity: 2, OrderStatus: "Pending", Price: "$19.99" },
            ],
        },
        {
            orderId: "ORD005",
            formattedOrderDate: "2025-12-01, 11:10 AM",
            customerName: "Michael Brown",
            email: "michael@example.com",
            phoneNumber: "9123987456",
            deliveryStatus: "Cancelled",
            totalAmount: "$199.98",
            shippingAddress: "654 Maple Dr, Phoenix, AZ 85001",
            totalOrderItems: 2,
            orderItems: [
                { OrderItemID: "OI013", ProductName: "Bluetooth Speaker", Quantity: 1, OrderStatus: "Cancelled", Price: "$129.99" },
                { OrderItemID: "OI014", ProductName: "AUX Cable", Quantity: 1, OrderStatus: "Cancelled", Price: "$19.99" },
            ],
        },
        {
            orderId: "ORD006",
            formattedOrderDate: "2025-11-30, 03:45 PM",
            customerName: "Sarah Davis",
            email: "sarah@example.com",
            phoneNumber: "9987654321",
            deliveryStatus: "Out for Delivery",
            totalAmount: "$75.25",
            shippingAddress: "987 Cedar Ln, Miami, FL 33101",
            totalOrderItems: 3,
            orderItems: [
                { OrderItemID: "OI015", ProductName: "Bookshelf", Quantity: 1, OrderStatus: "Out for Delivery", Price: "$49.99" },
                { OrderItemID: "OI016", ProductName: "Book Ends", Quantity: 2, OrderStatus: "Out for Delivery", Price: "$25.26" },
            ],
        },
        {
            orderId: "ORD007",
            formattedOrderDate: "2025-11-29, 01:30 PM",
            customerName: "David Miller",
            email: "david@example.com",
            phoneNumber: "9123459876",
            deliveryStatus: "Delivered",
            totalAmount: "$320.50",
            shippingAddress: "147 Birch Blvd, Seattle, WA 98101",
            totalOrderItems: 4,
            orderItems: [
                { OrderItemID: "OI017", ProductName: "Desk Lamp", Quantity: 1, OrderStatus: "Delivered", Price: "$45.99" },
                { OrderItemID: "OI018", ProductName: "Notebook Set", Quantity: 3, OrderStatus: "Delivered", Price: "$24.99" },
                { OrderItemID: "OI019", ProductName: "Pen Holder", Quantity: 1, OrderStatus: "Delivered", Price: "$12.99" },
            ],
        },
        {
            orderId: "ORD008",
            formattedOrderDate: "2025-11-28, 10:00 AM",
            customerName: "Lisa Anderson",
            email: "lisa@example.com",
            phoneNumber: "9876547890",
            deliveryStatus: "Processing",
            totalAmount: "$550.00",
            shippingAddress: "258 Walnut St, Denver, CO 80201",
            totalOrderItems: 2,
            orderItems: [
                { OrderItemID: "OI020", ProductName: "Smart Watch", Quantity: 1, OrderStatus: "Processing", Price: "$299.99" },
                { OrderItemID: "OI021", ProductName: "Watch Band", Quantity: 2, OrderStatus: "Processing", Price: "$125.01" },
            ],
        },
        {
            orderId: "ORD009",
            formattedOrderDate: "2025-11-27, 05:15 PM",
            customerName: "James Wilson",
            email: "james@example.com",
            phoneNumber: "9123789456",
            deliveryStatus: "Shipped",
            totalAmount: "$89.99",
            shippingAddress: "369 Spruce Ave, Boston, MA 02101",
            totalOrderItems: 1,
            orderItems: [
                { OrderItemID: "OI022", ProductName: "Backpack", Quantity: 1, OrderStatus: "Shipped", Price: "$89.99" },
            ],
        },
        {
            orderId: "ORD010",
            formattedOrderDate: "2025-11-26, 08:45 AM",
            customerName: "Maria Garcia",
            email: "maria@example.com",
            phoneNumber: "9987456123",
            deliveryStatus: "Delivered",
            totalAmount: "$210.75",
            shippingAddress: "741 Ash Dr, Atlanta, GA 30301",
            totalOrderItems: 5,
            orderItems: [
                { OrderItemID: "OI023", ProductName: "Kitchen Knife Set", Quantity: 1, OrderStatus: "Delivered", Price: "$149.99" },
                { OrderItemID: "OI024", ProductName: "Cutting Board", Quantity: 2, OrderStatus: "Delivered", Price: "$60.76" },
            ],
        },
        {
            orderId: "ORD011",
            formattedOrderDate: "2025-11-25, 02:30 PM",
            customerName: "Thomas Lee",
            email: "thomas@example.com",
            phoneNumber: "9123654789",
            deliveryStatus: "Returned",
            totalAmount: "$179.98",
            shippingAddress: "852 Poplar Rd, Dallas, TX 75201",
            totalOrderItems: 2,
            orderItems: [
                { OrderItemID: "OI025", ProductName: "Running Shoes", Quantity: 1, OrderStatus: "Returned", Price: "$129.99" },
                { OrderItemID: "OI026", ProductName: "Shoe Laces", Quantity: 1, OrderStatus: "Returned", Price: "$9.99" },
            ],
        },
        {
            orderId: "ORD012",
            formattedOrderDate: "2025-11-24, 12:00 PM",
            customerName: "Jennifer Taylor",
            email: "jennifer@example.com",
            phoneNumber: "9876123450",
            deliveryStatus: "Partially Delivered",
            totalAmount: "$340.25",
            shippingAddress: "963 Fir St, San Francisco, CA 94101",
            totalOrderItems: 3,
            orderItems: [
                { OrderItemID: "OI027", ProductName: "Wireless Earbuds", Quantity: 1, OrderStatus: "Delivered", Price: "$199.99" },
                { OrderItemID: "OI028", ProductName: "Charging Case", Quantity: 1, OrderStatus: "Shipped", Price: "$49.99" },
                { OrderItemID: "OI029", ProductName: "Ear Tips", Quantity: 3, OrderStatus: "Processing", Price: "$29.99" },
            ],
        },
    ];

    const [aOrders, setOrders] = useState(dummyOrders);
    const [bLoading, setLoading] = useState(false);
    const [bFilterLoading, setFilterLoading] = useState(false);
    const [sError, setError] = useState(null);
    const [sTotalPages, setTotalPages] = useState(1);
    const [nTotalRecords, setTotalRecords] = useState(dummyOrders.length);

    useEffect(() => {
        setTitle(t("ORDERS.TITLE"));
    }, [setTitle, t]);

    const toggleRowExpansion = (orderId) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) newSet.delete(orderId);
            else newSet.add(orderId);
            return newSet;
        });
    };

    const handleViewOrder = (order) => {
        navigate(`/orders/${order.orderId}`, { state: { order } });
    };

    // Open status update dialog
    const handleUpdateStatus = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.deliveryStatus);
        setShowStatusDialog(true);
    };

    // Update order status
    const handleConfirmStatusUpdate = async () => {
        if (!oSelectedOrder || !sNewStatus) return;

        setUpdatingStatus(true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.orderId === oSelectedOrder.orderId
                        ? { ...order, deliveryStatus: sNewStatus }
                        : order
                )
            );

            // Show success message
            alert(t("ORDERS.STATUS_UPDATED_SUCCESS"));
            setShowStatusDialog(false);
        } catch (error) {
            setError(t("ORDERS.STATUS_UPDATE_FAILED"));
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Update individual item status
    const handleUpdateItemStatus = (orderId, itemId, newStatus) => {
        setOrders(prevOrders =>
            prevOrders.map(order => {
                if (order.orderId === orderId) {
                    return {
                        ...order,
                        orderItems: order.orderItems.map(item =>
                            item.OrderItemID === itemId
                                ? { ...item, OrderStatus: newStatus }
                                : item
                        )
                    };
                }
                return order;
            })
        );
    };

    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, sTotalPages));
    const handlePageClick = (page) => setCurrentPage(page);

    const getDeliveryStatusColor = (status) => {
        const colors = {
            Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
            Processing: "bg-blue-100 text-blue-800 border border-blue-200",
            Shipped: "bg-purple-100 text-purple-800 border border-purple-200",
            "Out for Delivery": "bg-indigo-100 text-indigo-800 border border-indigo-200",
            Delivered: "bg-green-100 text-green-800 border border-green-200",
            Cancelled: "bg-red-100 text-red-800 border border-red-200",
            Returned: "bg-pink-100 text-pink-800 border border-pink-200",
            "Partially Delivered": "bg-orange-100 text-orange-800 border border-orange-200",
        };
        return colors[status] || "bg-gray-100 text-gray-800 border border-gray-200";
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setFilterStatus("all");
        setCurrentPage(1);
    };

    const handleExportOrders = () => setShowExportPanel(true);
    const handleConfirmExportOrders = () => setShowExportPanel(false);

    return (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-2">
            {/* Status Update Dialog */}
            {bShowStatusDialog && oSelectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {t("ORDERS.UPDATE_STATUS")}
                                </h3>
                                <button
                                    onClick={() => setShowStatusDialog(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-2">
                                    {t("ORDERS.ORDER_NUMBER")}: <span className="font-semibold">{oSelectedOrder.orderId}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    {t("ORDERS.TABLE.CUSTOMER_NAME")}: <span className="font-semibold">{oSelectedOrder.customerName}</span>
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t("ORDERS.NEW_STATUS")}
                                </label>
                                <select
                                    value={sNewStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B45E0] focus:border-transparent"
                                >
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowStatusDialog(false)}
                                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                    disabled={bUpdatingStatus}
                                >
                                    {t("COMMON.CANCEL")}
                                </button>
                                <button
                                    onClick={handleConfirmStatusUpdate}
                                    disabled={bUpdatingStatus || sNewStatus === oSelectedOrder.deliveryStatus}
                                    className="px-5 py-2.5 bg-[#5B45E0] text-white rounded-lg hover:bg-[#4c39c7] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {bUpdatingStatus ? t("COMMON.UPDATING") : t("COMMON.UPDATE")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Toolbar
                searchTerm={sSearchTerm}
                setSearchTerm={setSearchTerm}
                viewMode={sViewMode}
                setViewMode={setViewMode}
                showFilterDropdown={false}
                setShowFilterDropdown={() => { }}
                additionalFilters={[]}
                handleFilterChange={() => { }}
                searchPlaceholder={t("ORDERS.SEARCH_PLACEHOLDER")}
                onClearFilters={handleClearFilters}
                onExport={handleExportOrders}
            />

            {bShowExportPanel && (
                <ExportPanel
                    title={t("ORDERS.TITLE") + " – " + t("ORDERS.FILTERS.DATE_RANGE")}
                    value={oExportDate}
                    onChange={(val) => setExportDate(val)}
                    onCancel={() => setShowExportPanel(false)}
                    onConfirm={handleConfirmExportOrders}
                    confirmLabel={t("COMMON.DOWNLOAD")}
                />
            )}

            {sViewMode === "table" ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="table-head">
                                <tr>
                                    <th className="table-head-cell w-8"></th>
                                    <th className="table-head-cell">{t("ORDERS.TABLE.ORDER_NUMBER")}</th>
                                    <th className="table-head-cell">{t("ORDERS.TABLE.ORDER_DATE")}</th>
                                    <th className="table-head-cell">{t("ORDERS.TABLE.CUSTOMER_NAME")}</th>
                                    <th className="table-head-cell">{t("ORDERS.TABLE.PHONE_NUMBER")}</th>
                                    <th className="table-head-cell">{t("ORDERS.TABLE.DELIVERY_STATUS")}</th>
                                    <th className="table-head-cell">{t("ORDERS.TABLE.TOTAL_AMOUNT")}</th>
                                    <th className="table-head-cell">{t("COMMON.TOTAL_ORDER_ITEMS")}</th>
                                    <th className="table-head-cell">{t("COMMON.ACTIONS")}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bLoading ? (
                                    <tr>
                                        <td colSpan={9} className="py-8 text-center">
                                            <Loader size="small" />
                                        </td>
                                    </tr>
                                ) : aOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-8 text-gray-600">
                                            {t("ORDERS.NO_ORDERS_FOUND")}
                                        </td>
                                    </tr>
                                ) : (
                                    aOrders.map((order) => (
                                        <React.Fragment key={order.orderId}>
                                            <tr className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="table-cell px-4">
                                                    {order.orderItems.length > 0 && (
                                                        <button
                                                            onClick={() => toggleRowExpansion(order.orderId)}
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            {expandedRows.has(order.orderId) ? '▼' : '▶'}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="table-cell font-medium">{order.orderId}</td>
                                                <td className="table-cell">{order.formattedOrderDate}</td>
                                                <td className="table-cell">
                                                    <div>
                                                        <div className="font-medium">{order.customerName}</div>
                                                        <div className="text-xs text-gray-500">{order.email}</div>
                                                    </div>
                                                </td>
                                                <td className="table-cell">{order.phoneNumber}</td>
                                                <td className="table-cell">
                                                    <div className="flex flex-col items-center justify-center space-y-2">
                                                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getDeliveryStatusColor(order.deliveryStatus)}`}>
                                                            {order.deliveryStatus}
                                                        </span>
                                                    </div>
                                                </td>
                                               <td className="table-cell text-right font-semibold">{order.totalAmount}</td>
                                                <td className="table-cell text-center">{order.totalOrderItems}</td>
                                                <td className="table-cell">
                                                    <div className="flex flex-col space-y-2">
                                                        <button
                                                            onClick={() => handleUpdateStatus(order)}
                                                            className="text-gray-600 hover:text-gray-800 font-medium hover:underline text-sm"
                                                        >
                                                            {t("ORDERS.UPDATE_STATUS")}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedRows.has(order.orderId) && (
                                                <tr className="bg-gray-50">
                                                    <td colSpan={9} className="px-6 py-4">
                                                        <div className="space-y-3">
                                                            <div className="mb-2 text-sm text-gray-600">
                                                                <span className="font-medium">Shipping Address:</span> {order.shippingAddress}
                                                            </div>
                                                            {order.orderItems.map(item => (
                                                                <div key={item.OrderItemID} className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                                                    <div className="flex-1">
                                                                        <div className="font-medium text-gray-900">{item.ProductName}</div>
                                                                        <div className="text-xs text-gray-500">Item ID: {item.OrderItemID}</div>
                                                                    </div>
                                                                    <div className="flex items-center space-x-6">
                                                                        <div className="text-sm">
                                                                            <span className="text-gray-500">Price:</span>{" "}
                                                                            <span className="font-medium ml-1">{item.Price}</span>
                                                                        </div>
                                                                        <div className="text-sm">
                                                                            <span className="text-gray-500">Quantity:</span>{" "}
                                                                            <span className="font-medium ml-1">{item.Quantity}</span>
                                                                        </div>
                                                                        <div className="text-sm">
                                                                            <span className="text-gray-500">Subtotal:</span>{" "}
                                                                            <span className="font-medium ml-1">
                                                                                ${(parseFloat(item.Price.replace('$', '')) * item.Quantity).toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex flex-col items-center">
                                                                            <span className={`px-3 py-1.5 mb-2 text-xs font-medium rounded-full ${getDeliveryStatusColor(item.OrderStatus)}`}>
                                                                                {item.OrderStatus}
                                                                            </span>
                                                                            <select
                                                                                value={item.OrderStatus}
                                                                                onChange={(e) => handleUpdateItemStatus(order.orderId, item.OrderItemID, e.target.value)}
                                                                                className="text-xs border border-gray-300 rounded px-2 py-1"
                                                                            >
                                                                                {statusOptions.map(status => (
                                                                                    <option key={status} value={status}>{status}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {aOrders.map((order) => (
                        <div key={order.orderId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow duration-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-lg font-bold text-gray-900">{order.orderId}</div>
                                    <div className="text-sm text-gray-500">{order.formattedOrderDate}</div>
                                </div>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDeliveryStatusColor(order.deliveryStatus)}`}>
                                    {order.deliveryStatus}
                                </span>
                            </div>
                            <div className="flex flex-col space-y-3 flex-1">
                                <div>
                                    <span className="text-xs text-gray-500">{t("ORDERS.TABLE.CUSTOMER_NAME")}</span>
                                    <div className="text-sm font-medium">{order.customerName}</div>
                                    <div className="text-xs text-gray-600">{order.email}</div>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">{t("ORDERS.TABLE.PHONE_NUMBER")}</span>
                                    <div className="text-sm font-medium">{order.phoneNumber}</div>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Shipping Address</span>
                                    <div className="text-sm text-gray-700 line-clamp-2">{order.shippingAddress}</div>
                                </div>
                                <div className="pt-3 mt-auto border-t border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="text-xs text-gray-500">{t("COMMON.TOTAL_ORDER_ITEMS")}</span>
                                            <div className="text-sm font-semibold">{order.totalOrderItems} items</div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-gray-500">{t("ORDERS.TABLE.TOTAL_AMOUNT")}</span>
                                            <div className="text-lg font-bold text-gray-900">{order.totalAmount}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                <button
                                    onClick={() => handleViewOrder(order)}
                                    className="w-full border border-[#5B45E0] text-[#5B45E0] rounded-lg py-2.5 font-medium hover:bg-[#5B45E0] hover:text-white transition-colors duration-200"
                                >
                                    {t("ORDERS.VIEW_DETAILS")}
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(order)}
                                    className="w-full border border-gray-300 text-gray-700 rounded-lg py-2.5 font-medium hover:bg-gray-50 transition-colors duration-200"
                                >
                                    {t("ORDERS.UPDATE_STATUS")}
                                </button>
                            </div>
                        </div>
                    ))}
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