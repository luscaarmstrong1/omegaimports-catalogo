import type { Metadata } from "next";
import { Header, Footer, PageIntro } from "../components";
import { CatalogClient } from "../catalog-client";
import { activeProducts, getCategories } from "@/src/lib/catalog";

export const metadata: Metadata = {
  title: "Produtos",
  description:
    "Catálogo completo de produtos ativos OMEGAIMPORTS com busca, filtros e links para compra no Mercado Livre.",
};

export default function ProdutosPage() {
  const categories = getCategories();
  return (
    <>
      <Header />
      <main id="conteudo">
        <PageIntro eyebrow="Catálogo" title="Produtos OMEGAIMPORTS">
          <p>
            Busque por nome, marca, modelo, categoria, aplicação, tecnologia, código MLB ou
            especificação. Os botões de compra levam ao Mercado Livre.
          </p>
        </PageIntro>
        <CatalogClient products={activeProducts} categories={categories.map((category) => category.name)} />
      </main>
      <Footer />
    </>
  );
}
