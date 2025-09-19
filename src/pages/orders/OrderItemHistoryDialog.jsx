import React from "react";
import { X, Clock, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

const OrderItemHistoryDialog = ({ open, onClose, historyData }) => {
  const { t } = useTranslation();

  if (!open) return null;

  const sortedHistoryData = historyData.sort(
    (a, b) => new Date(b.changedOn) - new Date(a.changedOn)
  );

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg max-h-[70vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {t("ORDER_HISTORY.TITLE")}
              </h2>
              <p className="text-sm text-gray-600">{t("ORDER_HISTORY.SUBTITLE")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline Content */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          {sortedHistoryData.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t("ORDER_HISTORY.NO_HISTORY")}</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-gray-200 to-gray-100"></div>

              <div className="space-y-6">
                {sortedHistoryData.map((item, index) => {
                  const { date, time } = formatDateTime(item.changedOn);
                  const isLatest = index === 0;

                  return (
                    <div
                      key={item.orderItemHistoryId}
                      className="relative flex gap-4"
                    >
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-4 h-4 rounded-full border-4 border-white shadow-lg ${
                            isLatest ? "ring-4 ring-blue-100" : ""
                          }`}
                          style={{ backgroundColor: item.hexCode }}
                        ></div>
                        {isLatest && (
                          <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full border-2 border-blue-200 animate-pulse"></div>
                        )}
                      </div>

                      <div
                        className={`flex-1 pb-6 ${
                          isLatest ? "transform scale-[1.02]" : ""
                        }`}
                      >
                        <div
                          className={`bg-white rounded-xl border-2 p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
                            isLatest
                              ? "border-blue-200 bg-blue-50/30"
                              : "border-gray-100"
                          }`}
                        >
                          {/* Status header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h3
                                className="text-lg font-bold"
                                style={{ color: item.hexCode }}
                              >
                                {item.orderStatus}
                              </h3>
                              {isLatest && (
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                  {t("ORDER_HISTORY.LATEST")}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Remarks */}
                          {item.remarks && (
                            <div className="flex items-start gap-2 mb-3">
                              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {item.remarks}
                              </p>
                            </div>
                          )}

                          {/* Timestamp */}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <time className="font-medium">
                              {date} {t("ORDER_HISTORY.AT")} {time}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {t("ORDER_HISTORY.TOTAL_UPDATES")}: {sortedHistoryData.length}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              {t("COMMON.CLOSE")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItemHistoryDialog;
