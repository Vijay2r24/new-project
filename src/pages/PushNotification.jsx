import React, { useState } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';

const PushNotification = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    image: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setPreviewUrl(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call to send push notification
    console.log('Form submitted:', formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Push Notification</h1>
        </div>
        <p className="text-gray-500">Send push notifications to your users with custom messages and images.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Notification Details</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Arrange Title and Message side-by-side on medium screens and up */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5B45E0] focus:border-[#5B45E0] sm:text-sm"
                  placeholder="Enter notification title"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5B45E0] focus:border-[#5B45E0] sm:text-sm"
                  placeholder="Enter notification message"
                  required
                ></textarea>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notification Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="mx-auto h-32 w-auto object-contain"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-0 right-0 -mt-2 -mr-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
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
                          className="relative cursor-pointer bg-white rounded-md font-medium text-[#5B45E0] hover:text-[#4c39c7] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#5B45E0]"
                        >
                          <span>Upload an image</span>
                          <input
                            id="image-upload"
                            name="image"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
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
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B45E0]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#5B45E0] hover:bg-[#4c39c7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B45E0]"
          >
            Send Notification
          </button>
        </div>
      </form>
    </div>
  );
};

export default PushNotification; 