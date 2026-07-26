import { motion } from "framer-motion";

function StatsCard({
    title,
    value,
    subtitle,
    icon,
    color = "from-blue-500 to-cyan-500",
}) {
    return (
        <motion.div
            whileHover={{
                y: -6,
                scale: 1.02,
            }}
            transition={{
                duration: 0.25,
            }}
            className={`bg-gradient-to-r ${color} rounded-2xl p-6 shadow-xl text-white`}
        >
            <div className="flex justify-between items-center">

                <div>

                    <p className="text-white/80 text-sm">
                        {title}
                    </p>

                    <h2 className="text-4xl font-bold mt-2">
                        {value}
                    </h2>

                    <p className="text-white/80 mt-3 text-sm">
                        {subtitle}
                    </p>

                </div>

                <div className="text-5xl opacity-80">
                    {icon}
                </div>

            </div>
        </motion.div>
    );
}

export default StatsCard;