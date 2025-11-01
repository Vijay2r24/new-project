import { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import BrandList from "./brands/BrandList";
import BrandCreate from "./brands/CreateBrand";
import CategoryList from "./categories/CategoryList";
import CategoryCreate from "./categories/CreateCategory";
import AttributeTypeList from "./attributeTypes/AttributeTypeList";
import AttributeTypeCreate from "./attributeTypes/CreateAttributeType";
import ColorList from "./colors/ColorList";
import ColorCreate from "./colors/CreateColor";
import AttributeList from "./AttributeTypeValues/AttributeTypeValuesList";
import AttributeCreate from "./AttributeTypeValues/CreateAttributeTypeValuesList";
import ProductGroupList from "./productGroups/ProductGroupList";
import CreateProductGroup from "./productGroups/CreateProductGroup";
import {
  Package,
  Tag,
  Palette,
  Layers,
  Settings,
  Boxes,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useTitle } from "../../context/TitleContext";
import { ToastContainer } from "react-toastify";
import SpecificationTypeList from "./productSpecification/SpecificationTypeList";
import { VIEW_TYPES, FORM_MODES } from "../../contants/constants";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Browse = () => {
  const [nSelectedTab, setSelectedTab] = useState(0);
  const [sViewMode, setViewMode] = useState(VIEW_TYPES.LIST);

  const { t } = useTranslation();
  const location = useLocation();
  const { setTitle } = useTitle();

  const aTabs = [
    {
      name: t("PRODUCT_SETUP.TABS.BRANDS"),
      list: BrandList,
      create: BrandCreate,
      icon: Package,
    },
    {
      name: t("PRODUCT_SETUP.TABS.CATEGORIES"),
      list: CategoryList,
      create: CategoryCreate,
      icon: Tag,
    },
    {
      name: t("PRODUCT_SETUP.TABS.ATTRIBUTE_TYPES"),
      list: AttributeTypeList,
      create: AttributeTypeCreate,
      icon: Settings,
    },
    {
      name: t("PRODUCT_SETUP.TABS.COLORS"),
      list: ColorList,
      create: ColorCreate,
      icon: Palette,
    },
    {
      name: t("PRODUCT_SETUP.TABS.ATTRIBUTES"),
      list: AttributeList,
      create: AttributeCreate,
      icon: Layers,
    },
    {
      name: t("PRODUCT_SETUP.TABS.SPECIFICATION_TYPE"),
      list: SpecificationTypeList,
      create: CreateProductGroup,
      icon: Boxes,
    },
  ];

  useEffect(() => {
    if (location.state && location.state.fromCategoryEdit) {
      const categoryTabIndex = aTabs.findIndex(
        (tab) => tab.name === t("PRODUCT_SETUP.TABS.CATEGORIES")
      );
      if (categoryTabIndex !== -1) {
        setSelectedTab(categoryTabIndex);
      }
      setViewMode(VIEW_TYPES.LIST);
      window.history.replaceState({}, document.title);
    } else if (location.state && location.state.fromAttributeTypeEdit) {
      const attributeTypeTabIndex = aTabs.findIndex(
        (tab) => tab.name === t("PRODUCT_SETUP.TABS.ATTRIBUTE_TYPES")
      );
      if (attributeTypeTabIndex !== -1) {
        setSelectedTab(attributeTypeTabIndex);
      }
      setViewMode(VIEW_TYPES.LIST);
      window.history.replaceState({}, document.title);
    } else if (location.state && location.state.fromBrandEdit) {
      const brandTabIndex = aTabs.findIndex(
        (tab) => tab.name === t("PRODUCT_SETUP.TABS.BRANDS")
      );
      if (brandTabIndex !== -1) {
        setSelectedTab(brandTabIndex);
      }
      setViewMode(VIEW_TYPES.LIST);
      window.history.replaceState({}, document.title);
    } else if (location.state && location.state.fromColorEdit) {
      const colorTabIndex = aTabs.findIndex(
        (tab) => tab.name === t("PRODUCT_SETUP.TABS.COLORS")
      );
      if (colorTabIndex !== -1) {
        setSelectedTab(colorTabIndex);
      }
      setViewMode(VIEW_TYPES.LIST);
      window.history.replaceState({}, document.title);
    } else if (location.state && location.state.fromAttributeEdit) {
      const attributeTabIndex = aTabs.findIndex(
        (tab) => tab.name === t("PRODUCT_SETUP.TABS.ATTRIBUTES")
      );
      if (attributeTabIndex !== -1) {
        setSelectedTab(attributeTabIndex);
      }
      setViewMode(VIEW_TYPES.LIST);
      window.history.replaceState({}, document.title);
    } else if (location.state && location.state.fromProductGroupEdit) {
      const productGroupTabIndex = aTabs.findIndex(
        (tab) => tab.name === t("PRODUCT_SETUP.TABS.PRODUCT_GROUPS")
      );
      if (productGroupTabIndex !== -1) {
        setSelectedTab(productGroupTabIndex);
      }
      setViewMode(VIEW_TYPES.LIST);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, t]);

  useEffect(() => {
    setTitle(t("PRODUCT_SETUP.PRODUCT_SETUP"));
  }, [setTitle, t]);

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-2">
      {/* Tabs Section */}
      <div className="overflow-visible">
        <Tab.Group
          selectedIndex={nSelectedTab}
          onChange={(index) => {
            setSelectedTab(index);
            setViewMode(VIEW_TYPES.LIST);
          }}
        >
          <div className="overflow-x-auto">
            <Tab.List className="flex space-x-4 min-w-max border-b border-gray-200 px-4 sm:px-6">
              {aTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Tab
                    key={tab.name}
                    className={({ selected }) =>
                      classNames(
                        "flex items-center px-3 sm:px-5 py-2 sm:py-3 text-sm font-medium border-b-2 transition duration-150 ease-in-out whitespace-nowrap",
                        selected
                          ? "border-custom-bg text-custom-bg"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
              <Tab.Panel key={idx} className="p-4 sm:p-6">
                {sViewMode === VIEW_TYPES.LIST ? (
                  <tab.list
                    onCreate={() => setViewMode(FORM_MODES.CREATE)}
                  />
                ) : (
                  <tab.create
                    setViewMode={setViewMode}
                  />
                )}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Browse;