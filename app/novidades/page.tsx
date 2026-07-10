import { CatalogClient } from "../catalog-client";
import { Footer, Header, PageIntro } from "../components";
import { activeProducts, getCategories } from "@/src/lib/catalog";

export default function NovidadesPage() {
  return (
    <>
      <Header />
      <main id="conteudo">
        <PageIntro eyebrow="Novidades" title="Produtos recentes no catálogo">
          <p>Itens marcados como novidades a partir da importação mais recente fornecida.</p>
        </PageIntro>
        <CatalogClient
          products={activeProducts.filter((product) => product.newArrival)}
          categories={getCategories().map((category) => category.name)}
        />
      </main>
      <Footer />
    </>
  );
}
