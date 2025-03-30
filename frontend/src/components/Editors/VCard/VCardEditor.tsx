"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import EditForm from "@/components/Forms/Edit/EditFormRouter";
import PreviewCard from "@/components/Editors/VCard/PreviewCard";
import { cardDetailsFormSchema } from "@/lib/schemas";

// This component is used to update the vCards data
// It contains two sections:
// 1. Edit Form Section: This section contains the form to update the vCard data
// 2. Live Preview Section: This section contains the live preview of the vCard data
// The form data is passed to the PreviewCard component to display the live preview
// The form data is validated using the cardDetailsFormSchema schema
export default function VCardEditor({
    id,
    initialData,
}: {
    id: number,
    initialData: z.infer<typeof cardDetailsFormSchema>,
}) {
    const form = useForm<z.infer<typeof cardDetailsFormSchema>>({
        resolver: zodResolver(cardDetailsFormSchema),
        defaultValues: initialData,
    });

    const currentData = form.watch();

    return (
        <>
            {/* Edit Form Section */}
            <div className="space-y-8 p-0 xl:p-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Edit vCard
                </h2>
                <EditForm type="vCards" id={id} form={form} initialData={initialData} />
            </div>

            {/* Live Preview Section */}
            <div className="lg:col-span-1 p-0 lg:p-6">
                <div className="sticky top-8">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6">
                        Live Preview
                    </h3>
                    <PreviewCard data={currentData} />
                </div>
            </div>
        </>
    );
}