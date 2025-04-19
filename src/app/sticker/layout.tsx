import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sticker - Robodog",
  description: "View sticker activity and logs",
};

export default function StickerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
