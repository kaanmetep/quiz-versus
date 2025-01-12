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
};
export const viewport = {
  themeColor:
    "linear-gradient(to right, rgba(31, 41, 55, 0.7), rgba(23, 27, 36, 0.7))",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${inter.variable}`}>
      <body className="font-inter">{children}</body>
    </html>
  );
}
