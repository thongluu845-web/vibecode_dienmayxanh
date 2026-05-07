import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/gio-hang", "/tai-khoan", "/api/", "/_next/"],
      },
    ],
    sitemap: "https://dienmayxanh.com/sitemap.xml",
    host: "https://dienmayxanh.com",
  };
}
