import { Link } from "react-router-dom";

import { motion } from "framer-motion";

function NotFound() {

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white flex items-center justify-center px-6">

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="max-w-2xl text-center"
      >

        {/* 404 */}
        <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-6">

          404

        </h1>


        {/* Title */}
        <h2 className="text-3xl md:text-5xl font-bold mb-6">

          Page Not Found

        </h2>


        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-10">

          The page you are looking for does not exist
          or may have been moved.

        </p>


        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-8 py-4 rounded-2xl font-semibold"
          >
            Go Home
          </Link>

          <Link
            to="/dashboard"
            className="border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition px-8 py-4 rounded-2xl font-semibold"
          >
            Dashboard
          </Link>

        </div>

      </motion.div>
    </div>
  );
}

export default NotFound;