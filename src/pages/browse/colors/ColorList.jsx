import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResource, clearResourceError } from '../../../store/slices/allDataSlice';
import Toolbar from '../../../components/Toolbar';
import { useTranslation } from 'react-i18next';
import Pagination from '../../../components/Pagination';
import FullscreenErrorPopup from '../../../components/FullscreenErrorPopup';
import { ITEMS_PER_PAGE,DEFAULT_PAGE,STATUS_VALUES, STATUS_OPTIONS } from '../../../contants/constants';

const ColorList = ({ onCreate, onBack, setSubmitting }) => {
  const [sSearchQuery, setSearchQuery] = useState('');
  const [oFilters, setFilters] = useState({ status: STATUS_VALUES.ALL  });
  const [bShowFilters, setShowFilters] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Redux selectors
  const colorsState = useSelector((state) => state.allData.resources.colors);
  const aColors = colorsState?.data || [];
  const bLoading = colorsState?.loading || false;
  const sError = colorsState?.error || null;
  const iTotalItems = colorsState?.total || 0;

  const [nCurrentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [iItemsPerPage] = useState(ITEMS_PER_PAGE); 

  // Local state for optimistic UI updates (just keeping data in sync)
  const [localColors, setLocalColors] = useState(aColors || []);

  useEffect(() => {
    setLocalColors(aColors || []);
  }, [aColors]);

  // Fetch colors data
  useEffect(() => {
    const params = {
      pageNumber: nCurrentPage,
      pageSize: iItemsPerPage,
      searchText: sSearchQuery,
    };
    dispatch(fetchResource({ key: "colors", params }));
  }, [dispatch, nCurrentPage, iItemsPerPage, sSearchQuery]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      if (sError) {
        dispatch(clearResourceError("colors"));
      }
    };
  }, [sError, dispatch]);

  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (nCurrentPage < Math.ceil(iTotalItems / iItemsPerPage)) {
      setCurrentPage(prev => prev + DEFAULT_PAGE);
    }
  };

  const handlePrevPage = () => {
    if (nCurrentPage > DEFAULT_PAGE) {
      setCurrentPage(prev => prev - DEFAULT_PAGE);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">{t("PRODUCT_SETUP.COLORS.TITLE")}</h2>
      </div>

      <div className="mb-6">
        <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          showFilterDropdown={bShowFilters}
          setShowFilterDropdown={setShowFilters}
          searchPlaceholder={t("PRODUCT_SETUP.COLORS.SEARCH_PLACEHOLDER")}
          showSearch={true}
          showViewToggle={false}
          showFilterButton={false}
          onCreate={onCreate}
          createLabel={t("PRODUCT_SETUP.CREATE")}
          handleFilterChange={bShowFilters ? handleFilterChange : undefined}
        />
      </div>

      {bLoading ? (
        <div className="text-center py-8 text-gray-500">{t('COMMON.LOADING')}</div>
      ) : sError ? (
        <FullscreenErrorPopup
          message={sError}
          onClose={() => dispatch(clearResourceError("colors"))}
          showConfirmButton={false}
        />
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">{t("PRODUCT_SETUP.COLORS.TABLE.COLOR")}</th>
                  <th className="table-head-cell">{t("PRODUCT_SETUP.COLORS.TABLE.HEX_CODE")}</th>        
                </tr>
              </thead>
              <tbody className="table-body">
                {localColors.map((color) => (
                  <tr key={color.ColourID} className="table-row">
                    <td className="table-cell table-cell-text">
                      <div className="flex items-center">
                        <div
                          className="h-6 w-6 rounded-full mr-3 border border-gray-200"
                          style={{ backgroundColor: color.HexCode }}
                        />
                        <div className="text-sm font-medium text-gray-900">
                          {color.Name}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell table-cell-text text-secondary">{color.HexCode}</td>            
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {iTotalItems === 0 && !bLoading && !sError && (
        <div className="text-center py-12">
          <div className="text-gray-500">{t("PRODUCT_SETUP.COLORS.EMPTY.MESSAGE")}</div>
          {sSearchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilters({ status: STATUS_VALUES.ALL});
              }}
              className="mt-2 text-[#5B45E0] hover:text-[#4c39c7]"
            >
              {t("COMMON.CLEAR_SEARCH")}
            </button>
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

export default ColorList;
