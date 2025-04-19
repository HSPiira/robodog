import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings - Robodog",
  description: "Manage your application settings and preferences",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
