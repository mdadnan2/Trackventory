'use client';

import { useState } from 'react';
import { Package as PackageIcon, Search, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';

export function VolunteerPackagesView({ volunteerPackages }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const itemsPerPage = 10;

  // Filter and paginate packages
  const filteredPackages = volunteerPackages.filter((vp: any) => 
    vp.package.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vp.package.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPackages = filteredPackages.slice(startIndex, endIndex);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Package Management</h1>
        <p className="text-sm text-gray-500 mt-1">View available packages for distribution</p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search packages..."
          className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Package List */}
      {paginatedPackages.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <PackageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No packages found' : 'No Packages Available'}
          </h3>
          <p className="text-gray-600">
            {searchQuery ? 'Try adjusting your search' : 'Request packages from the Stock page'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedPackages.map((vp: any) => {
              const totalItems = vp.package.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
              return (
                <div
                  key={vp.package._id}
                  className="bg-white border border-gray-200 rounded-xl px-5 py-4 hover:bg-gray-50 transition flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900">{vp.package.name}</h3>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        {vp.available} available
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {vp.package.items.length} {vp.package.items.length === 1 ? 'item' : 'items'} • {totalItems} total quantity
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPackage(vp)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1}–{Math.min(endIndex, filteredPackages.length)} of {filteredPackages.length} packages
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`rounded-lg px-3 py-1.5 text-sm ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View Package Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-lg max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{selectedPackage.package.name}</h2>
              <button onClick={() => setSelectedPackage(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="text-sm text-blue-700 mb-1">Available Packages</div>
                <div className="text-3xl font-bold text-blue-900">{selectedPackage.available}</div>
              </div>
              {selectedPackage.package.description && (
                <p className="text-sm text-gray-600 mb-4">{selectedPackage.package.description}</p>
              )}
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">Items in this package:</div>
                {selectedPackage.package.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">
                      {typeof item.itemId === 'object' ? item.itemId.name : 'Item'}
                    </div>
                    <div className="text-gray-600">
                      {item.quantity} {typeof item.itemId === 'object' ? item.itemId.unit : ''}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSelectedPackage(null)}
                className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
