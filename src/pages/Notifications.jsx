import { useState } from 'react';
import { ArrowLeft, Upload, X, Plus, Bell, Settings, Send, AlertCircle } from 'lucide-react';
import TextInputWithIcon from '../components/TextInputWithIcon';
import { useTranslation } from "react-i18next";
import ActionButtons from '../components/ActionButtons';
const Notifications = () => {
  const [sActiveTab, setActiveTab] = useState('push');
  const { t } = useTranslation();
  // Push Notification State
  const [oPushFormData, setPushFormData] = useState({
    title: '',
    message: '',
    image: null
  });
  const [nPreviewUrl, setPreviewUrl] = useState(null);

  // Silent Notification State
  const [oSilentFormData, setSilentFormData] = useState({
    componentName: '',
    json: ''
  });

  const [aComponentNotifications] = useState([
    {
      id: 1,
      componentId: 'CMP001',
      componentName: 'User Profile',
      description: 'Updates to user profile information',
      status: 'Active'
    },
    {
      id: 2,
      componentId: 'CMP002',
      componentName: 'Order Status',
      description: 'Changes in order status',
      status: 'Active'
    },
    {
      id: 3,
      componentId: 'CMP003',
      componentName: 'Inventory',
      description: 'Stock level updates',
      status: 'Inactive'
    }
  ]);

  // Push Notification Handlers
  const handlePushChange = (e) => {
    const { name, value } = e.target;
    setPushFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleEdit = () => { }
  const handleDelete = () => { }
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPushFormData(prev => ({
        ...prev,
        image: file
      }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setPushFormData(prev => ({
      ...prev,
      image: null
    }));
    setPreviewUrl(null);
  };

  const handlePushSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call to send push notification
    console.log('Push notification submitted:', oPushFormData);
  };

  // Silent Notification Handlers
  const handleSilentChange = (e) => {
    const { name, value } = e.target;
    setSilentFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSilentSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call to create silent notification
    console.log('Silent notification submitted:', oSilentFormData);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen">
      {/* Header with Background */}
      <div className="relative rounded-2xl overflow-hidden mb-8 border border-sky-100/50">
        {/* Background with enhanced pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-indigo-100" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-200/40 via-transparent to-indigo-200/40" />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Content */}
        <div className="relative px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/80 rounded-lg">
                <Bell className="h-6 w-6 text-custom-bg" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{t('notifications.title')}</h1>
            </div>
          </div>
          <p className="text-gray-600 ml-14">{t('notifications.description')}</p>
        </div>
      </div>

      {/* Tabs with enhanced styling */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('push')}
              className={`${sActiveTab === 'push'
                ? 'border-custom-bg text-custom-bg'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <Send className="h-4 w-4" />
              {t('tabs.pushNotifications')}
            </button>
            <button
              onClick={() => setActiveTab('silent')}
              className={`${sActiveTab === 'silent'
                ? 'border-custom-bg text-custom-bg'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <Settings className="h-4 w-4" />
              {t('tabs.silentNotifications')}
            </button>
          </nav>
        </div>
      </div>

      {/* Push Notification Tab Content */}
      {sActiveTab === 'push' && (
        <form onSubmit={handlePushSubmit} className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Send className="h-5 w-5 text-custom-bg" />
                {t('pushNotification.detailsTitle')}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Title */}
              <TextInputWithIcon
                label={t('pushNotification.titleLabel')}
                id="title"
                name="title"
                value={oPushFormData.title}
                onChange={handlePushChange}
                placeholder={t('pushNotification.titlePlaceholder')}
                Icon={Send}
                required
              />

              {/* Message */}
              <TextInputWithIcon
                label={t('pushNotification.messageLabel')}
                id="message"
                name="message"
                value={oPushFormData.message}
                onChange={handlePushChange}
                placeholder={t('pushNotification.messagePlaceholder')}
                Icon={Send}
                required
              />

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pushNotification.imageLabel')}
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#5B45E0] transition-colors duration-200">
                  <div className="space-y-1 text-center">
                    {nPreviewUrl ? (
                      <div className="relative">
                        <img
                          src={nPreviewUrl}
                          alt={t('pushNotification.imagePreviewAlt')}
                          className="mx-auto h-32 w-auto object-contain rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-0 right-0 -mt-2 -mr-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="image-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-[#5B45E0] hover:text-[#4c39c7] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#5B45E0] transition-colors duration-200"
                          >
                            <span>{t('pushNotification.uploadImage')}</span>
                            <input
                              id="image-upload"
                              name="image"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="pl-1">{t('pushNotification.orDragAndDrop')}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B45E0] transition-colors duration-200"
            >
              {t('buttons.cancel')}
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              <Send className="h-4 w-4 mr-2" />
              {t('buttons.sendNotification')}
            </button>
          </div>
        </form>
      )}

      {/* Silent Notification Tab Content */}
      {sActiveTab === 'silent' && (
        <div className="space-y-8">
          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-custom-bg" />
                {t('silentNotification.addTitle')}
              </h2>
            </div>
            <form onSubmit={handleSilentSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInputWithIcon
                  label={t('silentNotification.componentNameLabel')}
                  id="componentName"
                  name="componentName"
                  value={oSilentFormData.componentName}
                  onChange={handleSilentChange}
                  placeholder={t('silentNotification.componentNamePlaceholder')}
                  Icon={Settings}
                  required
                />
                <TextInputWithIcon
                  label={t('silentNotification.jsonLabel')}
                  id="json"
                  name="json"
                  value={oSilentFormData.json}
                  onChange={handleSilentChange}
                  placeholder={t('silentNotification.jsonPlaceholder')}
                  Icon={AlertCircle}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('buttons.addNotification')}
                </button>
              </div>
            </form>
          </div>

          {/* Component Notifications Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-custom-bg" />
                {t('componentNotifications.title')}
              </h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                 {t('componentNotifications.tableHeaders.id')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('componentNotifications.tableHeaders.componentName')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('componentNotifications.tableHeaders.json')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t('componentNotifications.tableHeaders.status')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                  {t('componentNotifications.tableHeaders.actions')}
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
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {notification.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${notification.status === "Active"
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
                        onMore={() => console.log("More options for", notification.id)}
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