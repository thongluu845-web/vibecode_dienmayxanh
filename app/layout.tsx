import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dienmayluuthao.vn"),
  icons: {
    icon: "/favicon.svg",
  },
  title: {
    default: "Điện Máy Lưu Thảo - Điện lạnh Long Xuyên",
    template: "%s | Điện Máy Lưu Thảo",
  },
  description:
    "Điện Máy Lưu Thảo tại 24 Ung Văn Khiêm, Đông Xuyên, TP. Long Xuyên, An Giang. Hotline 070.6767.921. Mua bán, lắp đặt, bảo trì, sửa chữa và vệ sinh điện lạnh.",
  keywords: [
    "Điện Máy Lưu Thảo",
    "điện lạnh Long Xuyên",
    "máy lạnh Long Xuyên",
    "máy giặt Long Xuyên",
    "tủ lạnh Long Xuyên",
    "máy nước nóng Long Xuyên",
    "thu máy cũ",
    "đổi máy bù tiền",
  ],
  authors: [{ name: "Điện Máy Lưu Thảo" }],
  creator: "Điện Máy Lưu Thảo",
  publisher: "Điện Máy Lưu Thảo",
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
    url: "https://dienmayluuthao.vn",
    siteName: "Điện Máy Lưu Thảo",
    title: "Điện Máy Lưu Thảo - Điện lạnh Long Xuyên",
    description:
      "Mua bán, lắp đặt, bảo trì, sửa chữa, vệ sinh máy lạnh, tủ lạnh, máy giặt, máy nước nóng. Hotline 070.6767.921.",
    images: [
      {
        url: "/assets/dien-lanh/hero-dien-lanh.png",
        width: 1200,
        height: 630,
        alt: "Điện Máy Lưu Thảo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Điện Máy Lưu Thảo - Điện lạnh Long Xuyên",
    description: "Hotline 070.6767.921. Có thu máy cũ hoặc đổi máy bù tiền.",
    images: ["/assets/dien-lanh/hero-dien-lanh.png"],
  },
  alternates: {
    canonical: "https://dienmayluuthao.vn",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0284c7",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <html lang="vi" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {isAdminRoute ? (
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
        ) : (
          <>
            <Header />
            <main id="main-content" className="min-h-screen">
              {children}
            </main>
            <Footer />
          </>
        )}
      </body>
    </html>
  );
}
