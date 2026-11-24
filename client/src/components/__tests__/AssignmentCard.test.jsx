import {
    describe,
    it,
    expect,
    vi,
} from "vitest";

import {
    render,
    screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import AssignmentCard from "../AssignmentCard";

const DAY = 24 * 60 * 60 * 1000;

function createAssignment(overrides = {}) {
    return {
        _id: "assignment-001",
        title: "Research Assignment",

        subject: {
            _id: "subject-001",
            title: "Security Testing",
        },

        dueDate: new Date(
            Date.now() + 7 * DAY
        ).toISOString(),

        priority: "high",
        status: "pending",

        ...overrides,
    };
}

function renderAssignment(overrides = {}) {
    const assignment = createAssignment(overrides);

    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(
        <AssignmentCard
            assignment={assignment}
            onToggle={onToggle}
            onDelete={onDelete}
        />
    );

    return {
        assignment,
        onToggle,
        onDelete,
    };
}

describe("AssignmentCard", () => {

    it("renders the assignment title", () => {
        renderAssignment();

        expect(
            screen.getByRole("heading", {
                name: "Research Assignment",
            })
        ).toBeInTheDocument();
    });

    it("renders the populated subject information", () => {
        renderAssignment();

        expect(
            screen.getByText(
                "Subject: Security Testing"
            )
        ).toBeInTheDocument();
    });

    it("renders the assignment priority", () => {
        renderAssignment();

        expect(
            screen.getByText("high")
        ).toBeInTheDocument();
    });

    it("displays the pending assignment state", () => {
        renderAssignment();

        expect(
            screen.getByText("pending")
        ).toBeInTheDocument();

        const button = screen.getByRole("button", {
            name: "Mark as completed",
        });

        expect(button).toBeInTheDocument();

        expect(button).toHaveClass(
            "bg-green-500"
        );

        expect(button).toHaveAttribute(
            "title",
            "Mark as completed"
        );
    });

    it("displays the completed assignment state", () => {
        renderAssignment({
            status: "completed",
        });

        expect(
            screen.getByText("completed")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "Research Assignment",
            })
        ).toHaveClass("line-through");

        const button = screen.getByRole("button", {
            name: "Mark as pending",
        });

        expect(button).toBeInTheDocument();

        expect(button).toHaveClass(
            "bg-amber-500"
        );

        expect(button).toHaveAttribute(
            "title",
            "Mark as pending"
        );
    });

    it("calls the status handler when Complete is clicked", async () => {
        const user = userEvent.setup();

        const {
            assignment,
            onToggle,
        } = renderAssignment();

        await user.click(
            screen.getByRole("button", {
                name: "Mark as completed",
            })
        );

        expect(onToggle).toHaveBeenCalledTimes(1);

        expect(onToggle).toHaveBeenCalledWith(
            assignment._id
        );
    });

    it("calls the status handler when Undo is clicked", async () => {
        const user = userEvent.setup();

        const {
            assignment,
            onToggle,
        } = renderAssignment({
            status: "completed",
        });

        await user.click(
            screen.getByRole("button", {
                name: "Mark as pending",
            })
        );

        expect(onToggle).toHaveBeenCalledTimes(1);

        expect(onToggle).toHaveBeenCalledWith(
            assignment._id
        );
    });

    it("calls the delete handler with the correct assignment ID", async () => {
        const user = userEvent.setup();

        const {
            assignment,
            onDelete,
        } = renderAssignment();

        await user.click(
            screen.getByRole("button", {
                name: "Delete assignment",
            })
        );

        expect(onDelete).toHaveBeenCalledTimes(1);

        expect(onDelete).toHaveBeenCalledWith(
            assignment._id
        );
    });

    it("renders without crashing when subject information is missing", () => {
        renderAssignment({
            subject: null,
        });

        expect(
            screen.getByRole("heading", {
                name: "Research Assignment",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText(/^Subject:/)
        ).toBeInTheDocument();
    });

    it("displays an overdue warning for overdue assignments", () => {
        renderAssignment({
            dueDate: new Date(
                Date.now() - DAY
            ).toISOString(),
        });

        expect(
            screen.getByText("Overdue")
        ).toBeInTheDocument();
    });

    it("displays a due soon warning for upcoming assignments", () => {
        renderAssignment({
            dueDate: new Date(
                Date.now() + DAY
            ).toISOString(),
        });

        expect(
            screen.getByText("Due Soon")
        ).toBeInTheDocument();
    });

    it("does not display due date warnings for completed assignments", () => {
        renderAssignment({
            status: "completed",

            dueDate: new Date(
                Date.now() - DAY
            ).toISOString(),
        });

        expect(
            screen.queryByText("Overdue")
        ).not.toBeInTheDocument();

        expect(
            screen.queryByText("Due Soon")
        ).not.toBeInTheDocument();
    });

});