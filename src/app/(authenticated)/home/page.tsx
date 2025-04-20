"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Car, BarChart } from "lucide-react";

export default function HomePage() {
    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none bg-card/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">Total Policies</CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">245</div>
                        <p className="text-xs text-blue-500/75">+12% from last month</p>
                    </CardContent>
                </Card>

                <Card className="border-none bg-card/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">Active Vehicles</CardTitle>
                        <Car className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">189</div>
                        <p className="text-xs text-green-500/75">+8% from last month</p>
                    </CardContent>
                </Card>

                <Card className="border-none bg-card/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-500">312</div>
                        <p className="text-xs text-purple-500/75">+15% from last month</p>
                    </CardContent>
                </Card>

                <Card className="border-none bg-card/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">Revenue</CardTitle>
                        <BarChart className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">$12,450</div>
                        <p className="text-xs text-orange-500/75">+20% from last month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Quick Actions */}
                <Card className="border-none bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                        <p className="text-sm text-muted-foreground">Common tasks and operations</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="secondary" className="h-24 flex-col space-y-2">
                                <FileText className="h-6 w-6 text-blue-500" />
                                <span>New Policy</span>
                            </Button>
                            <Button variant="secondary" className="h-24 flex-col space-y-2">
                                <Car className="h-6 w-6 text-green-500" />
                                <span>Add Vehicle</span>
                            </Button>
                            <Button variant="secondary" className="h-24 flex-col space-y-2">
                                <Users className="h-6 w-6 text-purple-500" />
                                <span>New Customer</span>
                            </Button>
                            <Button variant="secondary" className="h-24 flex-col space-y-2">
                                <BarChart className="h-6 w-6 text-orange-500" />
                                <span>Reports</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-none bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                        <p className="text-sm text-muted-foreground">Latest updates and changes</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="rounded-full bg-blue-500/10 p-2">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">New policy created</p>
                                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="rounded-full bg-green-500/10 p-2">
                                    <Car className="h-4 w-4 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Vehicle information updated</p>
                                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="rounded-full bg-purple-500/10 p-2">
                                    <Users className="h-4 w-4 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">New customer registered</p>
                                    <p className="text-xs text-muted-foreground">Yesterday</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="rounded-full bg-orange-500/10 p-2">
                                    <BarChart className="h-4 w-4 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Monthly report generated</p>
                                    <p className="text-xs text-muted-foreground">2 days ago</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 