
import React, { useContext } from "react";
import { LocationDataContext } from "../../context/LocationDataProvider";
const StatusBadge = ({ status }) => {
  const { orderStatusData } = useContext(LocationDataContext);

  console.log("orderStatusData", orderStatusData);

  // Safely access color from orderStatusData.data
  const statusColor = orderStatusData?.data?.find(
    (statusItem) => statusItem.OrderStatus === status
  )?.HexColorCode;

  const badgeColor = statusColor || "#000";

  return (
    <span
      className="px-2 py-1 rounded-full text-white text-xs"
      style={{
        backgroundColor: badgeColor,
        boxShadow: `0 0 0 1px ${badgeColor}30`,
      }}
    >
      {status}
    </span>
  );
};


export default StatusBadge;