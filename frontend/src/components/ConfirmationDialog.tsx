"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmationDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
}

const ConfirmationDialog = ({
    isOpen,
    onConfirm,
    onCancel,
    title,
    message,
}: ConfirmationDialogProps) => {
    if (!isOpen) return null;

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent className="bg-gray-900 border-gray-700">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-500">{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {message}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel 
                        onClick={() => onCancel()}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={() => onConfirm()} 
                        className="!bg-red-400 text-white font-bold"
                    >
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    );
};

export default ConfirmationDialog;