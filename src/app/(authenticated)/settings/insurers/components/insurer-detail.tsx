import { Building2, Mail, Phone, X, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Insurer {
    id: string;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface InsurerDetailProps {
    insurer: Insurer;
    onClose: () => void;
    onEdit: () => void;
    onDelete: (id: string) => void;
}

export function InsurerDetail({ insurer, onClose, onEdit, onDelete }: InsurerDetailProps) {
    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        <span className="break-all">{insurer.name}</span>
                    </CardTitle>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 rounded-full hover:bg-muted"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <Badge variant="outline" className="mt-1 text-[10px] py-0 px-2 h-4 w-fit text-blue-500 dark:text-blue-400">
                    Insurance Provider
                </Badge>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-4 text-xs">
                    <div>
                        <h4 className="font-semibold text-blue-500 dark:text-blue-400">Contact Information</h4>
                        <div className="mt-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                                <span className="truncate">{insurer.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                                <span>{insurer.phone}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-blue-500 dark:text-blue-400">ID</h4>
                        <p className="font-mono text-[10px] bg-muted p-1 rounded mt-1">{insurer.id}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-blue-500 dark:text-blue-400">Created</h4>
                            <p className="mt-1">{new Date(insurer.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-blue-500 dark:text-blue-400">Last Updated</h4>
                            <p className="mt-1">{new Date(insurer.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-blue-500 dark:text-blue-400">Status</h4>
                        <Badge
                            variant={insurer.isActive ? "default" : "secondary"}
                            className="mt-1 text-[0.7rem] flex items-center gap-1.5"
                        >
                            {insurer.isActive ? (
                                <CheckCircle className="h-3 w-3" />
                            ) : (
                                <XCircle className="h-3 w-3" />
                            )}
                            {insurer.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <div className="flex gap-2 pt-2 border-t">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs rounded-full hover:bg-muted"
                            onClick={onEdit}
                        >
                            <Edit2 className="h-3 w-3 mr-1 text-blue-500 dark:text-blue-400" />
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs rounded-full"
                            onClick={() => onDelete(insurer.id)}
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 