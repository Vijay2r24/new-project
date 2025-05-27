import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, LayoutGrid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Toolbar from '../../components/Toolbar';
// import {fetchData} from '../../utils/apiUtils';
const OrderList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const [aUsers, setUsers] = useState([]);
  const [bLoading, setLoading] = useState(false);
  const [sError, setError] = useState('');
  const itemsPerPage = 3;
  const [oFilters, setFilters] = useState({
    orderStatus: 'all',
    paymentStatus: 'all',
  });
  const navigate = useNavigate();

  // Handle change for additional filters
  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
  };
//   useEffect(() => {
//   const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOjEsIlJvbGVJRCI6MSwiVGVuYW50SUQiOjEsIlN0b3JlSURzIjpbXSwiUGVybWlzc2lvbklEIjpbMV0sIlBlcm1pc3Npb25zIjpbIkFkZCBVc2VyIl0sImlhdCI6MTc0NzkxMDQwNH0.RVoM8isbPJTkwYQRNzNN-33GkH3-dLYwogFCZGvqlB0'; // Replace with your actual token
//   fetchData('/getAllOrders', setUsers, setLoading, setError, token);
//   console.log("orders",aUsers.data)
// }, []);


  // Define the available filters
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
  const orders = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      orderDate: '2024-03-15',
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
          quantity: 2,
          price: 29.99,
          image: 'product1.jpg',
        },
      ],
      total: 59.98,
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      orderDate: '2024-03-14',
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
          quantity: 1,
          price: 49.99,
          image: 'product2.jpg',
        },
      ],
      total: 49.99,
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      orderDate: '2024-03-13',
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
          quantity: 3,
          price: 19.99,
          image: 'product3.jpg',
        },
      ],
      total: 59.97,
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-004',
      orderDate: '2024-03-12',
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
          quantity: 1,
          price: 99.99,
          image: 'product4.jpg',
        },
      ],
      total: 99.99,
    },
    {
      id: '5',
      orderNumber: 'ORD-2024-005',
      orderDate: '2024-03-11',
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
          quantity: 2,
          price: 39.99,
          image: 'product5.jpg',
        },
      ],
      total: 79.98,
    },
    {
      id: '6',
      orderNumber: 'ORD-2024-006',
      orderDate: '2024-03-10',
      customer: {
        name: 'David Kim',
        email: 'david@example.com',
        phone: '+1 234 567 8905',
      },
      delivery: {
        address: '987 Spruce St',
        city: 'Philadelphia',
        state: 'PA',
        zipCode: '19019',
      },
      status: 'processing',
      products: [
        {
          id: '6',
          name: 'Product 6',
          quantity: 1,
          price: 59.99,
          image: 'product6.jpg',
        },
      ],
      total: 59.99,
    },
    {
      id: '7',
      orderNumber: 'ORD-2024-007',
      orderDate: '2024-03-09',
      customer: {
        name: 'Eva Green',
        email: 'eva@example.com',
        phone: '+1 234 567 8906',
      },
      delivery: {
        address: '246 Birch Blvd',
        city: 'San Antonio',
        state: 'TX',
        zipCode: '78201',
      },
      status: 'delivered',
      products: [
        {
          id: '7',
          name: 'Product 7',
          quantity: 4,
          price: 14.99,
          image: 'product7.jpg',
        },
      ],
      total: 59.96,
    },
    {
      id: '8',
      orderNumber: 'ORD-2024-008',
      orderDate: '2024-03-08',
      customer: {
        name: 'Frank Hall',
        email: 'frank@example.com',
        phone: '+1 234 567 8907',
      },
      delivery: {
        address: '135 Willow Way',
        city: 'San Diego',
        state: 'CA',
        zipCode: '92101',
      },
      status: 'pending',
      products: [
        {
          id: '8',
          name: 'Product 8',
          quantity: 2,
          price: 24.99,
          image: 'product8.jpg',
        },
      ],
      total: 49.98,
    },
    {
      id: '9',
      orderNumber: 'ORD-2024-009',
      orderDate: '2024-03-07',
      customer: {
        name: 'Grace Lee',
        email: 'grace@example.com',
        phone: '+1 234 567 8908',
      },
      delivery: {
        address: '753 Aspen Ct',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
      },
      status: 'shipped',
      products: [
        {
          id: '9',
          name: 'Product 9',
          quantity: 1,
          price: 89.99,
          image: 'product9.jpg',
        },
      ],
      total: 89.99,
    },
    {
      id: '10',
      orderNumber: 'ORD-2024-010',
      orderDate: '2024-03-06',
      customer: {
        name: 'Henry Ford',
        email: 'henry@example.com',
        phone: '+1 234 567 8909',
      },
      delivery: {
        address: '369 Elm St',
        city: 'San Jose',
        state: 'CA',
        zipCode: '95101',
      },
      status: 'cancelled',
      products: [
        {
          id: '10',
          name: 'Product 10',
          quantity: 2,
          price: 34.99,
          image: 'product10.jpg',
        },
      ],
      total: 69.98,
    },
    {
      id: '11',
      orderNumber: 'ORD-2024-011',
      orderDate: '2024-03-05',
      customer: {
        name: 'Ivy Chen',
        email: 'ivy@example.com',
        phone: '+1 234 567 8910',
      },
      delivery: {
        address: '111 Palm Dr',
        city: 'Austin',
        state: 'TX',
        zipCode: '73301',
      },
      status: 'processing',
      products: [
        {
          id: '11',
          name: 'Product 11',
          quantity: 1,
          price: 59.99,
          image: 'product11.jpg',
        },
      ],
      total: 59.99,
    },
    {
      id: '12',
      orderNumber: 'ORD-2024-012',
      orderDate: '2024-03-04',
      customer: {
        name: 'Jack Black',
        email: 'jack@example.com',
        phone: '+1 234 567 8911',
      },
      delivery: {
        address: '222 Oak Dr',
        city: 'Jacksonville',
        state: 'FL',
        zipCode: '32099',
      },
      status: 'delivered',
      products: [
        {
          id: '12',
          name: 'Product 12',
          quantity: 2,
          price: 44.99,
          image: 'product12.jpg',
        },
      ],
      total: 89.98,
    },
    {
      id: '13',
      orderNumber: 'ORD-2024-013',
      orderDate: '2024-03-03',
      customer: {
        name: 'Karen White',
        email: 'karen@example.com',
        phone: '+1 234 567 8912',
      },
      delivery: {
        address: '333 Pine Dr',
        city: 'Columbus',
        state: 'OH',
        zipCode: '43004',
      },
      status: 'pending',
      products: [
        {
          id: '13',
          name: 'Product 13',
          quantity: 1,
          price: 74.99,
          image: 'product13.jpg',
        },
      ],
      total: 74.99,
    },
    {
      id: '14',
      orderNumber: 'ORD-2024-014',
      orderDate: '2024-03-02',
      customer: {
        name: 'Leo Brown',
        email: 'leo@example.com',
        phone: '+1 234 567 8913',
      },
      delivery: {
        address: '444 Cedar Dr',
        city: 'Fort Worth',
        state: 'TX',
        zipCode: '76101',
      },
      status: 'shipped',
      products: [
        {
          id: '14',
          name: 'Product 14',
          quantity: 3,
          price: 24.99,
          image: 'product14.jpg',
        },
      ],
      total: 74.97,
    },
    {
      id: '15',
      orderNumber: 'ORD-2024-015',
      orderDate: '2024-03-01',
      customer: {
        name: 'Mona Lisa',
        email: 'mona@example.com',
        phone: '+1 234 567 8914',
      },
      delivery: {
        address: '555 Birch Dr',
        city: 'Charlotte',
        state: 'NC',
        zipCode: '28201',
      },
      status: 'cancelled',
      products: [
        {
          id: '15',
          name: 'Product 15',
          quantity: 2,
          price: 49.99,
          image: 'product15.jpg',
        },
      ],
      total: 99.98,
    },
    {
      id: '16',
      orderNumber: 'ORD-2024-016',
      orderDate: '2024-02-29',
      customer: {
        name: 'Nina Patel',
        email: 'nina@example.com',
        phone: '+1 234 567 8915',
      },
      delivery: {
        address: '666 Spruce Dr',
        city: 'Indianapolis',
        state: 'IN',
        zipCode: '46201',
      },
      status: 'processing',
      products: [
        {
          id: '16',
          name: 'Product 16',
          quantity: 1,
          price: 64.99,
          image: 'product16.jpg',
        },
      ],
      total: 64.99,
    },
    {
      id: '17',
      orderNumber: 'ORD-2024-017',
      orderDate: '2024-02-28',
      customer: {
        name: 'Oscar Wilde',
        email: 'oscar@example.com',
        phone: '+1 234 567 8916',
      },
      delivery: {
        address: '777 Willow Dr',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
      },
      status: 'delivered',
      products: [
        {
          id: '17',
          name: 'Product 17',
          quantity: 2,
          price: 54.99,
          image: 'product17.jpg',
        },
      ],
      total: 109.98,
    },
    {
      id: '18',
      orderNumber: 'ORD-2024-018',
      orderDate: '2024-02-27',
      customer: {
        name: 'Paul Young',
        email: 'paul@example.com',
        phone: '+1 234 567 8917',
      },
      delivery: {
        address: '888 Aspen Dr',
        city: 'Denver',
        state: 'CO',
        zipCode: '80201',
      },
      status: 'pending',
      products: [
        {
          id: '18',
          name: 'Product 18',
          quantity: 1,
          price: 84.99,
          image: 'product18.jpg',
        },
      ],
      total: 84.99,
    },
    {
      id: '19',
      orderNumber: 'ORD-2024-019',
      orderDate: '2024-02-26',
      customer: {
        name: 'Quinn Fox',
        email: 'quinn@example.com',
        phone: '+1 234 567 8918',
      },
      delivery: {
        address: '999 Maple Dr',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
      },
      status: 'shipped',
      products: [
        {
          id: '19',
          name: 'Product 19',
          quantity: 3,
          price: 29.99,
          image: 'product19.jpg',
        },
      ],
      total: 89.97,
    },
    {
      id: '20',
      orderNumber: 'ORD-2024-020',
      orderDate: '2024-02-25',
      customer: {
        name: 'Rita Gold',
        email: 'rita@example.com',
        phone: '+1 234 567 8919',
      },
      delivery: {
        address: '1010 Elm Dr',
        city: 'Detroit',
        state: 'MI',
        zipCode: '48201',
      },
      status: 'cancelled',
      products: [
        {
          id: '20',
          name: 'Product 20',
          quantity: 2,
          price: 39.99,
          image: 'product20.jpg',
        },
      ],
      total: 79.98,
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status];
  };

  const handleViewOrder = (order) => {
    navigate(`/orders/${order.id}`);
  };

  const handleDelete = (orderId) => {
    alert('Delete order: ' + orderId);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      oFilters.orderStatus === 'all' || order.status === oFilters.orderStatus;

    const matchPayment =
      oFilters.paymentStatus === 'all' ||
      order.paymentStatus === oFilters.paymentStatus;

    return matchesSearch && matchStatus && matchPayment;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when oFilters/search change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Export all orders as CSV (placeholder)
  const handleExportOrders = () => {
    // Placeholder: implement actual export logic as needed
    alert('Export All Orders functionality coming soon!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2">
      {/* Header: Orders heading and Export All Orders in one row */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="mt-1 text-sm text-gray-500">View and manage all orders</p>
          </div>
          <button
            onClick={() => handleExportOrders()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 gap-2"
          >
            <Download className="w-4 h-4" />
            Export All Orders
          </button>
        </div>
      </div>

      <Toolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showFilterDropdown={showFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        additionalFilters={additionalFilters}
        handleFilterChange={handleFilterChange}
        searchPlaceholder="Search by Order No, Customer Name, Email..." // 👈 Custom placeholder
      />


      {/* Table/Grid Section */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="table-head">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">${order.total.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.orderDate).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {order.customer.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                          <div className="text-sm text-gray-500">{order.customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.delivery.address}</div>
                      <div className="text-sm text-gray-500">
                        {`${order.delivery.city}, ${order.delivery.state} ${order.delivery.zipCode}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-[#5B45E0] hover:text-[#4c39c7] font-medium transition-colors duration-150"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of{' '}
                <span className="font-medium">{filteredOrders.length}</span> results
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="pagination-btn"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    className={`pagination-btn${currentPage === idx + 1 ? ' pagination-btn-active' : ''}`}
                    onClick={() => handlePageClick(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  className="pagination-btn"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Grid View
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold px-3 py-1 rounded-full border bg-gray-50 text-gray-700 border-gray-200">
                    {order.orderNumber}
                  </div>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.status)}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-base font-bold text-gray-600">{order.customer.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                    <div className="text-xs text-gray-500">{order.customer.email}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-900 mt-2 truncate">
                  <span className="font-medium">Delivery:</span> {order.delivery.address}, {order.delivery.city}, {order.delivery.state} {order.delivery.zipCode}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}<br /><span className="text-xs">{new Date(order.orderDate).toLocaleTimeString()}</span></div>
                  <div className="text-lg font-bold text-[#5B45E0]">${order.total.toFixed(2)}</div>
                </div>
                <button
                  onClick={() => handleViewOrder(order)}
                  className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 border border-[#5B45E0] text-[#5B45E0] rounded-lg font-medium hover:bg-[#5B45E0]/10 transition-colors duration-150"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
          {/* Pagination Section for Grid View */}
          <div className="px-6 py-4 border-t border-gray-100 mt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of{' '}
                <span className="font-medium">{filteredOrders.length}</span> results
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="pagination-btn"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    className={`pagination-btn${currentPage === idx + 1 ? ' pagination-btn-active' : ''}`}
                    onClick={() => handlePageClick(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  className="pagination-btn"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderList;
