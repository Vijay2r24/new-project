import { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Save,
  Image,
  ArrowUpDown,
  CheckCircle,
  GripVertical,
  Hash,
  ChevronUp,
  ChevronDown,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTitle } from "../context/TitleContext";
import BackButton from "../components/BackButton";
import { useNavigate } from "react-router-dom";
import { GET_ALL_BANNERS, UPDATE_BANNER_SORTORDER } from "../contants/apiRoutes";
import { apiGet, apiPatch } from "../utils/ApiUtils";
import { toast } from "react-toastify";
import { STATUS } from "../contants/constants";

const ActiveBannersWithSequence = () => {
  const { t } = useTranslation();
  const [activeBanners, setActiveBanners] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [swapPreview, setSwapPreview] = useState(null);
  const [inputErrors, setInputErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef(null);
  const { setTitle, setBackButton } = useTitle();
  const navigate = useNavigate();

  useEffect(() => {
    setTitle(t("BANNERS.TITLE"));
    setBackButton(<BackButton onClick={() => navigate("/banners")} />);

    fetchBanners();

    return () => {
      setBackButton(null);
      setTitle("");
    };
  }, [setTitle, setBackButton, t, navigate]);

  // Auto-play functionality for preview carousel
  useEffect(() => {
    if (showPreview && isAutoPlaying && activeBanners.length > 1) {
      autoPlayRef.current = setInterval(() => {
        handleNextPreview();
      }, 3000); // Change slide every 3 seconds
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [showPreview, isAutoPlaying, activeBanners.length]);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("COMMON.AUTH_ERROR"));

      // Call API with isActive=true parameter
      const response = await apiGet(
        `${GET_ALL_BANNERS}?isActive=true`,
        {},
        token
      );
      // Check different possible response structures
      const success = response?.data?.status === STATUS.SUCCESS.toUpperCase()|| response?.status === STATUS.SUCCESS.toUpperCase();

      if (success) {
        // Extract data from response - handle both response structures
        const bannersData = response.data?.data || response.data || [];

        const activeBannersData = bannersData
          .filter(banner => banner.IsActive === true)
          .map((banner, index) => ({
            BannerID: banner.BannerId || banner.BannerID,
            BannerName: banner.BannerName,
            Status: banner.IsActive ? "Active" : "Inactive",
            SequenceNumber: index + 1,
            BannerImages: banner.BannerImage
              ? banner.BannerImage.map((img) => ({
                BannerImageID: img.documentId,
                BannerImage: img.documentUrl,
              }))
              : [],
          }));

        setActiveBanners(activeBannersData);
      } else {
        throw new Error(response?.data?.message || t("COMMON.API_ERROR"));
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("COMMON.API_ERROR");
      toast.error(errorMessage);
      console.error("Error fetching banners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const reorderSequences = (banners) => {
    return banners.map((banner, index) => ({
      ...banner,
      SequenceNumber: index + 1,
    }));
  };

  const onDragEnd = (result) => {
    setIsDragging(false);
    setDraggedItemId(null);
    setSwapPreview(null);

    if (!result.destination) return;

    const items = Array.from(activeBanners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedItems = reorderSequences(items);
    setActiveBanners(reorderedItems);
    setInputErrors({});
  };

  const onDragUpdate = (update) => {
    if (!update.destination) return;

    const sourceIndex = update.source.index;
    const destIndex = update.destination.index;

    if (sourceIndex !== destIndex) {
      setSwapPreview({
        from: sourceIndex,
        to: destIndex,
        direction: destIndex > sourceIndex ? "down" : "up",
      });
    } else {
      setSwapPreview(null);
    }
  };

  const onDragStart = (start) => {
    setIsDragging(true);
    setDraggedItemId(start.draggableId);
    setSwapPreview(null);
  };

  const validateSequence = (value) => {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 1 && num <= activeBanners.length;
  };

  const handleSequenceChange = (bannerId, newSequence) => {
    const sequenceNum = parseInt(newSequence, 10);

    if (!validateSequence(newSequence)) {
      setInputErrors((prev) => ({ ...prev, [bannerId]: true }));
      return;
    }

    setInputErrors((prev) => ({ ...prev, [bannerId]: false }));

    const bannerIndex = activeBanners.findIndex((b) => b.BannerID === bannerId);
    if (bannerIndex === -1) return;

    const items = [...activeBanners];
    const [movedBanner] = items.splice(bannerIndex, 1);
    items.splice(sequenceNum - 1, 0, movedBanner);

    const reorderedItems = reorderSequences(items);
    setActiveBanners(reorderedItems);
  };

  const adjustSequence = (bannerId, direction) => {
    const banner = activeBanners.find((b) => b.BannerID === bannerId);
    if (!banner) return;

    const newSequence =
      direction === "up"
        ? banner.SequenceNumber - 1
        : banner.SequenceNumber + 1;

    if (newSequence < 1 || newSequence > activeBanners.length) return;

    handleSequenceChange(bannerId, newSequence);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("COMMON.AUTH_ERROR"));


      // Prepare payload for API
      const payload = {
        BannerDetails: activeBanners.map((banner) => ({
          BannerId: banner.BannerID,
          SortOrder: banner.SequenceNumber,
        })),
      };


      const response = await apiPatch(UPDATE_BANNER_SORTORDER, payload, token);

      // Check response success
      const success = response?.data?.status === STATUS.SUCCESS.toUpperCase() || response?.status === STATUS.SUCCESS.toUpperCase();

      if (success) {
        toast.success(response?.data?.message || t("BANNERS.SAVE_SUCCESS"));
        setTimeout(() => navigate("/banners"), 2000);
      } else {
        throw new Error(response?.data?.message || t("COMMON.API_ERROR"));
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("COMMON.API_ERROR");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
    setCurrentPreviewIndex(0);
    setIsAutoPlaying(true);
  };

  const handleNextPreview = () => {
    setCurrentPreviewIndex((prev) =>
      prev < activeBanners.length - 1 ? prev + 1 : 0
    );
  };

  const handlePrevPreview = () => {
    setCurrentPreviewIndex((prev) =>
      prev > 0 ? prev - 1 : activeBanners.length - 1
    );
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const handleIndicatorClick = (index) => {
    setCurrentPreviewIndex(index);
    // Reset auto-play timer when manually navigating
    if (isAutoPlaying) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
      autoPlayRef.current = setInterval(() => {
        handleNextPreview();
      }, 3000);
    }
  };

  // Group into rows of 4
  const groupedBanners = [];
  for (let i = 0; i < activeBanners.length; i += 3) {
    groupedBanners.push(activeBanners.slice(i, i + 3));
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-500">{t("COMMON.LOADING")}</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 ${isDragging ? "cursor-grabbing" : ""
        }`}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-4">
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {activeBanners.length}
                </div>
                <div className="text-sm text-gray-500">
                  {t("BANNERS.ACTIVE_BANNERS")}
                </div>
              </div>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-custom-bg">
                  {activeBanners.length}
                </div>
                <div className="text-sm text-gray-500">
                  {t("BANNERS.SEQUENCED")}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center space-x-2 text-sm px-3 py-2 rounded-lg transition-all ${isDragging
                  ? "bg-custom-bg/10 text-custom-bg/80"
                  : "text-gray-500 bg-gray-50"
                  }`}
              >
                <GripVertical className="h-4 w-4" />
                <span>
                  {isDragging
                    ? t("BANNERS.DROP_TO_REORDER")
                    : t("BANNERS.DRAG_TO_REORDER")}
                </span>
              </div>
              <button
                onClick={handlePreview}
                className="btn-secondry flex items-center gap-2 h-9 w-30"
              >
                <Eye className="h-5 w-5" />
                <span>{t("BANNERS.PREVIEW")}</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="h-5 w-5" />
                <span>
                  {t("BANNERS.SAVE_SEQUENCES")}
                </span>
              </button>
            </div>
          </div>
        </div>

        {activeBanners.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Image className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("BANNERS.NO_ACTIVE_BANNERS")}
            </h3>
            <p className="text-gray-500">
              {t("BANNERS.NO_ACTIVE_BANNERS_DESC")}
            </p>
          </div>
        ) : (
          <DragDropContext
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onDragUpdate={onDragUpdate}
          >
            <Droppable droppableId="banners">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {groupedBanners.map((row, rowIndex) => (
                    <div
                      key={`row-${rowIndex}`}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"

                    >
                      {row.map((banner, index) => {
                        const absoluteIndex = rowIndex * 4 + index;
                        return (
                          <Draggable
                            key={banner.BannerID}
                            draggableId={banner.BannerID}
                            index={absoluteIndex}
                          >
                            {(provided, snapshot) => {
                              let transform = "";
                              let zIndex = "auto";
                              let transition =
                                "all 0.3s cubic-bezier(0.2, 0, 0, 1)";

                              if (swapPreview) {
                                if (absoluteIndex === swapPreview.from) {
                                  zIndex = 50;
                                } else if (
                                  swapPreview.direction === "down" &&
                                  absoluteIndex > swapPreview.from &&
                                  absoluteIndex <= swapPreview.to
                                ) {
                                  transform = "translateY(-100%)";
                                } else if (
                                  swapPreview.direction === "up" &&
                                  absoluteIndex < swapPreview.from &&
                                  absoluteIndex >= swapPreview.to
                                ) {
                                  transform = "translateY(100%)";
                                }
                              }

                              return (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`relative bg-white rounded-2xl shadow-sm border transition-all duration-300 ${snapshot.isDragging
                                    ? "shadow-2xl border-custom-bg/50 z-50 scale-105"
                                    : "border-gray-200 hover:shadow-md"
                                    } ${inputErrors[banner.BannerID]
                                      ? "border-red-300"
                                      : ""
                                    }`}
                                  style={{
                                    ...provided.draggableProps.style,
                                    transform: snapshot.isDragging
                                      ? `${provided.draggableProps.style?.transform} rotate(2deg)`
                                      : transform ||
                                      provided.draggableProps.style?.transform,
                                    zIndex,
                                    transition,
                                  }}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className={`absolute inset-0 cursor-grab active:cursor-grabbing ${snapshot.isDragging
                                      ? "opacity-100"
                                      : "opacity-0 hover:opacity-5"
                                      } bg-custom-bg/10 transition-opacity rounded-2xl`}
                                  />

                                  <div className="flex flex-col">
                                    <div className="relative h-48">
                                      {banner.BannerImages?.length > 0 ? (
                                        <img
                                          src={banner.BannerImages[0].BannerImage}
                                          alt={banner.BannerName}
                                          className="w-full h-full object-contain rounded-t-2xl"
                                        />
                                      ) : (
                                        <div className="h-full bg-gray-100 flex items-center justify-center rounded-t-2xl">
                                          <div className="text-center text-gray-500">
                                            <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">
                                              {t("BANNERS.NO_IMAGE")}
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      <div className="absolute top-4 left-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          {banner.Status}
                                        </span>
                                      </div>

                                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm">
                                        <span className="text-sm font-semibold text-gray-700">
                                          #{banner.SequenceNumber}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="p-6">
                                      <div className="flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                          <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                              {banner.BannerName}
                                            </h3>
                                          </div>

                                          <div
                                            className={`rounded-xl p-3 border transition-all ${inputErrors[banner.BannerID]
                                              ? "bg-red-50 border-red-200"
                                              : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
                                              }`}
                                          >
                                            <div className="flex items-center space-x-3">
                                              <div className="relative">
                                                <input
                                                  type="number"
                                                  min="1"
                                                  max={activeBanners.length}
                                                  value={banner.SequenceNumber}
                                                  onChange={(e) =>
                                                    handleSequenceChange(
                                                      banner.BannerID,
                                                      e.target.value
                                                    )
                                                  }
                                                  className={`w-16 px-3 py-2 border rounded-lg text-center font-medium focus:ring-2 focus:outline-none transition-all duration-200 bg-white ${inputErrors[banner.BannerID]
                                                    ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                                                    : "border-gray-300 focus:ring-custom-bg/20 focus:border-custom-bg/50"
                                                    }`}
                                                />
                                                {inputErrors[banner.BannerID] && (
                                                  <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-red-500">
                                                    {t(
                                                      "BANNERS.INVALID_POSITION"
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {swapPreview?.from === absoluteIndex && (
                                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-custom-bg/70 text-white text-xs font-bold px-2 py-1 rounded-full">
                                      {swapPreview.direction === "up" ? "↑" : "↓"}
                                    </div>
                                  )}
                                </div>
                              );
                            }}
                          </Draggable>
                        );
                      })}
                    </div>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-custom-bg/10 border border-custom-bg/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-custom-bg mb-3">
            {t("BANNERS.HOW_TO_REORDER")}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-custom-bg">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-custom-bg/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                <GripVertical className="h-4 w-4 text-custom-bg" />
              </div>
              <div>
                <strong>{t("BANNERS.CLICK_DRAG")}:</strong>{" "}
                {t("BANNERS.CLICK_DRAG_DESC")}
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-custom-bg/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                <Hash className="h-4 w-4 text-custom-bg" />
              </div>
              <div>
                <strong>{t("BANNERS.SET_POSITION")}:</strong>{" "}
                {t("BANNERS.SET_POSITION_DESC")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold">
                {t("BANNERS.PREVIEW_TITLE")}
              </h3>
              <div className="flex items-center space-x-3">
                {activeBanners.length > 1 && (
                  <button
                    onClick={toggleAutoPlay}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                    title={isAutoPlaying ? t("BANNERS.PAUSE") : t("BANNERS.PLAY")}
                  >
                    {isAutoPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="relative">
              {activeBanners[currentPreviewIndex]?.BannerImages?.length > 0 ? (
                <img
                  src={activeBanners[currentPreviewIndex].BannerImages[0].BannerImage}
                  alt={activeBanners[currentPreviewIndex].BannerName}
                  className="w-full h-96 object-contain transition-opacity duration-500"
                />
              ) : (
                <div className="h-96 bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Image className="h-16 w-16 mx-auto mb-2 opacity-50" />
                    <p className="text-lg">{t("BANNERS.NO_IMAGE")}</p>
                  </div>
                </div>
              )}

              {activeBanners.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPreview}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <button
                    onClick={handleNextPreview}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">
                  {activeBanners[currentPreviewIndex]?.BannerName}
                </h4>
                <span className="bg-custom-bg/10 text-custom-bg px-3 py-1 rounded-full text-sm font-medium">
                  {t("BANNERS.POSITION")}: {currentPreviewIndex + 1}
                </span>
              </div>

              {activeBanners.length > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                  {activeBanners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleIndicatorClick(index)}
                      className={`h-3 w-3 rounded-full transition-all ${index === currentPreviewIndex ? 'bg-custom-bg scale-125' : 'bg-gray-300'}`}
                      aria-label={`Go to banner ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveBannersWithSequence;