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
import type { Insurer, StickerStock, StickerIssuance, StickerType } from "@prisma/client";

interface StickerStockDetailProps {
  stock: {
    id: string;
    serialNumber: string;
    receivedAt: Date;
    stickerStatus: StickerStatus;
    stickerType: {
      id: string;
      name: string;
    };
    insurer: {
      id: string;
      name: string;
    };
  };
  onClose?: () => void;
}

export type StickerStockWithRelations = StickerStock & {
  insurer: Insurer;
  sticker?: StickerIssuance;
  stickerType: StickerType;
  stickerStatus: StickerStatus;
  serialNumber: string;
  receivedAt: Date;
  isIssued: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function StickerStockDetail({
  stock,
  onClose,
}: StickerStockDetailProps) {
  const { toast } = useToast();

  const handleCopySerial = () => {
    navigator.clipboard.writeText(stock.serialNumber);
    toast({
      title: "Copied",
      description: "Serial number copied to clipboard",
    });
  };

  return (
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
            {stock.stickerStatus === "AVAILABLE" ? (
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

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs rounded-full flex-1"
              onClick={handleCopySerial}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy Serial
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs rounded-full flex-1"
              onClick={() => window.open(`/stickers/${stock.id}`, "_blank")}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
