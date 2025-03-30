"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useQrCodeCreator } from "@/hooks/use-qrcode-creator";

const ClassicForm = ({ onSubmit } : { onSubmit: any }) => {
    const { qrType, form } = useQrCodeCreator();

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                id={`${qrType.toLowerCase()}-form`}
                className="space-y-6"
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
            </form>
        </Form>
    );
}

export default ClassicForm;