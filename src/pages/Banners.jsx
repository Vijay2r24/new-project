import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { apiGet, apiPatch } from '../utils/ApiUtils';
import { GetAllBanners, UpdateBannerStatus } from '../contants/apiRoutes';
import { showEmsg } from '../utils/ShowEmsg';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { useTitle } from '../context/TitleContext';
import { STATUS } from '../contants/constants';


const Banners = () => {
  const [aBanners, setBanners] = useState([]);
  const [nPage, setPage] = useState(1);
  const rowsPerPage = 6;
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [nActiveMenu, setActiveMenu] = useState(null);
  const [sError, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setTitle } = useTitle();

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1024 },
      items: 1
    },
    desktop: {
      breakpoint: { max: 1024, min: 768 },
      items: 1
    },
    tablet: {
      breakpoint: { max: 768, min: 464 },
      items: 1
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
  };

  useEffect(() => {
    setTitle('Banners');
    return () => setTitle('');
  }, [setTitle]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await apiGet(GetAllBanners, { pageNumber: nPage, pageSize: rowsPerPage }, token);
        if (response.data && response.data.status === STATUS.SUCCESS_1) {
          setBanners(response.data.data || []);
          setTotalPages(response.data.totalPages || 1);
          setTotalRecords(response.data.totalRecords || 0);
          setError(null);
        } else {
          setBanners([]);
          setTotalPages(1);
          setTotalRecords(0);
          setError(response.data?.message || t('common.errorMessage'));
        }
      } catch (err) {
        setBanners([]);
        setTotalPages(1);
        setTotalRecords(0);
        const backendMessage = err?.response?.data?.message;
        setError(backendMessage || t('common.errorMessage'));
      }
    };
    fetchBanners();
  }, [nPage, t]);

  const paginatedBanners = aBanners;

  const toggleMenu = (id) => setActiveMenu(nActiveMenu === id ? null : id);
  const handleEditBanner = (id) => alert('Edit banner: ' + id);
  const handleDeleteBanner = (id) => {
    setBanners(prev => prev.filter(b => b.BannerID !== id));
    setActiveMenu(null);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      const response = await apiPatch(`${UpdateBannerStatus}/${id}`, { status: newStatus }, token);
      if (response.data && response.data.status === 'SUCCESS') {
        setBanners(prev => prev.map(b => b.BannerID === id ? { ...b, Status: newStatus } : b));
        showEmsg(response.data.message || t('bannerform.bannerStatusUpdateSuccess'), 'success');
      } else {
        showEmsg(response.data?.message || t('bannerform.bannerStatusUpdateError'), 'error');
      }
    } catch (err) {
      showEmsg(t('bannerform.bannerStatusUpdateError'), 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1" />
        <button
          type="button"
          className="btn-primary flex items-center gap-2"
          onClick={() => navigate('/banners-create')}
        >
          <Plus className="h-5 w-5" />
         {t('bannerform.create_banner')}
        </button>
      </div>
      <div>
        {sError && (
          <div className="mb-4 text-red-500 text-center">{sError}</div>
        )}
        <div className="grid grid-cols-1 mt-4 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedBanners.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-10">{t('bannerform.noBannersFound')}</div>
          )}
          {paginatedBanners.map((project) => (
            <div
              key={project.BannerID}
              className="bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col transition-transform transform hover:scale-[1.03] border border-gray-100"
            >
              <div className="relative w-full">
                {project.BannerImages && project.BannerImages.length > 0 ? (
                  <Carousel
                    responsive={responsive}
                    infinite={true}
                    autoPlay={false}
                    arrows={true}
                  >
                    {project.BannerImages.map((image) => (
                      <img
                        key={image.BannerImageID}
                        src={image.BannerImage}
                        alt={`Banner ${project.BannerName}`}
                        className="w-full aspect-[16/9] object-cover"
                      />
                    ))}
                  </Carousel>
                ) : (
                  <img
                    src="/placeholder.jpg"
                    alt="Placeholder"
                    className="w-full aspect-[16/9] object-cover"
                  />
                )}
                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow ${project.Status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {project.Status}
                </span>
                <div className="absolute top-3 right-3 z-20">
                  <button
                    className="text-gray-400 hover:text-custom-bg p-1 rounded-full focus:outline-none"
                    onClick={() => toggleMenu(project.BannerID)}
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  {nActiveMenu === project.BannerID && (
                    <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl z-200 min-w-[120px] border border-gray-100">
                      <ul className="text-sm text-gray-700">
                        <li
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer rounded-t-xl"
                          onClick={() => handleEditBanner(project.BannerID)}
                        >
                         {t('common.edit')}
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer rounded-b-xl text-red-600"
                          onClick={() => handleDeleteBanner(project.BannerID)}
                        >
                         {t('common.delete')}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-base font-semibold text-gray-900 truncate mb-2">
                  {project.BannerName || 'Unnamed Banner'}
                </h3>
                <div className="flex items-center justify-between mt-auto">
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
        <div className="flex justify-between mt-8">
          <button
            disabled={nPage === 1}
            onClick={() => setPage(nPage - 1)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-custom-bg font-semibold shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.previous')}
          </button>
          <span className="text-gray-600 flex items-center">Page {nPage} of {totalPages} ({totalRecords} total)</span>
          <button
            disabled={nPage === totalPages}
            onClick={() => setPage(nPage + 1)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-custom-bg font-semibold shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
           {t('common.next')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banners; 