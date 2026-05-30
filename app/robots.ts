import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/gio-hang", "/tai-khoan", "/api/", "/auth/"],
      },
    ],
    sitemap: "https://dienmayluuthao.vn/sitemap.xml",
    host: "https://dienmayluuthao.vn",
  };
}
