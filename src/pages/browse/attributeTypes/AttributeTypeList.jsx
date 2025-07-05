import { useState, useEffect } from "react";
import { Edit, Trash } from "lucide-react";
import Toolbar from "../../../components/Toolbar";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAttributeTypes } from "../../../context/AllDataContext";
import { showEmsg } from "../../../utils/ShowEmsg";
import Pagination from "../../../components/Pagination";
import { STATUS } from "../../../contants/constants";
import Switch from '../../../components/Switch';

const AttributeTypeList = () => {
  const [sSearchQuery, setSearchQuery] = useState("");
  const [bShowFilter, setShowFilter] = useState(false);
  const [sSelectedStatus, setSelectedStatus] = useState("");
  const { t } = useTranslation();

  const {
    data: aAttributeTypes,
    loading: bLoading,
    error: sError,
    total: iTotalItems,
    fetch: fetchAttributeTypes,
    toggleStatus: toggleAttributeTypeStatus,
  } = useAttributeTypes();

  const [iCurrentPage, setCurrentPage] = useState(1);
  const [iItemsPerPage] = useState(10);

  useEffect(() => {
    fetchAttributeTypes({
      pageNumber: iCurrentPage,
      pageSize: iItemsPerPage,
      searchText: sSearchQuery,
    });
  }, [iCurrentPage, iItemsPerPage, sSearchQuery]);

  const handleStatusChange = async (attributeTypeId, currentIsActive) => {
    try {
      const response = await toggleAttributeTypeStatus(
        attributeTypeId,
        !currentIsActive
      );
      if (response.status === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(response.message, "error");
      }
    } catch (error) {
      console.error("Error toggling attribute type status:", error);
      showEmsg("An unexpected error occurred.", "error");
    }
  };

  const filteredTypes = aAttributeTypes.filter((type) => {
    const matchesSearch = type.Name.toLowerCase().includes(
      sSearchQuery.toLowerCase()
    );

    const matchesStatus = sSelectedStatus
      ? type.IsActive === (sSelectedStatus === "Active")
      : true;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const iTotalPages = Math.ceil(iTotalItems / iItemsPerPage);
  const iIndexOfLastItem = iCurrentPage * iItemsPerPage;
  const iIndexOfFirstItem = iIndexOfLastItem - iItemsPerPage;
  const currentItems = aAttributeTypes;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {t("PRODUCT_SETUP.ATTRIBUTE_TYPE.LIST_TITLE")}
        </h2>
      </div>

      {/* Search & Filter */}
      <div className="mb-6">
        <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          filterStatus={bShowFilter}
          setFilterStatus={setShowFilter}
          searchPlaceholder={t(
            "PRODUCT_SETUP.ATTRIBUTE_TYPE.SEARCH_PLACEHOLDER"
          )}
          showSearch={true}
          showViewToggle={false}
          showFilterButton={true}
        />
        {bShowFilter && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              onClick={() => {
                setSelectedStatus("");
                setShowFilter(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              {t("COMMON.ALL")}
            </button>
            <button
              onClick={() => {
                setSelectedStatus("Active");
                setShowFilter(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              {t("COMMON.ACTIVE")}
            </button>
            <button
              onClick={() => {
                setSelectedStatus("Inactive");
                setShowFilter(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              {t("COMMON.INACTIVE")}
            </button>
          </div>
        )}
      </div>
      {bLoading && (
        <div className="text-center py-12 text-gray-500">
          {t("COMMON.LOADING")}
        </div>
      )}

      {sError && !bLoading && (
        <div className="text-center py-12 text-red-500">
          {t("COMMON.ERROR")}: {sError}
        </div>
      )}

      {/* Table */}
      {!bLoading && !sError && (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">
                    {t("PRODUCT_SETUP.ATTRIBUTE_TYPE.NAME")}
                  </th>
                  <th className="table-head-cell">
                    {t("PRODUCT_SETUP.ATTRIBUTE_TYPE.CODE")}
                  </th>
                  <th className="table-head-cell">
                    {t("PRODUCT_SETUP.ATTRIBUTE_TYPE.DESCRIPTION_LABEL")}
                  </th>
                  <th className="table-head-cell">
                    {t("PRODUCT_SETUP.ATTRIBUTE_TYPE.ATTRIBUTES")}
                  </th>
                  <th className="table-head-cell">{t("COMMON.STATUS")}</th>
                  <th className="table-head-cell">
                    {t("COMMON.UPDATE_STATUS")}
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
                {currentItems.map((type) => (
                  <tr key={type.AttributeTypeID} className="table-row">
                    <td className="table-cell table-cell-text">
                      <Link
                        to={`/browse/editattributetype/${type.AttributeTypeID}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {type.Name}
                      </Link>
                    </td>
                    <td className="table-cell">
                      <div className="text-secondary">{type.Code}</div>
                    </td>

                    <td className="table-cell">
                      <div className="text-sm text-gray-500">
                        {type.AttributeTypeDescription}
                      </div>
                    </td>

                    <td className="table-cell text-right table-cell-text">
                      <div className="text-sm text-gray-900 text-right">
                        {type.AttributeCount}
                      </div>
                    </td>

                    <td className="table-cell">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          type.IsActive ? "status-active" : "status-inactive"
                        }`}
                      >
                        {type.IsActive ? t("COMMON.ACTIVE") : t("COMMON.INACTIVE")}
                      </span>
                    </td>

                    <td className="table-cell table-cell-text">
                      <Switch checked={type.IsActive} onChange={() => handleStatusChange(type.AttributeTypeID, type.IsActive)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!bLoading && !sError && aAttributeTypes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {t("PRODUCT_SETUP.ATTRIBUTE_TYPE.EMPTY_MESSAGE")}
          </div>
          {sSearchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-[#5B45E0] hover:text-[#4c39c7]"
            >
              {t("COMMON.CLEAR_SEARCH")}
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {iTotalItems > 0 && !bLoading && (
        <Pagination
          currentPage={iCurrentPage}
          totalPages={iTotalPages}
          totalItems={iTotalItems}
          itemsPerPage={iItemsPerPage}
          handlePageClick={paginate}
          handlePrevPage={() => setCurrentPage((p) => (p > 1 ? p - 1 : p))}
          handleNextPage={() =>
            setCurrentPage((p) => (p < iTotalPages ? p + 1 : p))
          }
        />
      )}
    </div>
  );
};

export default AttributeTypeList;
