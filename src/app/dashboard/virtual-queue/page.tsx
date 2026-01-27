"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Users } from "lucide-react";
import { temples, timeSlots } from "@/lib/app-data";
import { useToken } from "@/context/TokenContext";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  temple: z.string().min(1, "Please select a temple."),
  date: z.string().min(1, "Please select a date."),
  timeSlot: z.string().min(1, "Please select a time slot."),
  numberOfPilgrims: z.coerce.number().min(1, "At least one pilgrim required.").max(10, "Maximum of 10 pilgrims allowed."),
  priority: z.enum(["general", "senior", "disabled"]).default("general"),
});

const defaultValues = {
    temple: "",
    date: "",
    timeSlot: "",
    numberOfPilgrims: 1,
    priority: "general" as const,
};

export default function VirtualQueuePage() {
    const { toast } = useToast();
    const router = useRouter();
    const { setActiveToken } = useToken();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const templeAbbreviation = values.temple.substring(0, 3).toUpperCase();
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const newActiveToken = {
            temple: values.temple,
            date: values.date,
            timeSlot: values.timeSlot,
            pilgrims: `${values.numberOfPilgrims} ${values.numberOfPilgrims > 1 ? 'Pilgrims' : 'Pilgrim'}`,
            tokenId: `TCN-${templeAbbreviation}-${randomString}`,
            gate: "Gate 3"
        }

        setActiveToken(newActiveToken);
        
        toast({
            title: "✅ Booking Successful!",
            description: `Your virtual queue token for ${values.temple} has been generated.`,
        });
        
        router.push('/dashboard/my-tokens');
    }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Book Virtual Queue</CardTitle>
                <CardDescription>Reserve your darshan slot to avoid long physical queues.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="temple"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Temple</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a temple for darshan" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {temples.map((temple) => (
                                                <SelectItem key={temple.id} value={temple.name}>
                                                    {temple.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="timeSlot"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Time Slot</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a time" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {timeSlots.map((slot) => (
                                                    <SelectItem key={slot.value} value={slot.value}>
                                                        {slot.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="numberOfPilgrims"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Number of Pilgrims</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input type="number" placeholder="e.g., 2" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>Priority Booking (if applicable)</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8"
                                    >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="general" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        General Queue
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="senior" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        Senior Citizen
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="disabled" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        Differently Abled
                                        </FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" size="lg">Book My Slot</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
