"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, Briefcase, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const reportSchema = z.object({
  reportType: z.enum(["person", "item"]),
  name: z.string().min(1, "Name is required."),
  description: z.string().min(1, "A brief description is required."),
  lastSeenLocation: z.string().min(1, "Last known location is required."),
  contact: z.string().min(1, "Contact information is required."),
  image: z.any().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

const activeReports = [
    { id: 1, type: "Person", name: "Ramesh Sharma", description: "Male, approx 70 years old, wearing white kurta.", location: "Near Food Court", status: "Active" },
    { id: 2, type: "Item", name: "Red Backpack", description: "A standard red backpack with a water bottle on the side.", location: "Gate 2 Entrance", status: "Active" },
]

export default function LostAndFoundPage() {
    const { toast } = useToast();
    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            reportType: "person",
            name: "",
            description: "",
            lastSeenLocation: "",
            contact: "",
        },
    });

    function onSubmit(data: ReportFormValues) {
        console.log(data);
        toast({
            title: "✅ Report Filed",
            description: "The new lost & found report has been submitted and broadcasted.",
        });
        form.reset();
    }

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Lost & Found</h1>
                <p className="text-muted-foreground">Manage reports for missing persons and items.</p>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Search /> File a New Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField control={form.control} name="reportType" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Report Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="person">Missing Person</SelectItem>
                                                <SelectItem value="item">Lost Item</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name of Person / Item</FormLabel>
                                        <FormControl><Input placeholder="e.g., Suresh Kumar or 'Blue Bag'" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl><Textarea placeholder="e.g., Wearing a red saree, approx 60 years old..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="lastSeenLocation" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Seen Location</FormLabel>
                                        <FormControl><Input placeholder="e.g., Near Gate 3" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                 <FormField control={form.control} name="contact" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reporting Person's Contact</FormLabel>
                                        <FormControl><Input placeholder="Phone number or staff ID" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="image" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Upload Photo (Optional)</FormLabel>
                                        <FormControl><Input type="file" accept="image/*" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="submit" className="w-full">Submit Report</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><List /> Active Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activeReports.map(report => (
                            <div key={report.id} className="border p-4 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    {report.type === "Person" ? <User className="w-5 h-5 text-primary" /> : <Briefcase className="w-5 h-5 text-primary" />}
                                    <h4 className="font-semibold">{report.name}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                                <p className="text-xs text-muted-foreground">Last seen: {report.location}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
