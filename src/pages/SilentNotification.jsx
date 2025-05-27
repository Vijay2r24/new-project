import { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash, MoreVertical } from 'lucide-react';

const SilentNotification = () => {
  const [oFormData, setFormData] = useState({
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call to create silent notification
    console.log('Form submitted:', oFormData);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Silent Notification</h1>
        </div>
        <p className="text-gray-500">Manage silent notifications for different components.</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add Silent Notification</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="componentName" className="block text-sm font-medium text-gray-700 mb-1">
                Component Name
              </label>
              <input
                type="text"
                id="componentName"
                name="componentName"
                value={oFormData.componentName}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5B45E0] focus:border-[#5B45E0] sm:text-sm"
                placeholder="Enter component name"
                required
              />
            </div>
            <div>
              <label htmlFor="json" className="block text-sm font-medium text-gray-700 mb-1">
                JSON Configuration
              </label>
              <textarea
                id="json"
                name="json"
                value={oFormData.json}
                onChange={handleChange}
                rows="4"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5B45E0] focus:border-[#5B45E0] sm:text-sm font-mono"
                placeholder="Enter JSON configuration"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#5B45E0] hover:bg-[#4c39c7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B45E0]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Notification
            </button>
          </div>
        </form>
      </div>

      {/* Component Notifications Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Component Notifications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Component ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Component Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {aComponentNotifications.map((notification) => (
                <tr key={notification.id} className="hover:bg-gray-50">
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      notification.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {notification.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-gray-400 hover:text-gray-500">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-500">
                        <Trash className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-500">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SilentNotification; 