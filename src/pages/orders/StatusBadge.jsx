import { useOrderStatuses } from "../../context/AllDataContext";
import { useMemo } from "react";

const StatusBadge = ({ status }) => {
  const { data: orderStatusData } = useOrderStatuses();

  const orderStatusArray = useMemo(() => {
    if (!orderStatusData) return [];
    if (Array.isArray(orderStatusData)) return orderStatusData;
    if (orderStatusData.data && orderStatusData.data.data && Array.isArray(orderStatusData.data.data.rows)) {
      return orderStatusData.data.data.rows;
    }
    if (orderStatusData.data && Array.isArray(orderStatusData.data.rows)) return orderStatusData.data.rows;
    if (orderStatusData.rows && Array.isArray(orderStatusData.rows)) return orderStatusData.rows;
    if (orderStatusData && typeof orderStatusData === 'object') return [orderStatusData];
    return [];
  }, [orderStatusData]);

  const statusColor = orderStatusArray.find(
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
