import React, { useState, useRef, useEffect } from "react";
import TextInputWithIcon from "../components/TextInputWithIcon";
import { PaintBucket, UploadCloud, Pencil, Save, X } from "lucide-react";
import { useTitle } from "../context/TitleContext";
import { useTranslation } from "react-i18next";
import electronics from "../../assets/images/electronics.jpg";
import women from "../../assets/images/women.jpg";
import men from "../../assets/images/men.jpg";
import kids from "../../assets/images/kids.jpg";
import beauty from "../../assets/images/beauty.jpg";
import accessories from "../../assets/images/accessories.jpg";
import banner1 from "../../assets/images/banner1.jpg";
import mobile from "../../assets/images/mobile.jpg";


const categories = [beauty, women, men, kids, accessories, mobile];
const products = [beauty, women, men];
const TenantSettings = () => {
  const [primaryColor, setPrimaryColor] = useState("#ff5a5f");
  const [logo, setLogo] = useState(null);
  const [editPortal, setEditPortal] = useState(false);
  const { t } = useTranslation();

  const [portal, setPortal] = useState({
    customerPortal: "",
    adminPortal: "",
    gstNo: "",
  });

  const { setTitle } = useTitle();
  const defaultColor = "#000000";

  const fileInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setLogo(URL.createObjectURL(file));
  };

  const handleUpdate = () => {
    console.log("Updated portal:", portal);
    setEditPortal(false);
  };

  useEffect(() => {
    setTitle("Tenant Settings");
  }, [setTitle]);

  return (
    <>
      <div className="mt-2">
        <h1 className="text-xl font-bold mb-6 text-[#FF5A5F]">Tenant Settings</h1>

        <div className="flex gap-0">
          <div className="w-[1200px] h-[500px] bg-white p-6 rounded-2xl shadow-lg border">
            <TextInputWithIcon
              label="Primary Color"
              value={primaryColor}
              Icon={PaintBucket}
              placeholder={defaultColor}
              inputSlot={
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-full cursor-pointer"
                />
              }
            />


            <div className="mt-6">
              <SectionCard
                title="Portal Information"
                editing={editPortal}
                onEdit={() => setEditPortal(true)}
                onCancel={() => setEditPortal(false)}
                onUpdate={() => handleUpdate("portal")}
              >
                <EditableItem label="Customer Portal" value={portal.customerPortal} editing={editPortal} onChange={(v) => setPortal({ ...portal, customerPortal: v })} />
                <EditableItem label="Admin Portal" value={portal.adminPortal} editing={editPortal} onChange={(v) => setPortal({ ...portal, adminPortal: v })} />
                <EditableItem label="GST Number" value={portal.gstNo} editing={editPortal} onChange={(v) => setPortal({ ...portal, gstNo: v })} />
              </SectionCard>
            </div>
          </div>

          {/* RIGHT PREVIEW */}
          <div className="w-[70%] flex flex-col items-center -mt-10 ml-auto pr-5">
            <h2 className="text-xl font-semibold mb-3">Web Preview</h2>

            <div className="origin-top-right scale-[0.85] w-[750px] h-[660px] overflow-y-auto bg-white shadow-xl rounded-2xl border p-0">
              {/* HEADER */}
              <div className="w-full px-6 py-4 flex items-center justify-between shadow-sm"
                style={{ backgroundColor: primaryColor }}>
                <div className="text-white text-2xl cursor-pointer">☰</div>
                <div className="flex items-center gap-2">
                  {logo ? (
                    <img src={logo} className="h-10 object-contain rounded-md bg-white/20 p-1" />
                  ) : (
                    <h2 className="text-3xl font-bold text-white">ShopNow</h2>
                  )}
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
                    What are you looking for today!
                  </h1>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}>
                    🔔
                  </div>
                </div>

                {/* BANNER */}
                <div className="mt-6 rounded-2xl overflow-hidden flex items-center justify-center bg-white">
                  <img src={banner1} className="w-full object-contain rounded-2xl" />
                </div>

                {/* CATEGORIES */}
                <div className="mt-10">
                  <h3 className="text-xl font-bold mb-4">Categories</h3>
                  <div className="flex gap-5 flex-wrap">
                    {categories.map((cat, i) => (
                      <div key={i} className="flex flex-col items-center w-24">
                        <div className="w-full aspect-square overflow-hidden rounded-xl shadow-md">
                          <img src={cat} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-sm mt-2 font-semibold">Category {i + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TRENDING */}
                <div className="mt-10">
                  <h3 className="text-xl font-bold mb-4">Trending Now</h3>
                  <div className="grid grid-cols-3 gap-5">
                    {products.map((img, i) => (
                      <div key={i} className="bg-white rounded-xl shadow-md border">
                        <div className="aspect-[4/3] w-full overflow-hidden rounded-t-xl">
                          <img src={img} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-semibold">Product {i + 1}</p>
                          <p className="text-sm font-semibold" style={{ color: primaryColor }}>₹999</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

    </>
  );

};

export default TenantSettings;

/* --------------------- REUSABLE COMPONENTS -------------------- */

const SectionCard = ({ title, children, editing, onEdit, onCancel, onUpdate }) => (
  <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4 w-full">
    <div className="flex items-center justify-between border-b pb-3">
      <h2 className="text-lg font-semibold">{title}</h2>

      {!editing && (
        <button
          className="px-4 py-1 bg-custom-bg text-white rounded-lg flex items-center gap-2"
          onClick={onEdit}
        >
          <Pencil size={18} /> Edit
        </button>
      )}
    </div>

    {/* First row 2 columns */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children.slice(0, 2)}
    </div>

    {/* Second row full width */}
    <div className="grid grid-cols-1 gap-6">
      {children.slice(2)}
    </div>

    {editing && (
      <div className="flex justify-end gap-3 border-t pt-4">
        <button className="px-5 py-2 border rounded-lg flex items-center gap-2" onClick={onCancel}>
          <X size={18} /> Cancel
        </button>

        <button className="px-5 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2" onClick={onUpdate}>
          <Save size={18} /> Update
        </button>
      </div>
    )}
  </div>
);


const EditableItem = ({ label, value, editing, onChange }) => (
  <div>
    <p className="text-sm text-gray-600">{label}</p>
    {editing ? (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border p-2 rounded-md"
      />
    ) : (
      <p className="font-medium text-gray-900">{value || "—"}</p>
    )}
  </div>
);
