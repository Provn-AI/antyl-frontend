import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Antyl — Turn Time into Opportunities",
  description: "AI-powered developer verification and smart job matching.",
  icons: {
    icon: "/Antyl.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>

 

  {children}

</AuthProvider>
      </body>
    </html>
  );
}