import { useState } from 'react';
import {Edit, Trash} from 'lucide-react';
import Toolbar from '../../../components/Toolbar'
import { useTranslation } from 'react-i18next';

const CategoryList = () => {
  const { t } = useTranslation();
  const [sSearchQuery, setSearchQuery] = useState('');
  const [sStatusFilter, setStatusFilter] = useState('');
  const [bShowFilters, setShowFilters] = useState(false);

  const [aCategories] = useState([
    { id: 1, name: 'Electronics', description: 'Electronic devices and accessories', status: 'Active', products: 250 },
    { id: 2, name: 'Clothing', description: 'Fashion and apparel', status: 'Active', products: 180 },
    { id: 3, name: 'Books', description: 'Books and publications', status: 'Inactive', products: 90 },
  ]);

  const filteredCategories = aCategories.filter(category =>
    (category.name.toLowerCase().includes(sSearchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(sSearchQuery.toLowerCase())) &&
    (sStatusFilter ? category.status === sStatusFilter : true)
  );
  return (
    <div>
      {/* Header with title and Add button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">{t("productSetup.categories.title")}</h2>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
         <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          filterStatus={bShowFilters}
          setFilterStatus={setShowFilters}
          searchPlaceholder={t("productSetup.categories.searchPlaceholder")}
          showSearch={true}
          showViewToggle={false}
          showFilterButton={true}
        />
      </div>

      {/* Category Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> {t("productSetup.categories.table.name")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("productSetup.categories.table.description")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("productSetup.categories.table.products")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("productSetup.categories.table.status")}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t("productSetup.categories.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{category.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{category.products}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.status === 'Active'
                        ? 'status-active'
                        : 'status-inactive'
                    }`}>
                      {category.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                   <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleEdit(store.id)} className="action-button" title={t('common.edit')}>
                          <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(store.id)} className="action-button" title={t('common.delete')}>
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
      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">{t("productSetup.categories.empty.message")}</div>
          {sSearchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-[#5B45E0] hover:text-[#4c39c7]"
            >
             {t("productSetup.categories.empty.clear")}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryList;
