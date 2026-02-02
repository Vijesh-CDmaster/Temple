
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkerAuth } from "@/context/WorkerContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Briefcase } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function WorkerLoginPage() {
    const router = useRouter();
    const { login } = useWorkerAuth();
    const { toast } = useToast();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(data: LoginFormValues) {
        try {
            await login(data.email, data.password);
            toast({
                title: "✅ Login Successful",
                description: "Welcome, let's get to work!",
            });
            router.push("/worker/dashboard");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "❌ Login Failed",
                description: error.message || "An unknown error occurred.",
            });
        }
    }

    return (
        <div className="w-full flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                     <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <Briefcase className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-2xl">Worker Login</CardTitle>
                    <CardDescription>Enter your official credentials to access your dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Official Email</FormLabel>
                                <FormControl>
                                <Input type="email" placeholder="worker@kgkite.ac.in" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting} suppressHydrationWarning>
                            {form.formState.isSubmitting ? "Logging in..." : "Access Dashboard"}
                        </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
