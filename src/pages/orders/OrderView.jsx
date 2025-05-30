import { useState, useEffect } from 'react';
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
const OrderView = () => {
  const { orderId } = useParams();
  const [nOrder, setOrder] = useState(null);
  const [bLoading, setLoading] = useState(true);
  const [nError, setError] = useState(null);
  const { t } = useTranslation();
  useEffect(() => {
    const aMockOrders = [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        orderDate: '2024-03-15T10:30:00Z',
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1 234 567 8900',
        },
        delivery: {
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
        },
        status: 'processing',
        products: [
          {
            id: '1',
            name: 'Product 1',
            sku: 'PROD-001',
            quantity: 2,
            price: 29.99,
            image: 'https://via.placeholder.com/50',
          },
          {
            id: '3',
            name: 'Product 3',
            sku: 'PROD-003',
            quantity: 1,
            price: 19.99,
            image: 'https://via.placeholder.com/50',
          },
        ],
        total: 59.98,
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        orderDate: '2024-03-14T14:00:00Z',
        customer: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1 234 567 8901',
        },
        delivery: {
          address: '456 Oak St',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
        },
        status: 'delivered',
        products: [
          {
            id: '2',
            name: 'Product 2',
            sku: 'PROD-002',
            quantity: 1,
            price: 49.99,
            image: 'https://via.placeholder.com/50',
          },
        ],
        total: 49.99,
      },
      {
        id: '3',
        orderNumber: 'ORD-2024-003',
        orderDate: '2024-03-13T09:00:00Z',
        customer: {
          name: 'Alice Johnson',
          email: 'alice@example.com',
          phone: '+1 234 567 8902',
        },
        delivery: {
          address: '789 Pine St',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
        },
        status: 'pending',
        products: [
          {
            id: '3',
            name: 'Product 3',
            sku: 'PROD-003',
            quantity: 3,
            price: 19.99,
            image: 'https://via.placeholder.com/50',
          },
        ],
        total: 59.97,
      },
      {
        id: '4',
        orderNumber: 'ORD-2024-004',
        orderDate: '2024-03-12T11:45:00Z',
        customer: {
          name: 'Bob Lee',
          email: 'bob@example.com',
          phone: '+1 234 567 8903',
        },
        delivery: {
          address: '321 Maple Ave',
          city: 'Houston',
          state: 'TX',
          zipCode: '77001',
        },
        status: 'shipped',
        products: [
          {
            id: '4',
            name: 'Product 4',
            sku: 'PROD-004',
            quantity: 1,
            price: 99.99,
            image: 'https://via.placeholder.com/50',
          },
        ],
        total: 99.99,
      },
      {
        id: '5',
        orderNumber: 'ORD-2024-005',
        orderDate: '2024-03-11T16:00:00Z',
        customer: {
          name: 'Carol King',
          email: 'carol@example.com',
          phone: '+1 234 567 8904',
        },
        delivery: {
          address: '654 Cedar Rd',
          city: 'Phoenix',
          state: 'AZ',
          zipCode: '85001',
        },
        status: 'cancelled',
        products: [
          {
            id: '5',
            name: 'Product 5',
            sku: 'PROD-005',
            quantity: 2,
            price: 39.99,
            image: 'https://via.placeholder.com/50',
          },
        ],
        total: 79.98,
      },
    ];

    const foundOrder = aMockOrders.find(order => order.id === orderId);
    setOrder(foundOrder);
    setLoading(false);
  }, [orderId]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled',
    };
    return colors[status] || colors.pending;
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
  const orderItems = nOrder.products || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2  print:bg-white">
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{t('vieworder.orderDetails')}</h1>
          </div>
          <p className="text-gray-500">{t('vieworder.OrderNumber')}{nOrder.orderNumber || nOrder.id}</p>
        </div>
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1 print:gap-4">
          {/* Left Column - Order Summary, Customer, Delivery, Payment */}
          <div className="lg:col-span-1 flex flex-col gap-6 print:gap-4">

            {/* Customer Details */}
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
              <div className="space-y-3 bg-whitetext-gray-700 print:space-y-2 print:text-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm print:text-xs">{t('vieworder.paymentMethod')}</span>
                  <span className="text-sm font-medium print:text-xs">{t('vieworder.creditCard')}</span> {/* Replace with actual payment method */}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm print:text-xs">{t('vieworder.transactionId')}</span>
                  <span className="text-sm font-medium print:text-xs">#1234567890</span> {/* Replace with actual transaction ID */}
                </div>
                {/* Add more payment details here as needed */}
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
                    <span className="text-lg font-bold text-[#5B45E0] print:text-base">${nOrder.total?.toFixed(2) || '0.00'}</span>
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider print:px-3 print:py-2 print:text-xs">{t('vieworder.table.total')}</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider print:px-3 print:py-2 print:text-xs">{t('vieworder.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 print:divide-gray-300">
                    {/* Display all order items */}
                    {orderItems.map((item) => (
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
                              <div className="text-sm font-medium text-gray-900 print:text-xs">{item.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500 print:text-[10px]">{item.sku || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 print:px-3 print:py-2 print:text-xs">
                          ${item.price?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 print:px-3 print:py-2 print:text-xs">
                          {item.quantity || 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium print:px-3 print:py-2 print:text-xs">
                          ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3 print:px-3 print:py-2 print:text-xs print:space-x-1">
                          <button className="text-blue-600 hover:text-blue-800 print:hidden" title="Edit">
                            <Edit className="w-4 h-4 inline" />
                          </button>
                          <button className="text-red-600 hover:text-red-800 print:hidden" title="Delete">
                            <Trash className="w-4 h-4 inline" />
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
                      <td colSpan="2" className="px-6 py-3 text-right text-lg font-bold text-[#5B45E0] print:px-3 print:py-2 print:text-base">${nOrder.total?.toFixed(2) || '0.00'}</td>
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
    </div>
  );
};

export default OrderView; 