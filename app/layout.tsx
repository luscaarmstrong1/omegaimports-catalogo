import type { Metadata } from "next";
import "./globals.css";
import { storeConfig } from "@/src/data/store";

export const metadata: Metadata = {
  metadataBase: new URL(storeConfig.siteUrl),
  title: {
    default: "OMEGAIMPORTS | Catálogo de componentes técnicos",
    template: "%s | OMEGAIMPORTS",
  },
  description:
    "Vitrine comercial da OMEGAIMPORTS para eletrônica, automação, energia e projetos tecnológicos. Compra finalizada no Mercado Livre.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "OMEGAIMPORTS",
    description: "A peça certa para o seu projeto avançar.",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "OMEGAIMPORTS",
    description: "Catálogo técnico com compra finalizada no Mercado Livre.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
