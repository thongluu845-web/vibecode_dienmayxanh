import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dienmayxanh.com"),
  title: {
    default: "Điện Máy Xanh - Mua sắm điện máy chính hãng, giá tốt nhất",
    template: "%s | Điện Máy Xanh",
  },
  description:
    "Điện Máy Xanh - Hệ thống siêu thị điện máy hàng đầu Việt Nam. Mua điện thoại, laptop, tivi, tủ lạnh, máy giặt chính hãng với giá rẻ nhất, giao hàng nhanh, lắp đặt tận nơi.",
  keywords: [
    "điện máy xanh",
    "mua điện thoại",
    "laptop giá rẻ",
    "tivi 4k",
    "tủ lạnh",
    "máy giặt",
    "điều hòa",
    "điện máy chính hãng",
    "mua sắm trực tuyến",
    "siêu thị điện máy",
  ],
  authors: [{ name: "Điện Máy Xanh" }],
  creator: "Điện Máy Xanh",
  publisher: "Công ty CP Thế Giới Di Động",
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
    locale: "vi_VN",
    url: "https://dienmayxanh.com",
    siteName: "Điện Máy Xanh",
    title: "Điện Máy Xanh - Mua sắm điện máy chính hãng, giá tốt nhất",
    description:
      "Hệ thống siêu thị điện máy hàng đầu Việt Nam. Điện thoại, laptop, tivi, tủ lạnh, máy giặt chính hãng, giá rẻ nhất.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Điện Máy Xanh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Điện Máy Xanh - Mua sắm điện máy chính hãng",
    description: "Hệ thống siêu thị điện máy hàng đầu Việt Nam",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://dienmayxanh.com",
  },
  verification: {
    google: "google-site-verification-token",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0066CC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <Header />
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
