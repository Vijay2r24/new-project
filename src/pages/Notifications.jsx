import { useState } from "react";
import {
  Upload,
  X,
  Plus,
  Bell,
  Settings,
  Send,
  AlertCircle,
} from "lucide-react";
import TextInputWithIcon from "../components/TextInputWithIcon";
import { useTranslation } from "react-i18next";
import ActionButtons from "../components/ActionButtons";
import BackButton from "../components/BackButton";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../utils/ApiUtils";
import ReactQuill from "react-quill";
import { SEND_NOTIFICATIONS } from "../contants/apiRoutes";
import { STATUS } from "../contants/constants";
import { showEmsg } from "../utils/ShowEmsg";
import { ToastContainer } from "react-toastify";

const Notifications = () => {
  const [sActiveTab, setActiveTab] = useState("push");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [oPushFormData, setPushFormData] = useState({
    title: "",
    message: "",
    image: null,
  });
  const [nPreviewUrl, setPreviewUrl] = useState(null);
  const [pushError, setPushError] = useState(null);
  const [pushSuccess, setPushSuccess] = useState(null);
  const [pushValidationErrors, setPushValidationErrors] = useState({});

  const [oSilentFormData, setSilentFormData] = useState({
    componentName: "",
    json: "",
  });

  const [aComponentNotifications] = useState([
    {
      id: 1,
      componentId: "CMP001",
      componentName: "User Profile",
      description: "Updates to user profile information",
      status: "Active",
    },
    {
      id: 2,
      componentId: "CMP002",
      componentName: "Order Status",
      description: "Changes in order status",
      status: "Active",
    },
    {
      id: 3,
      componentId: "CMP003",
      componentName: "Inventory",
      description: "Stock level updates",
      status: "Inactive",
    },
  ]);

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

  const handleEdit = () => {};
  const handleDelete = () => {};
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
        t("PUSH_NOTIFICATION.TITLE_LABEL") + " " + t("COMMON.REQUIRED");
    }
    if (
      !oPushFormData.message ||
      !oPushFormData.message.replace(/<(.|\n)*?>/g, "").trim()
    ) {
      errors.message =
        t("PUSH_NOTIFICATION.MESSAGE_LABEL") + " " + t("COMMON.REQUIRED");
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
    data.append(
      "data",
      JSON.stringify({
        title: oPushFormData.title,
        body: oPushFormData.message,
      })
    );
    if (oPushFormData.image) {
      data.append("NotificationImage", oPushFormData.image);
    }
    try {
      const oResponse = await apiPost(SEND_NOTIFICATIONS, data, token, true);
      if (oResponse?.data?.STATUS === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(oResponse?.data?.MESSAGE, STATUS.SUCCESS);
      } else {
        showEmsg(oResponse?.data?.MESSAGE, STATUS.ERROR);
        setPushError(oResponse?.data?.MESSAGE);
      }
    } catch (error) {
      showEmsg(error?.response?.data?.MESSAGE);
      setPushError(error?.response?.data?.MESSAGE);
    }
  };

  const handleSilentChange = (e) => {
    const { name, value } = e.target;
    setSilentFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSilentSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen">
      <ToastContainer />
      <div className="relative rounded-2xl overflow-hidden mb-8 border border-sky-100/50">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-indigo-100" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-200/40 via-transparent to-indigo-200/40" />

        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <BackButton onClick={() => navigate("/dashboard")} />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/80 rounded-lg">
                <Bell className="h-6 w-6 text-custom-bg" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("NOTIFICATIONS.TITLE")}
              </h1>
            </div>
          </div>
          <p className="text-caption ml-14">{t("NOTIFICATIONS.DESCRIPTION")}</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("push")}
              className={`${
                sActiveTab === "push"
                  ? "border-custom-bg text-custom-bg"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <Send className="h-4 w-4" />
              {t("TABS.PUSH_NOTIFICATIONS")}
            </button>
            <button
              onClick={() => setActiveTab("silent")}
              className={`${
                sActiveTab === "silent"
                  ? "border-custom-bg text-custom-bg"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <Settings className="h-4 w-4" />
              {t("TABS.SILENT_NOTIFICATIONS")}
            </button>
          </nav>
        </div>
      </div>

      {sActiveTab === "push" && (
        <form onSubmit={handlePushSubmit} className="space-y-8">
          {pushError && <div className="text-red-500 mb-2">{pushError}</div>}
          {pushSuccess && (
            <div className="text-green-600 mb-2">{pushSuccess}</div>
          )}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Send className="h-5 w-5 text-custom-bg" />
                {t("PUSH_NOTIFICATION.DETAILS_TITLE")}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[280px]">
                  <TextInputWithIcon
                    label={t("PUSH_NOTIFICATION.TITLE_LABEL")}
                    id="title"
                    name="title"
                    value={oPushFormData.title}
                    onChange={handlePushChange}
                    placeholder={t("PUSH_NOTIFICATION.TITLE_PLACEHOLDER")}
                    Icon={Send}
                    error={pushValidationErrors.title}
                  />
                </div>
                <div className="flex-1 mb-4 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("PUSH_NOTIFICATION.MESSAGE_LABEL")}
                  </label>
                  {pushValidationErrors.message && (
                    <div className="text-red-500 text-sm mb-1">
                      {pushValidationErrors.message}
                    </div>
                  )}
                  <ReactQuill
                    theme="snow"
                    value={oPushFormData.message}
                    onChange={(value) => {
                      setPushFormData((prev) => ({ ...prev, message: value }));
                      if (value.replace(/<(.|\n)*?>/g, "").trim()) {
                        setPushValidationErrors((prev) => ({
                          ...prev,
                          message: undefined,
                        }));
                      }
                    }}
                    placeholder={t("PUSH_NOTIFICATION.MESSAGE_PLACEHOLDER")}
                    className="h-32 mb-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("PUSH_NOTIFICATION.IMAGE_LABEL")}
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#5B45E0] transition-colors duration-200">
                  <div className="space-y-1 text-center">
                    {nPreviewUrl ? (
                      <div className="relative">
                        <img
                          src={nPreviewUrl}
                          alt={t("PUSH_NOTIFICATION.IMAGE_PREVIEW_ALT")}
                          className="mx-auto h-32 w-auto object-contain rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-0 right-0 -mt-2 -mr-2 p-1 bg-red-100 rounded-full text-red hover:bg-red-200 transition-colors duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-caption">
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
                          <p className="pl-1">{t("COMMON.OR_DRAG_AND_DROP")}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B45E0] transition-colors duration-200"
            >
              {t("COMMON.CANCEL")}
            </button>
            <button type="submit" className="btn-primary">
              <Send className="h-4 w-4 mr-2" />
              {t("BUTTONS.SEND_NOTIFICATION")}
            </button>
          </div>
        </form>
      )}

      {sActiveTab === "silent" && (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-custom-bg" />
                {t("SILENT_NOTIFICATION.ADD_TITLE")}
              </h2>
            </div>
            <form onSubmit={handleSilentSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInputWithIcon
                  label={t("SILENT_NOTIFICATION.COMPONENT_NAME_LABEL")}
                  id="componentName"
                  name="componentName"
                  value={oSilentFormData.componentName}
                  onChange={handleSilentChange}
                  placeholder={t(
                    "SILENT_NOTIFICATION.COMPONENT_NAME_PLACEHOLDER"
                  )}
                  Icon={Settings}
                  required
                />
                <TextInputWithIcon
                  label={t("SILENT_NOTIFICATION.JSON_LABEL")}
                  id="json"
                  name="json"
                  value={oSilentFormData.json}
                  onChange={handleSilentChange}
                  placeholder={t("SILENT_NOTIFICATION.JSON_PLACEHOLDER")}
                  Icon={AlertCircle}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("BUTTONS.ADD_NOTIFICATION")}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-custom-bg" />
                {t("COMPONENT_NOTIFICATIONS.TITLE")}
              </h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("COMPONENT_NOTIFICATIONS.TABLE_HEADERS.ID")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("COMPONENT_NOTIFICATIONS.TABLE_HEADERS.COMPONENT_NAME")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("COMPONENT_NOTIFICATIONS.TABLE_HEADERS.JSON")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("COMMON.STATUS")}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("COMPONENT_NOTIFICATIONS.TABLE_HEADERS.ACTIONS")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {aComponentNotifications.map((notification) => (
                  <tr
                    key={notification.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {notification.componentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {notification.componentName}
                    </td>
                    <td className="px-6 py-4 text-secondary">
                      {notification.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          notification.status === "Active"
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {notification.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ActionButtons
                        id={notification.id}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onMore={() =>
                          console.log("More options for", notification.id)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
