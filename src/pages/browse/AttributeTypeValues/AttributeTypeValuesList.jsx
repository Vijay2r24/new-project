import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import CreateAttribute from "./CreateAttributeTypeValuesList";
import Toolbar from "../../../components/Toolbar";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAttributes } from "../../../context/AllDataContext";
import Pagination from "../../../components/Pagination";
import FullscreenErrorPopup from "../../../components/FullscreenErrorPopup";
import Switch from "../../../components/Switch";
import { showEmsg } from "../../../utils/ShowEmsg";
import { UPDATE_ATTRIBUTRE_VALUE_STATUS } from "../../../contants/apiRoutes";
import { ITEMS_PER_PAGE ,DEFAULT_PAGE, STATUS, STATUS_VALUES, STATUS_OPTIONS} from "../../../contants/constants";
import { hideLoaderWithDelay } from "../../../utils/loaderUtils";
import { fetchResource, updateStatusById, clearResourceError } from "../../../store/slices/allDataSlice";

const AttributeTypeValueList = ({ onCreate, onBack, setSubmitting }) => {
  const [sSearchQuery, setSearchQuery] = useState("");
  const [oFilters, setFilters] = useState({ status: STATUS_VALUES.ALL });
  const [bShowFilter, setShowFilter] = useState(false);
  const [bShowCreate, setShowCreate] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const {
    data: aAttributes = [],
    loading: bLoading = false,
    error: sError = null,
    total: iTotalItems = 0,
    pagination,
  } = useSelector((state) => state.allData.resources.attributes || {});

  const [iCurrentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [iItemsPerPage] = useState(ITEMS_PER_PAGE);

  const [bShowErrorPopup, setShowErrorPopup] = useState(false);
  const [sErrorMessage, setErrorMessage] = useState("");

  const [statusPopup, setStatusPopup] = useState({
    open: false,
    attributeId: null,
    newStatus: null,
  });

  const iTotalPages = Math.ceil(iTotalItems / iItemsPerPage);

  useEffect(() => {
    const params = {
      pageNumber: iCurrentPage,
      pageSize: iItemsPerPage,
      searchText: sSearchQuery,
    };
    if (oFilters.status !== STATUS_VALUES.ALL) {
      params.IsActive = oFilters.status;
    }
    dispatch(fetchResource({ key: "attributes", params }));
  }, [dispatch, iCurrentPage, iItemsPerPage, sSearchQuery, oFilters.status]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearResourceError("attributes"));
    };
  }, [dispatch]);

  const handleStatusChange = (attributeId, currentIsActive) => {
    setStatusPopup({ open: true, attributeId, newStatus: !currentIsActive });
  };

  const handleStatusConfirm = async () => {
    if (setSubmitting) setSubmitting(true);

    const { attributeId, newStatus } = statusPopup;
    try {
      const result = await dispatch(
        updateStatusById({
          key: "attributes",
          id: attributeId,
          newStatus,
          apiRoute: UPDATE_ATTRIBUTRE_VALUE_STATUS,
          idField: "AttributeID",
        })
      ).unwrap();

      showEmsg(result.message, result.status ||  STATUS.SUCCESS);
    } catch (err) {
      console.error(err);
      setErrorMessage(t("COMMON.API_ERROR"));
      setShowErrorPopup(true);
    } finally {
      setStatusPopup({ open: false, attributeId: null, newStatus: null });
      hideLoaderWithDelay(setSubmitting);

      // Refetch after update
      const params = {
        pageNumber: iCurrentPage,
        pageSize: iItemsPerPage,
        searchText: sSearchQuery,
      };
      if (oFilters.status !== STATUS_VALUES.ALL) {
        params.IsActive = oFilters.status;
      }
      dispatch(fetchResource({ key: "attributes", params }));
    }
  };


  const handleStatusPopupClose = () => {
    setStatusPopup({ open: false, attributeId: null, newStatus: null });
  };

  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
  };

  const handlePageClick = (pageNumber) => setCurrentPage(pageNumber);
  const handlePrevPage = () =>
    setCurrentPage((prev) => (prev > DEFAULT_PAGE ? prev - DEFAULT_PAGE : prev));
  const handleNextPage = () =>
    setCurrentPage((prev) => (prev < iTotalPages ? prev + DEFAULT_PAGE : prev));

  // Map STATUS_OPTIONS to the format expected by Toolbar component
  const statusFilterOptions = STATUS_OPTIONS.map(option => ({
    value: option.value,
    label: t(option.labelKey)
  }));

  if (bShowCreate) {
    return <CreateAttribute onBack={() => setShowCreate(false)} />;
  }

  return (
    <>
      <div className="relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            {t("PRODUCT_SETUP.ATTRIBUTES.TITLE")}
          </h2>
        </div>
        <div className="mb-6">
          <Toolbar
            searchTerm={sSearchQuery}
            setSearchTerm={setSearchQuery}
            showFilterDropdown={bShowFilter}
            setShowFilterDropdown={setShowFilter}
            searchPlaceholder={t("PRODUCT_SETUP.ATTRIBUTES.SEARCH_PLACEHOLDER")}
            showSearch={true}
            showViewToggle={false}
            showFilterButton={true}
            onCreate={onCreate}
            createLabel={t("PRODUCT_SETUP.CREATE")}
            additionalFilters={
              bShowFilter
                ? [
                  {
                    label: t("COMMON.STATUS"),
                    name: "status",
                    value: oFilters.status,
                    options: statusFilterOptions,
                  },
                ]
                : []
            }
            handleFilterChange={bShowFilter ? handleFilterChange : undefined}
          />
        </div>
        {/* Table */}
        {bLoading && (
          <div className="text-center py-12 text-gray-500">
            {t("COMMON.LOADING")}
          </div>
        )}

        {sError && !bLoading && (
          <div className="text-center py-12 text-red-500">{sError}</div>
        )}

        {!bLoading && !sError && (
          <div className="table-container">
            <div className="table-wrapper">
              <table className="table-base">
                <thead className="table-head">
                  <tr>
                    <th className="table-head-cell">
                      {t("PRODUCT_SETUP.ATTRIBUTES.TABLE.NAME")}
                    </th>
                    {/* <th className="table-head-cell">
                      {t("PRODUCT_SETUP.TABS.ATTRIBUTE_TYPES")}
                    </th> */}
                    <th className="table-head-cell">
                      {t("COMMON.UNIT")}
                    </th>
                    <th className="table-head-cell">{t("COMMON.STATUS")}</th>
                    <th className="table-head-cell">
                      {t("COMMON.UPDATE_STATUS")}
                    </th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {aAttributes.map((attribute) => (
                    <tr
                      key={attribute.AttributeValueID}
                      className={`table-row text-left ${!attribute.IsActive ? 'bg-gray-50' : ''}`}
                    >
                      <td className="table-cell table-cell-text">
                        {attribute.IsActive ? (
                          <Link
                            to={`/browse/editattribute/${attribute.AttributeValueID}`}
                            className="text-blue-600 hover:underline block truncate max-w-[180px]"
                            title={attribute.Value}
                          >
                            {attribute.Value}
                          </Link>
                        ) : (
                          <span 
                            className="text-gray-500 block truncate max-w-[180px] cursor-not-allowed"
                            title={t("PRODUCT_SETUP.ATTRIBUTES.EDIT_DISABLED_TOOLTIP")}
                          >
                            {attribute.Value}
                          </span>
                        )}
                      </td>
                      <td className={`table-cell table-cell-text ${!attribute.IsActive ? 'text-gray-400' : ''}`}>
                        <div
                          className="truncate max-w-[220px]"
                          title={attribute.Unit}
                        >
                          {attribute.Unit}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${attribute.IsActive ? "status-active" : "status-inactive"
                            }`}
                        >
                          {t(`COMMON.${attribute.IsActive ? "ACTIVE" : "INACTIVE"}`)}
                        </span>
                      </td>
                      <td className="table-cell table-cell-text">
                        <Switch
                          checked={attribute.IsActive}
                          onChange={() =>
                            handleStatusChange(attribute.AttributeValueID, attribute.IsActive) // ✅ correct
                          }
                        />

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {!bLoading && !sError && aAttributes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {t("PRODUCT_SETUP.ATTRIBUTES.EMPTY_MESSAGE")}
            </div>
            {(sSearchQuery || oFilters.status !== STATUS_VALUES.ALL) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilters({ status: STATUS_VALUES.ALL });
                }}
                className="mt-2 text-[#5B45E0] hover:text-[#4c39c7]"
              >
                {t("PRODUCT_SETUP.ATTRIBUTES.CLEAR_FILTERS_BTN")}
              </button>
            )}
          </div>
        )}
        {!bLoading && !sError && iTotalItems > 0 && (
          <Pagination
            itemsPerPage={iItemsPerPage}
            totalItems={iTotalItems}
            currentPage={iCurrentPage}
            totalPages={iTotalPages}
            handlePageClick={handlePageClick}
            handlePrevPage={handlePrevPage}
            handleNextPage={handleNextPage}
          />
        )}
      </div>
      {bShowErrorPopup && (
        <FullscreenErrorPopup
          message={sErrorMessage}
          onClose={() => setShowErrorPopup(false)}
        />
      )}
      {statusPopup.open && (
        <FullscreenErrorPopup
          message={
            statusPopup.newStatus
              ? t("PRODUCT_SETUP.ATTRIBUTES.CONFIRM_ACTIVATE")
              : t("PRODUCT_SETUP.ATTRIBUTES.CONFIRM_DEACTIVATE")
          }
          onClose={handleStatusPopupClose}
          onConfirm={handleStatusConfirm}
        />
      )}
    </>
  );
};

export default AttributeTypeValueList;