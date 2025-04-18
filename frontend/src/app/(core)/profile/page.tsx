"use client";

import { api } from "@/lib/endpoint-builder";
import { PublicUser, ResultType } from "@/types";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfilePage = () => {
    const [userData, setUserData] = useState<PublicUser | null>(null);

    useEffect(() => {
        const fetchSessionUser = async () => {
            try {
                const res: ResultType = await fetch(api.users.current.toString()).then(res => res.json());

                if (!res.success) throw new Error("Failed to fetch user session");

                setUserData(res.body as PublicUser);
            } catch (error) {
                console.error(error);
            }
        };
        fetchSessionUser();
    }, []);

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
                        <div className="text-center">
                            <h1 className="text-4xl font-bold mb-2">{userData.username}</h1>
                            <Badge variant="outline" className="bg-purple-600/20 text-purple-300 border-purple-400/30">
                                {userData.tier} plan
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Stats Section */}
                    <Card className="bg-gray-800/50 border-gray-700 col-span-1 md:col-span-3">
                        <CardContent className="grid grid-cols-3 divide-x divide-gray-700 py-4">
                            <div className="text-center p-4">
                                <p className="text-2xl font-bold text-purple-400">{userData.qrCodesCount}</p>
                                <p className="text-gray-400">QR Codes</p>
                            </div>
                            <div className="text-center p-4">
                                <p className="text-2xl font-bold text-indigo-400">{userData.totalScans}</p>
                                <p className="text-gray-400">Total scans</p>
                            </div>
                            <div className="text-center p-4">
                                <p className="text-2xl font-bold text-blue-400">{userData.createdAt!.toLocaleString("it-IT") ?? "null"}</p>
                                <p className="text-gray-400">Since</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bio Section */}
                    <Card className="bg-gray-800/50 border-gray-700 md:col-span-2">
                        <CardHeader className="text-xl font-semibold border-b border-gray-700">
                            Quantum Profile
                        </CardHeader>
                        <CardContent className="pt-4 text-gray-300 leading-relaxed">
                            {"No bio available. Describe your quantum expertise!"}
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
                                Expertise
                            </CardHeader>
                            <CardContent className="pt-4 flex flex-wrap gap-2">
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;