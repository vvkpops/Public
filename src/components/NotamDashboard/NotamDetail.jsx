import React from 'react';

const NotamDetail = ({ notam, onClose }) => {
  if (!notam) return null;
  
  const effectiveDate = new Date(notam.effectiveDate).toLocaleString();
  const expiryDate = notam.expiryDate 
    ? new Date(notam.expiryDate).toLocaleString()
    : 'Permanent';
  
  const isActive = () => {
    const now = new Date();
    const start = new Date(notam.effectiveDate);
    const end = notam.expiryDate ? new Date(notam.expiryDate) : null;
    return start <= now && (!end || end >= now);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flight-tile">
        <div className="flex justify-between items-center border-b border-gray-700 p-4">
          <h3 className="text-xl font-bold text-cyan-400">NOTAM {notam.id}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl focus:outline-none"
          >
            ×
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-9rem)]">
          <div className="mb-6">
            <h4 className="text-lg font-bold border-b border-gray-700 pb-2 mb-3">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><span className="font-bold text-gray-400">Location:</span> {notam.location}</p>
                <p><span className="font-bold text-gray-400">Type:</span> 
                  <span className={`ml-2 inline-block px-2 py-1 rounded text-xs font-bold type-badge type-${notam.type}`}>
                    {notam.type}
                  </span>
                </p>
                <p><span className="font-bold text-gray-400">Status:</span> 
                  <span className={`ml-2 inline-block px-2 py-1 rounded text-xs font-bold ${isActive() ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                    {isActive() ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
              <div>
                <p><span className="font-bold text-gray-400">Effective Date:</span> {effectiveDate}</p>
                <p><span className="font-bold text-gray-400">Expiry Date:</span> {expiryDate}</p>
                {notam.issuedBy && (
                  <p><span className="font-bold text-gray-400">Issued By:</span> {notam.issuedBy}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-bold border-b border-gray-700 pb-2 mb-3">Description</h4>
            <p className="whitespace-pre-line">{notam.description}</p>
          </div>
          
          {(notam.altitude || notam.radius) && (
            <div className="mb-6">
              <h4 className="text-lg font-bold border-b border-gray-700 pb-2 mb-3">Additional Details</h4>
              {notam.altitude && (
                <p><span className="font-bold text-gray-400">Altitude:</span> {notam.altitude}</p>
              )}
              {notam.radius && (
                <p><span className="font-bold text-gray-400">Radius:</span> {notam.radius}</p>
              )}
            </div>
          )}
          
          {notam.remarks && (
            <div className="mb-6">
              <h4 className="text-lg font-bold border-b border-gray-700 pb-2 mb-3">Remarks</h4>
              <p className="whitespace-pre-line">{notam.remarks}</p>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-700 p-4 flex justify-end">
          <button
            onClick={() => window.print()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded"
          >
            Export as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotamDetail;
