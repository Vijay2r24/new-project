import { useState } from 'react';
import { Edit, Trash} from 'lucide-react';
import Toolbar from '../../../components/Toolbar';
import { useTranslation } from 'react-i18next';
const ColorList = () => {
  const [sSearchQuery, setSearchQuery] = useState('');
  const [sStatusFilter, setStatusFilter] = useState('');
  const [bShowFilters, setShowFilters] = useState(false);
  const { t } = useTranslation();
  const [oColors] = useState([
    { id: 1, name: 'Red', hex: '#FF0000', status: 'Active', products: 120 },
    { id: 2, name: 'Blue', hex: '#0000FF', status: 'Active', products: 150 },
    { id: 3, name: 'Green', hex: '#00FF00', status: 'Inactive', products: 80 },
  ]);

  const filteredColors = oColors.filter((color) => {
    const matchesSearch = color.name.toLowerCase().includes(sSearchQuery.toLowerCase());
    const matchesStatus = sStatusFilter ? color.status === sStatusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">{t("productSetup.colors.title")}</h2>
      </div>

      <div className="mb-6">
        <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          filterStatus={bShowFilters}
          setFilterStatus={setShowFilters}
          searchPlaceholder={t("productSetup.colors.searchPlaceholder")}
          showSearch={true}
          showViewToggle={false}
          showFilterButton={true}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("productSetup.colors.table.color")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("productSetup.colors.table.hexCode")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("productSetup.colors.table.products")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("productSetup.colors.table.status")}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t("productSetup.colors.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredColors.map((color) => (
                <tr key={color.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="h-6 w-6 rounded-full mr-3 border border-gray-200"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="text-sm font-medium text-gray-900">{color.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{color.hex}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{color.products}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      color.status === 'Active'
                        ? 'status-active'
                        : 'status-inactive'
                    }`}>
                      {color.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleEdit(store.id)} className="action-button" title={t("common.edit")}>
                          <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(store.id)} className="action-button" title={t("common.delete")}>
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

      {filteredColors.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">{t("productSetup.color.empty.message")}</div>
          {(sSearchQuery || sStatusFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
              className="mt-2 text-[#5B45E0] hover:text-[#4c39c7]"
            >
              {t("productSetup.color.empty.clear")}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ColorList;
