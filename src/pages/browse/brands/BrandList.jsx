import { useState, useEffect } from "react";
import CreateBrand from "./CreateBrand";
import Toolbar from "../../../components/Toolbar";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useBrands } from "../../../context/AllDataContext";
import Pagination from "../../../components/Pagination";
import { showEmsg } from "../../../utils/ShowEmsg";
import { STATUS } from "../../../contants/constants";

const BrandList = () => {
  const [bShowCreate, setShowCreate] = useState(false);
  const [sSearchQuery, setSearchQuery] = useState("");
  const [bShowFilters, setShowFilters] = useState(false);
  const [sStatusFilter, setStatusFilter] = useState("");
  const { t } = useTranslation();
  const brands = useBrands();
  const aBrands = brands.data || [];
  const bLoading = brands.loading;
  const sError = brands.error;
  const fetchBrands = brands.fetch;
  const iTotalItems = brands.total;
  const toggleBrandStatus = brands.toggleStatus;
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [iItemsPerPage] = useState(10);
  useEffect(() => {
    brands.fetch({
      pageNumber: nCurrentPage,
      pageSize: iItemsPerPage,
      searchText: sSearchQuery,
    });
  }, [nCurrentPage, iItemsPerPage, sSearchQuery]);

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

  const handleStatusChange = async (brandId, currentIsActive) => {
    try {
      const response = await toggleBrandStatus(brandId, !currentIsActive, {
        pageNumber: nCurrentPage,
        pageSize: iItemsPerPage,
        searchText: sSearchQuery,
      });
      if (response.status === STATUS.ERROR) {
        showEmsg(response.message || t('PRODUCT_SETUP.BRANDS.STATUS_UPDATE_ERROR'), STATUS.ERROR);
      } else {
        showEmsg(response.message || t('PRODUCT_SETUP.BRANDS.STATUS_UPDATE_SUCCESS'), STATUS.SUCCESS);
        fetchBrands({
          pageNumber: nCurrentPage,
          pageSize: iItemsPerPage,
          searchText: sSearchQuery,
        });
      }
    } catch (error) {
      showEmsg(t('PRODUCT_SETUP.BRANDS.UNEXPECTED_ERROR'),STATUS.ERROR);
    }
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
          filterStatus={bShowFilters}
          setFilterStatus={setShowFilters}
          searchPlaceholder={t("PRODUCT_SETUP.BRANDS.SEARCH_PLACEHOLDER")}
          showSearch={true}
          showViewToggle={false}
          showFilterButton={true}
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
                  <th className="table-head-cell">
                    {t("PRODUCT_SETUP.BRANDS.TABLE.LOGO")}
                  </th>
                  <th className="table-head-cell">
                    {t("COMMON.STATUS")}
                  </th>
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
                  <tr key={brand.BrandID} className="table-row">
                    <td className="table-cell table-cell-text">
                      <Link
                        to={`/browse/editbrand/${brand.BrandID}`}
                        className="text-blue-600 hover:underline"
                      >
                        {brand.BrandName}
                      </Link>
                    </td>
                    <td className="table-cell">
                      <div className="h-10 w-10 flex items-center justify-center rounded-full border overflow-hidden">
                        <img
                          src={brand.BrandLogo}
                          alt={brand.BrandName}
                          className="max-w-[70%] max-h-[70%] object-contain"
                        />
                      </div>
                    </td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          brand.IsActive ? "status-active" : "status-inactive"
                        }`}
                      >
                        {brand.IsActive
                          ? t("COMMON.ACTIVE")
                          : t("COMMON.INACTIVE")}
                      </span>
                    </td>
                    <td className="table-cell table-cell-text">
                      {new Date(brand.CreatedAt).toLocaleDateString()}
                    </td>
                    <td className="table-cell table-cell-text text-blue-600 hover:underline cursor-pointer">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          value=""
                          className="sr-only peer"
                          checked={brand.IsActive}
                          onChange={() =>
                            handleStatusChange(brand.BrandID, brand.IsActive)
                          }
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900"></span>
                      </label>
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
    </div>
  );
};

export default BrandList;
