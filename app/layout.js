import styles from "@/styles/globals.css";
import styles from "@/styles/theme.css";
import { Inter } from "next/font/google";
import { SupabaseProvider } from "@/context/SupabaseContext";
import { MagicLinkProvider } from "@/context/MagicLinkContext";
import { AuthProvider } from "@/context/AuthContext";
import { EthersProvider } from "@/context/EthersContext";
import { EthersTokenProvider } from "@/context/EthersTokenContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NordBalticum",
  description: "The Premium Web3 Wallet & Financial Ecosystem",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <SupabaseProvider>
          <MagicLinkProvider>
            <AuthProvider>
              <EthersProvider>
                <EthersTokenProvider>
                  {children}
                </EthersTokenProvider>
              </EthersProvider>
            </AuthProvider>
          </MagicLinkProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
