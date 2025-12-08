import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  ShoppingCart,
  Package,
  Settings,
  AlignLeft,
  LayoutDashboard,
  ShieldCheck,
  BarChart2,
  UserCog,
  LogOut,
} from 'lucide-react';

const Sidebar = ({ onClose, isCollapsed, onToggle, isMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Get user data from localStorage
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  // Helper function to check if user has permission
  const hasPermission = (requiredPermission) => {
    if (!currentUser) return false;

    // Admin has all permissions
    if (currentUser.role === 'admin') return true;

    // Check if user has the required permission
    return currentUser.permissions && currentUser.permissions.includes(requiredPermission);
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userDetails');
    navigate('/');
  };

  // Define all navigation items with permissions
  const allNavigationItems = [
    { 
      name: t('SIDEBAR.DASHBOARD'), 
      href: '/dashboard/dashBoard', 
      icon: LayoutDashboard,
      permission: 'dashboard',
      relatedPaths: ['/dashboard/dashBoard']
    },
    {
      name: t('SIDEBAR.PRODUCT_MANAGEMENT'),
      href: '/products',
      icon: Package,
      permission: 'products',
      relatedPaths: ['/products', '/AddProuct', '/products/edit']
    },
    {
      name: t('SIDEBAR.ORDERS_MANAGEMENT'),
      href: '/orders/order-list',
      icon: ShoppingCart,
      permission: 'orders',
      relatedPaths: ['/orders', '/orders/order-list', '/orders/add', '/orders/edit']
    },
    {
      name: t('SIDEBAR.USER_MANAGEMENT'),
      href: '/users',
      icon: Users,
      permission: 'users',
      relatedPaths: ['/users', '/addUser', '/users/edit']
    },
    {
      name: t('SIDEBAR.ROLE_MANAGEMENT'),
      href: '/roles',
      icon: ShieldCheck,
      permission: 'roles',
      relatedPaths: ['/roles', '/roles/add', '/roles/edit']
    },
    {
      name: t('SIDEBAR.EMPLOYEE_MANAGEMENT'),
      href: '/employees/employee-list',
      icon: UserCog,
      permission: 'employees',
      relatedPaths: ['/employees', '/employees/employee-list', '/employees/add', '/employees/edit']
    },
  ];

  // Filter navigation items based on user permissions
  const filteredNavigation = allNavigationItems.filter(item => 
    hasPermission(item.permission)
  );

  // Improved isActive logic (ONLY CHANGE)
  const isActive = (href, relatedPaths = []) => {
    const currentPath = location.pathname;

    // Direct match
    if (currentPath === href) return true;

    // Child routes
    if (currentPath.startsWith(href)) return true;

    // Related paths matching
    return relatedPaths.some(path => currentPath.startsWith(path));
  };

  return (
    <div className={`h-screen bg-gray-100 ${isMobileOpen ? 'block' : 'hidden lg:block'}`}>
      <div
        className={`h-full transition-all duration-300 
        ${isCollapsed ? 'w-16' : 'w-56'}`}
      >
        <div className="flex h-full flex-col bg-white shadow-md">
          
          {/* Only the collapse button at the top - No user details */}
          <div className="flex items-center justify-end px-4 py-4">
            <button
              onClick={onToggle}
              className="rounded-lg p-2 text-caption hover:bg-gray-100 hover:text-custom-bg"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <AlignLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items - Simple List */}
          <nav className="flex-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.relatedPaths);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={isMobileOpen ? onClose : undefined}
                  className={`flex items-center py-4 px-4 text-sm font-medium transition-all 
                    ${active
                      ? 'text-gray-900 font-bold border-l-4 border-custom-bg bg-gray-50'
                      : 'text-caption hover:text-custom-bg hover:bg-gray-50'
                    }`}
                >
                  <span className={`mr-4 w-5 flex items-center justify-center ${active ? 'text-custom-bg' : ''}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  {!isCollapsed && item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
