import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Users | RoboDog",
    description: "Manage system users",
};

export default function UsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1">{children}</main>
        </div>
    );
} 