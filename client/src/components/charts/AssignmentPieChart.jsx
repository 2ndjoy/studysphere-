import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { motion } from "framer-motion";
const COLORS = [
    "#22c55e",
    "#eab308",
];

function AssignmentPieChart({
    completed,
    pending,
}) {

    const data = [
        {
            name: "Completed",
            value: completed,
        },
        {
            name: "Pending",
            value: pending,
        },
    ];

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 20,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.4,
            }}
            whileHover={{
                y: -5,
                scale: 1.02,
            }}
        // className="bg-[#1e293b] border border-white/10 rounded-2xl p-6"
        >

            <h2 className="text-2xl font-semibold mb-6">
                Assignment Status
            </h2>

            <div className="h-80">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <PieChart>

                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label
                        >

                            {data.map(
                                (
                                    entry,
                                    index
                                ) => (
                                    <Cell
                                        key={index}
                                        fill={
                                            COLORS[
                                            index
                                            ]
                                        }
                                    />
                                )
                            )}

                        </Pie>

                        <Tooltip />

                    </PieChart>

                </ResponsiveContainer>

            </div>

        </motion.div>
    );
}

export default AssignmentPieChart;