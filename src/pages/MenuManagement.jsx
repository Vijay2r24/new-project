import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

// import Select from 'react-select'; // Uncomment if needed for menu management

const MenuManagement = () => {
  const [menuName, setMenuName] = useState('');
  const [description, setDescription] = useState('');
  // Add other state variables for menu details like items, prices, etc.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  // Placeholder data or initial fetch (replace with API fetch later)
  useEffect(() => {
    // Example: Fetch existing menu data if editing, or setup initial form state
  }, []);

  const handleClose = () => {
    // Navigate back to the menu list page (adjust path as needed)
    navigate("/menu-list");
  };

  // Placeholder save handler (replace with actual API call later)
  const handleSaveMenu = (event) => {
      event.preventDefault();
      console.log("Save Menu clicked");
      // Add logic here to gather menu data and save
      // console.log("Menu Name:", menuName);
      // console.log("Description:", description);
       // Example navigation after save (uncomment and adjust as needed)
      // setTimeout(() => {
      //   navigate("/menu-list");
      // }, 1000);
  };

  // Simplified validation for UI example
   const validateMenuDataSubmit = () => {
      const newErrors = {};
      if (!menuName) {
        newErrors.menuNameError = "Menu Name is required.";
      }
      // Add validation for other fields
      setErrors(newErrors);
      return Object.keys(newErrors).length > 0;
    };

  if (error) return <div>{error}</div>;

  return (
    <div className={`main-container`}>
      <div className=" p-6 rounded-lg ">
        <h2 className="heading">Add/Edit Menu</h2> {/* Updated heading */}
        <hr className="border-gray-300 my-4 mb-4" />

        <form onSubmit={handleSaveMenu}>
          <div className="mb-4 flex flex-col items-center justify-center">
            <div className=" flex flex-col sm:flex-row justify-center items-center w-full ">
              <label className="block font-semibold mr-[14px]">
                Menu Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={menuName}
                onChange={(e) => {setMenuName(e.target.value); setErrors(prev => ({ ...prev, menuNameError: undefined }));}}
                className={`border ${
                  errors.menuNameError && !menuName ? "border-red-500" : "border-gray-300"
                } p-2 w-full sm:w-1/2 rounded-md`}
                placeholder="Enter Menu Name"
              />
            </div>
            <div className="w-full sm:w-1/2 flex justify-center sm:mr-[300px] mt-1 mb-1 ">
              {errors.menuNameError && !menuName && (
                <p className="text-red-500 text-sm ">{errors.menuNameError}</p>
              )}
            </div>
          </div>

          {/* Add other form fields for menu details here */}
           <div className="mb-4 flex flex-col items-center justify-center">
            <div className=" flex flex-col sm:flex-row justify-center items-center w-full ">
              <label className="block font-semibold mr-[14px]">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`border border-gray-300 p-2 w-full sm:w-1/2 rounded-md`}
                placeholder="Enter Description"
                rows="4"
              />
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              className="bg-gray-200 px-4 py-2 rounded shadow w-full sm:w-auto"
              onClick={handleClose}
              type="button"
            >
              Close
            </button>
            <button
              className="bg-[#003375] text-white px-4 py-2 rounded shadow w-full sm:w-auto"
               onClick={(e) => {
                if (!validateMenuDataSubmit()) {
                  handleSaveMenu(e);
                }
              }}
              type="submit"
            >
              Save Menu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuManagement; 