import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reported Operations - Robodog",
    description: "View and manage reported operations",
};

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
} 