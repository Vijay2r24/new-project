import { useState, useEffect } from "react";
import { Edit, Trash } from "lucide-react";
import Toolbar from "../../../components/Toolbar";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAttributeTypes } from "../../../context/AllDataContext";
import { showEmsg } from "../../../utils/ShowEmsg";
import Pagination from "../../../components/Pagination";
import { STATUS } from "../../../contants/constants";

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
      if (response.status === STATUS.SUCCESS_1) {
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
          {t("productSetup.attributeType.listTitle")}
        </h2>
      </div>

      {/* Search & Filter */}
      <div className="mb-6">
        <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          filterStatus={bShowFilter}
          setFilterStatus={setShowFilter}
          searchPlaceholder={t("productSetup.attributeType.searchPlaceholder")}
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
              {t("common.all")}
            </button>
            <button
              onClick={() => {
                setSelectedStatus("Active");
                setShowFilter(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              {t("common.active")}
            </button>
            <button
              onClick={() => {
                setSelectedStatus("Inactive");
                setShowFilter(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              {t("common.inactive")}
            </button>
          </div>
        )}
      </div>
      {bLoading && (
        <div className="text-center py-12 text-gray-500">
          {t("common.loading")}
        </div>
      )}

      {sError && !bLoading && (
        <div className="text-center py-12 text-red-500">
          {t("common.error")}: {sError}
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
                    {t("productSetup.attributeType.name")}
                  </th>
                  <th className="table-head-cell">
                    {t("productSetup.attributeType.code")}
                  </th>
                  <th className="table-head-cell">
                    {t("productSetup.attributeType.description")}
                  </th>
                  <th className="table-head-cell">
                    {t("productSetup.attributeType.attributes")}
                  </th>
                  <th className="table-head-cell">{t("common.status")}</th>
                  <th className="table-head-cell">
                    {t("common.updateStatus")}
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
                      <div className="text-sm text-gray-500">{type.Code}</div>
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
                        {t(`common.${type.IsActive ? "active" : "inactive"}`)}
                      </span>
                    </td>

                    <td className="table-cell table-cell-text">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={type.IsActive}
                          onChange={() =>
                            handleStatusChange(
                              type.AttributeTypeID,
                              type.IsActive
                            )
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

      {/* Empty State */}
      {!bLoading && !sError && aAttributeTypes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {t("productSetup.attributeType.emptyMessage")}
          </div>
          {sSearchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-[#5B45E0] hover:text-[#4c39c7]"
            >
              {t("common.clearSearch")}
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
