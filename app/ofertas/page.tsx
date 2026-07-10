import { CatalogClient } from "../catalog-client";
import { Footer, Header, PageIntro } from "../components";
import { activeProducts, getCategories } from "@/src/lib/catalog";

export default function OfertasPage() {
  const products = activeProducts.filter((product) => product.featured || product.quantityInKit > 1);
  return (
    <>
      <Header />
      <main id="conteudo">
        <PageIntro eyebrow="Ofertas" title="Destaques e kits disponíveis">
          <p>
            Produtos destacados e ofertas em quantidade. Preço, frete e disponibilidade devem ser
            confirmados no anúncio correspondente no Mercado Livre.
          </p>
        </PageIntro>
        <CatalogClient products={products} categories={getCategories().map((category) => category.name)} />
      </main>
      <Footer />
    </>
  );
}
