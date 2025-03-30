"use client";

import { Button } from "../../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";
import { CardDetailsFormValues } from "@/lib/schemas";
import { UseFormReturn } from "react-hook-form";

const EditVCardForm = ({
    form,
    onSubmit,
    isPending
}: {
    form?: UseFormReturn<CardDetailsFormValues>,
    onSubmit: any,
    isPending: boolean
}) => {
    if (!form) {
        return null;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50">
                <div className="grid grid-cols-2 gap-4">
                    {/* Name field */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel className="text-gray-300">QR Code&apos;s Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="My Professional VCard"
                                        {...field}
                                        className="bg-gray-700/20 border-gray-600/50 focus:border-indigo-400/50 focus:ring-indigo-400/50 text-gray-100"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Other forms fields */}
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300">First Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="John"
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
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300">Last Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Doe"
                                        {...field}
                                        className="bg-gray-700/20 border-gray-600/50 focus:border-indigo-400/50 focus:ring-indigo-400/50 text-gray-100"
                                    />
                                </FormControl>
                                <FormMessage className="text-red-400/80" />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300">Phone</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="+1 555 000 0000"
                                        {...field}
                                        value={field.value || ""}
                                        className="bg-gray-700/20 border-gray-600/50 focus:border-indigo-400/50 focus:ring-indigo-400/50 text-gray-100"
                                    />
                                </FormControl>
                                <FormMessage className="text-red-400/80" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300">Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="john@example.com"
                                        {...field}
                                        value={field.value || ""}
                                        className="bg-gray-700/20 border-gray-600/50 focus:border-indigo-400/50 focus:ring-indigo-400/50 text-gray-100"
                                    />
                                </FormControl>
                                <FormMessage className="text-red-400/80" />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="websiteUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-300">Website</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="https://company.com"
                                    {...field}
                                    value={field.value || ""}
                                    className="bg-gray-700/20 border-gray-600/50 focus:border-indigo-400/50 focus:ring-indigo-400/50 text-gray-100"
                                />
                            </FormControl>
                            <FormMessage className="text-red-400/80" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-300">Address</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="123 Main St, City"
                                    {...field}
                                    value={field.value || ""}
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
                    Update vCard
                </Button>
            </form>
        </Form>
    );
}

export default EditVCardForm;