import { useState, useMemo, useEffect } from 'react';
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
  CreditCard // Add CreditCard icon for Payments
} from 'lucide-react';
import { getPermissionCode } from '../utils/permissionUtils';

const Sidebar = ({ onClose, isCollapsed, onToggle, isMobileOpen }) => {
  const location = useLocation();
  const [nExpandedSection, setExpandedSection] = useState(null);
  const [nHoveredSection, setHoveredSection] = useState(null);
  const { t } = useTranslation();

  const aNavigation = useMemo(() => [
    { 
      name: t('SIDEBAR.DASHBOARD'), 
      href: '/dashboard', 
      icon: LayoutDashboard,
      section: 'Dashbord',
    },
    { 
      name: t('SIDEBAR.ORDERS'), 
      href: '/orders', 
      icon: ShoppingCart 
    },
    {
      name: t('SIDEBAR.PRODUCT_MANAGEMENT'),
      href: '#',
      icon: Package,
      section: 'Product Management',
      subItems: [
        { name: t('SIDEBAR.PRODUCT_SETUP'), href: '/browse', icon: Settings },
        { name: t('SIDEBAR.PRODUCTS'), href: '/productList', icon: Package, relatedPaths: ['/Addproduct','/edit-product'] },
      ]
    },
    { 
      name: t('SIDEBAR.STORES'), 
      href: '/stores', 
      icon: Store,
      relatedPaths: ['/add-store', '/editStore']
    },
    {
      name: t('SIDEBAR.USER_MANAGEMENT'),
      href: '#',
      icon: Users,
      section: 'User Management',
      subItems: [
        { name: t('SIDEBAR.USERS'), href: '/users', icon: Users,  relatedPaths: ['/add-user','/editUser'] },
        { name: t('SIDEBAR.ROLES'), href: '/userRoles', icon: Shield, relatedPaths: ['/addUserRole','/edit-UserRole'] },
      ]
    },
    {
      name: t('SIDEBAR.CONTENT_MANAGEMENT'),
      href: '#',
      icon: FileText,
      section: 'Content Management',
      subItems: [
        { name: t('SIDEBAR.BANNERS'), href: '/banners', icon: Image, relatedPaths: ['/banners-create','/activeBanners'] },
        { name: t('SIDEBAR.NOTIFICATIONS'), href: '/notifications', icon: Bell },
      ]
    },
    // Add Payments menu item
    { 
      name: t('SIDEBAR.PAYMENTS'), 
      href: '/payments', 
      icon: CreditCard,
      relatedPaths: ['/payment-details']
    },
    {
      name: t('SIDEBAR.SETTINGS'),
      href: '#',
      icon: Settings,
      section: 'Settings',
      subItems: [
        { name: t('SIDEBAR.PAGES'), href: '/profile', icon: UserRound },
      ]
    },
  ], [t]);
  
  const userPermissionIDs = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('PermissionIDs')) || [];
    } catch {
      return [];
    }
  }, []);
  
 const allPermissions = useMemo(() => {
  try {
    // Direct array — not nested under data.rows
    return JSON.parse(localStorage.getItem('AllPermissions')) || [];
  } catch {
    return [];
  }
}, []);

