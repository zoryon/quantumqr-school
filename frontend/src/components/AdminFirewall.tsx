"use client";

import { useUserData } from "@/hooks/use-user-data";
import LoadingScreen from "./Loading/LoadingScreen";
import { ResultType } from "@/types";
import { api } from "@/lib/endpoint-builder";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const AdminFirewall = ({ children }: { children: React.ReactNode }) => {
    const { isPending, isAdmin } = useUserData();

    if (isPending) {
        return <LoadingScreen />;
    }

    async function handleRequestPromotion(requestReason: string) {
        const res: ResultType = await fetch(api.users.requestPromotion.toString(), {
            method: "POST",
            body: JSON.stringify({ requestReason: requestReason }),
        }).then(res => res.json());

        if (!res.success) {
            console.error("Error: ", res.message);
        }

        alert(res.message);
    }

    return !isAdmin() ? (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center">
                    <i className="fas fa-shield-alt text-4xl text-indigo-400 mb-4"></i>
                    <h1 className="text-3xl font-bold text-gray-100 mb-2">Admin Access Required</h1>
                    <p className="text-gray-400">Request elevated privileges to access this section</p>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all">
                    <form 
                        onSubmit={(e) => {
                            e.preventDefault();
                            const input = (e.currentTarget.elements.namedItem("requestReason") as HTMLInputElement);
                            handleRequestPromotion(input.value);
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <label htmlFor="requestReason" className="block text-sm font-medium text-gray-300 mb-2">
                                <i className="fas fa-comment-dots mr-2 text-indigo-400"></i>
                                Request Justification
                            </label>
                            <Input
                                id="requestReason"
                                name="requestReason"
                                type="text"
                                placeholder="Provide a detailed explanation..."
                                className="w-full bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-indigo-400"
                                required
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            <i className="fas fa-paper-plane mr-2"></i>
                            Submit Request
                        </Button>
                    </form>
                </div>

                <div className="text-center pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400">
                        <i className="fas fa-info-circle mr-2"></i>
                        Requests are typically reviewed within 24-48 hours
                    </p>
                </div>
            </div>
        </div>
    ) : (
        <>
            {children}
        </>
    );
}

export default AdminFirewall;