import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const RevenueChart = ({
    data,
    selectedYear,
    setSelectedYear,
}) => {

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>
                        <h6 className="fw-bold mb-1">
                            Revenue Overview
                        </h6>

                        <p className="text-muted small mb-0">
                            Monthly revenue
                        </p>
                    </div>

                    {/* Year Filter */}
                    <select
                        className="form-select w-auto rounded-pill shadow-sm"
                        value={selectedYear}
                        onChange={(e) =>
                            setSelectedYear(Number(e.target.value))
                        }>
                        <option value={2026}>2026</option>
                        <option value={2025}>2025</option>
                        <option value={2024}>2024</option>
                    </select>
                </div>

                {/* Revenue Chart */}
                <div style={{ width: "100%", height: "250px" }}>

                    <ResponsiveContainer width="100%" height="100%">

                        <LineChart data={data} margin={{
                            top: 10, right: 20, left: 0, bottom: 5
                        }}>

                            <CartesianGrid strokeDasharray="2 2" vertical={false} />

                            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{
                                fill: "#94a3b8",
                                fontSize: 12
                            }} dy={4} />

                            <YAxis tickLine={false}
                                axisLine={false} tick={{
                                    fill: "#94a3b8",
                                    fontSize: 12
                                }} />

                            <Tooltip formatter={(value) => [
                                `₹${Number(value).toLocaleString("en-IN")}`,
                                "Revenue"
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
                                cursor={{
                                    strokeDasharray: "4 4"
                                }} />

                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#198754" activeDot={{
                                    r: 5,
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default RevenueChart;