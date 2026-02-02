
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase } from "lucide-react";
import { workerRoleGroups } from "@/lib/app-data";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address.").refine(
    (email) => email.endsWith("@kgkite.ac.in"),
    { message: "Must be an official @kgkite.ac.in email." }
  ),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.string().min(1, "Please select your role."),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function WorkerRegisterPage() {
  const router = useRouter();
  const { register } = useWorkerAuth();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
        name: "",
        email: "",
        password: "",
        role: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    try {
      await register(data.name, data.email, data.password, data.role);
      toast({
        title: "✅ Registration Successful",
        description: "Your worker account has been created.",
      });
      router.push("/worker/dashboard");
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
                <Briefcase className="w-10 h-10 text-primary" />
            </div>
          <CardTitle className="font-headline text-2xl">Create Worker Account</CardTitle>
          <CardDescription>Use your official email and select your role to register.</CardDescription>
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
               <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Select Role</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose your assigned role" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {workerRoleGroups.map((group) => (
                                    <SelectGroup key={group.group}>
                                        <SelectLabel>{group.group}</SelectLabel>
                                        {group.roles.map((role) => (
                                            <SelectItem key={role.id} value={role.name}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
                />
              <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating Account..." : "Register as Worker"}
              </Button>
            </form>
          </Form>
           <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/worker/login" className="font-semibold text-primary hover:underline">
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
