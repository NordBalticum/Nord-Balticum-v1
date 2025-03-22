import "@/styles/globals.css";
import "@/styles/theme.css";
import { Inter } from "next/font/google";
import { DefaultSeo } from "next-seo";
import SEO from "@/next-seo.config";
import { Providers } from "@/app/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NordBalticum",
  description: "The premium Web3 wallet & financial ecosystem.",
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
