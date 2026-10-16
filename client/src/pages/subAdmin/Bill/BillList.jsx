import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";
import { confirmPayment, getBills } from "../../../services/billService";
import { SUB_ADMIN_ROUTE } from "../../../Constant/RoutesConstant";
import { useNavigate } from "react-router-dom";

function BillList() {
  const [bills, setBills] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await getBills();

      if (res.success) {
        setBills(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handlePayment = async (id) => {
    try {
      const res = await confirmPayment(id, {
        payment_method: "Cash",
      });

      if (res.success) {
        toast.success("Payment Completed");
        fetchBills();
      }
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* HEADER */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Bill Management</h3>
          <p className="text-muted mb-0">
            Manage payments and track restaurant bills
          </p>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="border rounded-3 px-3 py-2 bg-white shadow-sm">
            <small className="text-muted d-block">Total Bills</small>
            <h5 className="fw-bold mb-0">{bills.length}</h5>
          </div>

          <div className="border rounded-3 px-3 py-2 bg-white shadow-sm">
            <small className="text-muted d-block">Paid Bills</small>
            <h5 className="fw-bold text-success mb-0">
              {bills.filter(
                (bill) => bill.payment_status === "Paid"
              ).length}
            </h5>
          </div>
        </div>
      </div>

      {/* BILL TABLE */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

        <div className="card-header bg-white border-0 px-4 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold mb-1">All Bills</h5>
              {/* <small className="text-muted">
                Payment records and bill details
              </small> */}
            </div>

            <span className="badge bg-light text-dark rounded-pill px-3 py-2">
              {bills.filter(
                (bill) => bill.payment_status === "Pending"
              ).length} Pending
            </span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">

            <thead className="table-light">
              <tr>
                <th className="py-3 px-4">Bill Details</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Payment Status</th>
                <th className="py-3">Payment Method</th>
                <th className="py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {bills.map((bill) => (
                <tr key={bill._id}>

                  {/* BILL NUMBER */}
                  <td className="px-4 py-2">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-light rounded-3 p-3">
                        <span className="fw-bold">₹</span>
                      </div>

                      <div>
                        <div className="fw-bold">
                          {bill.bill_number}
                        </div>
                        {/* <small className="text-muted">
                          Restaurant Bill
                        </small> */}
                      </div>
                    </div>
                  </td>

                  {/* AMOUNT */}
                  <td>
                    <span className="fw-bold fs-6 ">
                      ₹{Number(bill.grand_total || 0).toLocaleString("en-IN")}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td>
                    <span
                      className={`badge rounded-pill px-3 py-2 ${bill.payment_status === "Paid"
                          ? "bg-success-subtle text-success"
                          : "bg-warning-subtle text-warning-emphasis"
                        }`}
                    >
                      <span className="me-1">
                        {bill.payment_status === "Paid"
                          ? "●"
                          : "●"}
                      </span>
                      {bill.payment_status}
                    </span>
                  </td>

                  {/* METHOD */}
                  <td>
                    <span className="text-capitalize">
                      {bill.payment_method || "Not selected"}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td>
                    <div className="d-flex justify-content-center align-items-center gap-2">

                      {bill.payment_status === "Pending" ? (
                        <button type="button"className="btn btn-success btn-sm rounded-3 px-3"
                          onClick={() => handlePayment(bill._id)}>
                          <FaCheckCircle className="me-1" />
                          Pay Now
                        </button>
                      ) : (
                        <span className="text-success fw-semibold small">
                          <FaCheckCircle className="me-1" />
                          Paid
                        </span>
                      )}

                      <button
                        type="button"
                        className="btn btn-light border btn-sm rounded-3"
                        title="View Bill"
                        onClick={() => navigate( `${SUB_ADMIN_ROUTE.BILL}/${bill._id}`)} >
                        <FaEye />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}

              {bills.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="mb-3 fs-1">🧾</div>
                    <h6 className="fw-bold">No Bills Found</h6>
                    <p className="text-muted mb-0">
                      Generated bills will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* FOOTER */}
        {bills.length > 0 && (
          <div className="card-footer bg-white border-0 px-4 py-3">
            <small className="text-muted">
              Showing {bills.length} bill{bills.length !== 1 ? "s" : ""}
            </small>
          </div>
        )}

      </div>
    </div>
  );
}

export default BillList;