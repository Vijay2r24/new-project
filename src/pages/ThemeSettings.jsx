import React, { useState, useRef ,useEffect} from "react";
import { PaintBucket, UploadCloud } from "lucide-react";
import TextInputWithIcon from "../components/TextInputWithIcon";
import electronics from "../../assets/images/electronics.jpg";
import women from "../../assets/images/women.jpg";
import men from "../../assets/images/men.jpg";
import kids from "../../assets/images/kids.jpg";
import beauty from "../../assets/images/beauty.jpg";
import accessories from "../../assets/images/accessories.jpg";
import banner1 from "../../assets/images/banner1.jpg";
import mobile from "../../assets/images/mobile.jpg";
import { useTitle } from "../context/TitleContext";

const ThemeSettings = () => {
  const defaultColor = "#FF5A5F";
  const [primaryColor, setPrimaryColor] = useState(defaultColor);
  const [logo, setLogo] = useState(null);
  const { setTitle } = useTitle();

  const fileInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setLogo(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setPrimaryColor(defaultColor);
    setLogo(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  const categories = [women, beauty, kids, men, accessories, mobile];
    useEffect(() => {
      setTitle("Theme Settings");
    }, [setTitle]);

  return (
    <div className="flex gap-10 p-6">

      {/* LEFT PANEL */}
      <div className="w-[55%] space-y-6">

        {/* PRIMARY COLOR */}
        <TextInputWithIcon
          label="Primary Color"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          Icon={PaintBucket}
          placeholder={defaultColor}
          inputSlot={
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-7 h-7 border rounded-full cursor-pointer"
            />
          }
        />

        {/* UPLOAD LOGO */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold">Upload Logo</label>

          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="absolute w-full h-full opacity-0 cursor-pointer z-10"
            />

            <div className="w-full border p-3 pl-12 rounded-lg bg-white text-gray-700 flex items-center h-[48px]">
              {logo ? (
                <img src={logo} alt="Logo" className="h-8 object-contain" />
              ) : (
                <span className="text-gray-500">Upload Logo</span>
              )}
            </div>

            {!logo && (
              <UploadCloud
                size={22}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            )}
          </div>
        </div>

        {/* RESET BUTTON */}
        <button
          onClick={handleReset}
          className="w-fit px-4 py-2 mt-2 bg-custom-bg rounded-lg text-sm text-white font-semibold"
        >
          Reset As Default
        </button>
      </div>

      {/* WEB PREVIEW */}
      <div className="w-[70%] flex flex-col items-center -mt-6 ml-auto pr-5">
        <h2 className="text-xl font-semibold mb-3">Web Preview</h2>

        <div className="origin-top-right scale-[0.85] w-[750px] h-[720px] overflow-y-auto bg-white shadow-xl rounded-2xl border border-gray-200 p-0">
          
          {/* HEADER */}
          <div
            className="w-full px-6 py-4 flex items-center justify-between shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="text-white text-2xl cursor-pointer">☰</div>

            <div className="flex items-center gap-2">
              {logo && <img src={logo} alt="Logo" className="h-10 object-contain" />}
              <h2 className="text-3xl font-bold text-white">ShopNow</h2>
            </div>

            <div className="flex items-center gap-4 text-white text-xl">
              <span>❤️</span>
              <span>🛒</span>
            </div>
          </div>

          {/* BODY */}
          <div className="p-6">
            <div className="flex justify-between items-center px-2">
              <h1 className="text-xl font-bold" style={{ color: primaryColor }}>
                "What are you looking for today!"
              </h1>

              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: primaryColor }}
              >
                🔔
              </div>
            </div>

            {/* Banner */}
            <div className="mt-6">
              <div className="rounded-2xl overflow-hidden flex items-center justify-center bg-white">
                <img src={banner1} alt="Sale Banner" className="w-full object-contain rounded-2xl" />
              </div>
            </div>

            {/* Categories */}
            <div className="mt-10">
              <h3 className="text-xl font-bold mb-4">Categories</h3>
              <div className="flex gap-5 flex-wrap">
                {categories.map((cat, i) => (
                  <div key={i} className="flex flex-col items-center w-24">
                    <div className="w-full aspect-square overflow-hidden rounded-xl shadow-md">
                      <img src={cat} alt={`Category ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm mt-2 font-semibold">Category {i + 1}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending */}
            <div className="mt-10">
              <h3 className="text-xl font-bold mb-4">Trending Now</h3>
              <div className="grid grid-cols-3 gap-5">
                {[women, accessories, kids, men, mobile, electronics].map((img, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md border">
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-t-xl">
                      <img src={img} alt="product" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold">Product {i + 1}</p>
                      <p className="text-sm font-semibold" style={{ color: primaryColor }}>
                        ₹999
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
