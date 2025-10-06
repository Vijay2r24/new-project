import { useState, useEffect } from "react";
import { Plus, MoreVertical, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiGet, apiPatch, apiDelete } from "../utils/ApiUtils";
import { GET_ALL_BANNERS, UPDATE_BANNER_STATUS, DELETE_BANNER } from "../contants/apiRoutes";
import { showEmsg } from "../utils/ShowEmsg";
import { useTitle } from "../context/TitleContext";
import { ITEMS_PER_PAGE, STATUS } from "../contants/constants";
import FullscreenErrorPopup from "../components/FullscreenErrorPopup";
import { ToastContainer } from "react-toastify";
import noImage from "../../assets/images/missing-pictur.jpg";
import Switch from "../components/Switch";

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
    setTitle(t("BANNER_FORM.TITLE"));
    return () => setTitle("");
  }, [setTitle, t]);

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
        oResponse.data.status === STATUS.SUCCESS.toUpperCase()
      ) {
        // Map API response to expected structure
        const bannerData = oResponse.data.data.map((banner) => ({
          BannerID: banner.BannerId,
          BannerName: banner.BannerName,
          Status: banner.IsActive ? "Active" : "Inactive",
          BannerImages: banner.BannerImage?.map((img) => ({
            BannerImage: img.documentUrl,
            sortOrder: img.sortOrder,
            documentId: img.documentId,
          })) || [],
          CategoryIDs: banner.CategoryIDs,
          Discount: banner.Discount,
          Price: banner.Price,
          SortOrder: banner.SortOrder,
        }));

        setBanners(bannerData);
        setTotalPages(oResponse.data.pagination?.totalPages || 1);
        setTotalRecords(oResponse.data.pagination?.totalRecords || 0);
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

  const handleDeleteBanner = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("COMMON.AUTH_ERROR"));

      // API call
      const response = await apiDelete(`${DELETE_BANNER}/${id}`, token);

      const success = response?.data?.status === STATUS.SUCCESS.toUpperCase() || response?.status === STATUS.SUCCESS.toUpperCase();

      if (success) {
        // Update UI
        setBanners((prev) => prev.filter((b) => b.BannerID !== id));
        setActiveMenu(null);

        toast.success(response?.data?.message || t("BANNERS.DELETE_SUCCESS"));
      } else {
        throw new Error(response?.data?.message || t("COMMON.API_ERROR"));
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("COMMON.API_ERROR");
      toast.error(errorMessage);
    }
  };

  const handleToggleStatus = (id, currentStatus) => {
    setStatusPopup({ open: true, id, currentStatus });
  };

  const handleStatusConfirm = async () => {
    const { id, currentStatus } = statusPopup;
    setStatusPopup({ open: false, id: null, currentStatus: null });
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "Active" ? false : true; // Convert to boolean for API
      const oResponse = await apiPatch(
        `${UPDATE_BANNER_STATUS}/${id}`,
        { IsActive: newStatus }, // Use IsActive to match API expectation
        token
      );
      if (
        oResponse.data &&
        oResponse.data.status === STATUS.SUCCESS.toUpperCase()
      ) {
        showEmsg(oResponse.data.message || t("BANNER_FORM.STATUS_UPDATED"), STATUS.SUCCESS);
        fetchBanners();
      } else {
        showEmsg(oResponse.data?.message || t("COMMON.API_ERROR"), STATUS.ERROR);
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        t("COMMON.API_ERROR");
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
          className="btn-secondry h-9 w-30 flex items-center gap-2"
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
        {paginatedBanners.length === 0 && !sError ? (
          <div className="text-center py-8 text-gray-500">
            {t("BANNER_FORM.NO_BANNERS_FOUND")}
          </div>
        ) : (
          <div className="grid grid-cols-1 mt-4 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedBanners.map((project) => (
              <div
                key={project.BannerID}
                className="bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col transition-transform transform hover:scale-[1.01] border border-gray-100"
              >
                <div className="relative w-full">
                  {project.BannerImages && project.BannerImages.length > 0 ? (
                    <div className="w-full">
                      <img
                        src={project.BannerImages[0].BannerImage || noImage}
                        alt={`Banner ${project.BannerName}`}
                        className="w-full aspect-[16/9] object-contain"
                      />
                    </div>
                  ) : (
                    <img
                      src={noImage}
                      alt="No image"
                      className="w-full aspect-[16/9] object-contain"
                    />
                  )}
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
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer rounded-b-xl text-red-600"
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
                    {project.BannerName || t("BANNER_FORM.UNNAMED_BANNER")}
                  </h3>
                  {project.Discount && (
                    <p className="text-sm text-gray-600 truncate">
                      {t("BANNER_FORM.DISCOUNT_PERCENTAGE")}: {project.Discount}
                    </p>
                  )}
                  {project.Price && (
                    <p className="text-sm text-gray-600 truncate">
                      {t("COMMON.PRICE")}: ₹{project.Price.toLocaleString()}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                      <Switch
                      checked={project.Status === "Active"}
                      onChange={() =>
                        handleToggleStatus(project.BannerID, project.Status)
                      }
                      />
                    <span
    className={`text-sm font-medium ml-3 px-2 py-1 rounded-full text-xs font-semibold shadow ${
      project.Status === "Active"
        ? "status-active bg-green-100 text-green-800"
        : "status-inactive bg-red-100 text-red-800"
    }`}
  >
    {project.Status}
  </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between mt-8">
          <button
            disabled={nPage === 1}
            onClick={() => setPage(nPage - 1)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-custom-bg font-semibold shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("COMMON.PREVIOUS")}
          </button>
          <span className="text-caption flex items-center">
            {t("BANNER_FORM.PAGE")} {nPage} {t("BANNER_FORM.OF")} {totalPages} (
            {totalRecords} {t("VIEW_ORDER.TABLE.TOTAL")})
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
          message={t("BANNERS.STATUS_CONFIRM_MESSAGE", {
            status: statusPopup.currentStatus === "Active" ? t("COMMON.INACTIVE") : t("COMMON.ACTIVE"),
          })}
          onClose={handleStatusPopupClose}
          onConfirm={handleStatusConfirm}
        />
      )}
    </div>
  );
};

export default Banners;
