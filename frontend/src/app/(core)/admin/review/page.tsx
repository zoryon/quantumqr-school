"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/endpoint-builder";
import { ResultType } from "@/types";
import { PromotionRequest, PromotionRequestReview } from "@/types/admin.types";
import { useEffect, useState } from "react";

const ReviewPromotionsPage = () => {
    const [requests, setRequests] = useState<PromotionRequest[]>([]);

    useEffect(() => {
        async function fetchRequests() {
            const res: ResultType = await fetch(api.admin.findPromotions.toString(), {
                method: "GET",
            }).then(res => res.json());

            if (!res.success) {
                console.error(res.message);
            }

            setRequests(res.data as PromotionRequest[]);
        }

        fetchRequests();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <h1 className="text-3xl font-bold text-gray-100 mb-8">Promotion Requests</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.length > 0 ? (
                    requests.map(req => (
                        <PromotionRequestComponent key={req.userId} req={req} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-400 text-lg">No pending requests</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const PromotionRequestComponent = ({ req }: { req: PromotionRequest }) => {
    const requestedAt = new Date(req.requestedAt).toLocaleDateString("it-IT", {
        dateStyle: "medium",
    });

    async function handleRequest(action: PromotionRequestReview) {
        const res: ResultType = await fetch(api.admin.reviewPromotion.toString(), {
            method: "POST",
            body: JSON.stringify({
                userId: req.userId,
                acceptedAt: action === "accept" ? new Date() : null,
                rejectedAt: action === "reject" ? new Date() : null,
                reviewedAt: new Date()
            })
        }).then(res => res.json());

        if (!res.success) {
            console.error(res.message);
        }

        window.location.href = "/admin/review";
    }

    return (
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-400">User ID: #{req.userId}</h3>
                <span className="text-sm text-gray-400">{requestedAt}</span>
            </div>

            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Request Reason</h4>
                <p className="text-gray-400 text-sm leading-relaxed max-h-32 overflow-y-auto">
                    {req.requestReason || "No reason provided"}
                </p>
            </div>

            <div className="flex gap-3">
                <Button
                    onClick={() => handleRequest("reject")}
                    className="flex-1 bg-red-600/20 hover:bg-red-600/30 border border-red-600 text-red-500 hover:text-red-400"
                >
                    <i className="far fa-times-circle mr-2 text-[1.1rem]"></i>
                    Reject
                </Button>
                <Button
                    onClick={() => handleRequest("accept")}
                    className="flex-1 bg-green-600/20 hover:bg-green-600/30 border border-green-600 text-green-500 hover:text-green-400"
                >
                    <i className="far fa-check-circle mr-2 text-[1.1rem]"></i>
                    Accept
                </Button>
            </div>
        </div>
    )
}

export default ReviewPromotionsPage;