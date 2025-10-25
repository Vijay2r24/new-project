import { useState, useEffect } from "react";
import {
  Upload,
  X,
  Send,
  MapPin,
  Bell,
  Clock,
} from "lucide-react";
import TextInputWithIcon from "../components/TextInputWithIcon";
import TextAreaWithIcon from "../components/TextAreaWithIcon";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../utils/ApiUtils";
import { SEND_NOTIFICATIONS } from "../contants/apiRoutes";
import { STATUS } from "../contants/constants";
import { showEmsg } from "../utils/ShowEmsg";
import { ToastContainer } from "react-toastify";
import { useTitle } from "../context/TitleContext";
import BackButton from "../components/BackButton";

const Notifications = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setTitle, setBackButton } = useTitle();

  const [oPushFormData, setPushFormData] = useState({
    title: "",
    message: "",
    image: null,
  });
  const [nPreviewUrl, setPreviewUrl] = useState(null);
  const [pushError, setPushError] = useState(null);
  const [pushSuccess, setPushSuccess] = useState(null);
  const [pushValidationErrors, setPushValidationErrors] = useState({});

  useEffect(() => {
    setTitle(t("NOTIFICATIONS.TITLE"));
    setBackButton(<BackButton onClick={() => navigate("/dashboard")} />);
    return () => {
      setBackButton(null);
      setTitle("");
    };
  }, [setTitle, setBackButton, t, navigate]);

  const handlePushChange = (e) => {
    const { name, value } = e.target;
    setPushFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPushValidationErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPushFormData((prev) => ({
        ...prev,
        image: file,
      }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setPushFormData((prev) => ({
      ...prev,
      image: null,
    }));
    setPreviewUrl(null);
  };

  const validatePushForm = () => {
    const errors = {};
    if (!oPushFormData.title || !oPushFormData.title.trim()) {
      errors.title =
        t("PUSH_NOTIFICATION.TITLE_LABEL");
    }
    if (!oPushFormData.message || !oPushFormData.message.trim()) {
      errors.message =
        t("PUSH_NOTIFICATION.MESSAGE_LABEL");
    }
    setPushValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePushSubmit = async (e) => {
    e.preventDefault();
    setPushError(null);
    setPushSuccess(null);
    if (!validatePushForm()) return;
    const token = localStorage.getItem("token");
    const data = new FormData();
    data.append("title", oPushFormData.title);
    data.append("body", oPushFormData.message.trim());
    if (oPushFormData.image) {
      data.append("NotificationImage", oPushFormData.image);
    }

    try {
      const oResponse = await apiPost(SEND_NOTIFICATIONS, data, token, true);
      if (oResponse?.data?.status === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(oResponse?.data?.message, STATUS.SUCCESS);
        setPushFormData({
          title: "",
          message: "",
          image: null,
        });
        setPreviewUrl(null);
      } else {
        showEmsg(oResponse?.data?.message, STATUS.ERROR);
        setPushError(oResponse?.data?.MESSAGE);
      }
    } catch (error) {
      showEmsg(error?.response?.data?.message);
      setPushError(error?.response?.data?.message);
    }
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <ToastContainer />
      <form onSubmit={handlePushSubmit} className="space-y-8">
        {/* Error/Success Messages */}
        <div className="space-y-4">
          {pushError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {pushError}
            </div>
          )}
          {pushSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {pushSuccess}
            </div>
          )}
        </div>

        {/* Push Notification Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Send className="h-5 w-5 text-custom-bg" />
              {t("PUSH_NOTIFICATION.DETAILS_TITLE")}
            </h2>
          </div>

          <div className="p-6 space-y-8">
            {/* Title and Message Inputs - Full Width */}
            <div className="space-y-6">
              <TextInputWithIcon
                label={t("PUSH_NOTIFICATION.TITLE_LABEL")}
                id="title"
                name="title"
                value={oPushFormData.title}
                onChange={handlePushChange}
                placeholder={t("PUSH_NOTIFICATION.TITLE_PLACEHOLDER")}
                Icon={Send}
                error={pushValidationErrors.title}
                required
              />

              <TextAreaWithIcon
                label={t("PUSH_NOTIFICATION.MESSAGE_LABEL")}
                name="message"
                value={oPushFormData.message}
                onChange={handlePushChange}
                placeholder={t("PUSH_NOTIFICATION.MESSAGE_PLACEHOLDER")}
                icon={MapPin}
                error={pushValidationErrors.message}
                required
              />
            </div>

            {/* Image Upload and Preview Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("PUSH_NOTIFICATION.IMAGE_LABEL")}
                </label>
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#5B45E0] transition-colors duration-200 min-h-[200px]">
                  <div className="space-y-3 text-center flex flex-col justify-center">
                    {nPreviewUrl ? (
                      <div className="relative inline-block">
                        <img
                          src={nPreviewUrl}
                          alt={t("PUSH_NOTIFICATION.IMAGE_PREVIEW_ALT")}
                          className="mx-auto h-32 w-auto object-contain rounded-lg shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors duration-200 shadow-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex flex-col sm:flex-row text-sm text-gray-600 justify-center items-center gap-1">
                          <label
                            htmlFor="image-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-[#5B45E0] hover:text-[#4c39c7] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#5B45E0] transition-colors duration-200"
                          >
                            <span>{t("COMMON.UPLOAD_A_FILE")}</span>
                            <input
                              id="image-upload"
                              name="image"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="text-gray-500">
                            {t("COMMON.OR_DRAG_AND_DROP")}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Notification Preview */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("PUSH_NOTIFICATION.PREVIEW_TITLE")}
                </label>
                <div className="flex justify-center items-center h-300">
                  {(!oPushFormData.title && !oPushFormData.message && !nPreviewUrl) ? (
                    <div className="w-full h-full flex flex-col justify-center items-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Bell className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-400 italic">
                        {t("PUSH_NOTIFICATION.NO_PREVIEW")}
                      </p>
                    </div>
                  ) : (
                    <div className="w-full max-w-xs bg-[#1E1E1E] text-white rounded-xl p-3 shadow-lg border border-gray-700">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-[#5B45E0] p-1 rounded-md">
                          <Bell className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-sm">
                          {t("PUSH_NOTIFICATION.APP_NAME")}
                        </span>
                        <div className="ml-auto flex items-center text-xs text-gray-400 gap-1">
                          <Clock className="h-3 w-3" /> {t("PUSH_NOTIFICATION.TIME_AGO")}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">
                          {oPushFormData.title || t("PUSH_NOTIFICATION.TITLE")}
                        </p>
                        <p className="text-xs text-gray-300">
                          {oPushFormData.message || t("PUSH_NOTIFICATION.MESSAGE")}
                        </p>
                      </div>

                      {/* Image if present */}
                      {nPreviewUrl && (
                        <img
                          src={nPreviewUrl}
                          alt="Notification"
                          className="mt-2 w-full rounded-lg object-cover max-h-32 border border-gray-600"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B45E0] transition-colors duration-200 order-2 sm:order-1"
          >
            {t("COMMON.CANCEL")}
          </button>
          <button
            type="submit"
            className="btn-primary order-1 sm:order-2 flex items-center justify-center"
          >
            <Send className="h-4 w-4 mr-2" />
            {t("BUTTONS.SEND_NOTIFICATION")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Notifications;