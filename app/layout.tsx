import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { jaJP } from "@clerk/localizations";
import Header from "@/components/ui/Header";
import ScrollRestoration from "@/components/ui/ScrollRestoration";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ployee.it.com"),
  title: "プロイー | AI面接練習で内定を掴む - 面接AI練習プラットフォーム",
  description:
    "AI面接官との実践的な面接練習で、自信を持って本番に挑めます。24時間いつでも面接練習が可能。面接AI、AI面接、面接練習、就活対策に最適なプラットフォーム。",
  keywords: [
    "面接AI",
    "AI面接",
    "面接練習",
    "就活対策",
    "面接対策",
    "AI面接官",
    "面接シミュレーション",
    "就職活動",
    "転職面接",
    "面接準備",
    "面接フィードバック",
    "オンライン面接練習",
    "AI就活支援",
    "面接スキル向上",
    "面接不安解消",
  ],
  authors: [{ name: "プロイー開発チーム" }],
  creator: "プロイー",
  publisher: "プロイー",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://ployee.it.com",
    title: "プロイー | AI面接練習で内定を掴む",
    description:
      "AI面接官との実践的な面接練習で、自信を持って本番に挑めます。24時間いつでも面接練習が可能。",
    siteName: "プロイー",
    images: [
      {
        url: "https://ployee.it.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "プロイー - AI面接練習プラットフォーム",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "プロイー | AI面接練習で内定を掴む",
    description:
      "AI面接官との実践的な面接練習で、自信を持って本番に挑めます。24時間いつでも面接練習が可能。",
    images: ["https://ployee.it.com/og-image.jpg"],
    creator: "@ployee_jp",
  },
  alternates: {
    canonical: "https://ployee.it.com",
    languages: {
      "ja-JP": "https://ployee.it.com",
      "x-default": "https://ployee.it.com",
    },
  },
  verification: {
    google: "XJ-vAmABbw4EGfp06PisjYYfdO8v6yxpo-BAIZv-OjM",
  },
  other: {
    "google-site-verification": "XJ-vAmABbw4EGfp06PisjYYfdO8v6yxpo-BAIZv-OjM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={jaJP}
      appearance={{
        variables: {
          colorPrimary: "#004526",
        },
        elements: {
          modalContent: {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            margin: "0",
            animation: "none",
            transition: "none",
          },
          modalBackdrop: {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "9999",
            animation: "none",
            transition: "none",
          },
        },
        signIn: {
          variables: {
            colorPrimary: "#004526",
          },
          elements: {
            modalContent: {
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              margin: "0",
              animation: "none",
              transition: "none",
            },
          },
        },
        signUp: {
          variables: {
            colorPrimary: "#004526",
          },
          elements: {
            modalContent: {
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              margin: "0",
              animation: "none",
              transition: "none",
            },
          },
        },
      }}
    >
      <html lang="ja" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin=""
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="antialiased">
          <ScrollRestoration />
          <Header />
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
