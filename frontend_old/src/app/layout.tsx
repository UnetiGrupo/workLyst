import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Layout from "@/components/layout/RouterLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Worklyst",
  description: "Gestor de proyectos para equipos",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        <Layout>
          <ProtectedRoute>{children}</ProtectedRoute>
        </Layout>
      </body>
    </html>
  );
}
