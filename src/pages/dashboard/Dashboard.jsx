import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Package, 
  ArrowUp, 
  ArrowDown,
  Star,
  Clock,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  // Mock data for the dashboard
  const aMetrics = [
    {
      title: 'Total Revenue',
      value: '$24,500',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Total Customers',
      value: '856',
      change: '+5.3%',
      trend: 'up',
      icon: Users,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Average Order',
      value: '$89.50',
      change: '-2.4%',
      trend: 'down',
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const aRecentOrders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      date: '2024-03-15',
      amount: '$245.00',
      status: 'Delivered',
      items: 3
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      date: '2024-03-15',
      amount: '$189.50',
      status: 'Processing',
      items: 2
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      date: '2024-03-14',
      amount: '$320.75',
      status: 'Shipped',
      items: 4
    },
    {
      id: 'ORD-004',
      customer: 'Sarah Wilson',
      date: '2024-03-14',
      amount: '$145.25',
      status: 'Pending',
      items: 1
    }
  ];

  const aTopProducts = [
    {
      name: 'Wireless Headphones',
      sales: 245,
      revenue: '$24,500',
      rating: 4.8,
      stock: 45,
      image: 'https://images.pexels.com/photos/3394665/pexels-photo-3394665.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      name: 'Smart Watch',
      sales: 189,
      revenue: '$18,900',
      rating: 4.6,
      stock: 32,
      image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      name: 'Laptop Backpack',
      sales: 156,
      revenue: '$7,800',
      rating: 4.9,
      stock: 28,
      image: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=300'
    }
  ];

  const aLowStockItems = [
    {
      name: 'Wireless Mouse',
      stock: 5,
      threshold: 10
    },
    {
      name: 'Mechanical Keyboard',
      stock: 3,
      threshold: 15
    },
    {
      name: 'USB-C Hub',
      stock: 2,
      threshold: 20
    }
  ];

  const [nTopProductsPage, setTopProductsPage] = useState(1);
  const PRODUCTS_PER_PAGE = 3;
  const totalTopProductsPages = Math.ceil(aTopProducts.length / PRODUCTS_PER_PAGE);
  const paginatedTopProducts = aTopProducts.slice(
    (nTopProductsPage - 1) * PRODUCTS_PER_PAGE,
    nTopProductsPage * PRODUCTS_PER_PAGE
  );

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2">
      {/* Product Details Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-xs w-full p-0 relative animate-fade-in-up overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-white to-gray-50">
              <h2 className="text-base font-bold text-gray-900">Product Details</h2>
              <button
                className="text-gray-400 hover:text-indigo-600 text-xl font-bold transition-colors"
                onClick={() => setShowProductModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            {/* Modal Content */}
            <div className="flex flex-col items-center px-4 py-4">
              <img
                src={selectedProduct.image || 'https://via.placeholder.com/96x96?text=Img'}
                alt={selectedProduct.name}
                className="h-28 w-28 rounded-lg object-cover border-2 border-indigo-100 shadow mb-2"
              />
              <h3 className="text-lg font-semibold text-gray-900 mb-0.5 text-center">{selectedProduct.name}</h3>
              <span className="inline-block mb-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{selectedProduct.category || 'General'}</span>
              <div className="flex items-center gap-0.5 mb-2">
                {[1,2,3,4,5].map(star => (
                  <Star key={star} className={`h-4 w-4 ${selectedProduct.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} fill={selectedProduct.rating >= star ? '#facc15' : 'none'} />
                ))}
                <span className="ml-1 text-xs text-gray-500">{selectedProduct.rating}</span>
              </div>
              <hr className="w-full border-t border-gray-200 my-2" />
              <div className="grid grid-cols-2 gap-2 w-full mt-1 mb-1">
                <div className="flex flex-col items-center">
                  <DollarSign className="h-4 w-4 text-green-500 mb-0.5" />
                  <span className="text-[11px] text-gray-500">Revenue</span>
                  <span className="font-semibold text-gray-800 text-sm">{selectedProduct.revenue}</span>
                </div>
                <div className="flex flex-col items-center">
                  <TrendingUp className="h-4 w-4 text-blue-500 mb-0.5" />
                  <span className="text-[11px] text-gray-500">Sales</span>
                  <span className="font-semibold text-gray-800 text-sm">{selectedProduct.sales}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Package className="h-4 w-4 text-gray-500 mb-0.5" />
                  <span className="text-[11px] text-gray-500">Stock</span>
                  <span className={`font-semibold text-sm ${selectedProduct.stock < 10 ? 'text-red-600' : 'text-gray-800'}`}>{selectedProduct.stock}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="h-4 w-4 text-indigo-400 mb-0.5" />
                  <span className="text-[11px] text-gray-500">Status</span>
                  <span className="font-semibold text-sm text-gray-800">{selectedProduct.stock < 10 ? 'Low Stock' : 'In Stock'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your store's performance and recent activity
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {aMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{metric.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${metric.color}`}>
                <metric.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {metric.trend === 'up' ? (
                <ArrowUp className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`ml-2 text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {metric.change}
              </span>
              <span className="ml-2 text-sm text-gray-500">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="mb-6 md:mb-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            </div>
            <div className="flex-1 w-full overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider align-middle">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider align-middle">Order ID</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider align-middle">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider align-middle">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {aRecentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition h-12">
                      <td className="px-4 py-3 align-middle whitespace-nowrap">
                        <span className="inline-block align-middle h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm text-center leading-8 mr-2" style={{minWidth: '2rem'}}>
                          {order.customer.split(' ').map(n => n[0]).join('')}
                        </span>
                        <span className="inline-block align-middle text-sm text-gray-900 max-w-[8rem] truncate">{order.customer}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 align-middle whitespace-nowrap">{order.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right align-middle whitespace-nowrap">{order.amount}</td>
                      <td className="px-4 py-3 align-middle whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold 
                          ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : ''}
                          ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : ''}
                          ${order.status === 'Pending' ? 'bg-gray-100 text-gray-700' : ''}
                        `}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col mt-6 md:mt-0">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
            </div>
            <div className="flex flex-col gap-3 p-4 flex-1">
              {paginatedTopProducts.map((product, index) => (
                <div key={index} className="flex flex-col md:flex-row items-center bg-white rounded-lg shadow-sm px-4 py-3 hover:shadow-md transition min-h-[80px]">
                  {/* Product Image */}
                  <div className="flex-shrink-0 mb-2 md:mb-0 md:mr-4">
                    <img
                      src={product.image || 'https://via.placeholder.com/48x48?text=Img'}
                      alt={product.name}
                      className="h-12 w-12 rounded object-cover border"
                    />
                  </div>
                  {/* Product Info */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 truncate max-w-[10rem]">{product.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{product.category || 'General'}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className={`h-4 w-4 ${product.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} fill={product.rating >= star ? '#facc15' : 'none'} />
                      ))}
                      <span className="ml-1 text-xs text-gray-500">{product.rating}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center"><DollarSign className="inline h-4 w-4 mr-1 text-green-400" />{product.revenue}</span>
                      <span className="flex items-center"><TrendingUp className="inline h-4 w-4 mr-1 text-blue-400" />{product.sales} sales</span>
                      <span className="flex items-center"><Package className="inline h-4 w-4 mr-1 text-gray-400" />{product.stock} in stock</span>
                      {product.stock < 10 && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Low</span>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="w-full md:w-auto mt-2 md:mt-0 md:ml-4 flex flex-col items-end gap-2">
                    <button className="w-full md:w-auto px-3 py-1 rounded bg-custom-bg text-white text-xs font-medium hover:bg-bg-hover transition" onClick={() => { setSelectedProduct(product); setShowProductModal(true); }}>View</button>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 px-6 py-2 border-t border-gray-100 bg-gray-50">
              <button
                className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300 transition disabled:opacity-50"
                onClick={() => setTopProductsPage(p => Math.max(1, p - 1))}
                disabled={nTopProductsPage === 1}
              >
                Previous
              </button>
              <span className="text-xs text-gray-500">
                Page {nTopProductsPage} of {totalTopProductsPages}
              </span>
              <button
                className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300 transition disabled:opacity-50"
                onClick={() => setTopProductsPage(p => Math.min(totalTopProductsPages, p + 1))}
                disabled={nTopProductsPage === totalTopProductsPages}
              >
                Next
              </button>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {aLowStockItems.map((item, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.stock} left (min: {item.threshold})
                        </p>
                      </div>
                    </div>
                    <button className="text-sm text-[#5B45E0] hover:text-[#4c39c7]">
                      Restock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 