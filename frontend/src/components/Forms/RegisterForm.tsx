"use client";

import { registerFormSchema } from "@/lib/schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "../ui/checkbox";
import Link from "next/link";
import { useState } from "react";
import ResultMessage from "../ResultMessage";
import { ResultType } from "@/types";
import PasswordField from "../PasswordField";
import { api } from "@/lib/endpoint-builder";

const RegisterForm = () => {
    const [isPending, setIsPending] = useState(false);
    const [result, setResult] = useState<ResultType>({ success: false, message: null, body: null });

    async function onSubmit(values: z.infer<typeof registerFormSchema>) {
        try {
            setIsPending(true);
            console.log(api.auth.register.toString())
            const res: ResultType = await fetch(api.auth.register.register.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            }).then(res => res.json());
            
            setResult({
                success: res.success,
                message: res.message,
                body: res.body,
            });
        } catch (error: any) {
            console.error("Error during registration: ", error.message);
            setResult({
                success: error.success,
                message: error.message,
                body: null,
            });
        } finally {
            setIsPending(false);
        }
    }

    const form = useForm<z.infer<typeof registerFormSchema>>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            email: "",
            username: "",
            password: "",
            passwordConfirmation: "",
            hasAllowedEmails: false,
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 backdrop-blur-sm rounded-2xl p-8">
                {/* form fields */}
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-300">Email</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="your@email.com"
                                    {...field}
                                    className="bg-gray-700/20 border-gray-600/50 focus:border-indigo-400/50 focus:ring-indigo-400/50 text-gray-100"
                                />
                            </FormControl>
                            <FormMessage className="text-red-400/80" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input 
                                    type="text" 
                                    placeholder="your username" 
                                    {...field} 
                                    className="bg-gray-700/20 border-gray-600/50 focus:border-indigo-400/50 focus:ring-indigo-400/50 text-gray-100"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <PasswordField control={form.control} />
                <PasswordField control={form.control} isConfirmation />

                {/* important policies */}
                <FormField
                    control={form.control}
                    name="hasAllowedEmails"
                    render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                            <FormControl>
                                <Checkbox id="hasAllowedEmails" checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel htmlFor="hasAllowedEmails" className="!text-xs text-gray-300">Accept receiving news letters</FormLabel>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <p className="text-xs text-gray-300">
                    By creating an account, you agree to QuantumQR&apos;s{" "}
                    <Link href={"/policies/privacy-policy"} className="underline text-blue-400">Privacy Policy</Link>
                    {" "}and{" "}
                    <Link href={"/policies/terms-of-service"} className="underline text-blue-400">Terms of Service</Link>.
                </p>

                <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                    disabled={isPending}
                >
                    Submit
                </Button>
                <ResultMessage success={result.success} message={result.message} />
            </form>
        </Form>
    );
}

export default RegisterForm;