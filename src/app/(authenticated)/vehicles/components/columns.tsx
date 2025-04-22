"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Tag,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Define meta types for the table
type TableMeta = {
  fetchVehicles?: () => void;
};

interface Vehicle {
  id: string;
  registrationNo: string;
  make: string;
  model: string;
  year: number;
  chassisNumber: string;
  engineNumber: string;
  bodyType: {
    name: string;
  };
  vehicleCategory: {
    name: string;
  };
  vehicleType: {
    name: string;
  };
  client: {
    id: string;
    name: string;
  };
  isActive: boolean;
  policies: number;
}

export const columns: ColumnDef<Vehicle>[] = [
  {
    accessorKey: "registrationNo",
    header: "Reg. No.",
    cell: ({ row }) => {
      return (
        <div className="font-medium uppercase whitespace-nowrap">
          {row.getValue("registrationNo")}
        </div>
      );
    },
  },
  {
    accessorKey: "make",
    header: "Make/Model",
    cell: ({ row }: { row: Row<Vehicle> }) => {
      return (
        <div className="truncate whitespace-nowrap max-w-[150px]">
          <span className="font-medium">{row.getValue("make")}</span>
          <span className="text-muted-foreground"> {row.original.model}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "year",
    header: "Year",
    cell: ({ row }) => {
      return <div className="whitespace-nowrap">{row.getValue("year")}</div>;
    },
  },
  {
    accessorKey: "vehicleCategory.name",
    header: "Category",
    cell: ({ row }: { row: Row<Vehicle> }) => {
      return (
        <div className="truncate capitalize whitespace-nowrap max-w-[120px]">
          {row.original.vehicleCategory?.name?.toLowerCase() || "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "bodyType.name",
    header: "Body Type",
    cell: ({ row }: { row: Row<Vehicle> }) => {
      return (
        <div className="truncate capitalize whitespace-nowrap max-w-[120px]">
          {row.original.bodyType?.name?.toLowerCase() || "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "client.name",
    header: "Owner",
    cell: ({ row }: { row: Row<Vehicle> }) => {
      return (
        <div className="truncate whitespace-nowrap max-w-[140px]">
          {row.original.client?.name || "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }: { row: Row<Vehicle> }) => {
      const isActive = row.getValue("isActive") as boolean;

      return (
        <div className="flex justify-center">
          {isActive ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
        </div>
      );
    },
  },
];
