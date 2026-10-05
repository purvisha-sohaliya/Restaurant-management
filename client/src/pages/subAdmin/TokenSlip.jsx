import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaPrint } from "react-icons/fa";

const TokenSlip = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        token_number,
        order_number,
        table_number,
        customer_name,
        items = []
    } = location.state || {};

    const handlePrint = () => {
        window.print();
    };

    const currentDate = new Date();

    const formattedDate = currentDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    const formattedTime = currentDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return (
        <div className="token-page min-vh-100 bg-light p-4">
            {/* Screen Header */}
            <div className="token-page-header no-print w-100 mx-auto mb-4 d-flex align-items-center justify-content-between gap-3">
                <button type="button" className="btn btn-outline-secondary"
                    onClick={() => navigate(-1)}> ← Back
                </button>

                <h4 className="mb-0 fw-bold">
                    Token Slip
                </h4>

                <button type="button" className="btn btn-dark"
                    onClick={handlePrint}><FaPrint /> Print
                </button>
            </div>

            {/* Token Slip */}
            <div className="token-slip bg-white mx-auto text-dark rounded">

                {/* Token */}
                <div className="text-center py-2 mb-3 border-bottom">
                    <h1 className="token-number fw-bolder">
                        #{token_number}
                    </h1>
                </div>

                {/* Order Details */}
                <div className="d-flex flex-column gap-2 mb-3 border-bottom">
                    <div className="d-flex justify-content-between gap-2">
                        <span>Order No</span>
                        <strong>
                            {order_number || "-"}
                        </strong>
                    </div>

                    <div className="d-flex justify-content-between gap-2">
                        <span>Created At</span>
                        <strong>
                            {formattedDate} {formattedTime}
                        </strong>
                    </div>

                    {table_number && (
                        <div className="d-flex justify-content-between gap-2">
                            <span>Table</span>
                            <strong>
                                T{table_number}
                            </strong>
                        </div>
                    )}

                    {customer_name && (
                        <div className="d-flex justify-content-between gap-2 mb-3">
                            <span>Customer</span>
                            <strong>
                                {customer_name}
                            </strong>
                        </div>
                    )}
                </div>

                <div className="items-list">
                    <div className="d-flex justify-content-between align-items-center border-bottom fw-bold pb-2 mb-2">
                        <span> Items </span>
                        <span> Qty </span>
                    </div>

                    {/* Items */}
                    {items?.length > 0 ? (
                        items.map((item, index) => (
                            <div
                                key={index}
                                className="d-flex justify-content-between align-items-center py-1 border-bottom"
                            >
                                {/* Item Name */}
                                <div className="d-flex align-items-start flex-grow-1 pe-3">
                                    <span className="text-muted me-2">
                                        {index + 1}.
                                    </span>

                                    <span className="fw-semibold text-dark">
                                        {item.item_name ||
                                            item.menu_item_id?.item_name ||
                                            "Item"}
                                    </span>
                                </div>

                                {/* Quantity */}
                                <span className="fw-bold text-dark">
                                    × {item.quantity}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted py-3">
                            No items
                        </div>
                    )}

                </div>
                {/* Message */}
                <div className="token-message text-center py-3">
                    <h5 className="fw-bolder mb-1">Thank You! </h5>
                    <p className="my-1"> Please wait for your order. </p>
                    <p className="small-text m-0"> Your token number is
                        <strong> #{token_number}</strong>
                    </p>
                </div>
                <div className="token-footer text-center text-secondary">
                    <span>Powered by Restaurant POS</span>
                </div>
            </div>
        </div>
    );
};

export default TokenSlip;