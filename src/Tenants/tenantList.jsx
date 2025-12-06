import { useState, useEffect, useCallback } from "react";
import { Mail, Phone, MapPin, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import ActionButtons from "../components/ActionButtons";
import { useTitle } from "../context/TitleContext";
import { ITEMS_PER_PAGE } from "../contants/constants"; 
import FullscreenErrorPopup from "../components/FullscreenErrorPopup";
import { showEmsg } from "../utils/ShowEmsg";
import { ToastContainer } from "react-toastify";
import Switch from "../components/Switch";
import userProfile from "../../assets/images/userProfile.svg";
import Loader from "../components/Loader";
import { hideLoaderWithDelay } from "../utils/loaderUtils";
import { useTenant } from "./tenantsContext";

const TenantList = () => {
  const navigate = useNavigate();
  const { setTitle } = useTitle();
  const { tenants: newTenants = [], updateTenant } = useTenant();
  
  // State Definitions matching Users component
  const [sSearchTerm, setSearchTerm] = useState("");
  const [sViewMode, setViewMode] = useState("table");
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [sShowFilterDropdown, setShowFilterDropdown] = useState(false);
  const [bSubmitting, setSubmitting] = useState(false);
  const [tableScrollTop, setTableScrollTop] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = ITEMS_PER_PAGE || 10;

  // Static Data (Merged with Context Data below)
  const staticTenants = [
    { id: 1, companyName: "Alpha Mart", tenantCode: "ALP001", email: "contact@alphamart.com", phone: "+91 9876543210", city: "Hyderabad", country: "India", status: "Active" },
    { id: 2, companyName: "Fashion Hub", tenantCode: "FHB991", email: "info@fashionhub.io", phone: "+1 202 555 0147", city: "New York", country: "USA", status: "Inactive" },
    { id: 3, companyName: "TechZone Electronics", tenantCode: "TZ1003", email: "support@techzone.com", phone: "+44 7700 900123", city: "London", country: "United Kingdom", status: "Active" },
    { id: 4, companyName: "GreenLeaf Organics", tenantCode: "GLO220", email: "hello@greenleaf.org", phone: "+61 412 345 678", city: "Sydney", country: "Australia", status: "Active" },
    { id: 5, companyName: "Urban Style Clothing", tenantCode: "USC511", email: "contact@urbanstyle.com", phone: "+1 303 555 0199", city: "Denver", country: "USA", status: "Inactive" },
  ];

  // Merge Context Tenants and Static Tenants
  const [mergedTenants, setMergedTenants] = useState([]);

  useEffect(() => {
    // Logic to merge newTenants (from context) and staticTenants
    // Preferring Context data if IDs collide
    const dynamicIds = new Set(newTenants.map(t => t.id));
    const remainingStatic = staticTenants.filter(t => !dynamicIds.has(t.id));
    setMergedTenants([...newTenants, ...remainingStatic]);
  }, [newTenants]);

  // Filters State
  const defaultFilters = { status: "all" }; // Can add 'country' or 'city' here if needed
  const [oFilters, setFilters] = useState(defaultFilters);

  // --- Filtering Logic ---
  const filteredTenants = mergedTenants.filter((tenant) => {
    const company = tenant.companyName?.toLowerCase() || "";
    const code = tenant.tenantCode?.toLowerCase() || "";
    const email = tenant.email?.toLowerCase() || "";
    const search = sSearchTerm.toLowerCase();

    const matchesSearch =
      company.includes(search) ||
      code.includes(search) ||
      email.includes(search);

    const matchesStatus =
      oFilters.status === "all" ||
      tenant.status === (oFilters.status === "Active" ? "Active" : "Inactive");
      // Note: Adjust the logic above depending on if your filter values are "Active"/"Inactive" or "true"/"false"

    return matchesSearch && matchesStatus;
  });

  // --- Pagination Logic ---
  const actualTotal = filteredTenants.length;
  const nTotalpages = Math.ceil(actualTotal / itemsPerPage);
  const startIndex = (nCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const tenantsData = filteredTenants.slice(startIndex, endIndex);
  const currentpagesize = Math.min(itemsPerPage, filteredTenants.length - startIndex);

  // --- Event Handlers ---
  const handleTableScroll = useCallback((e) => {
    setTableScrollTop(e.target.scrollTop);
  }, []);

  const getLogoUrl = (tenant) => {
    return tenant.Logo || tenant.logo || userProfile;
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const handleFilterChange = (e, filterName) => {
    setFilters({ ...oFilters, [filterName]: e.target.value });
    setCurrentPage(1);
  };

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, nTotalpages));
  const handlePageClick = (page) => setCurrentPage(page);

  // --- Status Popup Logic ---
  const [statusPopup, setStatusPopup] = useState({
    open: false,
    tenantId: null,
    newStatus: null,
    tenantData: null
  });

  const handleStatusChange = (tenant, isChecked) => {
    const newStatus = isChecked ? "Active" : "Inactive";
    setStatusPopup({ open: true, tenantId: tenant.id, newStatus, tenantData: tenant });
  };

  const handleStatusConfirm = async () => {
    setSubmitting(true);
    // Simulate API call delay
    setTimeout(() => {
      if (statusPopup.tenantData) {
        updateTenant({ ...statusPopup.tenantData, status: statusPopup.newStatus });
        showEmsg("Tenant status updated successfully", "success");
      }
      
      setStatusPopup({ open: false, tenantId: null, newStatus: null, tenantData: null });
      hideLoaderWithDelay(setSubmitting);
    }, 1000);
  };

  const handleStatusPopupClose = () =>
    setStatusPopup({ open: false, tenantId: null, newStatus: null, tenantData: null });

  // --- Initial Loader & Title ---
  useEffect(() => {
    setLoading(true);
    setTitle("Tenant List");
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [setTitle]);

  // Filter Options Configuration
  const statusOptions = [
    { value: "all", label: "All" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  const additionalFilters = [
    {
      label: "Status",
      name: "status",
      value: oFilters.status,
      options: statusOptions,
    },
  ];

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen bg-gray-50">
      {bSubmitting && (
        <div className="global-loader-overlay">
          <Loader />
        </div>
      )}
      <ToastContainer />

      {/* Reused Toolbar Component */}
      <Toolbar
        searchTerm={sSearchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={sViewMode}
        setViewMode={setViewMode}
        showFilterDropdown={sShowFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        additionalFilters={additionalFilters}
        handleFilterChange={handleFilterChange}
        searchPlaceholder="Search tenants..."
        onClearFilters={handleClearFilters}
        onCreate={() => navigate("/tenants/create")}
        createLabel="Create Tenant"
      />

      {/* TABLE VIEW */}
      {sViewMode === "table" ? (
        <div className="table-container-floating">
          <div
            className="table-wrapper-floating scrollbar-hide"
            onScroll={handleTableScroll}
          >
            <table className="table-base">
              <thead
                className={`table-head-floating ${
                  tableScrollTop > 10 ? "table-head-floating-shadow" : ""
                }`}
              >
                <tr>
                  <th className="table-head-cell-floating">Tenant</th>
                  <th className="table-head-cell-floating hidden sm:table-cell">Contact</th>
                  <th className="table-head-cell-floating hidden md:table-cell">Location</th>
                  <th className="table-head-cell-floating">Status</th>
                  <th className="table-head-cell-floating text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8">
                      <div className="flex justify-center items-center h-32">
                        <Loader className="h-8 w-8" />
                      </div>
                    </td>
                  </tr>
                ) : tenantsData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No tenants found
                    </td>
                  </tr>
                ) : (
                  tenantsData.map((item) => (
                    <tr key={item.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={getLogoUrl(item)}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = userProfile;
                              }}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="table-cell-text">
                              <span className="ellipsis-text">{item.companyName}</span>
                            </div>
                            <div className="table-cell-subtext">{item.tenantCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cellhidden sm:table-cell">
                        <div className="flex flex-col space-y-1">
                          <div className="table-cell-subtext flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="ellipsis-text">{item.email}</span>
                          </div>
                          <div className="table-cell-subtext flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            <span className="ellipsis-text">{item.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="table-cellhidden md:table-cell">
                         <div className="table-cell-subtext flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {item.city || item.address?.city || "-"}, {item.country || "-"}
                         </div>
                      </td>
                      <td className="table-cell">
                        <Switch
                          checked={item.status === "Active"}
                          onChange={(e) =>
                            handleStatusChange(item, e.target.checked)
                          }
                        />
                      </td>
                      <td className="table-cell text-center align-middle">
                        <ActionButtons
                          id={item.id}
                          viewLink={`/tenants/details/${item.id}`}
                          canDelete={false} 
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="flex justify-center items-center h-32">
                <Loader className="h-8 w-8" />
              </div>
            </div>
          ) : tenantsData.length === 0 ? (
            <div className="col-span-full text-center py-4">
              No tenants found
            </div>
          ) : (
            tenantsData.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-xl transition-shadow duration-200"
              >
                <div className="flex items-center gap-4 pb-2 border-b border-gray-100">
                  <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-full overflow-hidden">
                    <img
                      className="h-full w-full object-cover"
                      src={getLogoUrl(item)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = userProfile;
                      }}
                      alt=""
                    />
                  </div>
                  <div>
                    <div className="text-title font-bold text-gray-900">
                      {item.companyName}
                    </div>
                    <div className="text-secondary flex items-center mt-1">
                      <Shield className="h-4 w-4 mr-1" />
                      {item.tenantCode}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium mb-1">Location:</div>
                  <div className="truncate flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {item.city || "-"}, {item.country || "-"}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span
                    className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.status === "Active" ? "status-active" : "status-inactive"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-2">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span className="truncate max-w-[120px]" title={item.email}>
                      {item.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:ml-4">
                    <Phone className="h-4 w-4" />
                    <span>{item.phone}</span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 mt-2">
                  <ActionButtons
                    id={item.id}
                    viewLink={`/tenants/details/${item.id}`}
                    canDelete={false}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={nCurrentPage}
        totalpages={nTotalpages}
        totalItems={actualTotal}
        itemsPerPage={currentpagesize}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        handlePageClick={handlePageClick}
      />

      {statusPopup.open && (
        <FullscreenErrorPopup
          message={`Are you sure you want to set this tenant as ${statusPopup.newStatus}?`}
          onClose={handleStatusPopupClose}
          onConfirm={handleStatusConfirm}
        />
      )}
    </div>
  );
};

export default TenantList;