"use client";

import { sendResetEmailFormSchema } from "@/lib/schemas";
import { ResultType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import ResultMessage from "../../ResultMessage";
import { api } from "@/lib/endpoint-builder";


const SendResetEmailForm = () => {
    const [isPending, setIsPending] = useState(false);
    const [result, setResult] = useState<ResultType>({ success: false, message: null, data: null });

    async function onSubmit(values: z.infer<typeof sendResetEmailFormSchema>) {
        try {
            setIsPending(true);
            const res: ResultType = await fetch(api.auth.forgotPassword.sendEmail.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(values)
            }).then(res => res.json());

            if (!res.success) {
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

    const form = useForm<z.infer<typeof sendResetEmailFormSchema>>({
        resolver: zodResolver(sendResetEmailFormSchema),
        defaultValues: {
            emailOrUsername: "",
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50">
                {/* Form fields */}
                <FormField
                    control={form.control}
                    name="emailOrUsername"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-300">Email or Username</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="your email"
                                    {...field}
                                    className="bg-gray-700/20 border-gray-600/50 focus:border-indigo-400/50 focus:ring-indigo-400/50 text-gray-100"
                                />
                            </FormControl>
                            <FormMessage className="text-red-400/80" />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 
                    transition-all shadow-lg shadow-indigo-500/20"
                    disabled={isPending}
                >
                    Send Email
                </Button>
                <ResultMessage success={result.success} message={result.message} />
            </form>
        </Form>
    )
}

export default SendResetEmailForm;