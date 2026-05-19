import { Link } from "react-router-dom";

import { motion } from "framer-motion";

import {
  CalendarDays,
  BookOpen,
  Upload,
  BarChart3,
  NotebookPen,
  ArrowRight,
} from "lucide-react";

function Home() {

  const features = [
    {
      icon: <BookOpen size={28} />,
      title: "Smart Assignments",
      description:
        "Track deadlines, priorities, and overdue tasks effortlessly.",
    },

    {
      icon: <NotebookPen size={28} />,
      title: "Rich Notes",
      description:
        "Write beautifully formatted notes with a modern editor.",
    },

    {
      icon: <Upload size={28} />,
      title: "Cloud Resources",
      description:
        "Upload PDFs, study materials, and resources securely.",
    },

    {
      icon: <CalendarDays size={28} />,
      title: "Calendar View",
      description:
        "Visualize assignment schedules with an interactive calendar.",
    },

    {
      icon: <BarChart3 size={28} />,
      title: "Analytics Dashboard",
      description:
        "Monitor productivity with charts and smart insights.",
    },
  ];


  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white transition-colors duration-300">

      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-[#0f172a]/70">

        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="text-3xl font-bold tracking-tight"
          >
            StudySphere
          </Link>


          {/* Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">

            <a href="#features">
              Features
            </a>

            <a href="#dashboard">
              Dashboard
            </a>

            <a href="#footer">
              Contact
            </a>

          </div>


          {/* Auth Buttons */}
          <div className="flex items-center gap-3">

            <Link
              to="/login"
              className="px-5 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-2 rounded-xl"
            >
              Get Started
            </Link>

          </div>

        </div>

      </header>


      {/* Hero */}
      <section className="relative overflow-hidden">

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 blur-3xl" />


        <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-24">

          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
            }}
            className="max-w-4xl mx-auto text-center"
          >

            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full text-sm font-medium mb-6">

              🚀 Modern Student Productivity Platform

            </div>


            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">

              Organize Your
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                {" "}
                Academic Life
              </span>
              {" "}in One Place

            </h1>


            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-10 max-w-3xl mx-auto">

              Manage assignments, notes,
              resources, analytics, and deadlines
              with a modern all-in-one student workspace.

            </p>


            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-2"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/login"
                className="border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition px-8 py-4 rounded-2xl font-semibold"
              >
                Live Demo
              </Link>

            </div>

          </motion.div>

        </div>

      </section>


      {/* Features */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-6 py-24"
      >

        <div className="text-center mb-16">

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need
          </h2>

          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Designed to simplify your academic workflow.
          </p>

        </div>


        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {features.map(
            (feature, index) => (

              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                }}
                viewport={{
                  once: true,
                }}
                whileHover={{
                  y: -6,
                }}
                className="bg-gray-100 dark:bg-[#1e293b] border border-black/5 dark:border-white/10 rounded-3xl p-8"
              >

                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">

                  {feature.icon}

                </div>

                <h3 className="text-2xl font-semibold mb-3">

                  {feature.title}

                </h3>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">

                  {feature.description}

                </p>

              </motion.div>
            )
          )}

        </div>

      </section>


      {/* Dashboard Preview */}
      <section
        id="dashboard"
        className="max-w-7xl mx-auto px-6 pb-24"
      >

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.5,
          }}
          viewport={{
            once: true,
          }}
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-black/5 dark:border-white/10 rounded-[40px] p-8 md:p-14 overflow-hidden"
        >

          <div className="max-w-3xl">

            <h2 className="text-4xl md:text-5xl font-bold mb-6">

              Your Productivity Hub

            </h2>

            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-10">

              Track assignments, monitor progress,
              upload study resources, and manage
              everything from one beautifully designed dashboard.

            </p>

          </div>


          {/* Mock Dashboard */}
          <div className="mt-10 bg-[#0f172a] rounded-3xl border border-white/10 p-6 shadow-2xl">

            <div className="grid md:grid-cols-4 gap-4 mb-6">

              <div className="bg-[#1e293b] rounded-2xl p-5">
                <p className="text-gray-400 text-sm mb-2">
                  Subjects
                </p>

                <h3 className="text-4xl font-bold text-white">
                  12
                </h3>
              </div>

              <div className="bg-[#1e293b] rounded-2xl p-5">
                <p className="text-gray-400 text-sm mb-2">
                  Assignments
                </p>

                <h3 className="text-4xl font-bold text-white">
                  36
                </h3>
              </div>

              <div className="bg-[#1e293b] rounded-2xl p-5">
                <p className="text-gray-400 text-sm mb-2">
                  Completed
                </p>

                <h3 className="text-4xl font-bold text-green-400">
                  28
                </h3>
              </div>

              <div className="bg-[#1e293b] rounded-2xl p-5">
                <p className="text-gray-400 text-sm mb-2">
                  Progress
                </p>

                <h3 className="text-4xl font-bold text-blue-400">
                  78%
                </h3>
              </div>

            </div>


            <div className="bg-[#1e293b] rounded-3xl h-72 flex items-center justify-center text-gray-500 text-lg">

              Interactive Dashboard Preview

            </div>

          </div>

        </motion.div>

      </section>


      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24">

        <div className="bg-blue-600 rounded-[40px] p-10 md:p-16 text-center text-white">

          <h2 className="text-4xl md:text-5xl font-bold mb-6">

            Start Organizing Smarter

          </h2>

          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">

            Join StudySphere and take control of your assignments,
            notes, resources, and academic productivity.

          </p>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 transition px-8 py-4 rounded-2xl font-semibold"
          >
            Create Free Account
            <ArrowRight size={18} />
          </Link>

        </div>

      </section>


      {/* Footer */}
      <footer
        id="footer"
        className="border-t border-black/5 dark:border-white/10"
      >

        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">

          <div>

            <h3 className="text-2xl font-bold mb-2">
              StudySphere
            </h3>

            <p className="text-gray-600 dark:text-gray-400">
              Modern student productivity platform.
            </p>

          </div>


          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">

            <a href="#">
              GitHub
            </a>

            <a href="#">
              LinkedIn
            </a>

            <a href="#">
              Contact
            </a>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default Home;