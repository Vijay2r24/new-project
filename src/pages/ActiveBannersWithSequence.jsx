import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTitle } from "../context/TitleContext";
import BackButton from "../components/BackButton";
import {useNavigate} from "react-router-dom";

const STATIC_BANNERS = [
  {
    BannerID: "BAN001",
    BannerName: "Summer Sale Extravaganza",
    Status: "Active",
    SequenceNumber: 1,
    BannerImages: [
      {
        BannerImageID: "IMG001",
        BannerImage:
          "https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
    ],
  },
  {
    BannerID: "BAN002",
    BannerName: "New Product Launch",
    Status: "Active",
    SequenceNumber: 2,
    BannerImages: [
      {
        BannerImageID: "IMG002",
        BannerImage:
          "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
    ],
  },
  {
    BannerID: "BAN003",
    BannerName: "Black Friday Deals",
    Status: "Active",
    SequenceNumber: 3,
    BannerImages: [
      {
        BannerImageID: "IMG003",
        BannerImage:
          "https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
    ],
  },
  {
    BannerID: "BAN004",
    BannerName: "Winter Collection",
    Status: "Active",
    SequenceNumber: 4,
    BannerImages: [
      {
        BannerImageID: "IMG004",
        BannerImage:
          "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
    ],
  },
];

const ActiveBannersWithSequence = () => {
  const { t } = useTranslation();
  const [activeBanners, setActiveBanners] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [swapPreview, setSwapPreview] = useState(null);
  const [inputErrors, setInputErrors] = useState({});
  const { setTitle, setBackButton } = useTitle();
  const navigate = useNavigate();
  useEffect(() => {
    setTitle(t("BANNERS.TITLE"));
    setBackButton(<BackButton onClick={() => navigate("/banners")} />);

    const sortedBanners = [...STATIC_BANNERS].sort(
      (a, b) => a.SequenceNumber - b.SequenceNumber
    );
    setActiveBanners(sortedBanners);

    return () => {
      setBackButton(null);
      setTitle("");
    };
  }, [setTitle, setBackButton, t, navigate]);

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
    setTimeout(() => {
      alert(t("BANNERS.SAVE_SUCCESS"));
      setIsSubmitting(false);
    }, 1000);
  };
  const groupedBanners = [];
  for (let i = 0; i < activeBanners.length; i += 2) {
    groupedBanners.push(activeBanners.slice(i, i + 2));
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 ${
        isDragging ? "cursor-grabbing" : ""
      }`}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-4">
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
                <div className="text-2xl font-bold text-blue-600">
                  {activeBanners.length}
                </div>
                <div className="text-sm text-gray-500">
                  {t("BANNERS.SEQUENCED")}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center space-x-2 text-sm px-3 py-2 rounded-lg transition-all ${
                  isDragging
                    ? "bg-blue-100 text-blue-700"
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
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-all duration-200 space-x-2 shadow-lg hover:shadow-xl"
              >
                <Save className="h-5 w-5" />
                <span>
                  {isSubmitting
                    ? t("COMMON.SAVING")
                    : t("BANNERS.SAVE_SEQUENCES")}
                </span>
              </button>
            </div>
          </div>
        </div>
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
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {row.map((banner, index) => {
                      const absoluteIndex = rowIndex * 2 + index;
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
                                className={`relative bg-white rounded-2xl shadow-sm border transition-all duration-300 ${
                                  snapshot.isDragging
                                    ? "shadow-2xl border-blue-400 z-50 scale-105"
                                    : "border-gray-200 hover:shadow-md"
                                } ${
                                  inputErrors[banner.BannerID]
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
                                  className={`absolute inset-0 cursor-grab active:cursor-grabbing ${
                                    snapshot.isDragging
                                      ? "opacity-100"
                                      : "opacity-0 hover:opacity-5"
                                  } bg-blue-50 transition-opacity rounded-2xl`}
                                />

                                <div className="flex flex-col">
                                  <div className="relative h-48">
                                    {banner.BannerImages?.length > 0 ? (
                                      <img
                                        src={banner.BannerImages[0].BannerImage}
                                        alt={banner.BannerName}
                                        className="w-full h-full object-cover rounded-t-2xl"
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
                                          <p className="text-gray-500 text-sm">
                                            {t("BANNERS.BANNER_ID")}:{" "}
                                            {banner.BannerID}
                                          </p>
                                        </div>

                                        <div
                                          className={`rounded-xl p-3 border transition-all ${
                                            inputErrors[banner.BannerID]
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
                                                className={`w-16 px-3 py-2 border rounded-lg text-center font-medium focus:ring-2 focus:outline-none transition-all duration-200 bg-white ${
                                                  inputErrors[banner.BannerID]
                                                    ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                                                    : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
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
                                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
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

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            {t("BANNERS.HOW_TO_REORDER")}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                <GripVertical className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <strong>{t("BANNERS.CLICK_DRAG")}:</strong>{" "}
                {t("BANNERS.CLICK_DRAG_DESC")}
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                <Hash className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <strong>{t("BANNERS.SET_POSITION")}:</strong>{" "}
                {t("BANNERS.SET_POSITION_DESC")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveBannersWithSequence;
