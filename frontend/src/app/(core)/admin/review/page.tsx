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
        <div>
            {requests.length > 0 ? (
                requests.map(req => {
                    return (
                        <PromotionRequestComponent key={req.userId} req={req} />
                    );
                })
            ) : (
                <div>No requests for now..</div>
            )}
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
        <div>
            <h1>{req.userId}</h1>

            <h2>Reason:</h2>
            <p>{req.requestReason}</p>

            <h4>Requested at:</h4>
            <p> {requestedAt}</p>

            <section>
                <Button variant={"outline"} onClick={() => handleRequest("reject" as PromotionRequestReview)}>Reject</Button>
                <Button variant={"outline"} onClick={() => handleRequest("accept" as PromotionRequestReview)}>Accept</Button>
            </section>
        </div>
    )
}

export default ReviewPromotionsPage;