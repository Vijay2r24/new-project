import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Toolbar from "../../../components/Toolbar";
import Pagination from "../../../components/Pagination";
import FullscreenErrorPopup from "../../../components/FullscreenErrorPopup";
import Switch from "../../../components/Switch";
import { useProductGroups } from "../../../context/AllDataContext";
import { STATUS } from "../../../contants/constants";
import {UPDATE_PRODUCT_GROUPSTATUS } from "../../../contants/apiRoutes";

const ITEMS_PER_PAGE = 10;

const ProductGroupList = ({ onCreate }) => {
  const { t } = useTranslation();
  const [sSearchQuery, setSearchQuery] = useState("");
  const [bShowFilters, setShowFilters] = useState(false);
  const [oFilters, setFilters] = useState({ status: "all" });
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [statusPopup, setStatusPopup] = useState({
    open: false,
    groupId: null,
    newStatus: null,
  });

  const {
    data: productGroupsData,
    loading,
    error,
    fetch: fetchProductGroups,
    updateStatusById,
    total: totalGroups,
  } = useProductGroups();

  useEffect(() => {
    const fetchData = () => {
      const params = {
        pageNumber: nCurrentPage,
        pageSize: ITEMS_PER_PAGE,
        searchText: sSearchQuery,
      };

      if (oFilters.status && oFilters.status !== "all") {
        params.IsActive = oFilters.status === "true" || oFilters.status === true;
      }

      fetchProductGroups(params);
    };

    fetchData();
  }, [nCurrentPage, sSearchQuery, oFilters.status]);

  const handleStatusChange = (groupId, currentIsActive) => {
    setStatusPopup({
      open: true,
      groupId,
      newStatus: !currentIsActive,
    });
  };

  const handleStatusConfirm = async () => {
    try {
      const { groupId, newStatus } = statusPopup;
      if (!groupId) return;

      // Create complete payload object
      const payload = {
        ProductGroupID: groupId,
        IsActive: Boolean(newStatus) // Ensure boolean value
      };

      const result = await updateStatusById(
        groupId,
        payload, // Send complete payload
        UPDATE_PRODUCT_GROUPSTATUS,
        "ProductGroupID"
      );

      if (result.status === STATUS.SUCCESS) {
        const params = {
          pageNumber: nCurrentPage,
          pageSize: ITEMS_PER_PAGE,
          searchText: sSearchQuery,
        };
        
        if (oFilters.status && oFilters.status !== "all") {
          params.IsActive = oFilters.status === "true" || oFilters.status === true;
        }
        
        fetchProductGroups(params);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setStatusPopup({ open: false, groupId: null, newStatus: null });
    }
  };

  const handleStatusPopupClose = () => {
    setStatusPopup({ open: false, groupId: null, newStatus: null });
  };

  const handleFilterChange = (e, filterName) => {
    setFilters({ ...oFilters, [filterName]: e.target.value });
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const filteredGroups = productGroupsData || [];
  const isEmpty = filteredGroups.length === 0 && !loading;

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        {error || t("COMMON.ERROR_FETCHING_DATA")}
      </div>
    );
  }

  return (
    <div className="product-group-list">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {t("PRODUCT_SETUP.PRODUCT_GROUPS.TITLE")}
        </h2>
      </div>

      <div className="mb-6">
        <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={handleSearchChange}
          showFilterDropdown={bShowFilters}
          setShowFilterDropdown={setShowFilters}
          searchPlaceholder={t("PRODUCT_SETUP.PRODUCT_GROUPS.SEARCH_PLACEHOLDER")}
          showSearch={true}
          showViewToggle={false}
          showFilterButton={true}
          onCreate={onCreate}
          createLabel={t("PRODUCT_SETUP.CREATE")}
          additionalFilters={
            bShowFilters
              ? [
                  {
                    label: t("COMMON.STATUS"),
                    name: "status",
                    value: oFilters.status,
                    options: [
                      { value: "all", label: t("COMMON.ALL") },
                      { value: true, label: t("COMMON.ACTIVE") },
                      { value: false, label: t("COMMON.INACTIVE") },
                    ],
                  },
                ]
              : []
          }
          handleFilterChange={bShowFilters ? handleFilterChange : undefined}
        />
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="table-base">
            <thead className="table-head">
              <tr>
                <th className="table-head-cell">
                  {t("PRODUCT_SETUP.PRODUCT_GROUPS.TABLE.NAME")}
                </th>
                <th className="table-head-cell">
                  {t("PRODUCT_SETUP.PRODUCT_GROUPS.TABLE.CODE")}
                </th>
                <th className="table-head-cell">{t("COMMON.STATUS")}</th>
                <th className="table-head-cell">{t("COMMON.UPDATE_STATUS")}</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredGroups.map((group) => (
                <tr key={group.ProductGroupID} className="table-row">
                  <td className="table-cell">
                    <Link
                      to={`/browse/editgroup/${group.ProductGroupID}`}
                      className="text-blue-600 hover:underline block truncate max-w-[180px]"
                      title={group.ProductGroupName}
                    >
                      {group.ProductGroupName}
                    </Link>
                  </td>
                  <td className="table-cell table-cell-subtext">
                    {group.ProductGroupCode}
                  </td>
                  <td className="table-cell">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        group.IsActive === true || group.IsActive === "true"
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      {t(
                        `COMMON.${
                          group.IsActive === true || group.IsActive === "true"
                            ? "ACTIVE"
                            : "INACTIVE"
                        }`
                      )}
                    </span>
                  </td>
                  <td className="table-cell" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={group.IsActive === true || group.IsActive === "true"}
                      onChange={() =>
                        handleStatusChange(
                          group.ProductGroupID,
                          group.IsActive === true || group.IsActive === "true"
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isEmpty && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {t("PRODUCT_SETUP.PRODUCT_GROUPS.EMPTY.MESSAGE")}
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

      <Pagination
        currentPage={nCurrentPage}
        totalPages={Math.ceil(totalGroups / ITEMS_PER_PAGE)}
        totalItems={totalGroups}
        itemsPerPage={ITEMS_PER_PAGE}
        handlePrevPage={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        handleNextPage={() =>
          setCurrentPage((prev) =>
            prev < Math.ceil(totalGroups / ITEMS_PER_PAGE) ? prev + 1 : prev
          )
        }
        handlePageClick={(page) => setCurrentPage(page)}
      />

      {statusPopup.open && (
        <FullscreenErrorPopup
          message={
            statusPopup.newStatus
              ? t("PRODUCT_SETUP.PRODUCT_GROUPS.CONFIRM_ACTIVATE")
              : t("PRODUCT_SETUP.PRODUCT_GROUPS.CONFIRM_DEACTIVATE")
          }
          onClose={handleStatusPopupClose}
          onConfirm={handleStatusConfirm}
        />
      )}
    </div>
  );
};

export default ProductGroupList;