import { cardDetailsFormSchema } from "@/lib/schemas";
import Link from "next/link";
import { z } from "zod";

export default function PreviewCard({ data }: { data: z.infer<typeof cardDetailsFormSchema> }) {
    const contactPoints = [
        { icon: "fa-envelope", value: data.email, type: "mailto" },
        { icon: "fa-phone", value: data.phoneNumber, type: "tel" },
        { icon: "fa-map-marker-alt", value: data.address },
        { icon: "fa-globe", value: data.websiteUrl, type: "url" }
    ].filter((item) => Boolean(item.value));

    return (
        <div className="p-6 rounded-3xl bg-gray-800/50 border-2 border-gray-700/50 backdrop-blur-sm">
            <div className="text-center space-y-6">
                <h3 className="text-xl font-semibold text-gray-200 mb-6">
                    Live Preview
                </h3>

                <div className="flex flex-col items-center space-y-4">
                    <div className="w-32 h-32 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center">
                        <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            {data.firstName?.[0]}
                            <span className="animate-pulse">·</span>
                            {data.lastName?.[0]}
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-100">
                        {data.firstName} {data.lastName}
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-8">
                    {contactPoints.map((item, index) => (
                        <div
                            key={index}
                            className="p-4 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-all"
                        >
                            <div className="flex items-center space-x-3">
                                <i className={`fas ${item.icon} text-indigo-400 text-lg w-6`} />
                                {item.type ? (
                                    <Link
                                        href={item.type === "url" ? item.value! : `${item.type}:${item.value!}`}
                                        className="text-gray-200 hover:text-indigo-400 transition-colors truncate"
                                        target="_blank"
                                    >
                                        {item.value}
                                    </Link>
                                ) : (
                                    <span className="text-gray-200">{item.value}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}