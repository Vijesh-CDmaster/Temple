"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
    name: z.string().min(1, "Name is required."),
    email: z.string().email("Invalid email address."),
    phone: z.string().min(10, "Invalid phone number."),
    language: z.string(),
    avatar: z.string().url().optional(),
    dob: z.string(),
    gender: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    emergencyContact: z.object({
        name: z.string(),
        phone: z.string(),
    }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { currentUser, updateUser } = useAuth();
    const { toast } = useToast();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        if (currentUser) {
            form.reset(currentUser);
        }
    }, [currentUser, form.reset]);
    
    function onSubmit(data: ProfileFormValues) {
        if(!currentUser) return;
        updateUser(data);
        toast({
            title: "✅ Profile Updated",
            description: "Your information has been saved successfully.",
        });
    }

    if (!currentUser) {
        return (
             <div className="container py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-headline">Profile</h1>
                    <p className="text-muted-foreground">Manage your account and preferences</p>
                </div>
                <Card className="max-w-3xl mx-auto">
                    <CardHeader className="items-center text-center">
                        <Skeleton className="w-24 h-24 rounded-full mb-4" />
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-5 w-64" />
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-8">
                             <Skeleton className="h-8 w-1/3 mb-4" />
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2"><Skeleton className="h-6 w-24" /><Skeleton className="h-10 w-full" /></div>
                                <div className="space-y-2"><Skeleton className="h-6 w-24" /><Skeleton className="h-10 w-full" /></div>
                             </div>
                         </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const avatarFallback = currentUser.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Profile</h1>
                <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>
            <Card className="max-w-3xl mx-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardHeader className="items-center text-center">
                            <Avatar className="w-24 h-24 mb-4">
                                <AvatarImage src={currentUser.avatar} alt="User Avatar" />
                                <AvatarFallback>{avatarFallback}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="font-headline text-2xl">{currentUser.name}</CardTitle>
                            <CardDescription>{currentUser.email}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div>
                                <h3 className="text-lg font-medium mb-4 text-primary">Personal Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                     <FormField control={form.control} name="phone" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="dob" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date of Birth</FormLabel>
                                            <FormControl><Input type="date" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="gender" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h3 className="text-lg font-medium mb-4 text-primary">Address</h3>
                                <div className="space-y-4">
                                     <FormField control={form.control} name="address" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Street Address</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                         <FormField control={form.control} name="city" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="state" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>State</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="pincode" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pincode</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h3 className="text-lg font-medium mb-4 text-primary">Emergency Contact</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                     <FormField control={form.control} name="emergencyContact.name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Name</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                     <FormField control={form.control} name="emergencyContact.phone" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Phone</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </div>
                            <Separator />
                            <FormField control={form.control} name="language" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Preferred Language</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="flex justify-end pt-4">
                                <Button type="submit" size="lg" disabled={!currentUser || form.formState.isSubmitting}>Save Changes</Button>
                            </div>
                        </CardContent>
                    </form>
                </Form>
            </Card>
        </div>
    )
}
