import { Building2, Mail, Phone, MapPin, X, Edit2, Trash2, CheckCircle, XCircle, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Insurer, User as PrismaUser } from "@prisma/client";

type InsurerWithUsers = Insurer & {
    createdByUser: PrismaUser | null;
    updatedByUser: PrismaUser | null;
};

interface InsurerDetailProps {
    insurer: InsurerWithUsers;
    onClose: () => void;
    onEdit: () => void;
    onDelete: (id: string) => void;
}

// Add safe date formatting function
const safeFormatDate = (date: Date | string | null | undefined) => {
    if (!date) return "—";
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return "—";
        return format(dateObj, "PPP");
    } catch (error) {
        return "—";
    }
};

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
                    <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-1">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium">Name:</span>
                            <span className="text-sm">{insurer.name}</span>
                        </div>
                    </div>
                    {insurer.email && (
                        <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 mt-1">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium">Email:</span>
                                <span className="text-sm break-words">{insurer.email}</span>
                            </div>
                        </div>
                    )}
                    {insurer.phone && (
                        <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 mt-1">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium">Phone:</span>
                                <span className="text-sm">{insurer.phone}</span>
                            </div>
                        </div>
                    )}
                    {insurer.address && (
                        <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 mt-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium">Address:</span>
                                <span className="text-sm break-words">{insurer.address}</span>
                            </div>
                        </div>
                    )}
                    <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-1">
                            {insurer.isActive ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium">Status:</span>
                            <Badge variant={insurer.isActive ? "default" : "destructive"}>
                                {insurer.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                    </div>
                    {insurer.createdByUser && (
                        <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 mt-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium">Created By:</span>
                                <span className="text-sm">{insurer.createdByUser.name || insurer.createdByUser.email}</span>
                            </div>
                        </div>
                    )}
                    {insurer.updatedByUser && (
                        <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 mt-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium">Updated By:</span>
                                <span className="text-sm">{insurer.updatedByUser.name || insurer.updatedByUser.email}</span>
                            </div>
                        </div>
                    )}
                    <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium">Created:</span>
                            <span className="text-sm">{safeFormatDate(insurer.createdAt)}</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium">Updated:</span>
                            <span className="text-sm">{safeFormatDate(insurer.updatedAt)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 