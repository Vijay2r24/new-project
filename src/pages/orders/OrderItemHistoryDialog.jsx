import React from 'react';
import { X, Calendar, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const OrderItemHistoryDialog = ({ open, onClose, historyData }) => {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog Panel - Reduced width */}
      <div className="relative w-full max-w-md h-screen bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t('VIEW_ORDER.ORDER_ITEM_HISTORY')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Content - Fixed height without scroll */}
        <div className="p-4">
          {historyData.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-gray-500">
              <p className="text-center">{t('VIEW_ORDER.NO_HISTORY_AVAILABLE')}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[80vh]"> {/* Limited max height */}
              {historyData.map((historyItem, index) => (
                <div
                  key={historyItem.orderItemHistoryId || index}
                  className="relative pl-6"
                >
                  {/* Timeline line */}
                  {index !== historyData.length - 1 && (
                    <div className="absolute left-3 top-4 w-0.5 h-full bg-gray-200" />
                  )}
                  
                  {/* Timeline dot */}
                  <div className="absolute left-2.5 top-1 w-2 h-2 bg-purple-500 rounded-full border-2 border-white" />
                  
                  {/* Content */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex flex-col gap-2 mb-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">
                          {historyItem.changedOn 
                            ? new Date(historyItem.changedOn).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'N/A'
                          }
                        </span>
                      </div>
                      <div 
                        className="px-2 py-1 rounded-full text-xs font-medium text-white text-center"
                        style={{ 
                          backgroundColor: historyItem.hexCode || '#6B7280' 
                        }}
                      >
                        {historyItem.orderStatus || 'Unknown Status'}
                      </div>
                    </div>
                    
                    {historyItem.remarks && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 font-medium mb-1">
                          {t('VIEW_ORDER.REMARKS')}:
                        </p>
                        <p className="text-xs text-gray-700 bg-white p-2 rounded border line-clamp-3">
                          {historyItem.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderItemHistoryDialog;