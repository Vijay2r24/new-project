import { useState } from 'react';
import { Edit, Trash, } from 'lucide-react';
import Toolbar from '../../../components/Toolbar';
import { useTranslation } from 'react-i18next';
const AttributeTypeList = () => {
  const [sSearchQuery, setSearchQuery] = useState('');
  const [bShowFilter, setShowFilter] = useState(false);
  const [sSelectedStatus, setSelectedStatus] = useState('');
  const { t } = useTranslation();
  const [aAttributeTypes] = useState([
    { id: 1, name: 'Size', description: 'Product size variations', status: 'Active', attributes: 5 },
    { id: 2, name: 'Material', description: 'Product material types', status: 'Active', attributes: 3 },
    { id: 3, name: 'Style', description: 'Product style variations', status: 'Inactive', attributes: 2 },
  ]);

  const filteredTypes = aAttributeTypes.filter((type) => {
    const matchesSearch =
      type.name.toLowerCase().includes(sSearchQuery.toLowerCase()) ||
      type.description.toLowerCase().includes(sSearchQuery.toLowerCase());

    const matchesStatus = sSelectedStatus ? type.status === sSelectedStatus : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {t('productSetup.attributeType.listTitle')}
        </h2>
      </div>

      {/* Search & Filter */}
      <div className="mb-6">
        <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          filterStatus={bShowFilter}
          setFilterStatus={setShowFilter}
          searchPlaceholder={t('productSetup.attributeType.searchPlaceholder')}
          showSearch={true}
          showViewToggle={false}
          showFilterButton={true}
        />
        {bShowFilter && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              onClick={() => {
                setSelectedStatus('');
                setShowFilter(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              {t('common.all')}
            </button>
            <button
              onClick={() => {
                setSelectedStatus('Active');
                setShowFilter(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              {t('common.active')}
            </button>
            <button
              onClick={() => {
                setSelectedStatus('Inactive');
                setShowFilter(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              {t('common.inactive')}
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('productSetup.attributeType.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('productSetup.attributeType.description')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('productSetup.attributeType.attributes')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.status')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTypes.map((type) => (
                <tr key={type.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{type.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{type.attributes}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${type.status === 'Active'
                          ? 'status-active'
                          : 'status-inactive'
                        }`}
                    >
                      {t(`common.${type.status.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(type.id)}
                        className="action-button"
                        title={t('common.edit')}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(type.id)}
                        className="action-button"
                        title={t('common.delete')}
                      >
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
      {filteredTypes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {t('productSetup.attributeType.emptyMessage')}
          </div>
          {sSearchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-[#5B45E0] hover:text-[#4c39c7]"
            >
              {t('common.clearSearch')}
            </button>
          )}
        </div>
      )}
    </div>

  );
};

export default AttributeTypeList;
