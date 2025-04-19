"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="company">Company</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>
                                Manage your general application settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="language">Language</Label>
                                <Select defaultValue="en">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                        <SelectItem value="sw">Swahili</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Select defaultValue="eat">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="eat">East Africa Time</SelectItem>
                                        <SelectItem value="cat">Central Africa Time</SelectItem>
                                        <SelectItem value="wat">West Africa Time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="dark-mode" />
                                <Label htmlFor="dark-mode">Enable Dark Mode</Label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="company">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Information</CardTitle>
                            <CardDescription>
                                Update your company details and preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="company-name">Company Name</Label>
                                <Input id="company-name" placeholder="Enter company name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company-address">Address</Label>
                                <Input
                                    id="company-address"
                                    placeholder="Enter company address"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company-phone">Phone</Label>
                                <Input id="company-phone" placeholder="Enter company phone" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company-email">Email</Label>
                                <Input
                                    id="company-email"
                                    type="email"
                                    placeholder="Enter company email"
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save Changes</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Manage how you receive notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Switch id="email-notifications" />
                                <Label htmlFor="email-notifications">Email Notifications</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="policy-expiry" />
                                <Label htmlFor="policy-expiry">Policy Expiry Alerts</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="payment-notifications" />
                                <Label htmlFor="payment-notifications">
                                    Payment Notifications
                                </Label>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notification-frequency">
                                    Notification Frequency
                                </Label>
                                <Select defaultValue="daily">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="realtime">Real-time</SelectItem>
                                        <SelectItem value="daily">Daily Digest</SelectItem>
                                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save Preferences</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>
                                Manage your security preferences and authentication settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input id="confirm-password" type="password" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="two-factor" />
                                <Label htmlFor="two-factor">
                                    Enable Two-Factor Authentication
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="session-timeout" />
                                <Label htmlFor="session-timeout">Enable Session Timeout</Label>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Update Security Settings</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
