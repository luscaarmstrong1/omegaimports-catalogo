import { CatalogClient } from "../catalog-client";
import { Footer, Header, PageIntro } from "../components";
import { activeProducts, getCategories } from "@/src/lib/catalog";

export default function MaisVendidosPage() {
  return (
    <>
      <Header />
      <main id="conteudo">
        <PageIntro eyebrow="Mais vendidos" title="Produtos de maior prioridade comercial">
          <p>
            Seleção baseada na prioridade comercial da importação. Não representa ranking público do
            Mercado Livre.
          </p>
        </PageIntro>
        <CatalogClient
          products={activeProducts.filter((product) => product.bestSeller)}
          categories={getCategories().map((category) => category.name)}
        />
      </main>
      <Footer />
    </>
  );
}
