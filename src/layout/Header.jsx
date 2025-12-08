import React, { useRef, useState, useEffect } from "react";
import { Bell, Menu, Dot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { useTitle } from "../context/TitleContext";
import { fetchUserDetails, clearUserDetails } from "../store/slices/allDataSlice";
import user from "../../assets/images/user.jpg";

const aMockNotifications = [
  { id: 1, title: "Order #1234 delivered", time: "2 min ago" },
  { id: 2, title: "New user registered", time: "10 min ago" },
  { id: 3, title: "Stock running low for Laptop", time: "1 hour ago" },
];

const Header = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const { title, backButton } = useTitle();
  const dispatch = useDispatch();
  const { userDetails, userDetailsLoading, userDetailsError } = useSelector((state) => state.allData);
  
  const [bShowNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef();
  const dropdownRef = useRef();
  const [bShowProfileMenu, setbShowProfileMenu] = useState(false);
  const profileRef = useRef();
  const profileDropdownRef = useRef();
  const navigate = useNavigate();

  // Get user from localStorage on component mount
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  // Get user details from Redux store on component mount
  useEffect(() => {
    // Directly fetch user details when component mounts
    const storedUserDetails = localStorage.getItem("userDetails");
    if (storedUserDetails) {
      const parsedDetails = JSON.parse(storedUserDetails);
      dispatch(fetchUserDetails(parsedDetails.UserID));
    }
  }, [dispatch]);

  // Get profile image URL from the response
  const getProfileImageUrl = () => {
    if (!userDetails || !userDetails.ProfileImageUrl) return user;
    
    // Check if ProfileImageUrl is an array with at least one item
    if (Array.isArray(userDetails.ProfileImageUrl) && userDetails.ProfileImageUrl.length > 0) {
      return userDetails.ProfileImageUrl[0].documentUrl;
    }
    
    // Fallback to default image
    return user;
  };

  // Use currentUser from localStorage as fallback if Redux userDetails is not available
  const oUserDetails = userDetails || currentUser || {};

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }
    if (bShowNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [bShowNotifications]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setbShowProfileMenu(false);
      }
    }
    if (bShowProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [bShowProfileMenu]);

  const handleProfileMenuAction = (action) => {
    setbShowProfileMenu(false);
    setTimeout(() => {
      switch (action) {
        case "profile":
          navigate("pages/profile-details");
          break;
        case "logout":
          localStorage.removeItem("token");
          localStorage.removeItem("userDetails");
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userRole');
          dispatch(clearUserDetails());
          navigate("/");
          break;
        default:
          break;
      }
    }, 100);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        <div className="lg:hidden flex items-center">
          <button
            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center gap-2">
          {backButton}
          {title && (
            <h1 className="text-lg font-bold text-gray-900 truncate max-w-xs">
              {title}
            </h1>
          )}
        </div>
        <div className="relative flex items-center gap-3">
          <button
            ref={bellRef}
            className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setShowNotifications((v) => !v)}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </button>

          {bShowNotifications && (
            <div
              ref={dropdownRef}
              className="fixed right-4 sm:right-6 top-14 w-full max-w-xs sm:w-80 rounded-xl shadow-lg border border-gray-100 z-50 bg-white animate-fade-in"
            >
              <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 rounded-t-xl" />
              <div className="p-4 border-b font-semibold text-gray-800 flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-500" />
                {t("HEADER.NOTIFICATIONS")}
              </div>
              <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                {aMockNotifications.length === 0 ? (
                  <li className="p-4 text-gray-500 text-sm">
                    {t("HEADER.NO_NOTIFICATIONS")}
                  </li>
                ) : (
                  aMockNotifications.map((n) => (
                    <li
                      key={n.id}
                      className="flex items-start gap-3 p-4 hover:bg-blue-50/60 transition-colors cursor-pointer"
                    >
                      <Dot className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {n.title}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {n.time}
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
              <div className="p-3 text-center border-t bg-gray-50 rounded-b-xl">
                <a
                  href="/notifications"
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  {t("COMMON.VIEW_ALL")}
                </a>
              </div>
            </div>
          )}

          <div className="relative flex items-center gap-2 pl-2 sm:pl-3 border-l border-gray-200 ml-2 sm:ml-3">
            <button
              ref={profileRef}
              className="flex items-center focus:outline-none group"
              onClick={() => setbShowProfileMenu((v) => !v)}
              aria-label="Profile menu"
            >
              <div className="relative">
                <img
                  className="h-8 w-8 rounded-full border-2 border-gray-200 group-hover:border-blue-200 transition-colors"
                  src={getProfileImageUrl()}
                  alt="Profile"
                  onError={(e) => {
                    e.target.src = user;
                  }}
                />
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border border-white"></div>
              </div>
              <div className="hidden sm:block text-left ml-2">
                <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis">
                  {oUserDetails?.FirstName || oUserDetails?.name || 'User'} {oUserDetails?.LastName || ''}
                </div>
                <div className="text-xs text-gray-500 truncate max-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis">
                  {oUserDetails?.RoleName || oUserDetails?.role || 'Role'}
                </div>
              </div>
            </button>

            {bShowProfileMenu && (
              <div
                ref={profileDropdownRef}
                className="absolute right-0 top-12 w-56 rounded-lg shadow-xl border border-gray-100 z-50 bg-white animate-fade-in overflow-hidden"
              >
                <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-t border-l border-gray-100 rotate-45 z-10"></div>
                <div className="flex flex-col items-center pt-5 pb-3 px-4 border-b">
                  <img
                    className="h-14 w-14 rounded-full border border-gray-200 shadow-sm mb-2"
                    src={getProfileImageUrl()}
                    alt="Profile"
                    onError={(e) => {
                      e.target.src = user;
                    }}
                  />
                  <div className="text-sm font-semibold text-gray-900 text-center">
                    {oUserDetails?.FirstName || oUserDetails?.name || 'User'} {oUserDetails?.LastName || ''}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    {oUserDetails?.RoleName || oUserDetails?.role || 'Role'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {oUserDetails?.email || ''}
                  </div>
                </div>
                <div className="py-1">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    onClick={() => handleProfileMenuAction("profile")}
                  >
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {t("HEADER.YOUR_PROFILE")}
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                    onClick={() => handleProfileMenuAction("logout")}
                  >
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    {t("HEADER.LOGOUT")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;