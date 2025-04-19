"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Car, BarChart } from "lucide-react";

export default function HomePage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">Total Policies</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">245</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">Active Vehicles</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">189</div>
                        <p className="text-xs text-muted-foreground">+8% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">312</div>
                        <p className="text-xs text-muted-foreground">+15% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">Revenue</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$12,450</div>
                        <p className="text-xs text-muted-foreground">+20% from last month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                        <p className="text-sm text-muted-foreground">Common tasks and operations</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="h-24 flex-col space-y-2">
                                <FileText className="h-6 w-6" />
                                <span>New Policy</span>
                            </Button>
                            <Button variant="outline" className="h-24 flex-col space-y-2">
                                <Car className="h-6 w-6" />
                                <span>Add Vehicle</span>
                            </Button>
                            <Button variant="outline" className="h-24 flex-col space-y-2">
                                <Users className="h-6 w-6" />
                                <span>New Customer</span>
                            </Button>
                            <Button variant="outline" className="h-24 flex-col space-y-2">
                                <BarChart className="h-6 w-6" />
                                <span>Reports</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                        <p className="text-sm text-muted-foreground">Latest updates and changes</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="rounded-full bg-primary/10 p-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">New policy created</p>
                                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="rounded-full bg-primary/10 p-2">
                                    <Car className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Vehicle information updated</p>
                                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="rounded-full bg-primary/10 p-2">
                                    <Users className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">New customer registered</p>
                                    <p className="text-xs text-muted-foreground">Yesterday</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="rounded-full bg-primary/10 p-2">
                                    <BarChart className="h-4 w-4 text-primary" />
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