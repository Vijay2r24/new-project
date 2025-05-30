import React, { useState } from 'react';
import { Plus, MoreVertical, Edit, Trash, MapPin, Phone, Mail, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import Toolbar from '../components/Toolbar';
import Pagination from '../components/Pagination';
import ActionButtons from '../components/ActionButtons';
const Stores = () => {
  const [sSearchQuery, setSearchQuery] = useState('');
  const [sSearchTerm, setSearchTerm] = useState('');
  const [bShowFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sFilterStatus, setFilterStatus] = useState('all');
  const [oFilters, setFilters] = useState({
    status: '',
    products: '',
    employees: ''
  });
  const aAdditionalFilters = [
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      value: oFilters.status,
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
      ],
    },
  ];
  const [aStores] = useState([
    {
      id: 1,
      name: 'Downtown Store',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      phone: '(555) 123-4567',
      email: 'downtown@store.com',
      status: 'Active',
      products: 250,
      employees: 15
    },
    {
      id: 2,
      name: 'Westside Branch',
      address: '456 West Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      phone: '(555) 987-6543',
      email: 'westside@store.com',
      status: 'Active',
      products: 180,
      employees: 12
    },
    {
      id: 3,
      name: 'Eastside Location',
      address: '789 East Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      phone: '(555) 456-7890',
      email: 'eastside@store.com',
      status: 'Inactive',
      products: 120,
      employees: 8
    }
  ]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const handleEdit = (storeId) => {
    // TODO: Implement edit functionality
    console.log('Edit store:', storeId);
  };

  const handleDelete = (storeId) => {
    // TODO: Implement delete functionality
    console.log('Delete store:', storeId);
  };

  const handleMore = (storeId) => {
    // TODO: Implement more options functionality
    console.log('More options for store:', storeId);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const filteredStores = aStores.filter(store => {
    const matchesSearch =
      store.name.toLowerCase().includes(sSearchQuery.toLowerCase()) ||
      store.city.toLowerCase().includes(sSearchQuery.toLowerCase()) ||
      store.state.toLowerCase().includes(sSearchQuery.toLowerCase());

    const matchesStatus = !oFilters.status || store.status === oFilters.status;
    const matchesProducts = !oFilters.products || store.products >= parseInt(oFilters.products);
    const matchesEmployees = !oFilters.employees || store.employees >= parseInt(oFilters.employees);

    return matchesSearch && matchesStatus && matchesProducts && matchesEmployees;
  });

  const hasActiveFilters = Object.values(oFilters).some(value => value !== '');

  // Pagination logic
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const paginatedStores = filteredStores.slice(
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

  // Reset to page 1 when filters/search change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sSearchQuery, oFilters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen bg-gray-50">
      {/* Header: Stores heading and Add Store in one row */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your store locations and their details</p>
          </div>
          <Link
            to="/add-store"
            className='btn-primary'
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Store
          </Link>
        </div>
      </div>
      <Toolbar
        searchTerm={sSearchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showFilterDropdown={bShowFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        filterStatus={sFilterStatus}
        setFilterStatus={setFilterStatus}
        additionalFilters={aAdditionalFilters}
        handleFilterChange={handleFilterChange}
      />

      {/* Stores List: Table or Grid View */}
      {viewMode === 'table' ? (
        <div className="table-container overflow-hidden">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th scope="col" className="table-head-cell">
                    Store Details
                  </th>
                  <th scope="col" className="table-head-cell">
                    Contact
                  </th>
                  <th scope="col" className="table-head-cell">
                    Status
                  </th>
                  <th scope="col" className="table-head-cell">
                    Inventory
                  </th>
                  <th scope="col" className="table-head-cell">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
                {paginatedStores.map((store) => (
                  <tr key={store.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-custom-bg/10 rounded-lg flex items-center justify-center">
                          <Building className="h-5 w-5 text-custom-bg" />
                        </div>
                        <div className="ml-4">
                          <div className="table-cell-text">{store.name}</div>
                          <div className="table-cell-subtext flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {store.address}, {store.city}, {store.state} {store.zipCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="table-cell-text flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" />
                        {store.phone}
                      </div>
                      <div className="table-cell-subtext flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                        {store.email}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${store.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {store.status}
                      </span>
                    </td>
                    <td className="table-cell table-cell-text">
                      <div>Products: {store.products}</div>
                      <div>Employees: {store.employees}</div>
                    </td>
                    <td className="table-cell text-right">
                      <ActionButtons
                        id={''}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onMore={() => console.log('More options for', product.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Grid View
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedStores.map(store => (
              <div key={store.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-xl transition-shadow duration-200">
                {/* Store Icon and Name */}
                <div className="flex items-center gap-4 pb-2 border-b border-gray-100">
                  <div className="flex-shrink-0 h-12 w-12 bg-custom-bg/10 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-custom-bg" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{store.name}</div>
                    <div className="text-xs text-gray-500 flex items-center mt-1 whitespace-nowrap overflow-hidden text-ellipsis w-full">
                      <MapPin className="h-4 w-4 mr-1 shrink-0" />
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {store.address}, {store.city}, {store.state}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Status and Inventory */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${store.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{store.status}</span>
                  <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Products: {store.products}</span>
                  <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Employees: {store.employees}</span>
                </div>
                {/* Contact Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-2">
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{store.phone}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:ml-4 max-w-full overflow-hidden">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate block">{store.email}</span>
                  </div>

                </div>
                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 mt-2">
                  <ActionButtons
                    id={''}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onMore={() => console.log('More options for', product.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {/* Pagination component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredStores.length}
        itemsPerPage={itemsPerPage}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        handlePageClick={handlePageClick}
      />
    </div>
  );
};

export default Stores; 