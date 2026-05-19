import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";

import { motion } from "framer-motion";

import {
  Calendar,
  dateFnsLocalizer,
} from "react-big-calendar";

import "react-big-calendar/lib/css/react-big-calendar.css";

import "../styles/calendar.css";

import {
  format,
  parse,
  startOfWeek,
  getDay,
} from "date-fns";

import enUS from "date-fns/locale/en-US";

import {
  getAssignments,
} from "../services/assignmentService";


const locales = {
  "en-US": enUS,
};


const localizer =
  dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });


function CalendarPage() {

  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    const fetchAssignments =
      async () => {

        try {

          const assignments =
            await getAssignments();

          const today =
            new Date();

          const formattedEvents =
            assignments.map(
              (assignment) => {

                const due =
                  new Date(
                    assignment.dueDate
                  );

                const isOverdue =
                  assignment.status !==
                    "completed" &&
                  due < today;

                return {
                  title:
                    assignment.title,

                  start: due,

                  end: due,

                  allDay: true,

                  resource:
                    assignment,

                  status:
                    assignment.status,

                  priority:
                    assignment.priority,

                  isOverdue,
                };
              }
            );

          setEvents(
            formattedEvents
          );

        } catch (error) {

          console.log(error);

        } finally {

          setLoading(false);

        }
      };

    fetchAssignments();

  }, []);


  // EVENT COLORS
  const eventStyleGetter =
    (event) => {

      let backgroundColor =
        "#3b82f6";

      // Completed
      if (
        event.status ===
        "completed"
      ) {
        backgroundColor =
          "#22c55e";
      }

      // Overdue
      if (event.isOverdue) {
        backgroundColor =
          "#ef4444";
      }

      // High Priority
      if (
        event.priority ===
          "high" &&
        !event.isOverdue
      ) {
        backgroundColor =
          "#f97316";
      }

      return {
        style: {
          backgroundColor,
          borderRadius: "12px",
          border: "none",
          color: "white",
          padding: "4px 8px",
          fontSize: "13px",
          fontWeight: "600",
        },
      };
    };


  return (
    <DashboardLayout>

      {/* Header */}
      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.3,
        }}
        className="mb-8"
      >

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Calendar
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Visualize assignment deadlines
        </p>

      </motion.div>


      {/* Calendar Wrapper */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.4,
        }}
        className="bg-gray-100 dark:bg-[#1e293b] border border-black/5 dark:border-white/10 rounded-3xl p-4 md:p-6 overflow-hidden"
      >

        {loading ? (

          <div className="h-[700px] flex items-center justify-center text-gray-500 dark:text-gray-400">

            Loading calendar...

          </div>

        ) : (

          <div className="h-[700px]">

            <Calendar
              localizer={
                localizer
              }
              events={events}
              startAccessor="start"
              endAccessor="end"
              views={[
                "month",
                "week",
                "agenda",
              ]}
              popup
              eventPropGetter={
                eventStyleGetter
              }
            />

          </div>

        )}

      </motion.div>

    </DashboardLayout>
  );
}

export default CalendarPage;