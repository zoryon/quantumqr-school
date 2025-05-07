export type PromotionRequest = {
    userId: number,
    requestReason: string, 
    requestedAt: Date,
    reviewedAt: Date,
    rejectedAt: Date,
    acceptedAt: Date
};

export type PromotionRequestReview = "accept" | "reject";
