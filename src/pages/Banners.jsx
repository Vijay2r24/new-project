import { useState, useEffect } from "react";
import { Plus, MoreVertical, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiGet, apiPatch } from "../utils/ApiUtils";
import { GET_ALL_BANNERS, UPDATE_BANNER_STATUS } from "../contants/apiRoutes";
import { showEmsg } from "../utils/ShowEmsg";
import { useTitle } from "../context/TitleContext";
import { ITEMS_PER_PAGE, STATUS } from "../contants/constants";
import FullscreenErrorPopup from "../components/FullscreenErrorPopup";
import { ToastContainer } from "react-toastify";
import noImage from "../../assets/images/missing-pictur.jpg";

const Banners = () => {
  const [aBanners, setBanners] = useState([]);
  const [nPage, setPage] = useState(1);
  const rowsPerPage = ITEMS_PER_PAGE;
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [nActiveMenu, setActiveMenu] = useState(null);
  const [sError, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const [statusPopup, setStatusPopup] = useState({
    open: false,
    id: null,
    currentStatus: null,
  });

  useEffect(() => {
    setTitle("Banners");
    return () => setTitle("");
  }, [setTitle]);

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem("token");
      const oResponse = await apiGet(
        GET_ALL_BANNERS,
        { page: nPage, limit: rowsPerPage },
        token
      );
      if (
        oResponse.data &&
        oResponse.data.STATUS === STATUS.SUCCESS.toUpperCase()
      ) {
        const bannerData = oResponse.data.data?.data || [];
        setBanners(bannerData);
        setTotalPages(oResponse.data.data?.totalPages || 1);
        setTotalRecords(oResponse.data.data?.totalRecords || 0);
        setError(null);
      } else {
        setBanners([]);
        setTotalPages(1);
        setTotalRecords(0);
        setError(oResponse.data?.message || t("COMMON.ERROR_MESSAGE"));
      }
    } catch (err) {
      setBanners([]);
      setTotalPages(1);
      setTotalRecords(0);
      const backendMessage = err?.response?.data?.message;
      setError(backendMessage || t("COMMON.ERROR_MESSAGE"));
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [nPage, t]);

  const paginatedBanners = aBanners;

  const toggleMenu = (id) => setActiveMenu(nActiveMenu === id ? null : id);
  const handleEditBanner = (id) => navigate(`/banners-edit/${id}`);
  const handleDeleteBanner = (id) => {
    setBanners((prev) => prev.filter((b) => b.BannerID !== id));
    setActiveMenu(null);
  };

  const handleToggleStatus = (id, currentStatus) => {
    setStatusPopup({ open: true, id, currentStatus });
  };

  const handleStatusConfirm = async () => {
    const { id, currentStatus } = statusPopup;
    setStatusPopup({ open: false, id: null, currentStatus: null });
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      const oResponse = await apiPatch(
        `${UPDATE_BANNER_STATUS}/${id}`,
        { Status: newStatus },
        token
      );
      if (
        oResponse.data &&
        oResponse.data.STATUS === STATUS.SUCCESS.toUpperCase()
      ) {
        showEmsg(oResponse.data.MESSAGE, STATUS.SUCCESS);
        fetchBanners();
      } else {
        showEmsg(oResponse.data?.MESSAGE, STATUS.ERROR);
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.data?.error ||
        err?.response?.data?.MESSAGE ||
        err?.message;
      showEmsg(errorMessage, STATUS.ERROR);
    }
  };

  const handleStatusPopupClose = () => {
    setStatusPopup({ open: false, id: null, currentStatus: null });
  };

  const handleViewActiveBanners = () => {
    navigate("/activeBanners");
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen">
      <ToastContainer />
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1" />
        <button
          type="button"
          className="flex items-center gap-2 mr-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
          onClick={handleViewActiveBanners}
        >
          <ImageIcon className="h-5 w-5" />
          {t("BANNER_FORM.VIEW_ACTIVE_BANNERS")}
        </button>

        <button
          type="button"
          className="btn-primary flex items-center gap-2"
          onClick={() => navigate("/banners-create")}
        >
          <Plus className="h-5 w-5" />
          {t("BANNER_FORM.CREATE_BANNER")}
        </button>
      </div>
      <div>
        {sError && (
          <div className="mb-4 text-red-500 text-center">{sError}</div>
        )}
        <div className="grid grid-cols-1 mt-4 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedBanners.map((project) => (
            <div
              key={project.BannerID}
              className="bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col transition-transform transform hover:scale-[1.03] border border-gray-100"
            >
              <div className="relative w-full">
                {project.BannerImages && project.BannerImages.length > 0 ? (
                  <div className="w-full">
                    <img
                      src={project.BannerImages[0].BannerImage || noImage}
                      alt={`Banner ${project.BannerName}`}
                      className="w-full aspect-[16/9] object-cover"
                    />
                  </div>
                ) : (
                  <img
                    src={noImage}
                    alt="No image"
                    className="w-full aspect-[16/9] object-contain"
                  />
                )}
                <span
                  className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow ${
                    project.Status === "Active"
                      ? "status-active"
                      : "status-inactive"
                  }`}
                >
                  {project.Status}
                </span>
                <div className="absolute top-3 right-3 z-20">
                  <button
                    className="text-custom-bg hover:text-custom-bg p-1 rounded-full focus:outline-none"
                    onClick={() => toggleMenu(project.BannerID)}
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  {nActiveMenu === project.BannerID && (
                    <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl z-[2000] min-w-[120px] border border-gray-100">
                      <ul className="text-sm text-gray-700">
                        <li
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer rounded-t-xl"
                          onClick={() => handleEditBanner(project.BannerID)}
                        >
                          {t("COMMON.EDIT")}
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer rounded-b-xl text-red"
                          onClick={() => handleDeleteBanner(project.BannerID)}
                        >
                          {t("COMMON.DELETE")}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-base font-semibold text-gray-900 truncate mb-2">
                  {project.BannerName || "Unnamed Banner"}
                </h3>
                <div className="flex items-center justify-between mt-auto">
                  <div
                    onClick={() =>
                      handleToggleStatus(project.BannerID, project.Status)
                    }
                    className={`relative w-10 h-5 rounded-full cursor-pointer transition-all duration-200 ${
                      project.Status === "Active"
                        ? "bg-green-400"
                        : "bg-red-400"
                    }`}
                  >
                    <div
                      className={`absolute top-1/2 left-0.5 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${
                        project.Status === "Active"
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    ></div>
                  </div>
                  <span
                    className={`text-sm font-medium ml-3 ${
                      project.Status === "Active"
                        ? "text-green-600"
                        : "text-red"
                    }`}
                  >
                    {project.Status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-8">
          <button
            disabled={nPage === 1}
            onClick={() => setPage(nPage - 1)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-custom-bg font-semibold shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("COMMON.PREVIOUS")}
          </button>
          <span className="text-caption flex items-center">
            Page {nPage} of {totalPages} ({totalRecords} total)
          </span>
          <button
            disabled={nPage === totalPages}
            onClick={() => setPage(nPage + 1)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-custom-bg font-semibold shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("COMMON.NEXT")}
          </button>
        </div>
      </div>
      {statusPopup.open && (
        <FullscreenErrorPopup
          title={t("FULLSCREEN_ERROR_POPUP.TITLE")}
          message={t(
            "Are you sure you want to change the status of this banner?"
          )}
          onClose={handleStatusPopupClose}
          onConfirm={handleStatusConfirm}
        />
      )}
    </div>
  );
};

export default Banners;
