"use client";

import PreviewCard from "@/components/Editors/VCard/PreviewCard";
import QRCodeForm from "../../Forms/Create/QRCodeFormRouter";
import { useQrCodeCreator } from "@/hooks/use-qrcode-creator";
import { CardDetailsFormValues } from "@/lib/schemas";

// This component is used to create the vCards data
// It contains two sections:
// 1. Form Section: This section contains the form to create the vCard data
// 2. Preview Section: This section contains the live preview of the vCard data
// The form data is passed to the PreviewCard component to display the live preview
// The form data is validated using the cardDetailsFormSchema schema
export default function CreateVCardEditor() {
    const { form } = useQrCodeCreator();

    const currentData = form.watch() as CardDetailsFormValues;

    // Preview Data
    const previewData = {
        id: -1,
        name: currentData.name || "My vCard",
        firstName: currentData.firstName || "John",
        lastName: currentData.lastName || "Doe",
        email: currentData.email || "john@company.com",
        phoneNumber: currentData.phoneNumber || "+1 555 000 0000",
        address: currentData.address || "123 Main St, City",
        websiteUrl: currentData.websiteUrl || "https://company.com",
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-0 xl:p-4">
            {/* Form Section */}
            <div className="space-y-6">
                <QRCodeForm />
            </div>

            {/* Preview Section */}
            <div className="lg:col-span-1 p-0 lg:p-6">
                <div className="sticky top-8">
                    <PreviewCard data={previewData} />
                </div>
            </div>
        </div>
    );
}