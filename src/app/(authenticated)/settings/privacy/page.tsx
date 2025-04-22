'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function PrivacySecurityPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Privacy & Security</CardTitle>
                    </div>
                    <CardDescription>Configure your privacy and security settings</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Shield className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">Coming Soon</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-md">
                            Privacy and security features are currently under development. This section will allow you to manage your privacy settings, security preferences, and data protection options.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 