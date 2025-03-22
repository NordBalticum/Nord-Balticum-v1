// app/layout.js

import styles from "@/styles/globals.css";
import styles from "@/styles/theme.css";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { DefaultSeo } from "next-seo";
import SEO from "@/next-seo.config";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NordBalticum",
  description: "The Premium Web3 Wallet & Financial Ecosystem",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <DefaultSeo {...SEO} />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
