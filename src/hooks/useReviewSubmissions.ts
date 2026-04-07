import { useMemo } from "react";
import { useApplications } from "@/hooks/useFirestore";
import { ReviewSubmission, ReviewStatus, QueuePriority } from "@/types/review";
import { differenceInHours } from "date-fns";

export const useReviewSubmissions = () => {
  const { applications, loading, error, updateApplicationStatus } = useApplications();

  const submissions: ReviewSubmission[] = useMemo(() => {
    return applications.map((app) => {
      // Map application status to review status
      let reviewStatus: ReviewStatus = "awaiting_review";
      if (app.status === "approved") reviewStatus = "approved";
      else if (app.status === "rejected") reviewStatus = "rejected";

      // Determine queue priority based on age and status
      const hoursOld = differenceInHours(new Date(), app.createdAt);
      let queuePriority: QueuePriority = "normal";
      if (reviewStatus === "awaiting_review" && hoursOld > 48) queuePriority = "urgent";
      else if (reviewStatus === "awaiting_review" && hoursOld > 24) queuePriority = "priority";

      // Is "new" if less than 6 hours old and still awaiting review
      const isNew = reviewStatus === "awaiting_review" && hoursOld < 6;

      return {
        id: app.id,
        customerName: app.name,
        phone: app.phone,
        vehicleType: app.vehicleType,
        borderRoute: app.where,
        travelDay: app.when,
        packages: app.packages,
        passengers: app.passengers,
        totalPrice: app.totalPrice,
        paymentMethod: "qr" as const,
        reviewStatus,
        queuePriority,
        createdAt: app.createdAt,
        documents: app.documents,
        isNew,
      };
    });
  }, [applications]);

  const stats = useMemo(() => {
    const awaiting = submissions.filter((s) => s.reviewStatus === "awaiting_review").length;
    const approved = submissions.filter((s) => s.reviewStatus === "approved").length;
    const rejected = submissions.filter((s) => s.reviewStatus === "rejected").length;
    const totalRevenue = submissions
      .filter((s) => s.reviewStatus === "approved")
      .reduce((sum, s) => sum + s.totalPrice, 0);
    const urgent = submissions.filter((s) => s.queuePriority === "urgent").length;

    return { awaiting, approved, rejected, totalRevenue, total: submissions.length, urgent };
  }, [submissions]);

  return { submissions, stats, loading, error, updateApplicationStatus };
};
