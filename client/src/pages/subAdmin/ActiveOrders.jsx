import { useEffect, useState } from "react";
import { FaMoneyBillWave } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../../services/orderService";
import { SUB_ADMIN_ROUTE } from "../../Constant/RoutesConstant";
import { generateBill } from "../../services/billService";
import { toast } from "react-toastify";

function ActiveOrders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await getOrders();
            if (res.success) {
                const activeOrders = res.data.filter(
                    (o) =>
                        o.order_status !== "Completed" &&
                        o.order_status !== "Cancelled" &&
                        o.payment_status !== "Paid"
                );
                setOrders(activeOrders);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.log(err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };
    const handleBill = async (order) => {
        try {
            const res = await generateBill({
                order_id: order._id,
                payment_method: "Cash",
            });

            if (res.success) {
                toast.success("Bill generated successfully");
                navigate(`${SUB_ADMIN_ROUTE.BILL}/${res.data._id}`);
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Unable to generate bill"
            );
        }
    };

    return (
        <div className="container-fluid py-4">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1">Active Orders</h4>
                    <p className="text-muted small mb-0">
                        Manage your ongoing orders
                    </p>
                </div>

                <span className="badge bg-dark rounded-pill px-3 py-2">
                    {orders.length} Orders
                </span>
            </div>

            <div className="row g-4">
                {loading ? (
                    <div className="col-12 text-center py-5">
                        <div className="spinner-border text-dark mb-3"></div>
                        <h6 className="text-muted">Loading orders...</h6>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="col-12">
                        <div className="card-body text-center py-5">
                            <h5 className="text-muted">No Active Orders</h5>
                        </div>
                    </div>
                ) : (

                    orders.map((order) => (
                        <div className="col-xl-4 col-lg-6 col-md-6 col-12" key={order._id} >
                            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">

                                {/* TOP */}
                                <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div className="d-flex align-items-center gap-3">
                                            <h5 className="fw-bold mb-0">
                                                {order.orderNumber || order.order_number || "-"}
                                            </h5>

                                            <small className="text-muted">
                                                {new Date(order.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </small>
                                        </div>

                                        <span
                                            className={`badge rounded-pill px-3 py-2 ${order.status === "Pending"
                                                ? "bg-warning text-dark"
                                                : order.status === "Preparing"
                                                    ? "bg-primary"
                                                    : order.status === "Completed"
                                                        ? "bg-success"
                                                        : "bg-danger"
                                                }`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    {/* TABLE + CUSTOMER */}
                                    <div className="d-flex gap-4 mb-3">
                                        <div className="bg-light rounded-3 px-3 py-2 flex-fill">
                                            <small className="text-muted d-block">
                                                Table
                                            </small>
                                            <span className="fw-bold">
                                                {order.table_id?.tableNumber || "-"}
                                            </span>
                                        </div>

                                        <div className="bg-light rounded-3 px-3 py-2 flex-fill text-truncate">
                                            <small className="text-muted d-block">
                                                Customer
                                            </small>
                                            <span
                                                className="fw-bold text-truncate d-block"
                                                title={order.customer_name || "Walk In"}>
                                                {order.customer_name || "Walk In"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ITEMS */}
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="fw-bold">
                                                Order Items
                                            </span>

                                            <span className="badge bg-light text-dark rounded-pill">
                                                {order.items?.length || 0}
                                            </span>
                                        </div>

                                        <div className="border rounded-3 overflow-auto"
                                            style={{ height: "150px" }} >
                                            {order.items?.map((item, index) => (
                                                <div key={index}
                                                    className={`d-flex justify-content-between align-items-center px-3 py-2 ${index !== order.items.length - 1
                                                        ? "border-bottom"
                                                        : ""}`}>
                                                    <div className="text-truncate">
                                                        <span className="fw-semibold">
                                                            {item.item_name}
                                                        </span>

                                                        <small className="text-muted ms-2">
                                                            × {item.quantity}
                                                        </small>
                                                    </div>

                                                    <span className="fw-semibold ms-2">
                                                        ₹{item.total || 0}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* TOTAL */}
                                    <div className="d-flex justify-content-between align-items-center border-top pt-3">
                                        <span className="text-muted">
                                            Total Amount
                                        </span>
                                        <span className="fs-5 fw-bold">
                                            ₹{Number(order.total_amount || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="card-footer bg-white border-0 px-4 pb-4">
                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn  bg-success text-white rounded-3 w-50 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                                            onClick={() =>
                                                navigate(
                                                    `${SUB_ADMIN_ROUTE.ORDER_EDIT}/${order._id}`,
                                                    {
                                                        state: {
                                                            table_id:
                                                                order.table_id?._id ||
                                                                order.table_id,
                                                            tableNumber:
                                                                order.table_id?.tableNumber,
                                                            customer_name:
                                                                order.customer_name,
                                                            order_type:
                                                                order.order_type,
                                                        },
                                                    }
                                                )
                                            }
                                        >
                                            <span className="fs-5">+</span>
                                            <span>Add Item</span>
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-dark rounded-3 w-50 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                                            onClick={() => handleBill(order)}
                                        >
                                            <FaMoneyBillWave />
                                            <span>Generate Bill</span>
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ActiveOrders;