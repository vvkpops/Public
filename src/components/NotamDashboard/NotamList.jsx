import React from 'react';

const NotamList = ({ notams, loading, selectedNotam, onSelectNotam }) => {
  if (loading) {
    return (
      <div className="flight-tile p-4 bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">NOTAM List</h3>
        <div className="flex justify-center items-center p-8">
          <div className="inline-block w-8 h-8 border-4 border-t-cyan-500 border-r-cyan-500 border-b-gray-700 border-l-gray-700 rounded-full animate-spin"></div>
          <p className="ml-3 text-cyan-500">Loading NOTAMs...</p>
        </div>
      </div>
    );
  }
  
  if (!notams || notams.length === 0) {
    return (
      <div className="flight-tile p-4 bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">NOTAM List</h3>
        <p className="text-center text-gray-400 p-4">No NOTAMs found matching your criteria.</p>
      </div>
    );
  }
  
  return (
    <div className="flight-tile p-4 bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">NOTAM List ({notams.length} found)</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Effective</th>
              <th className="px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {notams.map(notam => (
              <tr 
                key={notam.id} 
                className={`border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition ${selectedNotam && selectedNotam.id === notam.id ? 'bg-cyan-900 hover:bg-cyan-800' : ''}`}
                onClick={() => onSelectNotam(notam)}
              >
                <td className="px-4 py-2 font-bold">{notam.id}</td>
                <td className="px-4 py-2">{notam.location}</td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold type-badge type-${notam.type}`}>
                    {notam.type}
                  </span>
                </td>
                <td className="px-4 py-2">{new Date(notam.effectiveDate).toLocaleDateString()}</td>
                <td className="px-4 py-2 truncate max-w-md">{notam.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotamList;
