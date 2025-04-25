"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { FormControl } from "@/components/ui/form";
import { ControllerRenderProps } from "react-hook-form";

interface ComboboxSelectProps<T extends { id: string; name: string }> {
    field: ControllerRenderProps<any, string>;
    options: T[];
    placeholder: string;
    searchPlaceholder?: string;
    emptyText?: string;
    description?: string | ((item: T) => string);
    icon?: React.ReactNode;
    disabled?: boolean;
}

export function ComboboxSelect<T extends { id: string; name: string }>({
    field,
    options,
    placeholder,
    searchPlaceholder,
    emptyText = "No results found.",
    description,
    icon,
    disabled,
}: ComboboxSelectProps<T>) {
    const [open, setOpen] = React.useState(false);

    const selected = React.useMemo(
        () => options.find((item) => item.id === field.value),
        [options, field.value]
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                        )}
                        disabled={disabled}
                    >
                        <span className="flex items-center gap-2 truncate">
                            {icon}
                            {selected?.name || placeholder}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command className="w-full">
                    <CommandInput
                        placeholder={searchPlaceholder || `Search ${placeholder.toLowerCase()}...`}
                        className="h-9"
                    />
                    <div className="max-h-[200px] overflow-y-auto">
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {options.map((item) => (
                                <CommandItem
                                    key={item.id}
                                    value={item.name}
                                    onSelect={() => {
                                        field.onChange(item.id);
                                        setOpen(false);
                                    }}
                                    className="flex items-center gap-2 text-sm py-2"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4 flex-shrink-0",
                                            item.id === field.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="truncate">
                                        {item.name}
                                        {description && (
                                            <span className="text-muted-foreground">
                                                {" "}
                                                {typeof description === "function"
                                                    ? description(item)
                                                    : description}
                                            </span>
                                        )}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </div>
                </Command>
            </PopoverContent>
        </Popover>
    );
} 