import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import BrandList from './brands/BrandList';
import BrandCreate from './brands/CreateBrand';
import CategoryList from './categories/CategoryList';
import CategoryCreate from './categories/CreateCategory';
import AttributeTypeList from './attributeTypes/AttributeTypeList';
import AttributeTypeCreate from './attributeTypes/CreateAttributeType';
import ColorList from './colors/ColorList';
import ColorCreate from './colors/CreateColor';
import AttributeList from './attributes/AttributeList';
import AttributeCreate from './attributes/CreateAttribute';
import { Plus, Package, Tag, Palette, Layers, Settings, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useTitle } from '../../context/TitleContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Browse = () => {
  const [nSelectedTab, setSelectedTab] = useState(0);
  const [sViewMode, setViewMode] = useState('list');
  const { t } = useTranslation();
  const location = useLocation();
  const { setTitle } = useTitle();

  useEffect(() => {
    if (location.state && location.state.fromCategoryEdit) {
      const categoryTabIndex = aTabs.findIndex(tab => tab.name === t('productSetup.tabs.categories'));
      if (categoryTabIndex !== -1) {
        setSelectedTab(categoryTabIndex);
      }
      setViewMode('list'); // Ensure it goes back to list mode
      // Clear the state after use to prevent re-triggering on subsequent visits
      window.history.replaceState({}, document.title);
    } else if (location.state && location.state.fromAttributeTypeEdit) {
      const attributeTypeTabIndex = aTabs.findIndex(tab => tab.name === t('productSetup.tabs.attributeTypes'));
      if (attributeTypeTabIndex !== -1) {
        setSelectedTab(attributeTypeTabIndex);
      }
      setViewMode('list'); // Ensure it goes back to list mode
      window.history.replaceState({}, document.title);
    } else if (location.state && location.state.fromBrandEdit) {
      const brandTabIndex = aTabs.findIndex(tab => tab.name === t('productSetup.tabs.brands'));
      if (brandTabIndex !== -1) {
        setSelectedTab(brandTabIndex);
      }
      setViewMode('list'); // Ensure it goes back to list mode
      window.history.replaceState({}, document.title);
    } else if (location.state && location.state.fromColorEdit) {
      const colorTabIndex = aTabs.findIndex(tab => tab.name === t('productSetup.tabs.colors'));
      if (colorTabIndex !== -1) {
        setSelectedTab(colorTabIndex);
      }
      setViewMode('list'); // Ensure it goes back to list mode
      window.history.replaceState({}, document.title);
    } else if (location.state && location.state.fromAttributeEdit) {
      const attributeTabIndex = aTabs.findIndex(tab => tab.name === t('productSetup.tabs.attributes'));
      if (attributeTabIndex !== -1) {
        setSelectedTab(attributeTabIndex);
      }
      setViewMode('list'); // Ensure it goes back to list mode
      window.history.replaceState({}, document.title);
    }
  }, [location.state, t]);

  useEffect(() => {
    setTitle(t('productSetup.productSetup'));
  }, [setTitle, t]);

 const aTabs = [
  { name: t('productSetup.tabs.brands'), list: BrandList, create: BrandCreate, icon: Package },
  { name: t('productSetup.tabs.categories'), list: CategoryList, create: CategoryCreate, icon: Tag },
  { name: t('productSetup.tabs.attributeTypes'), list: AttributeTypeList, create: AttributeTypeCreate, icon: Settings },
  { name: t('productSetup.tabs.colors'), list: ColorList, create: ColorCreate, icon: Palette },
  { name: t('productSetup.tabs.attributes'), list: AttributeList, create: AttributeCreate, icon: Layers }
];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2">
      {/* Header and Toggle Button */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          {/* <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('productSetup.productSetup')}</h1> */}
          <p className="mt-1 text-sm text-gray-500">
           {t('productSetup.productSetupSubheading')}
          </p>
        </div>
        <button
          onClick={() => setViewMode(sViewMode === 'list' ? 'create' : 'list')}
          className='btn-primary'
        >
          {sViewMode === 'list' ? (
            <>
              <Plus className="h-4 w-4 mr-2" />
             {t('productSetup.create')}
            </>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('productSetup.viewList')}
            </>
          )}
        </button>
      </div>

      {/* Tabs Section */}
      <div className="overflow-visible">
        <Tab.Group selectedIndex={nSelectedTab} onChange={setSelectedTab}>
          <div className="overflow-x-auto">
            <Tab.List className="flex space-x-4 min-w-max border-b border-gray-200 px-4 sm:px-6">
              {aTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Tab
                    key={tab.name}
                    className={({ selected }) =>
                      classNames(
                        'flex items-center px-3 sm:px-5 py-2 sm:py-3 text-sm font-medium border-b-2 transition duration-150 ease-in-out whitespace-nowrap',
                        selected
                          ? 'border-custom-bg text-custom-bg'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      )
                    }
                  >
                    <Icon className="h-4 w-4 mr-1.5" />
                    {tab.name}
                  </Tab>
                );
              })}
            </Tab.List>
          </div>

          <Tab.Panels>
            {aTabs.map((tab, idx) => (
              <Tab.Panel key={idx} className="p-4 sm:p-6 animate-fadeIn">
                {sViewMode === 'list' ? (
                  <tab.list />
                ) : (
                  <tab.create setViewMode={setViewMode} />
                )}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default Browse;
