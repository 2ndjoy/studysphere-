import {
    getSubjects,
} from "./subjectService";

import {
    getAssignments,
} from "./assignmentService";


export const getDashboardStats =
    async () => {

        const subjects =
            await getSubjects();

        const assignments =
            await getAssignments();

        const completed =
            assignments.filter(
                (assignment) =>
                    assignment.status ===
                    "completed"
            ).length;

        const pending =
            assignments.filter(
                (assignment) =>
                    assignment.status ===
                    "pending"
            ).length;

        const completionRate =
            assignments.length > 0
                ? Math.round(
                    (completed /
                        assignments.length) *
                    100
                )
                : 0;

        return {
            totalSubjects:
                subjects.length,

            totalAssignments:
                assignments.length,

            completed,

            pending,

            completionRate,
        };
    };