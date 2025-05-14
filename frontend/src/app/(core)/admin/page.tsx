"use client";

import { useEffect, useState } from "react";
import { ADMIN_ACTIVITIES } from "@/constants";
import { useUserData } from "@/hooks/use-user-data";
import { cn } from "@/lib/utils";
import { AdminActivity, ResultType } from "@/types";
import Link from "next/link";
import { api } from "@/lib/endpoint-builder";

const AdminDashboard = () => {
    const [usersCount, setUsersCount] = useState<number>(0);
    const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(0);
    
    const { userData } = useUserData();

    useEffect(() => {
        async function fetchStats() {
            const res: ResultType = await fetch(api.admin.appStats.toString(), { 
                method: "GET" 
            }).then(res => res.json());

            if (res.success) {
                setUsersCount(res.data.usersCount);
                setPendingReviewsCount(res.data.pendingReviewsCount);
            } else {
                alert(`Error: ${res.message}`);
            }
        }
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-100 mb-2">
                        <i className="fas fa-shield-alt text-indigo-500 mr-3"></i>
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-400">
                        Welcome back, <span className="text-indigo-500">{userData?.username}</span>
                    </p>
                </header>

                {/* Navigation Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ADMIN_ACTIVITIES.map((activity, i) => (
                        <AdminActivityCard key={i} activity={activity} />
                    ))}
                </div>

                {/* Quick Stats Footer */}
                <div className="mt-12 border-t border-gray-700 pt-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-gray-800/50 p-4 rounded-xl">
                            <p className="text-gray-400 text-sm mb-1">Total Users</p>
                            <p className="text-2xl font-bold text-blue-400">{usersCount}</p>
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded-xl">
                            <p className="text-gray-400 text-sm mb-1">Pending Reviews</p>
                            <p className="text-2xl font-bold text-purple-400">{pendingReviewsCount}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminActivityCard = ({ activity }: { activity: AdminActivity }) => {
    return (
        <Link
            href={activity.url === "/admin/analytics" ? "#" : activity.url}
            className="bg-gray-800 rounded-xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
        >
            <div className="flex items-center mb-4">
                <div className={cn("p-3 rounded-lg mr-4", activity.bg)}>
                    <i className={cn("text-2xl", activity.icon)} />
                </div>
                <h2 className="text-xl font-semibold text-gray-100">{activity.title}</h2>
            </div>
            <p className="text-gray-400 text-sm">
                {activity.paragraph}
            </p>
        </Link>
    )
}

export default AdminDashboard;