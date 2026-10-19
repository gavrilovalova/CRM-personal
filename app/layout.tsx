import type { Metadata } from "next";
import { Onest } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Личная CRM",
  description: "Люди, которых вы знаете лично, и контекст общения с ними",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${onest.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <Toaster position="top-center" theme="light" />
      </body>
    </html>
  );
}
