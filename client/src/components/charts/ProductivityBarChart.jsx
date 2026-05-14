import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
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
            className="bg-[#1e293b] border border-white/10 rounded-2xl p-6"
        >

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

        </motion.div>
    );
}

export default ProductivityBarChart;