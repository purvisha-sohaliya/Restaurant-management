import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Label } from "recharts";

const COLORS = { "Dine In": "#0d6efd", "Takeaway": "#198754", "Delivery": "#ffc107" };

const OrderTypeChart = ({ data = [] }) => {
    const totalOrders = data.reduce((total, item) => total + item.value, 0);

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3">

                {/* Header */}
                <div className="mb-3">
                    <h6 className="fw-bold mb-1">
                        Order Type Distribution
                    </h6>

                    <p className="text-muted small mb-0">
                        Orders by type
                    </p>
                </div>

                {/* Donut Chart */}
                <div style={{ width: "100%", height: "250px" }}>

                    {totalOrders === 0 ? (
                        <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                            No order data available
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={60}
                                    outerRadius={95}
                                    paddingAngle={2}
                                    cornerRadius={5}
                                    stroke="none" >
                                    {data.map((entry) => (
                                        <Cell
                                            key={entry.name}
                                            fill={COLORS[entry.name] || "#94a3b8"}
                                        />
                                    ))}

                                    <Label
                                        content={({ viewBox }) => {
                                            if (!viewBox?.cx || !viewBox?.cy) return null;

                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        dy="-5"
                                                        fontSize="22"
                                                        fontWeight="700"
                                                        fill="#1e293b"
                                                    >
                                                        {totalOrders}
                                                    </tspan>

                                                    <tspan
                                                        x={viewBox.cx}
                                                        dy="20"
                                                        fontSize="11"
                                                        fill="#94a3b8"
                                                    >
                                                        Total Orders
                                                    </tspan>
                                                </text>
                                            );
                                        }}
                                    />
                                </Pie>

                                <Tooltip
                                    formatter={(value, name) => [
                                        `${value} Orders`,
                                        name
                                    ]}
                                    contentStyle={{
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                                    }}
                                    itemStyle={{
                                        color: "#334155",
                                        fontSize: "12px",
                                        fontWeight: 500
                                    }}
                                />

                                <Legend
                                    iconType="circle"
                                    iconSize={9}
                                    wrapperStyle={{
                                        fontSize: "14px",
                                        color: "#64748b",
                                        paddingTop: "10px"
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderTypeChart;