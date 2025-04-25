"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface CreateStockFormProps {
    trigger: React.ReactNode;
    onStockCreated?: () => void;
}

export function CreateStockForm({ trigger, onStockCreated }: CreateStockFormProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [insurers, setInsurers] = useState<{ id: string; name: string }[]>([]);
    const [stickerTypes, setStickerTypes] = useState<{ id: string; name: string }[]>([]);

    // Fetch insurers and sticker types on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [insurersRes, typesRes] = await Promise.all([
                    fetch("/api/insurers"),
                    fetch("/api/sticker-types")
                ]);

                if (!insurersRes.ok) throw new Error("Failed to fetch insurers");
                if (!typesRes.ok) throw new Error("Failed to fetch sticker types");

                const [insurersData, typesData] = await Promise.all([
                    insurersRes.json(),
                    typesRes.json()
                ]);

                setInsurers(insurersData);
                setStickerTypes(typesData);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load form data",
                    variant: "destructive",
                });
            }
        };
        fetchData();
    }, [toast]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            serialNumber: formData.get("serialNumber"),
            receivedAt: formData.get("receivedAt"),
            insurerId: formData.get("insurerId"),
            stickerTypeId: formData.get("stickerTypeId"),
        };

        try {
            const response = await fetch("/api/stickers/stock", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to create stock");

            toast({
                title: "Success",
                description: "Stock created successfully",
            });
            setOpen(false);
            onStockCreated?.();
        } catch (error) {
            console.error("Error creating stock:", error);
            toast({
                title: "Error",
                description: "Failed to create stock",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Stock</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="serialNumber">Sticker Number</Label>
                        <Input
                            id="serialNumber"
                            name="serialNumber"
                            placeholder="Enter sticker number"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stickerTypeId">Sticker Type</Label>
                        <Select name="stickerTypeId" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select sticker type" />
                            </SelectTrigger>
                            <SelectContent>
                                {stickerTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="receivedAt">Received Date</Label>
                        <Input
                            id="receivedAt"
                            name="receivedAt"
                            type="date"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="insurerId">Insurer</Label>
                        <Select name="insurerId" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select insurer" />
                            </SelectTrigger>
                            <SelectContent>
                                {insurers.map((insurer) => (
                                    <SelectItem key={insurer.id} value={insurer.id}>
                                        {insurer.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create Stock'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
} 