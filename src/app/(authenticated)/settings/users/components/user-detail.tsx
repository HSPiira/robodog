import { User2, Mail, Shield, X, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface UserDetailProps {
    user: User;
    onClose: () => void;
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
}

export function UserDetail({ user, onClose, onEdit, onDelete }: UserDetailProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <User2 className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-base font-semibold">{user.name}</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-4 text-xs">
                    <div>
                        <h4 className="font-semibold text-muted-foreground">Contact Information</h4>
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-blue-500" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="h-3.5 w-3.5 text-blue-500" />
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'text-xs h-5 rounded-full',
                                        user.role === 'ADMIN' && 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
                                        user.role === 'MANAGER' && 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                                    )}
                                >
                                    {user.role}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-muted-foreground">Status</h4>
                        <div className="mt-2 flex items-center gap-2">
                            {user.isActive ? (
                                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                                <XCircle className="h-3.5 w-3.5 text-red-500" />
                            )}
                            <span>
                                {user.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-muted-foreground">ID</h4>
                        <p className="font-mono text-[10px] bg-blue-50/70 dark:bg-blue-950/20 p-1 rounded mt-1">{user.id}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-muted-foreground">Created</h4>
                            <p className="mt-1">{format(new Date(user.createdAt), "MMM d, yyyy")}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-muted-foreground">Last Updated</h4>
                            <p className="mt-1">{format(new Date(user.updatedAt), "MMM d, yyyy")}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs rounded-full"
                            onClick={() => onEdit(user)}
                        >
                            <Edit2 className="h-3 w-3 mr-1 text-blue-500" /> Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs rounded-full"
                            onClick={() => onDelete(user.id)}
                        >
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 