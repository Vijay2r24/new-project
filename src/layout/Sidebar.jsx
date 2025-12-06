import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  ShoppingCart,
  Package,
  Settings,
  Bell,
  Store,
  Image,
  FileText,
  Shield,
  AlignLeft,
  LayoutDashboard,
  UserRound,
  CreditCard,
  UserCog,
  ListChecks,
  Palette,
  UserPlus,
  ShieldCheck,

} from 'lucide-react';


const Sidebar = ({ onClose, isCollapsed, onToggle, isMobileOpen }) => {
  const location = useLocation();
  const [nExpandedSection, setExpandedSection] = useState(null);
  const [nHoveredSection, setHoveredSection] = useState(null);
  const { t } = useTranslation();

  // Navigation Structure

  const aNavigation = [
    { name: t('SIDEBAR.DASHBOARD'), href: '/dashboard/dashBoard', icon: LayoutDashboard },

    {
      name: t('SIDEBAR.PRODUCT_MANAGEMENT'),
      href: '/products',
      icon: Users,
      relatedPaths: ['/products', '/add-products','/edit-product','/product-details']
    },
    {
      name: t('SIDEBAR.ORDERS_MANAGEMENT'),
      href: '/orders/order-list',
      icon: ShoppingCart, // use the orders icon
      relatedPaths: ['/orders']
    },
    {
      name: t('SIDEBAR.USER_MANAGEMENT'),
      href: '/users',
      icon: Users,
      relatedPaths: ['/users', '/addUser']
    },
    {
      name: t('SIDEBAR.ROLE_MANAGEMENT'),
      href: '/roles',
      icon: ShieldCheck,      
      relatedPaths: ['/roles','/addRole']
    },
     {
      name: t('SIDEBAR.EMPLOYEE_MANAGEMENT'),
      href: '/employees/employee-list',
      icon: Users,
      relatedPaths: ['/employees']
    },

  ];


  // Helpers

  const toggleSection = (section) => {
    setExpandedSection(nExpandedSection === section ? null : section);
  };

  const checkIsActive = (navItem) => {
    if (!navItem.href || navItem.href === '#') return false;

    const isActivePath = location.pathname.startsWith(navItem.href);
    const isRelatedActive = navItem.relatedPaths?.some((p) =>
      location.pathname.startsWith(p)
    );

    return isActivePath || isRelatedActive;
  };


  // Render Menu Items

  const renderNavigationItem = (item) => {
    const isActive = checkIsActive(item);
    const Icon = item.icon;
    const isHovered = nHoveredSection === item.name;

    if (item.subItems) {
      return (
        <div
          key={item.name}
          className="relative transition"
          onMouseEnter={() => setHoveredSection(item.name)}
          onMouseLeave={() => setHoveredSection(null)}
        >
          {/* Toggle Checkbox */}
          <input
            type="checkbox"
            id={`menu-${item.name}`}
            className="peer hidden"
            checked={nExpandedSection === item.name}
            onChange={() => toggleSection(item.name)}
          />

          {/* Main Menu Button */}
          <button
            className={`flex peer relative w-full items-center py-4 px-4 text-sm font-medium leading-none outline-none transition-all duration-100 ease-in-out cursor-pointer
            ${isActive
                ? 'text-gray-900 font-bold border-l-4 border-custom-bg'
                : 'text-caption hover:text-custom-bg'
              }`}
          >
            <span
              className={`mr-4 w-5 flex items-center justify-center ${isActive ? 'text-custom-bg' : ''
                }`}
            >
              <Icon className="h-5 w-5" />
            </span>

            {!isCollapsed && item.name}

            <label
              htmlFor={`menu-${item.name}`}
              className="absolute inset-0 cursor-pointer"
            ></label>
          </button>

          {/* Dropdown (Expanded) */}
          {!isCollapsed && (
            <ul className="duration-400 flex max-h-0 flex-col overflow-hidden rounded-xl bg-gray-100 transition-all duration-300 peer-checked:max-h-96">
              {item.subItems.map((sub) => {
                const SubIcon = sub.icon;
                const isSubActive = checkIsActive(sub);

                return (
                  <li key={sub.name} className="relative">
                    <Link
                      to={sub.href}
                      onClick={isMobileOpen ? onClose : undefined}
                      className={`flex m-2 cursor-pointer py-2 pl-10 text-sm ${isSubActive
                        ? 'text-custom-bg font-bold'
                        : 'text-caption hover:text-custom-bg'
                        }`}
                    >
                      <span className="mr-5">
                        <SubIcon className="h-5 w-5" />
                      </span>
                      {sub.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Hover Popup When Collapsed */}
          {isCollapsed && (
            <div
              className={`absolute left-full top-0 ml-1 w-48 rounded-lg bg-white shadow-lg transition-all
              ${isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            >
              <div className="py-2">
                {item.subItems.map((sub) => {
                  const SubIcon = sub.icon;
                  const isSubActive = checkIsActive(sub);

                  return (
                    <Link
                      key={sub.name}
                      to={sub.href}
                      onClick={isMobileOpen ? onClose : undefined}
                      className={`flex items-center px-4 py-2 text-sm ${isSubActive
                        ? 'bg-gray-100 text-gray-900 font-bold'
                        : 'text-caption hover:bg-gray-50 hover:text-custom-bg'
                        }`}
                    >
                      <SubIcon className="mr-3 h-4 w-4" />
                      {sub.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }


    // Simple Link (No Submenu)

    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={isMobileOpen ? onClose : undefined}
        className={`flex cursor-pointer items-center w-full py-4 px-4 text-sm font-medium transition-all 
        ${isActive
            ? 'text-gray-900 font-bold border-l-4 border-custom-bg'
            : 'text-caption hover:text-custom-bg'
          }`}
      >
        <span
          className={`mr-4 w-5 flex items-center justify-center ${isActive ? 'text-custom-bg' : ''
            }`}
        >
          <Icon className="h-5 w-5" />
        </span>

        {!isCollapsed && item.name}
      </Link>
    );
  };


  // Sidebar UI Layout

  return (
    <div className={`h-screen bg-gray-100 ${isMobileOpen ? 'block' : 'hidden lg:block'}`}>
      <div
        className={`h-full transition-all duration-300 
        ${isCollapsed ? 'w-16' : 'w-56'}`}
      >
        <div className="flex h-full flex-col bg-white shadow-md">
          {/* Collapse Button */}
          <div className="hidden md:flex items-center justify-end px-4 py-4">
            <button
              onClick={onToggle}
              className="rounded-lg p-2 text-caption hover:bg-gray-100 hover:text-custom-bg"
            >
              <AlignLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            {aNavigation.map((item) => renderNavigationItem(item))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
