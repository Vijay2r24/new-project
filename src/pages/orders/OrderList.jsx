import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Toolbar from '../../components/Toolbar';
import Pagination from '../../components/Pagination';
import { useTranslation } from 'react-i18next';
import { apiGet } from '../../utils/ApiUtils';
import { GETALLORDERS_API } from '../../contants/apiRoutes';
import { useTitle } from '../../context/TitleContext';

const OrderList = () => {
  const [sSearchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();
  const [sFilterStatus, setFilterStatus] = useState('all');
  const [bShowFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sViewMode, setViewMode] = useState('table'); 
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [aOrders, setOrders] = useState([]);
  const [aProductRows, setProductRows] = useState([]);
  const [totalPages, setTotalPages] = useState('');
  const productsPerPage = 10;
  const [oFilters, setFilters] = useState({
    orderStatus: 'all',
    paymentStatus: 'all',
  });
  const navigate = useNavigate();
  const { setTitle } = useTitle();

  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
  };
  const additionalFilters = [
    {
      label: 'Order Status',
      name: 'orderStatus',
      value: oFilters.orderStatus,
      options: [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    {
      label: 'Payment Status',
      name: 'paymentStatus',
      value: oFilters.paymentStatus,
      options: [
        { value: 'all', label: 'All' },
        { value: 'paid', label: 'Paid' },
        { value: 'unpaid', label: 'Unpaid' },
        { value: 'pending', label: 'Pending' },
      ],
    },
  ];
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const params = {
        searchText: sSearchTerm,
        orderStatus: oFilters.orderStatus !== 'all' ? oFilters.orderStatus : undefined,
        paymentStatus: oFilters.paymentStatus !== 'all' ? oFilters.paymentStatus : undefined,
      };

      try {
        const oResponse = await apiGet(GETALLORDERS_API, params, token);
        const allProductItems = oResponse.data.data.flatMap(order =>
          order.orderItems.map(item => ({
            ...item,
            orderId: order.orderId,
            orderStatus: order.orderStatus,
          }))
        );
        setProductRows(allProductItems);
        setTotalPages(Math.ceil(allProductItems.length / productsPerPage));
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sSearchTerm, oFilters]);
  useEffect(() => {
    setTitle(t('ORDERS.TITLE'));
  }, [setTitle, t]);
  const getStatusColor = (status) => {
    const statusClasses = {
      Pending: 'status-pending',
      Processing: 'status-processing',
      Shipped: 'status-shipped',
      Delivered: 'status-delivered',
      Cancelled: 'status-cancelled',
    };
    return statusClasses[status] || 'status-default';
  };

  const handleViewOrder = (order) => {
    navigate(`/orders/${order.orderId}`);
  };


  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  const handlePageClick = (page) => {
    setCurrentPage(page);
  };
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sSearchTerm, sFilterStatus]);
  const handleExportOrders = () => {
    alert('Export All Orders functionality coming soon!');
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="mt-1 text-secondary">{t('ORDERS.SUBTITLE')}</p>
          </div>
          <button
            onClick={() => handleExportOrders()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 gap-2"
          >
            <Download className="w-4 h-4" />
            {t('ORDERS.EXPORT_BUTTON')}
          </button>
        </div>
      </div>
      <Toolbar
        SearchTerm={sSearchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={sViewMode}
        setViewMode={setViewMode}
        showFilterDropdown={bShowFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        filterStatus={sFilterStatus}
        setFilterStatus={setFilterStatus}
        additionalFilters={additionalFilters}
        handleFilterChange={handleFilterChange}
        searchPlaceholder={t('ORDERS.SEARCH_PLACEHOLDER')}
      />
      {sViewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="table-head">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('ORDERS.TABLE.ORDER_NUMBER')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('ORDERS.TABLE.PRODUCT_NAME')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                    {t('COMMON.QUANTITY')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('COMMON.STATUS')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('COMMON.ACTIONS')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {aProductRows.slice(
                  (nCurrentPage - 1) * productsPerPage,
                  nCurrentPage * productsPerPage
                ).map((productRow) => (
                  <tr key={`${productRow.orderId}-${productRow.id}`} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-caption font-semibold">{productRow.orderId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{productRow.product?.productName || 'Unnamed Product'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 text-right">{productRow.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(productRow.orderStatus)}`}>
                        {productRow.orderStatus || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-secondary">
                      <button
                        onClick={() => handleViewOrder(productRow)}
                        className="text-[#5B45E0] hover:text-[#4c39c7] font-medium transition-colors duration-150"
                      >
                        {t('ORDERS.VIEW_DETAILS')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {aProductRows.slice(
              (nCurrentPage - 1) * productsPerPage,
              nCurrentPage * productsPerPage
            ).map((productRow) => (
              <div key={`${productRow.orderId}-${productRow.id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold px-3 py-1 rounded-full border bg-gray-50 text-gray-700 border-gray-200">
                    {productRow.orderId.split('-')[0]}
                  </div>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(productRow.orderStatus)}`}>
                    {productRow.orderStatus || 'Unknown'}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-base font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{productRow.product?.productName || 'Unnamed Product'}</div>
                  <div className="text-sm text-caption mt-1">
                    {t('ORDERS.TABLE.QUANTITY')} : {productRow.quantity}
                  </div>
                </div>

                <button
                  onClick={() => handleViewOrder(productRow)}
                  className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 border border-[#5B45E0] text-[#5B45E0] rounded-lg font-medium hover:bg-[#5B45E0]/10 transition-colors duration-150"
                >
                  {t('ORDERS.VIEW_DETAILS')}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <Pagination
        currentPage={nCurrentPage}
        totalPages={totalPages}
        totalItems={aProductRows.length}
        itemsPerPage={productsPerPage}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        handlePageClick={handlePageClick}
      />
    </div>
    </>
  );
};

export default OrderList;
