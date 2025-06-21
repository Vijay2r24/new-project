import { useState, useEffect, useContext } from 'react';
import {
  X,
  Package,
  Truck,
  User,
  MapPin,
  CreditCard,
  Calendar,
  ArrowLeft,
  Clock,
  Phone,
  Mail,
  Edit,
  Trash,
  Building
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import NotFoundMessage from '../../components/NotFoundMessage';
import { useTranslation } from 'react-i18next';
import { apiGet, apiPut } from '../../utils/ApiUtils';
import { GETORDER_BYID_API, UPDATE_ORDER_ITEM_STATUS } from '../../contants/apiRoutes'
import SelectWithIcon from '../../components/SelectWithIcon';
import TextAreaWithIcon from '../../components/TextAreaWithIcon';
import StatusBadge from './StatusBadge'
import { LocationDataContext } from '../../context/LocationDataProvider';
import { showEmsg } from '../../utils/ShowEmsg';
import { ToastContainer } from 'react-toastify';
import { useTitle } from '../../context/TitleContext';

const OrderView = () => {
  const { orderId } = useParams();
  const [nOrder, setOrder] = useState(null);
  const [bLoading, setLoading] = useState(true);
  const [nError, setError] = useState(null);
  const { t } = useTranslation();
  const { setTitle } = useTitle();

  const [bShowEditDialog, setShowEditDialog] = useState(false);
  const [oEditingItem, setEditingItem] = useState(null);
  const [sEditedStatus, setEditedStatus] = useState('');
  const [sEditedRemarks, setEditedRemarks] = useState('');
  const [sEditedStatusId, setEditedStatusId] = useState(null);


  const { orderStatusData } = useContext(LocationDataContext);

  const openEditDialog = (item) => {
    setEditingItem(item);
    const currentStatus = orderStatusData?.data?.find(status => status.OrderStatus === item.status);
    setEditedStatus(item.status || '');
    setEditedStatusId(currentStatus?.StatusID || null);
    setEditedRemarks('');
    setShowEditDialog(true);
  };

  const closeEditDialog = () => {
    setShowEditDialog(false);
    setEditingItem(null);
    setEditedStatus('');
    setEditedStatusId(null);
    setEditedRemarks('');
  };
  const fetchData = async () => {
    const token = localStorage.getItem("token")
    try {
      const response = await apiGet(`${GETORDER_BYID_API}/${orderId}`, {}, token);
      const data = response.data.data;
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
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
    setTitle(t('vieworder.orderDetails'));
  }, [fetchData, setTitle, t]);
  const handleSaveChanges = async () => {
    const payload = {
      OrderItemID: oEditingItem?.id,
      StatusID: sEditedStatusId,
      remarks: sEditedRemarks,
    };

    const token = localStorage.getItem("token");

    try {
      const response = await apiPut(`${UPDATE_ORDER_ITEM_STATUS}/${orderId}`, payload, token, false);
      console.log('API Response:', response.data);

      if (response?.data?.status === 'SUCCESS') {
        showEmsg(response.data.message, 'success');
        fetchData();
        closeEditDialog();
      } else {
        showEmsg(response.data.message || 'Something went wrong', 'error');
      }

    } catch (error) {
      showEmsg(error?.response?.data?.message || 'API Error occurred', 'error');
    }
  };
  if (bLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-lg">{t('vieworder.loadingOrderDetails')}</div>
      </div>
    );
  }

  if (nError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">{t('vieworder.errorLoadingOrderDetails')}{nError.message}</div>
      </div>
    );
  }

  if (!nOrder) {
    return <NotFoundMessage message={t('vieworder.orderNotFound')} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2  print:bg-white">
      <ToastContainer />
      <div>
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>

            <p className="text-gray-500">
              {t('vieworder.OrderNumber')}{nOrder.orderId || nOrder.id}
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
                  <h4 className="text-lg font-semibold text-gray-900 print:text-base">{t('vieworder.customerDetails')}</h4>
                </div>
                <div className="space-y-3 text-gray-700 print:space-y-2 print:text-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center print:h-8 print:w-8 print:bg-gray-100">
                      <span className="text-sm font-medium text-blue-600 print:text-gray-600 print:text-xs">
                        {nOrder.customer?.name ? nOrder.customer.name.split(' ').map(n => n[0]).join('') : '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 print:text-xs">{nOrder.customer?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-600 print:text-[10px]">{t('vieworder.customer')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500 print:hidden" />
                    <p className="text-sm print:text-xs">{nOrder.customer?.email || 'N/A'}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500 print:hidden" />
                    <p className="text-sm print:text-xs">{nOrder.customer?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100 print:rounded-none print:shadow-none print:border print:p-4">
              <div>
                <div className="flex items-center space-x-3 mb-4 print:mb-3">
                  <div className="p-2 bg-green-100 rounded-lg print:hidden">
                    <MapPin className="h-5 w-5 text-green-700" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 print:text-base">{t('vieworder.deliveryInformation')}</h4>
                </div>
                <div className="space-y-3 text-gray-700 print:space-y-2 print:text-gray-800">
                  <div className="flex items-start space-x-3">
                    <Building className="h-4 w-4 text-gray-500 mt-1 print:hidden" />
                    <div>
                      <p className="text-sm print:text-xs">{nOrder.delivery?.address || 'N/A'}</p>
                      <p className="text-xs text-gray-600 print:text-[10px]">
                        {nOrder.delivery ? `${nOrder.delivery.city}, ${nOrder.delivery.state} ${nOrder.delivery.zipCode}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Truck className="h-4 w-4 text-gray-500 mt-1 print:hidden" />
                    <div>
                      <p className="text-sm print:text-xs">{t('vieworder.standarddelivery')}</p>
                      <p className="text-xs text-gray-600 print:text-[10px]">2-4 Business Days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="rounded-lg p-6 bg-white shadow-sm border border-gray-100 print:rounded-none print:shadow-none print:border print:p-4">
              <div className="flex items-center space-x-3 mb-4 print:mb-3">
                <div className="p-2 bg-yellow-100 rounded-lg print:hidden">
                  <CreditCard className="h-5 w-5 text-yellow-700" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 print:text-base">{t('vieworder.paymentInformation')}</h4>
              </div>
              <div className="space-y-3 text-gray-700 print:space-y-2 print:text-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm print:text-xs">{t('vieworder.paymentMethod')}</span>
                  <span className="text-sm font-medium print:text-xs">{nOrder?.orderItems?.[0]?.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm print:text-xs">{t('vieworder.paymentStatus')}</span>
                  <span className="text-sm font-medium print:text-xs">{nOrder?.orderItems?.[0]?.paymentStatus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm print:text-xs">{t('vieworder.paymentDate')}</span>
                  <span className="text-sm font-medium print:text-xs">
                    {new Date(nOrder?.orderItems?.[0]?.paymentDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>


          </div >

          {/* Right Column - Order Items, Order Summary */}
          <div className="lg:col-span-2 flex flex-col gap-6 print:gap-4">
            <div className="hidden bg-white lg:block rounded-lg p-6 shadow-sm border border-gray-100 print:rounded-none print:shadow-none print:border print:p-4">
              <div>
                <div className="flex items-center space-x-3 mb-4 print:mb-3">
                  <div className="p-2 bg-[#5B45E0]/10 rounded-lg print:hidden">
                    <Package className="h-5 w-5 text-[#5B45E0]" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 print:text-base">{t('vieworder.orderSummary')}</h4>
                </div>
                <div className="space-y-3 bg-white print:space-y-2 text-gray-700 print:text-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm print:text-xs">{t('vieworder.orderDate')}</span>
                    <div className="flex items-center text-sm text-gray-900 font-medium print:text-xs">
                      <Calendar className="h-4 w-4 mr-1.5 text-gray-500 print:hidden" />
                      {nOrder.orderDate ? new Date(nOrder.orderDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm print:text-xs">{t('vieworder.orderTime')}</span>
                    <div className="flex items-center text-sm text-gray-900 font-medium print:text-xs">
                      <Clock className="h-4 w-4 mr-1.5 text-gray-500 print:hidden" />
                      {nOrder.orderDate ? new Date(nOrder.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between font-medium border-t border-gray-100 pt-3 mt-3 print:border-gray-200 print:pt-2 print:mt-2">
                    <span className="text-base text-gray-900 print:text-sm">{t('vieworder.totalAmount')}</span>
                    <span className="text-lg font-bold text-[#5B45E0] print:text-base">₹{nOrder.totalAmount || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="rounded-lg shadow-sm border border-gray-100 print:rounded-none print:shadow-none print:border print:p-4">
              <div className="px-6 py-4 border-b border-gray-200 print:px-3 print:py-2 print:border-b print:border-gray-300">
                <h4 className="text-lg font-semibold text-gray-900 print:text-base">{t('vieworder.orderItems')}</h4>
              </div>
              <div className="overflow-x-auto print:overflow-visible">
                <table className="min-w-full divide-y divide-gray-200 print:text-sm print:divide-gray-300">
                  <thead className="bg-gray-100 print:bg-white">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider print:px-3 print:py-2 print:text-xs">{t('vieworder.table.product')}</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider print:px-3 print:py-2 print:text-xs">{t('vieworder.table.price')}</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider print:px-3 print:py-2 print:text-xs">{t('vieworder.table.quantity')}</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider print:px-3 print:py-2 print:text-xs">{t('vieworder.table.status')}</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider print:px-3 print:py-2 print:text-xs">{t('vieworder.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 print:divide-gray-300">
                    {/* Display all order items */}
                    {nOrder.orderItems.map((item) => (
                      <tr key={item?.id || item?.sku || item?.name}>
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
                                  {t('vieworder.noImage')}
                                </div>
                              )}
                            </div>
                            <div className="ml-4 print:ml-0">
                              <div className="text-sm font-medium text-gray-900 print:text-xs">
                                {(item.name?.split(' ').slice(0, 2).join(' ') || 'N/A') + (item.name?.split(' ').length > 2 ? '...' : '')}
                              </div>
                            </div>

                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 print:px-3 print:py-2 print:text-xs">
                          ₹{item.price?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 print:px-3 print:py-2 print:text-xs">
                          {item.quantity || 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 print:px-3 print:py-2 print:text-xs">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3 print:px-3 print:py-2 print:text-xs print:space-x-1">
                          <button className="text-blue-600 hover:text-blue-800 print:hidden" title="Edit" onClick={() => openEditDialog(item)}>
                            <Edit className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Totals Footer */}
                  <tfoot className="bg-gray-100 print:bg-white">
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-left text-base font-semibold text-gray-900 print:px-3 print:py-2 print:text-sm">{t('vieworder.subtotal')}</td>
                      <td colSpan="2" className="px-6 py-3 text-right text-base font-semibold text-gray-900 print:px-3 print:py-2 print:text-sm">${nOrder.total?.toFixed(2) || '0.00'}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-left text-base font-semibold text-gray-900 print:px-3 print:py-2 print:text-sm">{t('vieworder.shipping')}</td>
                      <td colSpan="2" className="px-6 py-3 text-right text-base font-semibold text-gray-900 print:px-3 print:py-2 print:text-sm">$0.00</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-left text-base font-semibold text-gray-900 print:px-3 print:py-2 print:text-sm">{t('vieworder.tax')}</td>
                      <td colSpan="2" className="px-6 py-3 text-right text-base font-semibold text-gray-900 print:px-3 print:py-2 print:text-sm">$0.00</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-left text-lg font-bold text-gray-900 print:px-3 print:py-2 print:text-base">{t('vieworder.ordertotal')}</td>
                      <td colSpan="2" className="px-6 py-3 text-right text-lg font-bold text-[#5B45E0] print:px-3 print:py-2 print:text-base">₹{nOrder.totalAmount || '0.00'}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Order Summary Card - Shown only on small/medium screens */}
            <div className="lg:hidden rounded-lg p-6 shadow-sm border border-gray-100 print:rounded-none print:shadow-none print:border print:p-4">
              <div>
                <div className="flex items-center space-x-3 mb-4 print:mb-3">
                  <div className="p-2 bg-[#5B45E0]/10 rounded-lg print:hidden">
                    <Package className="h-5 w-5 text-[#5B45E0]" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 print:text-base">{t('vieworder.orderSummary')}</h4>
                </div>
                <div className="space-y-3 print:space-y-2 text-gray-700 print:text-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm print:text-xs">{t('vieworder.orderDate')}</span>
                    <div className="flex items-center text-sm text-gray-900 font-medium print:text-xs">
                      <Calendar className="h-4 w-4 mr-1.5 text-gray-500 print:hidden" />
                      {nOrder.orderDate ? new Date(nOrder.orderDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm print:text-xs">{t('vieworder.orderItems')}</span>
                    <div className="flex items-center text-sm text-gray-900 font-medium print:text-xs">
                      <Clock className="h-4 w-4 mr-1.5 text-gray-500 print:hidden" />
                      {nOrder.orderDate ? new Date(nOrder.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between font-medium border-t border-gray-100 pt-3 mt-3 print:border-gray-200 print:pt-2 print:mt-2">
                    <span className="text-base text-gray-900 print:text-sm">{t('vieworder.totalAmount')}</span>
                    <span className="text-lg font-bold text-[#5B45E0] print:text-base">${nOrder.total?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Edit Order Item Dialog */}
      {bShowEditDialog && oEditingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{t('vieworder.editOrderItem')}</h3>
            <div className="space-y-4">
              <div>
                <SelectWithIcon
                  label={t('vieworder.status')}
                  id="orderStatus"
                  name="orderStatus"
                  value={sEditedStatusId !== null ? sEditedStatusId.toString() : ''}
                  onChange={(e) => {
                    const selectedStatusId = e.target.value;
                    const selectedStatus = orderStatusData?.data?.find(status => status.StatusID === parseInt(selectedStatusId));
                    setEditedStatusId(parseInt(selectedStatusId));
                    setEditedStatus(selectedStatus?.OrderStatus || '');
                  }}
                  options={orderStatusData?.data?.map(status => ({ value: status.StatusID.toString(), label: status.OrderStatus })) || []}
                  Icon={Truck}
                />
              </div>
              <div>
                <TextAreaWithIcon
                  label={t('vieworder.remarks')}
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
                className="btn-cancel"
                onClick={closeEditDialog}
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveChanges}
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderView; 