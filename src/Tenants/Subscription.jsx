import React, { useState } from "react";
import { Plus } from "lucide-react";

// Example subscriptions for monthly and yearly
const monthlyPlans = [
  { id: 1, name: "Basic Plan", price: "$10/mo", features: ["Feature A", "Feature B"] },
  { id: 2, name: "Standard Plan", price: "$25/mo", features: ["Feature A", "Feature B", "Feature C"] },
  { id: 3, name: "Premium Plan", price: "$50/mo", features: ["Feature A", "Feature B", "Feature C", "Feature D"] },
];

const yearlyPlans = [
  { id: 1, name: "Basic Plan", price: "$100/yr", features: ["Feature A", "Feature B"] },
  { id: 2, name: "Standard Plan", price: "$250/yr", features: ["Feature A", "Feature B", "Feature C"] },
  { id: 3, name: "Premium Plan", price: "$500/yr", features: ["Feature A", "Feature B", "Feature C", "Feature D"] },
];

const Subscription = () => {
  const [activeTab, setActiveTab] = useState("monthly"); // monthly or yearly

  const plans = activeTab === "monthly" ? monthlyPlans : yearlyPlans;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-blue-600 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Subscription Plans</h2>
          <button className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
            <Plus size={18} /> Add Subscription
          </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mt-4 border-b border-gray-200">
          <button
            className={`px-6 py-2 font-medium ${
              activeTab === "monthly"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("monthly")}
          >
            Monthly
          </button>
          <button
            className={`px-6 py-2 font-medium ${
              activeTab === "yearly"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("yearly")}
          >
            Yearly
          </button>
        </div>

        {/* Subscription Cards */}
        <div className="p-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((sub) => (
            <div
              key={sub.id}
              className="border border-blue-200 rounded-xl p-5 hover:shadow-md transition bg-white"
            >
              <h3 className="text-lg font-semibold text-blue-600">{sub.name}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{sub.price}</p>
              <ul className="mt-4 space-y-2">
                {sub.features.map((feature, idx) => (
                  <li key={idx} className="text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
 
