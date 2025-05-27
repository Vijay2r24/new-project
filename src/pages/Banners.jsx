import React, { useRef, useState } from 'react';
import { Plus, ArrowLeft, ArrowRight, Trash2, MoreVertical, Image as ImageIcon } from 'lucide-react';
import { IoIosSearch } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

const aInitialBanners = [
  {
    BannerID: 1,
    BannerName: 'Summer Sale',
    Status: 'Active',
    BannerImages: [
      { BannerImageID: '1-1', BannerImage: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&w=600' },
      { BannerImageID: '1-2', BannerImage: 'https://images.pexels.com/photos/3184451/pexels-photo-3184451.jpeg?auto=compress&w=600' },
    ],
  },
  {
    BannerID: 2,
    BannerName: 'New Arrivals',
    Status: 'Inactive',
    BannerImages: [
      { BannerImageID: '2-1', BannerImage: 'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&w=600' },
      { BannerImageID: '2-2', BannerImage: 'https://images.pexels.com/photos/2983463/pexels-photo-2983463.jpeg?auto=compress&w=600' },
      { BannerImageID: '2-3', BannerImage: 'https://images.pexels.com/photos/2983462/pexels-photo-2983462.jpeg?auto=compress&w=600' },
    ],
  },
  {
    BannerID: 3,
    BannerName: 'Festive Offers',
    Status: 'Active',
    BannerImages: [
      { BannerImageID: '3-1', BannerImage: 'https://images.pexels.com/photos/3769747/pexels-photo-3769747.jpeg?auto=compress&w=600' },
    ],
  },
  {
    BannerID: 4,
    BannerName: 'Clearance',
    Status: 'Inactive',
    BannerImages: [
      { BannerImageID: '4-1', BannerImage: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&w=600' },
      { BannerImageID: '4-2', BannerImage: 'https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&w=600' },
    ],
  },
  {
    BannerID: 5,
    BannerName: 'Flash Deals',
    Status: 'Active',
    BannerImages: [
      { BannerImageID: '5-1', BannerImage: 'https://images.pexels.com/photos/325876/pexels-photo-325876.jpeg?auto=compress&w=600' },
      { BannerImageID: '5-2', BannerImage: 'https://images.pexels.com/photos/325877/pexels-photo-325877.jpeg?auto=compress&w=600' },
    ],
  },
  {
    BannerID: 6,
    BannerName: 'Winter Collection',
    Status: 'Inactive',
    BannerImages: [
      { BannerImageID: '6-1', BannerImage: 'https://images.pexels.com/photos/167964/pexels-photo-167964.jpeg?auto=compress&w=600' },
    ],
  },
];

const Banners = () => {
  const [banners, setBanners] = useState(aInitialBanners);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 6;
  const [activeMenu, setActiveMenu] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState({});
  const fileInputRef = useRef();
  const navigate = useNavigate();

  // Search
  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const filteredBanners = banners.filter(b =>
    b.BannerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(b.BannerID).includes(searchQuery)
  );

  // Pagination
  const paginatedBanners = filteredBanners.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  // Carousel controls
  const handleCarouselLeft = (id, images) => {
    setCarouselIndex(idx => ({
      ...idx,
      [id]: idx[id] > 0 ? idx[id] - 1 : images.length - 1
    }));
  };
  const handleCarouselRight = (id, images) => {
    setCarouselIndex(idx => ({
      ...idx,
      [id]: idx[id] < images.length - 1 ? idx[id] + 1 : 0
    }));
  };

  // Dropdown menu
  const toggleMenu = (id) => setActiveMenu(activeMenu === id ? null : id);

  // Edit/Delete handlers (simulate)
  const handleEditBanner = (id) => alert('Edit banner: ' + id);
  const handleDeleteBanner = (id) => {
    setBanners(prev => prev.filter(b => b.BannerID !== id));
    setActiveMenu(null);
  };

  // Status toggle
  const handleToggleStatus = (id, status) => {
    setBanners(prev => prev.map(b => b.BannerID === id ? { ...b, Status: status === 'Active' ? 'Inactive' : 'Active' } : b));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen">
      {/* Header with Background */}
      <div className="relative rounded-2xl overflow-hidden mb-8 border border-sky-100/50">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-indigo-100" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-200/40 via-transparent to-indigo-200/40" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-white/80 rounded-lg">
              <ImageIcon className="h-6 w-6 text-custom-bg" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
            <div className="flex-1" />
              <button
                type="button"
              className="btn-primary flex items-center gap-2"
              onClick={() => navigate('/banners-create')}
              >
              <Plus className="h-5 w-5" />
              Create Banner
              </button>
      </div>
      {/* Search Bar */}
          <div className="mt-4 max-w-lg">
          <div className="relative flex items-center">
            <input
              id="searchName"
              type="text"
                placeholder="Search by Banner Number / Banner Name"
              value={searchQuery}
              onChange={handleSearchChange}
                className="p-2 pr-10 border border-gray-300 rounded-lg w-full text-sm leading-6 h-[40px] focus:ring-2 focus:ring-custom-bg focus:border-custom-bg"
            />
              <div className="absolute right-3 text-gray-400">
              <IoIosSearch />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Banner Grid */}
      <div>
        <div className="grid grid-cols-1 mt-4 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedBanners.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-10">No banners found.</div>
          )}
          {paginatedBanners.map((project) => (
            <div
              key={project.BannerID}
              className="bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col transition-transform transform hover:scale-[1.03] border border-gray-100"
            >
              {/* Carousel Section */}
              <div className="relative w-full">
                {project.BannerImages && project.BannerImages.length > 0 ? (
                  <div className="relative">
                    <img
                      src={project.BannerImages[carouselIndex[project.BannerID] || 0].BannerImage}
                      alt={`Banner ${project.BannerName}`}
                      className="w-full aspect-[16/9] object-cover"
                    />
                    {project.BannerImages.length > 1 && (
                      <>
                        <button
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                          onClick={() => handleCarouselLeft(project.BannerID, project.BannerImages)}
                          aria-label="Previous"
                          type="button"
                        >
                          <ArrowLeft className="h-5 w-5 text-custom-bg" />
                        </button>
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                          onClick={() => handleCarouselRight(project.BannerID, project.BannerImages)}
                          aria-label="Next"
                          type="button"
                        >
                          <ArrowRight className="h-5 w-5 text-custom-bg" />
                        </button>
                        {/* Carousel Dots */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {project.BannerImages.map((img, idx) => (
                            <span
                              key={img.BannerImageID}
                              className={`w-2 h-2 rounded-full ${idx === (carouselIndex[project.BannerID] || 0) ? 'bg-custom-bg' : 'bg-gray-300'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <img
                    src="/placeholder.jpg"
                    alt="Placeholder"
                    className="w-full aspect-[16/9] object-cover"
                  />
                )}
                {/* Status Badge */}
                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow ${project.Status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {project.Status}
                </span>
                {/* Action Menu */}
                <div className="absolute top-3 right-3 z-20">
                    <button
                    className="text-gray-400 hover:text-custom-bg p-1 rounded-full focus:outline-none"
                      onClick={() => toggleMenu(project.BannerID)}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {activeMenu === project.BannerID && (
                    <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl z-30 min-w-[120px] border border-gray-100">
                        <ul className="text-sm text-gray-700">
                          <li
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer rounded-t-xl"
                            onClick={() => handleEditBanner(project.BannerID)}
                          >
                            Edit
                          </li>
                          <li
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer rounded-b-xl text-red-600"
                            onClick={() => handleDeleteBanner(project.BannerID)}
                          >
                            Delete
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              {/* Content Section */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-base font-semibold text-gray-900 truncate mb-2">
                  {project.BannerName || 'Unnamed Banner'}
                </h3>
                <div className="flex items-center justify-between mt-auto">
                  {/* Toggle Switch */}
                  <div
                    onClick={() => handleToggleStatus(project.BannerID, project.Status)}
                    className={`relative w-10 h-5 rounded-full cursor-pointer transition-all duration-200 ${project.Status === 'Active' ? 'bg-green-400' : 'bg-red-400'}`}
                  >
                    <div
                      className={`absolute top-1/2 left-0.5 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${project.Status === 'Active' ? 'translate-x-5' : 'translate-x-0'}`}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ml-3 ${project.Status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                    {project.Status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-between mt-8">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-custom-bg font-semibold shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            disabled={(page + 1) * rowsPerPage >= filteredBanners.length}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-custom-bg font-semibold shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banners; 