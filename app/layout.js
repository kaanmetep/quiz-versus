import { Orbitron, Inter } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-orbitron",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Quiz Versus",
  description: "Real-time quiz battle with friends!",
  appleWebApp: {
    statusBarStyle: "black-translucent",
  },
  viewport: {
    themeColor: "#1F2937",
  },
};
export const viewport = {
  themeColor: "#1F2937",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${inter.variable}`}>
      <body className="font-inter">{children}</body>
    </html>
  );
}
