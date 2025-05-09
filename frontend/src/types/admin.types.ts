export type PromotionRequest = {
    userId: number,
    reviewerAdminId: number,
    requestReason: string, 
    requestedAt: Date,
    reviewedAt: Date,
    rejectedAt: Date,
    acceptedAt: Date
};

export type PromotionRequestReview = "accept" | "reject";

export type AdminActivity = {
    url: string,
    icon: string,
    bg: string,
    title: string,
    paragraph: string
}