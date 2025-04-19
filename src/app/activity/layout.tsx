import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Activity - Robodog",
    description: "View system activity and logs",
};

export default function ActivityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
} 