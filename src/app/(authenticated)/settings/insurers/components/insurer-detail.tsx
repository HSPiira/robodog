import { Building2, Mail, Phone, MapPin, X, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Insurer } from "@/types";

interface InsurerDetailProps {
    insurer: Insurer;
    onClose: () => void;
    onEdit: () => void;
    onDelete: (id: string) => void;
}

export function InsurerDetail({ insurer, onClose, onEdit, onDelete }: InsurerDetailProps) {
    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Insurer Details</CardTitle>
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={onEdit}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(insurer.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Name:</span>
                        </div>
                        <span>{insurer.name}</span>
                    </div>
                    {insurer.email && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Email:</span>
                            </div>
                            <span>{insurer.email}</span>
                        </div>
                    )}
                    {insurer.phone && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Phone:</span>
                            </div>
                            <span>{insurer.phone}</span>
                        </div>
                    )}
                    {insurer.address && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Address:</span>
                            </div>
                            <span>{insurer.address}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            {insurer.isActive ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="font-medium">Status:</span>
                        </div>
                        <Badge variant={insurer.isActive ? "default" : "destructive"}>
                            {insurer.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Created:</span>
                        <span>{format(new Date(insurer.createdAt), "PPP")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Last Updated:</span>
                        <span>{format(new Date(insurer.updatedAt), "PPP")}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 