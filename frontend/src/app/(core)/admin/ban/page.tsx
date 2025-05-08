"use client";

import { useUserData } from "@/hooks/use-user-data";
import { api } from "@/lib/endpoint-builder";
import { PublicUser, ResultType } from "@/types";
import { useEffect, useState } from "react";

const BanUsersPage = () => {
    const { userData } = useUserData();
    const [userList, setUserList] = useState<PublicUser[]>([]);

    useEffect(() => {
        async function fetchUserList() {
            const res: ResultType = await fetch(api.users.findAll.toString(), { 
                method: "GET" 
            }).then(res => res.json());

            if (res.success) {
                setUserList(res.data as PublicUser[]);
            } else {
                console.error(res.message);
            }
        }
        fetchUserList();
    }, []);

    async function handleBanUser(email: string) {
        const confirmBan = window.confirm(`Are you sure you want to ban ${email}?`);
        if (!confirmBan) return;

        const res: ResultType = await fetch(api.admin.banUser.toString(), {
            method: "POST",
            body: JSON.stringify({ email })
        }).then(res => res.json());

        if (res.success) {
            setUserList(prev => prev.filter(user => user.email !== email));
        } else {
            console.error(res.message);
            alert("Failed to ban user");
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-100">Manage platform users</h1>
                </header>

                <section className="bg-gray-800 rounded-xl p-6 shadow-xl">
                    <h2 className="text-xl font-semibold text-gray-100 mb-6">
                        <i className="fas fa-users mr-2 text-purple-400"></i>
                        User List
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userList.length > 0 ? userList.map(user => (
                            <div key={user.email} className="bg-gray-700 rounded-lg p-4 hover:shadow-2xl transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-100">{user.username}</h3>
                                        <p className="text-sm text-gray-400 break-all">{user.email}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        user.tier !== 'Free' 
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : 'bg-amber-500/20 text-amber-400'
                                    }`}>
                                        {user.tier}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="bg-gray-600/30 p-2 rounded">
                                        <p className="text-xs text-gray-400">QR Codes</p>
                                        <p className="text-gray-100 font-mono">{user.qrCodesCount}</p>
                                    </div>
                                    <div className="bg-gray-600/30 p-2 rounded">
                                        <p className="text-xs text-gray-400">Total Scans</p>
                                        <p className="text-gray-100 font-mono">{user.totalScans}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <p className="text-gray-400">
                                        <i className="fas fa-calendar-plus mr-2"></i>
                                        {new Date(user.createdAt!).toLocaleDateString("it-IT", {
                                            dateStyle: "medium"
                                        })}
                                    </p>
                                    <button
                                        onClick={() => handleBanUser(user.email)}
                                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-lg transition-colors"
                                    >
                                        <i className="fas fa-ban mr-2"></i>
                                        Ban
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-6">
                                <p className="text-gray-400">No users found</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default BanUsersPage;