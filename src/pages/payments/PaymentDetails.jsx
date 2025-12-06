import React from "react";
import { CheckCircle, XCircle, CreditCard, Clock } from "lucide-react";
import { useEffect } from "react";
import { useTitle } from "../../context/TitleContext";

const PaymentDetails = () => {
   const { setTitle } = useTitle();
  
    useEffect(() => {
      setTitle("Payments");
    }, []);
  const paymentHistory = [
    {
      id: "txn_001",
      planName: "Bronze",
      amount: 499,
      currency: "INR",
      paymentMethod: "Razorpay",
      status: "Success",
      date: "2025-01-10",
      transactionId: "pay_KL45XH89ABCD12",
    },
    {
      id: "txn_002",
      planName: "Silver",
      amount: 999,
      currency: "INR",
      paymentMethod: "Razorpay",
      status: "Pending",
      date: "2025-01-12",
      transactionId: "pay_OP45XH12XYZA34",
    },
    {
      id: "txn_003",
      planName: "Gold",
      amount: 1499,
      currency: "INR",
      paymentMethod: "Razorpay",
      status: "Success",
      date: "2025-01-14",
      transactionId: "pay_KL85OI12PQRS45",
    },
    {
      id: "txn_004",
      planName: "Diamond",
      amount: 1999,
      currency: "INR",
      paymentMethod: "Razorpay",
      status: "Failed",
      date: "2025-01-16",
      transactionId: "pay_NM34LK09ZYXW78",
    },
    {
      id: "txn_005",
      planName: "Platinum",
      amount: 2499,
      currency: "INR",
      paymentMethod: "Razorpay",
      status: "Pending",
      date: "2025-01-18",
      transactionId: "pay_KLBVPO18JKLM78",
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Payment History</h2>

      <div className="rounded-xl border shadow-md overflow-hidden bg-white">
        <table className="w-full text-center">
          <thead>
            <tr className="bg-[#F9FAFB] text-[#6B7280]">
              <th className="p-4">Plan</th>
              <th className="p-4">Payment Method</th>
              <th className="p-4">Payment ID & Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {paymentHistory.map((payment) => (
              <tr
                key={payment.id}
                className="border-b hover:bg-gray-100 transition"
              >
                <td className="p-4 font-medium capitalize">{payment.planName}</td>

                <td className="p-4 flex items-center justify-center gap-2">
                  <CreditCard size={18} className="text-indigo-600" />
                  {payment.paymentMethod}
                </td>

                {/* PaymentId + Date */}
                <td className="p-4 text-gray-700">
                  <div className="font-medium">{payment.transactionId}</div>
                  <div className="text-xs text-gray-500 mt-1">{payment.date}</div>
                </td>

                <td className="p-4 text-gray-700">₹{payment.amount}</td>

                <td className="p-4">
                  {payment.status === "Success" && (
                    <span className="flex items-center justify-center gap-1 text-green-600 bg-green-100 px-3 py-1 rounded-full w-fit text-sm font-semibold mx-auto">
                      <CheckCircle size={16} />
                      Success
                    </span>
                  )}

                  {payment.status === "Failed" && (
                    <span className="flex items-center justify-center gap-1 text-red-600 bg-red-100 px-3 py-1 rounded-full w-fit text-sm font-semibold mx-auto">
                      <XCircle size={16} />
                      Failed
                    </span>
                  )}

                  {payment.status === "Pending" && (
                    <span className="flex items-center justify-center gap-1 text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full w-fit text-sm font-semibold mx-auto">
                      <Clock size={16} />
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentDetails;
