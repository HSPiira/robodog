"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Copy,
  ExternalLink,
  Ticket,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  CircuitBoard,
  MoreHorizontal,
  CircleSlash,
  Tag,
  Sticker,
  X,
  Trash2,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StickerStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type StickerStockWithRelations = Prisma.StickerStockGetPayload<{
  include: {
    insurer: true;
    sticker: true;
    stickerType: true;
  };
}>;

interface StickerStockDetailProps {
  stock: StickerStockWithRelations;
  onClose?: () => void;
  onDelete: () => void;
}

export function StickerStockDetail({
  stock,
  onClose,
  onDelete,
}: StickerStockDetailProps) {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopySerial = async () => {
    try {
      await navigator.clipboard.writeText(stock.serialNumber);
      toast({
        title: "Copied",
        description: "Serial number copied to clipboard",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not access clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/stickers/stock/${stock.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete stock");
      }

      toast({
        title: "Success",
        description: "Stock deleted successfully",
      });
      onDelete();
    } catch (error) {
      console.error("Error deleting stock:", error);
      toast({
        title: "Error",
        description: "Failed to delete stock",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card className="h-full shadow-sm">
        <CardHeader className="border-b pb-2.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center mr-2">
                <Sticker className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <CardTitle className="text-base whitespace-nowrap">
                {stock.serialNumber}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {stock.stickerStatus === StickerStatus.AVAILABLE ? (
                <div className="flex items-center text-xs text-green-600">
                  <CheckCircle className="h-3.5 w-3.5 mr-1 stroke-2" />
                  Available
                </div>
              ) : (
                <div className="flex items-center text-xs text-amber-600">
                  <CircleSlash className="h-3.5 w-3.5 mr-1 stroke-2" />
                  Used
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs">Stock Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 text-xs cursor-pointer"
                    onClick={handleCopySerial}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy serial number
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 text-xs cursor-pointer"
                    onClick={() => window.open(`/stickers/${stock.id}`, "_blank")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View details
                  </DropdownMenuItem>
                  {stock.stickerStatus === StickerStatus.AVAILABLE && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="gap-2 text-xs text-destructive cursor-pointer"
                        onClick={() => setShowDeleteDialog(true)}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete stock
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3">
          <div className="space-y-4">
            {/* Main details */}
            <div className="pb-2.5 border-b">
              <div className="flex items-center mb-1.5">
                <Tag className="h-3.5 w-3.5 text-purple-500 mr-1.5 flex-shrink-0" />
                <h3 className="font-medium text-sm truncate">
                  {stock.stickerType.name}
                </h3>
              </div>
              <div className="flex items-center text-xs text-muted-foreground pl-5">
                <Calendar className="h-3 w-3 inline mr-1 text-orange-500 flex-shrink-0" />
                {format(stock.receivedAt, "dd MMM yyyy")}
                <span className="mx-1.5">•</span>
                <Building2 className="h-3 w-3 inline mr-1 text-emerald-500 flex-shrink-0" />
                <span className="truncate">{stock.insurer.name}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Stock</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this stock? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
