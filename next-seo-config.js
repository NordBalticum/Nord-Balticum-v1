// next-seo.config.js

const SEO = {
  title: "NordBalticum – Web3 BSC Wallet",
  titleTemplate: "%s | NordBalticum",
  defaultTitle: "NordBalticum – The Future of Web3 Banking",
  description: "Secure and modern BNB & Token wallet. Web3 ready. Built for Binance Smart Chain with premium UX and blazing fast performance.",
  canonical: "https://nordbalticum.com",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nordbalticum.com",
    site_name: "NordBalticum",
    title: "NordBalticum – The Future of Web3 Banking",
    description: "Send, receive, and manage your BNB and tokens with style. Built on Binance Smart Chain. Next-level UI/UX with security.",
    images: [
      {
        url: "https://nordbalticum.com/logo.png",
        width: 1200,
        height: 630,
        alt: "NordBalticum Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    handle: "@nordbalticum",
    site: "@nordbalticum",
    cardType: "summary_large_image",
  },
  additionalMetaTags: [
    {
      name: "application-name",
      content: "NordBalticum",
    },
    {
      name: "theme-color",
      content: "#0A1F44",
    },
    {
      name: "keywords",
      content: "Web3 Wallet, Binance Smart Chain, BNB, Tokens, Decentralized Banking, NordBalticum",
    },
  ],
};

export default SEO;