const allowedPermissionCodes = useMemo(() => {
  // Match PermissionID instead of ID/Code
  return allPermissions
    .filter(perm => userPermissionIDs.includes(perm.PermissionID))
    .map(perm => perm.PermissionID);
}, [allPermissions, userPermissionIDs]);


  const menuPermissionCode = useMemo(() => ({
    '/dashboard': getPermissionCode('Menu Management', 'Dashboard'),
    '/orders': getPermissionCode('Menu Management', 'Orders'),
    '/stores': getPermissionCode('Menu Management', 'Stores'),
    '/users': getPermissionCode('Menu Management', 'Users'),
    '/userRoles': getPermissionCode('Menu Management', 'UserRoles'),
    '/banners': getPermissionCode('Menu Management', 'Banners'),
    '/notifications': getPermissionCode('Menu Management', 'Notification'),
    '/pages': getPermissionCode('Menu Management', 'Pages'),
    '/browse': getPermissionCode('Menu Management', 'Products'),
    '/productList': getPermissionCode('Menu Management', 'Products'),
    // Add Payments permission code
    '/payments': getPermissionCode('Menu Management', 'Payments'),
  }), []);

  const filteredNavigation = useMemo(() => {
    const isAllowed = (href) => {
      const code = menuPermissionCode[href];
      if (!code) return true;
      return allowedPermissionCodes.includes(code);
    };
    
    return aNavigation
      .map(item => {
        if (item.subItems) {
          const filteredSubItems = item.subItems.filter(sub => isAllowed(sub.href));
          if (filteredSubItems.length > 0) {
            return { ...item, subItems: filteredSubItems };
          }
          return null;
        } else {
          return isAllowed(item.href) ? item : null;
        }
      })
      .filter(Boolean);
  }, [aNavigation, allowedPermissionCodes, menuPermissionCode]);

  useEffect(() => {
    const activeSection = filteredNavigation.find(item =>
      item.subItems?.some(subItem => 
        location.pathname.startsWith(subItem.href) || subItem.relatedPaths?.some(p => location.pathname.startsWith(p))
      )
    );
    if (activeSection) {
      setExpandedSection(activeSection.name);
    }
  }, [location.pathname, filteredNavigation]);

  const toggleSection = (section) => {
    setExpandedSection(nExpandedSection === section ? null : section);
  };

  const renderNavigationItem = (item) => {
    const checkIsActive = (navItem) => {
      if (!navItem.href || navItem.href === '#') return false;
      const isActivePath = location.pathname.startsWith(navItem.href);
      const isRelatedActive = navItem.relatedPaths?.some(p => location.pathname.startsWith(p));
      const result = isActivePath || isRelatedActive;
      return result;
    }

    const isActive = checkIsActive(item);
    const Icon = item.icon;
    const isHovered = nHoveredSection === item.name;
    const isSectionActive = item.subItems?.some(subItem => checkIsActive(subItem));
    const isExpanded = nExpandedSection === item.name && !isCollapsed;

    if (item.subItems) {
      return (
        <div
          key={item.name}
          className="relative transition"
          onMouseEnter={() => setHoveredSection(item.name)}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <input
            className="peer hidden"
            type="checkbox"
            id={`menu-${item.name}`}
            checked={nExpandedSection === item.name}
            onChange={() => toggleSection(item.name)}
          />
          {isExpanded && (
            <div className={`absolute top-[48px] bottom-2 left-6 w-px  ${isSectionActive ? 'bg-custom-bg' : 'bg-gray-400'} vertical-connector-line`}></div>
          )}
          <button
            className={`flex peer relative w-full items-center py-4 px-4 text-sm font-medium leading-none outline-none transition-all duration-100 ease-in-out focus:outline-none border-0 m-0 appearance-none ${isSectionActive ? 'text-gray-900 font-bold' : 'text-caption hover:text-custom-bg'} ${isSectionActive ? 'border-l-4 border-custom-bg' : ''}`}
          >
            <span className={`h-full flex items-center justify-center ${isSectionActive ? 'text-custom-bg' : ''} mr-4 w-5`}>
              <Icon className="h-5 w-5 align-middle" />
            </span>
            {!isCollapsed && item.name}
            <label htmlFor={`menu-${item.name}`} className="absolute inset-0 h-full w-full cursor-pointer"></label>
          </button>

          {isCollapsed && (
            <div className={`absolute left-full top-0 ml-1 w-48 rounded-lg bg-white shadow-lg transition-all duration-200 ${isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
              <div className="py-2">
                {item.subItems.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const isSubActive = checkIsActive(subItem);
                  return (
                    <Link
                      key={subItem.name}
                      to={subItem.href}
                      className={`flex items-center px-4 py-2 text-sm ${isSubActive ? 'bg-gray-100 text-gray-900 font-bold' : 'text-caption hover:bg-gray-50 hover:text-custom-bg'}`}
                      onClick={isMobileOpen ? onClose : undefined}
                    >
                      <SubIcon className="mr-3 h-4 w-4" />
                      {subItem.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {!isCollapsed && (
            <ul className="duration-400 flex max-h-0 flex-col overflow-hidden rounded-xl bg-gray-100 font-medium transition-all duration-300 peer-checked:max-h-96">
              {item.subItems.map((subItem) => {
                const SubIcon = subItem.icon;
                const isSubActive = checkIsActive(subItem);
                const showArrow = isSectionActive;

                const arrowBaseClass = 'absolute top-1/2 left-6 w-3.5 h-px transform -translate-y-1/2';
                const arrowActiveClass = 'bg-custom-bg after:content-[\'\'] after:absolute after:left-full after:top-1/2 after:transform after:-translate-y-1/2 after:-ml-px after:border-t-[3px] after:border-t-transparent after:border-b-[3px] after:border-b-transparent after:border-l-[3px] after:border-l-custom-bg';
                const arrowInactiveClass = 'bg-gray-400 after:content-[\'\'] after:absolute after:left-full after:top-1/2 after:transform after:-translate-y-1/2 after:-ml-px after:border-t-[3px] after:border-t-transparent after:border-b-[3px] after:border-b-transparent after:border-l-[3px] after:border-l-gray-400';

                return (
                  <li key={subItem.name} className="relative">
                    <div
                      className={`${arrowBaseClass} ${isSubActive ? arrowActiveClass : arrowInactiveClass
                        }`}
                    ></div>

                    <Link
                      to={subItem.href}
                      className={`flex m-2 cursor-pointer py-2 pl-10 text-sm transition-all duration-100 ease-in-out ${isSubActive
                          ? 'text-custom-bg font-bold'
                          : 'text-caption  hover:text-custom-bg'
                        }`}
                      onClick={isMobileOpen ? onClose : undefined}
                    >
                      <span className="mr-5">
                        <SubIcon className="h-5 w-5" />
                      </span>
                      {subItem.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.href}
        className={`flex cursor-pointer items-center w-full py-4 px-4 text-sm font-medium leading-none outline-none transition-all duration-100 ease-in-out focus:outline-none border-0 m-0 ${isActive ? 'text-gray-900 font-bold' : 'text-caption hover:text-custom-bg'} ${isActive ? 'border-l-4 border-custom-bg' : ''}`}
        onClick={isMobileOpen ? onClose : undefined}
      >
        <span className={`h-full flex items-center justify-center mr-4 w-5 ${isActive ? 'text-custom-bg' : ''}`}>
          <Icon className="h-5 w-5 align-middle" />
        </span>
        {!isCollapsed && item.name}
        {!isCollapsed && item.badge && (
          <span className="ml-auto rounded-full bg-custom-bg px-2 text-xs text-white">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className={`h-screen bg-gray-100 ${isMobileOpen ? 'block' : 'hidden lg:block'}`}>
      <div className={`h-full transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-56'}`}>
        <div className="flex h-full flex-col bg-white shadow-md">
          <div className="bg-white">
            <div className="hidden md:flex items-center justify-end px-4 py-4">
              <button
                onClick={onToggle}
                className="rounded-lg p-2 text-caption hover:bg-gray-100 hover:text-custom-bg"
              >
                <AlignLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1">
            <nav className="h-full">
              {filteredNavigation.map((item) => renderNavigationItem(item))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;