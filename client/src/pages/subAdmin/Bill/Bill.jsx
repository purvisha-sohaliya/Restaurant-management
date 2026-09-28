import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { confirmPayment, getBillById, } from "../../../services/billService";
import { toast } from "react-toastify";

function Bill() {
  const { id } = useParams();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState("Cash");

  useEffect(() => {
    loadBill();
  }, [id]);

  const loadBill = async () => {
    try {
      const res = await getBillById(id);
      console.log("FULL BILL RESPONSE:", res);

      if (res.success) {
        setBill(res.data);

        if (res.data.payment_method) {
          setSelectedPayment(res.data.payment_method);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load bill");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      const res = await confirmPayment(bill._id, {
        payment_method: selectedPayment,
      });

      if (res.success) {
        toast.success("Payment Successful");
        loadBill();
      }
    } catch (err) {
      console.log(err);
      toast.error("Payment failed");
    }
  };

  if (loading) {
    return <h3>Loading...</h3>;
  }

  if (!bill) {
    return <h3>Bill Not Found</h3>;
  }

  // Bill Calculations
  const subtotal = Number(bill.sub_total || 0);
  const discountPercent = Number(bill.discount_percent || 0);
  const discountAmount = Number(bill.discount_amount || 0);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxPercent = Number(bill.tax_percent || 0);
  const taxAmount = Number(bill.tax_amount || 0);
  const grandTotal = Number(bill.grand_total || 0);

  // Restaurant Details
  const restaurant = bill.restaurant_id || {};
  const restaurantName = restaurant.restaurant_name || "Restaurant Name";
  const restaurantAddress = restaurant.address || "Restaurant Address";

  // order details
  const customerName = bill.order_id?.customer_name || "Customer";

  //  Date
  const billDate = bill.createdAt
    ? new Date(bill.createdAt).toLocaleDateString("en-IN")
    : "-";

  const billTime = bill.createdAt
    ? new Date(bill.createdAt).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })
    : "-";

  return (
    <div className="bill-page d-flex justify-content-center py-5 px-3 bg-light">
      <div className="settle-bill-card w-100 bg-white rounded-3 p-3 shadow">

        {/* Restaurant Header */}
        <div className="text-center border-bottom pb-3 mb-3">
          <h4 className="fw-bold mb-1 text-dark">
            {restaurantName}
          </h4>

          <div className="text-muted small">
            {restaurantAddress}
          </div>
        </div>
        {/* Bill info */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <div className="mb-1">
              <span className="text-muted">Bill No:</span>{" "}
              <strong className="text-dark">{bill.bill_number || "-"}</strong>
            </div>
            <div className="mb-1">
              <span className="text-muted">Customer:</span>{" "}
              <strong className="text-dark">{customerName}</strong>
            </div>
          </div>

          <div className="text-end">
            <div className="small text-muted">Date: {billDate} </div>
            <div className="small text-muted">Time: {billTime}</div>
          </div>
        </div>

        {/* Items */}
        <div className="border rounded-3 p-3 mb-3">

          {/* Item Header */}
          <div className="d-flex align-items-center border-bottom pb-2 mb-2 fw-semibold text-secondary">
            <div style={{ width: "45%" }}>Item</div>
            <div className="text-center" style={{ width: "15%" }}>Qty</div>
            <div className="text-end" style={{ width: "20%" }}> Rate</div>
            <div className="text-end" style={{ width: "20%" }}> Amount</div>
          </div>

          {/* Item */}
          {bill.items?.map((item, index) => {
            const quantity = Number(item.quantity || item.qty || 1);
            const rate = Number(item.price || item.rate || 0);
            const amount = Number(item.amount || item.total);
            const itemName = item.item_name || "Item";

            return (
              <div key={item._id || index}
                className="d-flex align-items-center py-2 border-bottom">

                {/* Item Name */}
                <div className="text-dark" style={{ width: "45%" }}> {itemName} </div>

                {/* Quantity */}
                <div className="text-center text-dark" style={{ width: "15%" }}>{quantity} </div>

                {/* Rate */}
                <div className="text-end text-dark" style={{ width: "20%" }}>₹{rate.toFixed(2)}</div>

                {/* Amount */}
                <div className="text-end fw-medium text-dark" style={{ width: "20%" }}> ₹{amount.toFixed(2)}</div>

              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="amount-box border rounded-3 p-3 bg-white">

          {/* Subtotal */}
          <div className="amount-row d-flex justify-content-between align-items-center mb-2 text-secondary">
            <span>Subtotal</span>

            <strong className="text-dark fw-medium"> ₹{subtotal.toFixed(2)}</strong>
          </div>

          {/* Discount */}
          <div className="amount-row d-flex justify-content-between align-items-center mb-2 text-secondary">
            <span> Discount
              {discountPercent > 0 && (
                <span className="ms-1">
                  ({discountPercent.toFixed(0)}%)
                </span>
              )}
            </span>
            <strong className="text-dark fw-medium">
              -₹{discountAmount.toFixed(2)}
            </strong>
          </div>

          {/* Taxable Amount */}
          <div className="amount-row d-flex justify-content-between align-items-center mb-2 text-secondary">
            <span>Taxable Amount</span>
            <strong className="text-dark fw-medium">
              ₹{taxableAmount.toFixed(2)}
            </strong>
          </div>

          {/* Tax */}
          <div className="amount-row d-flex justify-content-between align-items-center mb-2 text-secondary">
            <span> Tax ({taxPercent.toFixed(2)}%)</span>

            <strong className="text-dark fw-medium">
              ₹{taxAmount.toFixed(2)}
            </strong>
          </div>
          <hr />

          {/* Total */}
          <div className="amount-row total-row d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold text-dark">Total</span>

            <strong className="text-dark fw-bold fs-5">
              ₹{grandTotal.toFixed(2)}
            </strong>
          </div>
          <hr />

          {/* Tax Note */}
          <div className="text-center text-secondary small my-2">
            ABOVE PRICES INCLUDE TAXES
          </div>

          {/* Total GST */}
          <div className="amount-row d-flex justify-content-between align-items-center mb-2 text-secondary">
            <span>Total GST</span>

            <strong className="text-dark fw-medium">
              ₹{taxAmount.toFixed(2)}
            </strong>
          </div>

          <div className="amount-row d-flex justify-content-between align-items-center mb-2 text-secondary">
            <span> Non-Taxable</span>
            <strong className="text-dark fw-medium">₹0.00</strong>
          </div>
          <hr />

          {/* Paid By */}
          <div className="amount-row d-flex justify-content-between align-items-center text-secondary">
            <span>Paid By</span>
            <strong className="text-dark fw-medium text-uppercase">
              {bill.payment_method || "Cash"}
            </strong>
          </div>
        </div>

        <button
          type="button"
          className="collect-btn bg-blue w-100 border-0 rounded-3 mt-3  text-white fw-bold" style={{ height: "50px" }}
          onClick={handlePayment}
          disabled={bill.payment_status === "Paid"}>

          {bill.payment_status === "Paid"
            ? "Payment Completed"
            : `Collect ₹${Number(bill.grand_total || 0).toFixed(0)}`
          }
        </button>
      </div>
    </div>
  );
}

export default Bill;