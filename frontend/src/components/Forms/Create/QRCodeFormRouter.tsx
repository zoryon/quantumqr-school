"use client";

import { useQrCodeCreator } from "@/hooks/use-qrcode-creator";
import ClassicForm from "./ClassicForm";
import VCardForm from "./VCardForm";

// This component is responsible for rendering the form based on the selected QR Code type.
// It also handles the form submission and optimistic update of the QR Code list.
// It also handles the API call to create the QR Code and updates the QR Code list with the newly created QR Code.
// It also handles the error and success messages and updates the result state accordingly.
// It also handles the loading state of the form.
const QRCodeForm = () => {
    const { qrType, handleCreate } = useQrCodeCreator();

    switch (qrType) {
        case "classics":
            return (<ClassicForm onSubmit={handleCreate} />);
        case "vCards": 
            return (<VCardForm onSubmit={handleCreate} />);
        default:
            return null;
    }
};

export default QRCodeForm;