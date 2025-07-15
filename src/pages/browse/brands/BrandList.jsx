import { useState, useEffect } from "react";
import CreateBrand from "./CreateBrand";
import Toolbar from "../../../components/Toolbar";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useBrands } from "../../../context/AllDataContext";
import Pagination from "../../../components/Pagination";
import { showEmsg } from "../../../utils/ShowEmsg";
import FullscreenErrorPopup from "../../../components/FullscreenErrorPopup";
import { UPDATE_BRAND_STATUS } from '../../../contants/apiRoutes';
import Switch from '../../../components/Switch';
import { ITEMS_PER_PAGE } from "../../../contants/constants";

const BrandList = () => {
  const [bShowCreate, setShowCreate] = useState(false);
  const [sSearchQuery, setSearchQuery] = useState("");
  const [bShowFilters, setShowFilters] = useState(false);
  const [oFilters, setFilters] = useState({ status: "all" });
  const { t } = useTranslation();
  const brands = useBrands();
  const aBrands = brands.data || [];
  const bLoading = brands.loading;
  const sError = brands.error;
  const iTotalItems = brands.total;
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [iItemsPerPage] = useState(ITEMS_PER_PAGE);
  const { updateStatusById } = useBrands();
  const [statusPopup, setStatusPopup] = useState({ open: false, brandId: null, newStatus: null });

  useEffect(() => {
    const params = {
      pageNumber: nCurrentPage,
      pageSize: iItemsPerPage,
      searchText: sSearchQuery,
    };
    if (oFilters.status && oFilters.status !== "all") {
      params.status = oFilters.status;
    }
    brands.fetch(params);
  }, [nCurrentPage, iItemsPerPage, sSearchQuery, oFilters.status]);

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (nCurrentPage < Math.ceil(iTotalItems / iItemsPerPage)) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (nCurrentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleStatusChange = (brandId, currentIsActive) => {
    setStatusPopup({ open: true, brandId, newStatus: !currentIsActive });
  };

  const handleStatusConfirm = async () => {
    const { brandId, newStatus } = statusPopup;
    const result = await updateStatusById(brandId, newStatus, UPDATE_BRAND_STATUS, 'BrandID');
    showEmsg(result.message, result.status);
    setStatusPopup({ open: false, brandId: null, newStatus: null });
  };

  const handleStatusPopupClose = () => {
    setStatusPopup({ open: false, brandId: null, newStatus: null });
  };

  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
  };

  if (bShowCreate) {
    return <CreateBrand onBack={() => setShowCreate(false)} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {t("PRODUCT_SETUP.BRANDS.HEADING")}
        </h2>
      </div>

      <div className="mb-6">
        <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          showFilterDropdown={bShowFilters}
          setShowFilterDropdown={setShowFilters}
          searchPlaceholder={t("PRODUCT_SETUP.BRANDS.SEARCH_PLACEHOLDER")}
          showSearch={true}
          showViewToggle={false}
          showFilterButton={true}
          additionalFilters={
            bShowFilters
              ? [
                  {
                    label: t("COMMON.STATUS"),
                    name: "status",
                    value: oFilters.status,
                    options: [
                      { value: "all", label: t("COMMON.ALL") },
                      { value: "Active", label: t("COMMON.ACTIVE") },
                      { value: "Inactive", label: t("COMMON.INACTIVE") },
                    ],
                  },
                ]
              : []
          }
          handleFilterChange={bShowFilters ? handleFilterChange : undefined}
        />
      </div>

      {bLoading ? (
        <div className="text-center py-8 text-gray-500">
          {t("COMMON.LOADING")}
        </div>
      ) : sError ? (
        <div className="text-center py-8 text-red-500">
          {t("COMMON.ERROR")} {sError}
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">
                    {t("PRODUCT_SETUP.BRANDS.TABLE.NAME")}
                  </th>
                  <th className="table-head-cell">{t("COMMON.STATUS")}</th>
                  <th className="table-head-cell">
                    {t("PRODUCT_SETUP.BRANDS.TABLE.CREATED_AT")}
                  </th>
                  <th className="table-head-cell">
                    {t("COMMON.UPDATE_STATUS")}
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
                {aBrands.map((brand) => (
                  <tr key={brand.BrandID} className="table-row items-center align-middle">
                    <td className="table-cell table-cell-text align-middle">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full border overflow-hidden bg-white">
                          {brand.BrandLogo ? (
                            <img
                              src={brand.BrandLogo.startsWith('http') ? brand.BrandLogo : `${process.env.REACT_APP_IMAGE_BASE_URL || ''}${brand.BrandLogo}`}
                              alt={brand.BrandName}
                              className="w-full h-full object-cover"
                              onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">{t("COMMON.NO_IMAGE")}</span>
                          )}
                        </div>
                        <Link
                          to={`/browse/editbrand/${brand.BrandID}`}
                          className="text-blue-600 hover:underline"
                        >
                          {brand.BrandName}
                        </Link>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          brand.Status === t("COMMON.ACTIVE")
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {brand.Status}
                      </span>
                    </td>
                    <td className="table-cell table-cell-text">
                      {new Date(brand.CreatedAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })}
                    </td>
                    <td className="table-cell table-cell-text text-blue-600 hover:underline cursor-pointer">
                      <Switch
                        checked={brand.Status === t("COMMON.ACTIVE")}
                        onChange={() => handleStatusChange(brand.BrandID, brand.Status === t("COMMON.ACTIVE"))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {bLoading === false && aBrands.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {sSearchQuery && (
            <div>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-[#5B45E0] hover:text-[#4c39c7]"
              >
                {t("COMMON.CLEAR_SEARCH")}
              </button>
            </div>
          )}
        </div>
      )}
      {iTotalItems > 0 && (
        <Pagination
          currentPage={nCurrentPage}
          totalPages={Math.ceil(iTotalItems / iItemsPerPage)}
          totalItems={iTotalItems}
          itemsPerPage={iItemsPerPage}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
          handlePageClick={handlePageClick}
        />
      )}

      {statusPopup.open && (
        <FullscreenErrorPopup
          message={statusPopup.newStatus ? t("PRODUCT_SETUP.BRANDS.CONFIRM_ACTIVATE") : t("PRODUCT_SETUP.BRANDS.CONFIRM_DEACTIVATE")}
          onClose={handleStatusPopupClose}
           onConfirm={handleStatusConfirm}
        />
      )}
    </div>
  );
};

export default BrandList;
