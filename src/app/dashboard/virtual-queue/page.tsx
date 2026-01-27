"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, useWatch, Control } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Users, Trash2 } from "lucide-react";
import { temples, timeSlots } from "@/lib/app-data";
import { useToken } from "@/context/TokenContext";
import { useRouter } from "next/navigation";

const pilgrimSchema = z.object({
    name: z.string().min(1, "Name is required."),
    age: z.coerce.number().min(1, "Age must be at least 1.").max(120, "Age seems unlikely."),
    phone: z.string().optional(),
    isDifferentlyAbled: z.boolean().default(false),
    photo: z.any().optional(),
});

const formSchema = z.object({
  temple: z.string().min(1, "Please select a temple."),
  date: z.string().min(1, "Please select a date."),
  timeSlot: z.string().min(1, "Please select a time slot."),
  numberOfPilgrims: z.coerce.number().min(1, "At least one pilgrim required.").max(10, "Maximum of 10 pilgrims allowed."),
  pilgrims: z.array(pilgrimSchema),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
    temple: "",
    date: "",
    timeSlot: "",
    numberOfPilgrims: 1,
    pilgrims: [{ name: "", age: 0, phone: "", isDifferentlyAbled: false }],
};


function PilgrimFields({ control, index, remove }: { control: Control<FormValues>, index: number, remove: (index: number) => void }) {
    const age = useWatch({
        control,
        name: `pilgrims.${index}.age`,
    });

    const isPhoneNumberDisabled = age < 18;

    return (
        <div className="border p-4 rounded-lg space-y-4 relative">
             <h4 className="font-semibold text-primary">Pilgrim {index + 1}</h4>
             {index > 0 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>}
            <FormField
                control={control}
                name={`pilgrims.${index}.name`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter pilgrim's name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={control}
                    name={`pilgrims.${index}.age`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 35" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name={`pilgrims.${index}.phone`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="Optional for minors" {...field} disabled={isPhoneNumberDisabled} />
                            </FormControl>
                            {isPhoneNumberDisabled && <FormDescription className="text-xs">Phone number is not required for minors.</FormDescription>}
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
                 <FormField
                    control={control}
                    name={`pilgrims.${index}.photo`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Photo</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={control}
                    name={`pilgrims.${index}.isDifferentlyAbled`}
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 h-16 justify-center">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Differently Abled?</FormLabel>
                                <FormDescription className="text-xs">Check for priority access.</FormDescription>
                            </div>
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}

export default function VirtualQueuePage() {
    const { toast } = useToast();
    const router = useRouter();
    const { setActiveTokens } = useToken();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
        mode: "onChange",
    });

    const { control, watch, setValue } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: "pilgrims",
    });

    const numberOfPilgrims = watch("numberOfPilgrims");

    useEffect(() => {
        const currentCount = fields.length;
        if (numberOfPilgrims > currentCount) {
            for (let i = 0; i < numberOfPilgrims - currentCount; i++) {
                append({ name: "", age: 0, phone: "", isDifferentlyAbled: false });
            }
        } else if (numberOfPilgrims < currentCount) {
            const indicesToRemove = Array.from({ length: currentCount - numberOfPilgrims }, (_, i) => currentCount - 1 - i);
            remove(indicesToRemove);
        }
    }, [numberOfPilgrims, fields.length, append, remove]);


    function onSubmit(values: FormValues) {
        const templeAbbreviation = values.temple.substring(0, 3).toUpperCase();
        
        const newTokens = values.pilgrims.map(pilgrim => {
             const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
             return {
                temple: values.temple,
                date: values.date,
                timeSlot: values.timeSlot,
                pilgrim: {
                    name: pilgrim.name,
                    age: pilgrim.age,
                    phone: pilgrim.phone || 'N/A',
                    isDifferentlyAbled: pilgrim.isDifferentlyAbled
                },
                tokenId: `TCN-${templeAbbreviation}-${randomString}`,
                gate: pilgrim.isDifferentlyAbled ? "Gate 1 (Priority)" : "Gate 3"
             }
        })

        setActiveTokens(newTokens);
        
        toast({
            title: "✅ Booking Successful!",
            description: `Generated ${newTokens.length} virtual queue token(s) for ${values.temple}.`,
        });
        
        router.push('/dashboard/my-tokens');
    }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Book Virtual Queue</CardTitle>
                <CardDescription>Reserve your darshan slot to avoid long physical queues.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={control}
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
                                control={control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} min={new Date().toISOString().split("T")[0]} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={control}
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
                            control={control}
                            name="numberOfPilgrims"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Number of Pilgrims</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input type="number" min="1" max="10" placeholder="e.g., 2" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-6">
                            {fields.map((field, index) => (
                                <PilgrimFields key={field.id} control={control} index={index} remove={() => {
                                    remove(index)
                                    setValue('numberOfPilgrims', numberOfPilgrims - 1)
                                }} />
                            ))}
                        </div>
                       
                        <Button type="submit" className="w-full" size="lg" disabled={!form.formState.isValid}>Book My Slot</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
