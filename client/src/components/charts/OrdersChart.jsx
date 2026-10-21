import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

const OrdersChart = ({ data, orderView, setOrderView }) => {

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>
                        <h6 className="fw-bold mb-1">
                            Orders Overview
                        </h6>

                        <p className="text-muted small mb-0">
                            {orderView === "daily"
                                ? "Daily orders · Current month"
                                : "Monthly orders · Current year"}
                        </p>
                    </div>

                    <select
                        className="form-select form-select-sm w-auto rounded-pill px-3 py-1 shadow-sm"
                        value={orderView}
                        onChange={(e) => setOrderView(e.target.value)}
                    >
                        <option value="daily">Daily</option>
                        <option value="monthly">Monthly</option>
                    </select>

                </div>

                {/* Orders Chart */}
                <div style={{ width: "100%", height: "250px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{
                            top: 15,
                            right: 15,
                            left: -15,
                            bottom: 5
                        }} barCategoryGap="15%">

                            <CartesianGrid stroke="#e2e8f0"
                                strokeDasharray="2 2"
                                vertical={false} />

                            <XAxis
                                dataKey={orderView === "daily" ? "day" : "month"} axisLine={false}
                                interval={1} tickLine={false}
                                tick={{
                                    fill: "#94a3b8",
                                    fontSize: 12
                                }} dy={4} />

                            <YAxis
                                allowDecimals={false}
                                domain={[0, "auto"]}
                                tickLine={false}
                                axisLine={false}
                                tick={{
                                    fill: "#94a3b8",
                                    fontSize: 12
                                }}
                                width={40} />

                            <Tooltip cursor={{
                                fill: "#eff6ff"
                            }}
                                formatter={(value) => [
                                    `${value} Orders`,
                                    "Total"
                                ]}
                                labelFormatter={(label) => `Day ${label}`}
                                contentStyle={{
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "10px",
                                    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                                }}
                                itemStyle={{
                                    color: "#334155",
                                    fontSize: "12px",
                                    fontWeight: 500
                                }} />

                            <Bar
                                dataKey="orders"
                                name="Orders"
                                fill="#198754"
                                radius={[5, 5, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default OrdersChart;