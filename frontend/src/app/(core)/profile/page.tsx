"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useUserData } from "@/hooks/use-user-data";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { ResultType } from "@/types";
import { api } from "@/lib/endpoint-builder";

const ProfilePage = () => {
    const { userData } = useUserData();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState(userData?.username || "");
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

    async function handleChangeUsername() {
        const res: ResultType = await fetch(api.users.changeUsername.toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: newUsername }),
        }).then(res => res.json());

        if (!res.success) console.error(res.message);

        setIsEditing(false);
        setShowConfirmationDialog(false);
        window.location.href = "/profile";
    }

    return userData && (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col items-center gap-6">
                        <Avatar className="w-32 h-32 border-4 border-purple-400/20">
                            <AvatarImage src={""} />
                            <AvatarFallback className="bg-purple-600 text-2xl font-bold">
                                {userData.username[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center space-y-4">
                            <div className="flex justify-center items-center gap-3">
                                {isEditing ? (
                                    <Input
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="bg-transparent border-none text-4xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
                                        autoFocus
                                    />
                                ) : (
                                    <h1 className="text-4xl font-bold">{userData.username}</h1>
                                )}
                                <i
                                    onClick={() =>
                                        isEditing
                                            ? setShowConfirmationDialog(true)
                                            : setIsEditing(true)
                                    }
                                    className={`fa-solid ${isEditing ? "fa-check" : "fa-pen-to-square"
                                        } text-xs text-gray-400 cursor-pointer`}
                                />
                                {isEditing && (
                                    <i
                                        onClick={() => setIsEditing(false)}
                                        className="fa-solid fa-xmark text-xs text-gray-400 cursor-pointer"
                                    />
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="bg-purple-600/20 text-purple-300 border-purple-400/30"
                                >
                                    {userData.tier} plan
                                </Badge>
                                <i
                                    className="fa-regular fa-circle-up text-xl text-yellow-500 cursor-pointer"
                                    onClick={() => router.push("/profile/tier")}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Stats Section */}
                    <Card className="bg-gray-800/50 border-gray-700 col-span-1 md:col-span-3">
                        <CardContent className="grid grid-cols-3 divide-x divide-gray-700 py-4 text-sm md:text-base lg:text-2xl">
                            <div className="text-center p-4">
                                <p className="font-bold text-purple-400">
                                    {userData.qrCodesCount}
                                </p>
                                <p className="text-sm text-gray-400">QR Codes</p>
                            </div>
                            <div className="text-center p-4">
                                <p className="font-bold text-indigo-400">
                                    {userData.totalScans}
                                </p>
                                <p className="text-sm text-gray-400">Total scans</p>
                            </div>
                            <div className="text-center p-4">
                                <p className="font-bold text-blue-400">
                                    {new Date(userData.createdAt!).toLocaleString("en-GB", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        weekday: "short",
                                        hour: "numeric",
                                        minute: "numeric",
                                    }) ?? "null"}
                                </p>
                                <p className="text-sm text-gray-400">Since</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bio Section */}
                    <Card className="bg-gray-800/50 border-gray-700 md:col-span-2">
                        <CardHeader className="text-xl font-semibold border-b border-gray-700">
                            Profile
                        </CardHeader>
                        <CardContent className="pt-4 text-gray-300 leading-relaxed">
                            {"No bio available. Describe your expertise!"}
                        </CardContent>
                    </Card>

                    {/* Details Section */}
                    <div className="space-y-6">
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardHeader className="text-lg font-semibold border-b border-gray-700">
                                Email
                            </CardHeader>
                            <CardContent className="pt-4 space-y-2">
                                <p className="text-gray-300">{userData.email}</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardHeader className="text-lg font-semibold border-b border-gray-700">
                                Role
                            </CardHeader>
                            <CardContent className="pt-4 flex flex-wrap gap-2">
                                {userData.role[0].toUpperCase() + userData.role.slice(1)}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showConfirmationDialog}
                onConfirm={handleChangeUsername}
                onCancel={() => setShowConfirmationDialog(false)}
                title="Confirm Username Change"
                message={`Are you sure you want to change your username to "${newUsername}"?`}
            />
        </div>
    );
};

export default ProfilePage;