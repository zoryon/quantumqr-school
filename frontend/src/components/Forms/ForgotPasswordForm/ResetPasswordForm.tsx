"use client";

import { resetPasswordFormSchema } from "@/lib/schemas";
import { ResultType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PasswordField from "../../PasswordField";
import { Button } from "../../ui/button";
import ResultMessage from "../../ResultMessage";
import { Form } from "../../ui/form";
import { api } from "@/lib/endpoint-builder";

const ResetPasswordForm = ({ token }: { token: string }) => {
    const [isPending, setIsPending] = useState(false);
    const [result, setResult] = useState<ResultType>({ success: false, message: null, data: null });
    const router = useRouter();

    async function onSubmit(values: z.infer<typeof resetPasswordFormSchema>) {
        try {
            setIsPending(true);
            const res: ResultType = await fetch(api.auth.forgotPassword.reset.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ...values, token: token })
            }).then(res => res.json());

            if (res.success) {
                router.push("/login");
            } else {
                setIsPending(false);
            }

            setResult({
                success: res.success,
                message: res.message,
                data: res.data
            });
        } catch (error: any) {
            console.error("Error while changing password: ", error.message);
            setResult({
                success: error.success,
                message: error.message,
                data: null
            });
            setIsPending(false);
        }
    }

    const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
        resolver: zodResolver(resetPasswordFormSchema),
        defaultValues: {
            password: "",
            passwordConfirmation: "",
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50">
                <PasswordField control={form.control} fieldLabel="New password" />
                <PasswordField control={form.control} isConfirmation />

                <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 
                    transition-all shadow-lg shadow-indigo-500/20"
                    disabled={isPending}
                >
                    Reset password
                </Button>
                <ResultMessage success={result.success} message={result.message} />
            </form>
        </Form>
    )
}

export default ResetPasswordForm;