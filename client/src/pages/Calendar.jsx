import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import { motion } from "framer-motion";


import {
    Calendar,
    dateFnsLocalizer,
} from "react-big-calendar";

import "react-big-calendar/lib/css/react-big-calendar.css";

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

                    const formattedEvents =
                        assignments.map(
                            (assignment) => ({

                                title: `${assignment.title}`,

                                start: new Date(
                                    assignment.dueDate
                                ),

                                end: new Date(
                                    assignment.dueDate
                                ),

                                allDay: true,

                                resource:
                                    assignment,

                            })
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


    return (
        <DashboardLayout>

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

                <h1 className="text-4xl font-bold">
                    Calendar
                </h1>

                <p className="text-gray-400 mt-2">
                    Visualize assignment deadlines
                </p>

            </motion.div>


            <div className="bg-white rounded-2xl p-4 overflow-hidden">

                {loading ? (

                    <p>Loading calendar...</p>

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
                        />

                    </div>

                )}

            </div>

        </DashboardLayout>
    );
}

export default CalendarPage;