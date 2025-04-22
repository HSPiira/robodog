"use client"

import { useState } from "react"
import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"

export default function ComboboxExamplesPage() {
    const [selectedFruit, setSelectedFruit] = useState<string>()
    const [selectedCountry, setSelectedCountry] = useState<string>()
    const [selectedCategory, setSelectedCategory] = useState<string>()

    const fruits: ComboboxOption[] = [
        { value: "apple", label: "Apple" },
        { value: "banana", label: "Banana" },
        { value: "orange", label: "Orange" },
        { value: "grape", label: "Grape" },
        { value: "strawberry", label: "Strawberry" },
        { value: "pineapple", label: "Pineapple" },
        { value: "mango", label: "Mango" },
        { value: "kiwi", label: "Kiwi" },
    ]

    const countries: ComboboxOption[] = [
        { value: "us", label: "United States" },
        { value: "ca", label: "Canada" },
        { value: "mx", label: "Mexico" },
        { value: "br", label: "Brazil" },
        { value: "uk", label: "United Kingdom" },
        { value: "fr", label: "France" },
        { value: "de", label: "Germany" },
        { value: "jp", label: "Japan" },
        { value: "au", label: "Australia" },
        { value: "cn", label: "China" },
        { value: "in", label: "India" },
    ]

    const categories: ComboboxOption[] = [
        { value: "sedan", label: "Sedan" },
        { value: "suv", label: "SUV" },
        { value: "truck", label: "Truck" },
        { value: "coupe", label: "Coupe" },
        { value: "wagon", label: "Wagon" },
        { value: "van", label: "Van" },
        { value: "convertible", label: "Convertible" },
    ]

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-6">Combobox Examples</h1>

            <Tabs defaultValue="basic" className="mb-8">
                <TabsList>
                    <TabsTrigger value="basic">Basic Usage</TabsTrigger>
                    <TabsTrigger value="form">In Forms</TabsTrigger>
                    <TabsTrigger value="disabled">States</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Combobox</CardTitle>
                            <CardDescription>
                                A simple combobox implementation with searchable options.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="fruit">Select a Fruit</Label>
                                    <Combobox
                                        options={fruits}
                                        value={selectedFruit}
                                        onValueChange={setSelectedFruit}
                                        placeholder="Select a fruit..."
                                    />
                                    {selectedFruit && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Selected: {fruits.find(f => f.value === selectedFruit)?.label}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country">Select a Country</Label>
                                    <Combobox
                                        options={countries}
                                        value={selectedCountry}
                                        onValueChange={setSelectedCountry}
                                        placeholder="Select a country..."
                                    />
                                    {selectedCountry && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Selected: {countries.find(c => c.value === selectedCountry)?.label}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="form" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Combobox in Forms</CardTitle>
                            <CardDescription>
                                Using combobox components within forms for data selection.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Vehicle Category</Label>
                                    <Combobox
                                        options={categories}
                                        value={selectedCategory}
                                        onValueChange={setSelectedCategory}
                                        placeholder="Select a vehicle category..."
                                    />
                                </div>

                                <div className="pt-4">
                                    <p className="text-sm text-muted-foreground">
                                        The combobox can be easily integrated into form components and works with
                                        form libraries like React Hook Form.
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="disabled" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Disabled State</CardTitle>
                            <CardDescription>
                                Combobox in a disabled state to prevent interaction.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Disabled Combobox</Label>
                                    <Combobox
                                        options={fruits}
                                        value="apple"
                                        onValueChange={() => { }}
                                        placeholder="Select a fruit..."
                                        disabled={true}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        This combobox is disabled and cannot be interacted with.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Implementation Details</h2>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground mb-4">
                            The Combobox component is built using the following components:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Popover for the dropdown container</li>
                            <li>Command for search and item selection</li>
                            <li>Button for the trigger element</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                            Check the implementation in <code className="bg-muted px-1 py-0.5 rounded text-sm">src/components/ui/combobox.tsx</code>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 