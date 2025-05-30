import { useState } from 'react';
import {Edit, Trash, } from 'lucide-react';
import CreateAttribute from './CreateAttribute';
import Toolbar from '../../../components/Toolbar';
import { useTranslation } from 'react-i18next';
const AttributeList = () => {
  const [sSearchQuery, setSearchQuery] = useState('');
  const [sTypeFilter, setTypeFilter] = useState('');
  const [sStatusFilter, setStatusFilter] = useState('');
  const [bShowFilter, setShowFilter] = useState(false);
  const [bShowCreate, setShowCreate] = useState(false);
  const { t } = useTranslation();
  const [aAttributes] = useState([
    {
      id: 1,
      name: 'Screen Size',
      type: 'Numeric',
      description: 'Display size in inches',
      status: 'Active',
      products: 45
    },
    {
      id: 2,
      name: 'Material',
      type: 'Text',
      description: 'Product material type',
      status: 'Active',
      products: 120
    },
    {
      id: 3,
      name: 'Warranty',
      type: 'Boolean',
      description: 'Product warranty status',
      status: 'Inactive',
      products: 30
    },
  ]);

  const filteredAttributes = aAttributes.filter(attribute => {
    const matchesSearch =
      attribute.name.toLowerCase().includes(sSearchQuery.toLowerCase()) ||
      attribute.description.toLowerCase().includes(sSearchQuery.toLowerCase());

    const matchesType = sTypeFilter ? attribute.type === sTypeFilter : true;
    const matchesStatus = sStatusFilter ? attribute.status === sStatusFilter : true;

    return matchesSearch && matchesType && matchesStatus;
  });

  if (bShowCreate) {
    return <CreateAttribute onBack={() => setShowCreate(false)} />;
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">{t('productSetup.attributes.title')}</h2>
      </div>

      {/* Filters */}
      <div className="mb-6">
         <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          filterStatus={bShowFilter}
          setFilterStatus={setShowFilter}
          searchPlaceholder={t('productSetup.attributes.searchPlaceholder')}
          showSearch={true}
          showViewToggle={false}
          showFilterButton={true}
        />
      </div>
      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('productSetup.attributes.table.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('productSetup.attributes.table.type')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('productSetup.attributes.table.description')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('productSetup.attributes.table.products')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('productSetup.attributes.table.status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('productSetup.attributes.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttributes.map((attribute) => (
                <tr key={attribute.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attribute.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${attribute.type === 'Numeric'
                        ? 'bg-blue-100 text-blue-800'
                        : attribute.type === 'Text'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                      {attribute.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{attribute.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{attribute.products}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${attribute.status === 'Active'
                        ? 'status-active'
                        : 'status-inactive'
                      }`}>
                      {attribute.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => handleEdit(store.id)} className="action-button" title="Edit">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(store.id)} className="action-button" title="Delete">
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredAttributes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No attributes found</div>
          {(sSearchQuery || sTypeFilter || sStatusFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('');
                setStatusFilter('');
              }}
              className="mt-2 text-[#5B45E0] hover:text-[#4c39c7]"
            >
              {t('productSetup.attributes.clearFilters-btn')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AttributeList;
