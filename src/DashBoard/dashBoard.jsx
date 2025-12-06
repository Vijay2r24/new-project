import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Package,
  Users,
  Briefcase,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle
} from "lucide-react";
import { useTitle } from "../context/TitleContext";
import DashboardCharts from "./dashboardCharts";
import DateTimeRangePickerComponent from "../components/CustomDatePicker";

const Dashboard = () => {
  const { setTitle } = useTitle();
  
  // Initialize with current day start/end
  const [dateRange, setDateRange] = useState({
    start: dayjs().startOf('day'),
    end: dayjs().endOf('day'),
  });

  // Updated stats data for orders, users, employees, products
  const [dashboardStats, setDashboardStats] = useState({
    // Orders
    totalOrders: 1250,
    pendingOrders: 85,
    completedOrders: 1105,
    averageOrderValue: 1245.75,
    
    // Users
    totalUsers: 520,
    newUsers: 42,
    activeUsers: 385,
    
    // Employees
    totalEmployees: 85,
    activeEmployees: 78,
    onLeave: 7,
    
    // Products
    totalProducts: 2450,
    lowStock: 125,
    outOfStock: 32,
    
    // Financial
    totalRevenue: 1024500,
    todayRevenue: 45250,
  });

  const [highlights, setHighlights] = useState([
    {
      icon: <Package size={20} />,
      label: "Orders This Month",
      value: "245",
      change: "+12%",
      trend: "up",
      badgeColor: "bg-blue-100 text-blue-600 border-blue-200"
    },
    {
      icon: <Users size={20} />,
      label: "New Users",
      value: "42",
      change: "+8%",
      trend: "up",
      badgeColor: "bg-green-100 text-green-600 border-green-200"
    },
    {
      icon: <ShoppingBag size={20} />,
      label: "Best Selling Product",
      value: "Wireless Earbuds",
      badgeColor: "bg-purple-100 text-purple-600 border-purple-200"
    },
    {
      icon: <TrendingUp size={20} />,
      label: "Conversion Rate",
      value: "4.2%",
      change: "+0.5%",
      trend: "up",
      badgeColor: "bg-amber-100 text-amber-600 border-amber-200"
    },
    {
      icon: <Clock size={20} />,
      label: "Avg. Delivery Time",
      value: "2.4 days",
      change: "-0.3",
      trend: "down",
      badgeColor: "bg-indigo-100 text-indigo-600 border-indigo-200"
    },
    {
      icon: <DollarSign size={20} />,
      label: "Avg. Order Value",
      value: `₹${dashboardStats.averageOrderValue.toFixed(2)}`,
      change: "+5.2%",
      trend: "up",
      badgeColor: "bg-emerald-100 text-emerald-600 border-emerald-200"
    }
  ]);

  useEffect(() => {
    setTitle("Dashboard");
  }, [setTitle]);

  const getDisplayText = () => {
    if (!dateRange.start || !dateRange.end) return "Select Date Range";
    const formatStr = "MMM DD, YYYY HH:mm"; 
    return `${dateRange.start.format(formatStr)} - ${dateRange.end.format(formatStr)}`;
  };

  const handleClearDates = () => {
    setDateRange({ start: null, end: null });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
        </div>

        {/* Date Picker Section */}
        <div className="w-[340px]"> 
          <DateTimeRangePickerComponent
            dateRange={dateRange}
            setDateRange={setDateRange}
            displayText={getDisplayText()}
            handleClearDates={handleClearDates}
            allowFutureDates={true}
          />
        </div>
      </div>

      {/* Cards Grid - Row 1 */}
      <div className="grid grid-cols-4 gap-6 w-full max-lg:grid-cols-2 max-sm:grid-cols-1">
        {/* Orders Cards */}
        <CardBox
          title="Total Orders"
          value={dashboardStats.totalOrders.toLocaleString()}
          icon={<Package size={24} />}
          color="bg-blue-500"
          subtitle={`${dashboardStats.completedOrders} completed`}
        />
        <CardBox
          title="Pending Orders"
          value={dashboardStats.pendingOrders}
          icon={<Clock size={24} />}
          color="bg-amber-500"
          subtitle="Awaiting fulfillment"
        />
        
        {/* Users & Employees Cards */}
        <CardBox
          title="Total Users"
          value={dashboardStats.totalUsers}
          icon={<Users size={24} />}
          color="bg-green-500"
          subtitle={`${dashboardStats.activeUsers} active`}
        />
        <CardBox
          title="Employees"
          value={dashboardStats.totalEmployees}
          icon={<Briefcase size={24} />}
          color="bg-purple-500"
          subtitle={`${dashboardStats.onLeave} on leave`}
        />
      </div>

      {/* Cards Grid - Row 2 */}
      <div className="grid grid-cols-4 gap-6 w-full mt-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <CardBox
          title="Total Products"
          value={dashboardStats.totalProducts.toLocaleString()}
          icon={<ShoppingBag size={24} />}
          color="bg-indigo-500"
          subtitle={`${dashboardStats.lowStock} low stock`}
        />
        <CardBox
          title="Today's Revenue"
          value={`₹${dashboardStats.todayRevenue.toLocaleString()}`}
          icon={<DollarSign size={24} />}
          color="bg-emerald-500"
          subtitle="From 85 orders"
        />
        <CardBox
          title="Total Revenue"
          value={`₹${dashboardStats.totalRevenue.toLocaleString()}`}
          icon={<TrendingUp size={24} />}
          color="bg-teal-500"
          subtitle="All time"
        />
        <CardBox
          title="Order Completion"
          value={`${Math.round((dashboardStats.completedOrders / dashboardStats.totalOrders) * 100)}%`}
          icon={<CheckCircle size={24} />}
          color="bg-pink-500"
          subtitle="Success rate"
        />
      </div>

      <div className="w-full grid grid-cols-12 gap-6 mt-8">
        <div className="col-span-6">
          <DashboardCharts />
        </div>

        <div className="col-span-6">
          <h3 className="text-[20px] font-semibold text-gray-800 mb-5">
            Performance Highlights
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {highlights.map((item, index) => (
              <HighlightItem
                key={index}
                icon={item.icon}
                label={item.label}
                value={item.value}
                change={item.change}
                trend={item.trend}
                badgeColor={item.badgeColor}
              />
            ))}
          </div>
          
          {/* Quick Stats Section */}
          <div className="mt-6 p-5 bg-white rounded-xl border border-gray-200">
            <h4 className="text-[16px] font-semibold text-gray-800 mb-4">Quick Stats</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-[12px] text-gray-500 mb-1">Avg. Orders/Day</p>
                <p className="text-[18px] font-bold text-gray-800">42</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-[12px] text-gray-500 mb-1">User Growth</p>
                <p className="text-[18px] font-bold text-green-600">+8.2%</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-[12px] text-gray-500 mb-1">Inventory Value</p>
                <p className="text-[18px] font-bold text-gray-800">₹85.2L</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// Fixed CardBox component with proper alignment
const CardBox = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-200 transition-all hover:shadow-md">
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="text-[14px] text-gray-500 font-medium">{title}</p>
        <h2 className="text-[28px] font-bold text-gray-900 mt-1">{value}</h2>
      </div>
      <div className={`w-[44px] h-[44px] ${color} flex items-center justify-center text-white rounded-xl`}>
        {icon}
      </div>
    </div>
    {subtitle && (
      <p className="text-[13px] text-gray-400 pt-2 border-t border-gray-100">{subtitle}</p>
    )}
  </div>
);

// Fixed HighlightItem with proper alignment
const HighlightItem = ({ icon, label, value, change, trend, badgeColor }) => (
  <div className="flex items-center w-full p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer shadow-sm">
    <div className={`w-[46px] h-[46px] rounded-xl flex items-center justify-center border mr-4 flex-shrink-0 ${badgeColor}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] text-gray-500 truncate">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-[16px] font-semibold text-gray-800 truncate mr-2">{value}</p>
        {change && (
          <span className={`text-[12px] font-medium px-2 py-1 rounded ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} flex-shrink-0`}>
            {change}
          </span>
        )}
      </div>
    </div>
  </div>
);