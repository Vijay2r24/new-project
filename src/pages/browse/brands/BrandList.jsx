import { useState } from 'react';
import { Edit, Trash, Search, Filter } from 'lucide-react';
import CreateBrand from './CreateBrand';
import Toolbar from '../../../components/Toolbar';
import { useTranslation } from 'react-i18next';

const BrandList = () => {
  const [bShowCreate, setShowCreate] = useState(false);
  const [sSearchQuery, setSearchQuery] = useState('');
  const [bShowFilters, setShowFilters] = useState(false);
  const [sStatusFilter, setStatusFilter] = useState('');
  const { t } = useTranslation();
  const [aBrands] = useState([
    { id: 1, name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', status: 'Active', products: 150 },
    { id: 2, name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg', status: 'Active', products: 120 },
    { id: 3, name: 'Puma', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Puma_logo.svg', status: 'Inactive', products: 80 },
  ]);

  const filteredBrands = aBrands.filter(brand =>
    brand.name.toLowerCase().includes(sSearchQuery.toLowerCase()) &&
    (sStatusFilter ? brand.status === sStatusFilter : true)
  );

  if (bShowCreate) {
    return <CreateBrand onBack={() => setShowCreate(false)} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">{t('productSetup.brands.heading')}</h2>
      </div>

      <div className="mb-6">
        <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          filterStatus={bShowFilters}
          setFilterStatus={setShowFilters}
          searchPlaceholder={t('productSetup.brands.searchPlaceholder')}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('productSetup.brands.table.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('productSetup.brands.table.logo')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('productSetup.brands.table.products')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('productSetup.brands.table.status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('productSetup.brands.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBrands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{brand.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full border overflow-hidden">
                      <img src={brand.logo} alt={brand.name} className="max-w-[70%] max-h-[70%] object-contain" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{brand.products}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${brand.status === 'Active' ? 'status-active' : 'status-inactive'
                      }`}>
                      {brand.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
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

      {filteredBrands.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {t('productSetup.brands.noBrandsFound')}
          {sSearchQuery && (
            <div>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-[#5B45E0] hover:text-[#4c39c7]"
              >
                {t('common.clearSearch')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandList;
