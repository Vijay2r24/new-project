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
        <div className="text-secondary print:text-xs">
          {t("COMMON.SHOWING")}
          <span className="font-medium">
            {(currentPage - 1) * itemsPerPage + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>{" "}
          {t("COMMON.OF")} <span className="font-medium">{totalItems}</span>{" "}
          {t("COMMON.RESULTS")}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="pagination-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            {t("COMMON.PREVIOUS")}
          </button>
          {/* Show only a limited set of page numbers */}
          {(() => {
            const pageButtons = [];
            const maxVisible = 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
            let endPage = startPage + maxVisible - 1;
            if (endPage > totalPages) {
              endPage = totalPages;
              startPage = Math.max(1, endPage - maxVisible + 1);
            }
            if (startPage > 1) {
              pageButtons.push(
                <button key={1} className={`pagination-btn${currentPage === 1 ? " pagination-btn-active" : ""}`} onClick={() => handlePageClick(1)}>
                  1
                </button>
              );
              if (startPage > 2) {
                pageButtons.push(<span key="start-ellipsis" className="px-2">...</span>);
              }
            }
            for (let i = startPage; i <= endPage; i++) {
              pageButtons.push(
                <button
                  key={i}
                  className={`pagination-btn${currentPage === i ? " pagination-btn-active" : ""}`}
                  onClick={() => handlePageClick(i)}
                >
                  {i}
                </button>
              );
            }
            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pageButtons.push(<span key="end-ellipsis" className="px-2">...</span>);
              }
              pageButtons.push(
                <button key={totalPages} className={`pagination-btn${currentPage === totalPages ? " pagination-btn-active" : ""}`} onClick={() => handlePageClick(totalPages)}>
                  {totalPages}
                </button>
              );
            }
            return pageButtons;
          })()}
          <button
            className="pagination-btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            {t("COMMON.NEXT")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
