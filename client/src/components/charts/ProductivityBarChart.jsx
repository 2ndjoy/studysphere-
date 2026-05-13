import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

function ProductivityBarChart({
    completed,
    pending,
}) {

    const data = [
        {
            name: "Completed",
            tasks: completed,
        },
        {
            name: "Pending",
            tasks: pending,
        },
    ];

    return (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6">

            <h2 className="text-2xl font-semibold mb-6">
                Productivity Overview
            </h2>

            <div className="h-80">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <BarChart data={data}>

                        <XAxis dataKey="name" />

                        <YAxis />

                        <Tooltip />

                        <Bar
                            dataKey="tasks"
                            fill="#3b82f6"
                            radius={[
                                8,
                                8,
                                0,
                                0,
                            ]}
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

        </div>
    );
}

export default ProductivityBarChart;