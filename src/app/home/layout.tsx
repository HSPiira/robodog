import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reported Operations - Robodog",
    description: "View and manage reported operations",
};

export default function ReportedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
} 