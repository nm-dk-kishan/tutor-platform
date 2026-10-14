export const getAssignmentDisplayStatus = (assignment, now) => {
  if (assignment.review?.reviewedAt || assignment.status === "reviewed") {
    return "reviewed";
  }

  if (
    assignment.submission?.submittedAt ||
    assignment.status === "submitted"
  ) {
    return "submitted";
  }

  const deadline = assignment.dueDate
    ? new Date(assignment.dueDate).getTime()
    : Number.NaN;

  if (Number.isFinite(deadline) && now > deadline) {
    return "overdue";
  }

  return "assigned";
};

export const getAssignmentSummary = (assignments, now) => {
  const summary = {
    total: assignments.length,
    pending: 0,
    submitted: 0,
    reviewed: 0,
    overdue: 0,
    averageMarks: null,
  };
  const marks = [];

  assignments.forEach((assignment) => {
    const status = getAssignmentDisplayStatus(assignment, now);

    if (status === "assigned") summary.pending += 1;
    if (status === "submitted") summary.submitted += 1;
    if (status === "reviewed") {
      summary.reviewed += 1;

      const mark = assignment.review?.marks;
      if (typeof mark === "number" && Number.isFinite(mark) && mark >= 0 && mark <= 100) {
        marks.push(mark);
      }
    }
    if (status === "overdue") summary.overdue += 1;
  });

  if (marks.length > 0) {
    summary.averageMarks =
      Math.round((marks.reduce((total, mark) => total + mark, 0) / marks.length) * 10) /
      10;
  }

  return summary;
};
