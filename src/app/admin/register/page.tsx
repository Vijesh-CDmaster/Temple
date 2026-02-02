
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address.").refine(
    (email) => email.endsWith("@kgkite.ac.in"),
    { message: "Must be an official @kgkite.ac.in email." }
  ),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AdminRegisterPage() {
  const router = useRouter();
  const { register } = useAdminAuth();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
        name: "",
        email: "",
        password: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    try {
      await register(data.name, data.email, data.password);
      toast({
        title: "✅ Admin Registration Successful",
        description: "Your admin account has been created.",
      });
      router.push("/admin");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "❌ Registration Failed",
        description: error.message || "An unknown error occurred.",
      });
    }
  }

  return (
    <div className="w-full flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <Shield className="w-10 h-10 text-primary" />
            </div>
          <CardTitle className="font-headline text-2xl">Create Admin Account</CardTitle>
          <CardDescription>Use your official email to register for admin access.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Official Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your-name@kgkite.ac.in" {...field} />
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
              <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating Account..." : "Register as Admin"}
              </Button>
            </form>
          </Form>
           <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/admin/login" className="font-semibold text-primary hover:underline">
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
