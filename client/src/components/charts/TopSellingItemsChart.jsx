import React from "react";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

const TopSellingItemsChart = ({ data }) => {

    const totalQuantity = data.reduce(
        (total, item) => total + Number(item.total_quantity || 0),
        0
    );

    const chartData = data.map((item) => ({
        ...item,
        percentage: totalQuantity > 0
            ? (Number(item.total_quantity || 0) / totalQuantity) * 100
            : 0
    }));

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h6 className="fw-bold mb-1">
                            Top 5 Selling Menu Items
                        </h6>

                        <p className="text-muted small mb-0">
                            Best selling items by quantity
                        </p>
                    </div>
                </div>

                {/* Chart */}
                <div style={{ width: "100%", height: "250px" }}>

                    {data.length === 0 ? (
                        <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                            No sales data available
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{
                                    top: 10,
                                    right: 20,
                                    left: 0,
                                    bottom: 5
                                }} >

                                <CartesianGrid
                                    strokeDasharray="2 2"
                                    vertical={false}
                                />

                                <XAxis
                                    type="number"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{
                                        fill: "#94a3b8",
                                        fontSize: 12
                                    }}
                                />

                                <YAxis
                                    type="category"
                                    dataKey="item_name"
                                    width={110}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{
                                        fill: "#94a3b8",
                                        fontSize: 12
                                    }}
                                    tickMargin={8} />

                                <Tooltip
                                    formatter={(value, name, props) => [
                                        `${value} Sold (${props.payload.percentage.toFixed(1)}%)`,
                                        "Quantity"
                                    ]}
                                    contentStyle={{
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 15px rgba(0,0,0,0.08)"
                                    }}
                                    itemStyle={{
                                        color: "#334155",
                                        fontSize: "12px",
                                        fontWeight: 600
                                    }}
                                    cursor={{
                                        fill: "#f1f5f9"
                                    }} />

                                <Bar
                                    dataKey="total_quantity"
                                    name="Quantity"
                                    fill="#198754"
                                    radius={[0, 4, 4, 0]}
                                    barSize={25}
                                    activeBar={{
                                        fill: "#157347"
                                    }} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopSellingItemsChart;