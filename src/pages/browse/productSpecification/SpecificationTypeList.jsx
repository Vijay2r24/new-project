import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchResource, clearResourceError, updateStatusById } from "../../../store/slices/allDataSlice";
import Toolbar from "../../../components/Toolbar";
import { useTranslation } from "react-i18next";
import Pagination from "../../../components/Pagination";
import { showEmsg } from "../../../utils/ShowEmsg";
import FullscreenErrorPopup from "../../../components/FullscreenErrorPopup";
import { CREATE_OR_UPDATE_SPECIFICATION_TYPE, GET_SPECIFICATION_TYPE_ID, UPDATE_SPECIFICATION_TYPE_STATUS } from "../../../contants/apiRoutes";
import Switch from "../../../components/Switch";
import { ITEMS_PER_PAGE, DEFAULT_PAGE, STATUS, FORM_MODES, STATUS_VALUES, STATUS_OPTIONS } from "../../../contants/constants";
import { hideLoaderWithDelay } from "../../../utils/loaderUtils";
import { apiPost, apiGet } from "../../../utils/ApiUtils";
import ActionButtons from "../../../components/ActionButtons";

const SpecificationTypeList = ({ setSubmitting }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const [sSearchQuery, setSearchQuery] = useState(""); // Search input
  const [bShowFilters, setShowFilters] = useState(false); // Toggle filter dropdown
  const [oFilters, setFilters] = useState({ status: STATUS_VALUES.ALL }); // Filters applied on table

  // Redux state for specification types
  const specificationTypesState = useSelector((state) => state.allData.resources.specificationType);
  const aSpecificationTypes = specificationTypesState?.data || [];
  const bLoading = specificationTypesState?.loading || false;
  const sError = specificationTypesState?.error;
  const iTotalItems = specificationTypesState?.total || 0;

  // Pagination state
  const [nCurrentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [iItemsPerPage] = useState(ITEMS_PER_PAGE);

  // Status popup state (for confirmation when toggling Active/Inactive)
  const [statusPopup, setStatusPopup] = useState({
    open: false,
    specificationTypeId: null,
    newStatus: null,
  });

  // Create/Edit form state
  const [editForm, setEditForm] = useState({
    open: false,
    mode: FORM_MODES.CREATE,
    specificationTypeId: null,
    name: "",
    originalData: null,
  });

  // Fetch specification types whenever search, page, or filters change
  useEffect(() => {
    const params = {
      pageNumber: nCurrentPage,
      pageSize: iItemsPerPage,
      searchText: sSearchQuery,
    };
    if (oFilters.status !== STATUS_VALUES.ALL) {
      params.IsActive = oFilters.status;
    }
    
    dispatch(fetchResource({ key: "specificationType", params }));
  }, [dispatch, nCurrentPage, iItemsPerPage, sSearchQuery, oFilters.status]);

  // Clear error when unmounting
  useEffect(() => {
    return () => {
      if (sError) {
        dispatch(clearResourceError("specificationType"));
      }
    };
  }, [dispatch, sError]);

  // Open confirmation popup when toggling Active/Inactive
  const handleStatusChange = (specificationTypeId, currentStatus) => {
    // FIX: currentStatus is a boolean, not a string
    const isCurrentlyActive = Boolean(currentStatus);
    setStatusPopup({ 
      open: true, 
      specificationTypeId,
      newStatus: !isCurrentlyActive 
    });
  };

  // Close status popup
  const handleStatusPopupClose = () => {
    setStatusPopup({ open: false, specificationTypeId: null, newStatus: null });
  };

  // Pagination controls
  const handlePageClick = (pageNumber) => setCurrentPage(pageNumber);
  const handleNextPage = () => {
    if (nCurrentPage < Math.ceil(iTotalItems / iItemsPerPage)) {
      setCurrentPage((prev) => prev + DEFAULT_PAGE);
    }
  };
  const handlePrevPage = () => {
    if (nCurrentPage > DEFAULT_PAGE) {
      setCurrentPage((prev) => prev - DEFAULT_PAGE);
    }
  };

  // Update filters
  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
  };

  // Open "create" form
  const handleCreate = () => {
    setEditForm({
      open: true,
      mode: FORM_MODES.CREATE,
      specificationTypeId: null,
      name: "",
      originalData: null,
    });
  };

  // Open "edit" form and fetch latest data by ID
  const handleEdit = async (specificationType) => {
    if (setSubmitting) setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await apiGet(
        `${GET_SPECIFICATION_TYPE_ID}/${specificationType.SpecificationTypeID}`,
        {},
        token
      );
      
      if (response?.data?.status === STATUS.SUCCESS.toUpperCase()) {
        setEditForm({
          open: true,
          mode: FORM_MODES.EDIT,
          specificationTypeId: specificationType.SpecificationTypeID,
          name: response.data.data.Name || specificationType.Name,
          originalData: specificationType,
        });
      } else {
        showEmsg(response?.data?.message || t("CONTEXT.ERROR_FETCHING_SPECIFICATION_TYPE"), STATUS.ERROR);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err?.response?.data?.message || t("COMMON.API_ERROR");
      showEmsg(errorMessage, STATUS.ERROR);
    } finally {
      hideLoaderWithDelay(setSubmitting);
    }
  };

  // Handle text input change for form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission (create or update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (setSubmitting) setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const payload = { Name: editForm.name };
      
      if (editForm.mode === FORM_MODES.EDIT) {
        payload.SpecificationTypeID = editForm.specificationTypeId;
      }

      const response = await apiPost(
        CREATE_OR_UPDATE_SPECIFICATION_TYPE,
        payload,
        token
      );

      if (response?.data?.status === STATUS.SUCCESS.toUpperCase()) {
        const successMessage = response?.data?.message || 
          (editForm.mode === FORM_MODES.CREATE 
            ? t("PRODUCT_SETUP.SPECIFICATION_TYPES.CREATE_SUCCESS") 
            : t("PRODUCT_SETUP.SPECIFICATION_TYPES.UPDATE_SUCCESS"));
      
        showEmsg(successMessage, STATUS.SUCCESS);
        
        const params = {
          pageNumber: nCurrentPage,
          pageSize: iItemsPerPage,
          searchText: sSearchQuery,
        };
        if (oFilters.status !== STATUS_VALUES.ALL) {
          params.status = oFilters.status;
        }
        dispatch(fetchResource({ key: "specificationType", params }));
        
        setEditForm({
          open: false,
          mode: FORM_MODES.CREATE,
          specificationTypeId: null,
          name: "",
          originalData: null,
        });
      } else {
        showEmsg(response?.data?.message || t("CONTEXT.ERROR_SAVING_SPECIFICATION_TYPE"), STATUS.ERROR);
      }
      
    } catch (err) {
      console.error(err);
      const errorMessage = err?.response?.data?.message || t("COMMON.API_ERROR");
      showEmsg(errorMessage, STATUS.ERROR);
    } finally {
      hideLoaderWithDelay(setSubmitting);
    }
  };

  // Cancel form action
  const handleFormCancel = () => {
    setEditForm({
      open: false,
      mode: FORM_MODES.CREATE,
      specificationTypeId: null,
      name: "",
      originalData: null,
    });
  };

  // Check if a row is currently being edited
  const isEditing = (specificationTypeId) => {
    return editForm.open && editForm.mode === FORM_MODES.EDIT && editForm.specificationTypeId === specificationTypeId;
  };

  // Get current status for row being edited
  const getCurrentStatus = (specificationTypeId) => {
    if (isEditing(specificationTypeId) && editForm.originalData) {
      return editForm.originalData.IsActive;
    }
    return null;
  };

  const handleStatusConfirm = async () => {
    if (setSubmitting) setSubmitting(true);
    const { specificationTypeId, newStatus } = statusPopup;
    
    try {
      const result = await dispatch(
        updateStatusById({
          key: "specificationType",
          id: specificationTypeId,
          newStatus,
          apiRoute: UPDATE_SPECIFICATION_TYPE_STATUS,
          idField: "SpecificationTypeID",
        })
      ).unwrap();
  
      showEmsg(result.message, STATUS.SUCCESS);
  
      const params = {
        pageNumber: nCurrentPage,
        pageSize: iItemsPerPage,
        searchText: sSearchQuery,
      };
      if (oFilters.status !== STATUS_VALUES.ALL) {
        params.IsActive = oFilters.status;
      }
      dispatch(fetchResource({ key: "specificationType", params }));
    } catch (err) {
      console.error(err);
      showEmsg(err?.message || t("COMMON.API_ERROR"), STATUS.ERROR);
    } finally {
      setStatusPopup({ open: false, specificationTypeId: null, newStatus: null });
      hideLoaderWithDelay(setSubmitting);
    }
  };

  // Prepare status options using STATUS_OPTIONS from constants
  const statusFilterOptions = STATUS_OPTIONS.map(option => ({
    value: option.value,
    label: t(option.labelKey)
  }));

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {t("PRODUCT_SETUP.SPECIFICATION_TYPES.TITLE")}
        </h2>
      </div>
      
      {/* Toolbar with search and filters */}
      <div className="mb-6">
        <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          showFilterDropdown={bShowFilters}
          setShowFilterDropdown={setShowFilters}
          searchPlaceholder={t("PRODUCT_SETUP.SPECIFICATION_TYPES.SEARCH_PLACEHOLDER")}
          showSearch={true}
          showViewToggle={false}
          showFilterButton={true}
          onCreate={handleCreate}
          createLabel={t("PRODUCT_SETUP.CREATE")}
          additionalFilters={
            bShowFilters
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
          handleFilterChange={bShowFilters ? handleFilterChange : undefined}
        />
      </div>

      {/* Loading/Error states */}
      {bLoading ? (
        <div className="text-center py-8 text-gray-500">
          {t("COMMON.LOADING")}
        </div>
      ) : sError ? (
        <div className="text-center py-8 text-red-500">
          {t("COMMON.ERROR")}: {sError}
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">{t("PRODUCT_SETUP.SPECIFICATION_TYPES.TABLE.NAME")}</th>
                  <th className="table-head-cell">{t("COMMON.CREATED_AT")}</th>
                  <th className="table-head-cell">{t("COMMON.STATUS")}</th>
                  <th className="table-head-cell">{t("COMMON.UPDATE_STATUS")}</th>
                  <th className="table-head-cell">{t("COMMON.ACTIONS")}</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {/* Create row */}
                {editForm.open && editForm.mode === FORM_MODES.CREATE && (
                  <tr className="table-row bg-blue-50">
                    <td className="table-cell">
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={t("PRODUCT_SETUP.SPECIFICATION_TYPES.NAME_PLACEHOLDER")}
                        required
                      />
                    </td>
                    <td className="table-cell table-cell-text">-</td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium status-active">
                        {t("COMMON.ACTIVE")}
                      </span>
                    </td>
                    <td className="table-cell table-cell-text">
                      <Switch checked={true} disabled={true} />
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button onClick={handleFormSubmit} className="btn-primary py-1 px-3 text-sm">
                          {t("COMMON.SAVE")}
                        </button>
                        <button onClick={handleFormCancel} className="btn-cancel py-1 px-3 text-sm">
                          {t("COMMON.CANCEL")}
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                
                {/* List all specification types */}
                {aSpecificationTypes.map((specType) => {
                  const editing = isEditing(specType.SpecificationTypeID);
                  const currentStatus = editing ? getCurrentStatus(specType.SpecificationTypeID) : specType.IsActive;
                  
                  return (
                    <tr key={specType.SpecificationTypeID} className={`table-row ${editing ? "bg-blue-50" : ""}`}>
                      {/* Name column */}
                      <td className="table-cell">
                        {editing ? (
                          <input
                            type="text"
                            name="name"
                            value={editForm.name}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder={t("PRODUCT_SETUP.SPECIFICATION_TYPES.NAME_PLACEHOLDER")}
                            required
                          />
                        ) : (
                          <div 
                            className="block truncate max-w-[180px]"
                            title={specType.Name}
                          >
                            {specType.Name}
                          </div>
                        )}
                      </td>

                      {/* Created At column */}
                      <td className="table-cell table-cell-text">
                        {specType.CreatedAt ? new Date(specType.CreatedAt).toLocaleString(undefined, {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }) : "-"}
                      </td>
                   
                      {/* Status */}
                      <td className="table-cell">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus ? "status-active" : "status-inactive"}`}
                        >
                          {t(`COMMON.${currentStatus ? "ACTIVE" : "INACTIVE"}`)}
                        </span>
                      </td>

                      {/* Toggle status */}
                      <td className="table-cell table-cell-text">
                        <Switch
                          checked={Boolean(currentStatus)} // Ensure it's a boolean
                          onChange={() => handleStatusChange(specType.SpecificationTypeID, currentStatus)}
                          disabled={editing}
                        />
                      </td>

                      {/* Actions */}
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          {editing ? (
                            <>
                              <button onClick={handleFormSubmit} className="btn-primary py-1 px-3 text-sm">
                                {t("COMMON.SAVE")}
                              </button>
                              <button onClick={handleFormCancel} className="btn-cancel py-1 px-3 text-sm">
                                {t("COMMON.CANCEL")}
                              </button>
                            </>
                          ) : (
                            <ActionButtons
                              id={specType.SpecificationTypeID}
                              className="mr-10" 
                              onEdit={() => handleEdit(specType)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {!bLoading && !sError && aSpecificationTypes.length === 0 && !editForm.open && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {t("PRODUCT_SETUP.SPECIFICATION_TYPES.EMPTY.MESSAGE")}
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
      
      {/* Confirmation popup for status change */}
      {statusPopup.open && (
        <FullscreenErrorPopup
          message={
            statusPopup.newStatus
              ? t("PRODUCT_SETUP.SPECIFICATION_TYPES.CONFIRM_ACTIVATE")
              : t("PRODUCT_SETUP.SPECIFICATION_TYPES.CONFIRM_DEACTIVATE")
          }
          onClose={handleStatusPopupClose}
          onConfirm={handleStatusConfirm}
        />
      )}
    </div>
  );
};

export default SpecificationTypeList;