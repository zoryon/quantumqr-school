"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { classicDetailsFormSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const EditClassicForm = ({ 
    onSubmit, 
    isPending, 
    initialData 
}: { 
    onSubmit: any, 
    isPending: boolean,
    initialData: any
}) => {
    const form = useForm<z.infer<typeof classicDetailsFormSchema>>({
        resolver: zodResolver(classicDetailsFormSchema),
        defaultValues: initialData,
    });

    return (
        <div className="space-y-8 p-0 xl:p-4 col-span-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Edit QR Code
            </h2>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6 bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300">QR Code Name</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder="My Professional Card"
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
                        name="websiteUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300">Website url</FormLabel>
                                <FormControl>
                                    <Input
                                        type="url"
                                        placeholder="https://company.com"
                                        {...field}
                                        value={field.value ?? ""}
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
                        Update classic
                    </Button>
                </form>
            </Form>
        </div>
    );
}

export default EditClassicForm;