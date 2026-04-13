import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArgusOmni - Test Orchestrator",
  description: "Universal YAML-Based Test Orchestration Framework",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
