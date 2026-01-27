import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userProfile } from "@/lib/app-data";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Profile</h1>
                <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>
            <Card className="max-w-3xl mx-auto">
                <CardHeader className="items-center text-center">
                    <Avatar className="w-24 h-24 mb-4">
                        <AvatarImage src={userProfile.avatar} alt="User Avatar" />
                        <AvatarFallback>{userProfile.avatarFallback}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="font-headline text-2xl">{userProfile.name}</CardTitle>
                    <CardDescription>{userProfile.email}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-8">
                        <div>
                             <h3 className="text-lg font-medium mb-4 text-primary">Personal Information</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" defaultValue={userProfile.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" defaultValue={userProfile.phone} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dob">Date of Birth</Label>
                                    <Input id="dob" type="date" defaultValue={userProfile.dob} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Input id="gender" defaultValue={userProfile.gender} />
                                </div>
                            </div>
                        </div>

                        <Separator />

                         <div>
                            <h3 className="text-lg font-medium mb-4 text-primary">Address</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Street Address</Label>
                                    <Input id="address" defaultValue={userProfile.address} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" defaultValue={userProfile.city} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Input id="state" defaultValue={userProfile.state} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pincode">Pincode</Label>
                                        <Input id="pincode" defaultValue={userProfile.pincode} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <Separator />

                        <div>
                            <h3 className="text-lg font-medium mb-4 text-primary">Emergency Contact</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="emergency-name">Contact Name</Label>
                                    <Input id="emergency-name" defaultValue={userProfile.emergencyContact.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency-phone">Contact Phone</Label>
                                    <Input id="emergency-phone" defaultValue={userProfile.emergencyContact.phone} />
                                </div>
                            </div>
                        </div>
                        
                        <Separator />

                        <div className="space-y-2">
                            <Label htmlFor="language">Preferred Language</Label>
                            <Input id="language" defaultValue={userProfile.language} />
                        </div>
                        
                         <div className="flex justify-end pt-4">
                            <Button type="submit" size="lg">Save Changes</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
