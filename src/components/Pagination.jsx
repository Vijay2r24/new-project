import { useTranslation } from "react-i18next";
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  handlePrevPage,
  handleNextPage,
  handlePageClick,
}) => {
   const { t } = useTranslation();
  return (
    <div className="px-6 py-4 border-t border-gray-100 print:px-3 print:py-2 print:border-t print:border-gray-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="text-sm text-gray-500 print:text-xs">
          {t('common.showing')}<span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> {t('common.of')}{' '}
          <span className="font-medium">{totalItems}</span> {t('common.results')}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="pagination-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
           {t('common.previous')}
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx + 1}
              className={`pagination-btn${currentPage === idx + 1 ? ' pagination-btn-active' : ''}`}
              onClick={() => handlePageClick(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button
            className="pagination-btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
           {t('common.next')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination; 