import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, JsonLd, ProductCard, TrustBand } from "./components";
import { articleCards, storeConfig } from "@/src/data/store";
import { activeProducts, getCategories } from "@/src/lib/catalog";

export const metadata: Metadata = {
  title: "OMEGAIMPORTS | Componentes para eletrônica, automação e energia",
  description:
    "Catálogo OMEGAIMPORTS com módulos, sensores, fontes, conectores, instrumentos e compra finalizada no Mercado Livre.",
};

export default function Home() {
  const categories = getCategories();
  const featured = activeProducts.filter((product) => product.featured).slice(0, 12);

  return (
    <>
      <Header />
      <main id="conteudo">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: storeConfig.name,
            url: storeConfig.siteUrl,
            sameAs: [storeConfig.mercadoLivreStoreUrl],
          }}
        />
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Catálogo independente OMEGAIMPORTS</p>
            <h1>A peça certa para o seu projeto avançar.</h1>
            <p>
              Componentes para eletrônica, automação, energia e desenvolvimento de projetos,
              com compra segura pelo Mercado Livre.
            </p>
            <div className="hero-actions">
              <Link href="/produtos">Explorar produtos</Link>
              <a href={storeConfig.mercadoLivreStoreUrl} target="_blank" rel="noopener noreferrer sponsored">
                Ver loja no Mercado Livre ↗
              </a>
            </div>
          </div>
          <div className="hero-panel" aria-label="Produtos reais da OMEGAIMPORTS">
            {featured.slice(0, 4).map((product) => (
              <div key={product.id}>
                <img src={product.image} alt="" />
                <span>{product.shortName}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="search-strip">
          <form action="/produtos">
            <label htmlFor="home-search">O que você precisa para o seu projeto?</label>
            <input
              id="home-search"
              name="q"
              placeholder="ESP32, SIM800L, GPS, SCT-013, fonte 5 V, Split Bolt..."
            />
            <button type="submit">Buscar</button>
          </form>
        </section>
        <section className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Categorias principais</p>
            <h2>Catálogo organizado por aplicação e família técnica</h2>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link href={`/categorias/${category.slug}`} className="category-card" key={category.slug}>
                <span>{category.count}</span>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Produtos em destaque</p>
            <h2>Ofertas selecionadas com diversidade de categorias</h2>
          </div>
          <div className="product-grid">
            {featured.map((product, index) => (
              <ProductCard product={product} index={index} key={product.id} />
            ))}
          </div>
        </section>
        <TrustBand />
        <section className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Soluções por aplicação</p>
            <h2>Encontre produtos pelo tipo de projeto</h2>
          </div>
          <div className="application-grid">
            {[
              "Projetos com ESP32 e Arduino",
              "Telemetria e comunicação GSM",
              "Rastreamento e localização",
              "Medição de corrente e energia",
              "Comando e automação",
              "Alimentação de circuitos",
              "Prototipagem eletrônica",
              "Manutenção e bancada",
            ].map((item) => (
              <Link href={`/produtos?q=${encodeURIComponent(item)}`} key={item}>
                {item}
              </Link>
            ))}
          </div>
        </section>
        <section className="section-block split-info">
          <div>
            <p className="eyebrow">Kits e compras em quantidade</p>
            <h2>Unidade, kits e lotes aparecem como ofertas distintas</h2>
            <p>
              Quando houver unidade, kit com 3, 5, 10, 20 ou lotes maiores, cada opção é
              apresentada de forma separada para facilitar a comparação. Quantidade, preço,
              frete e disponibilidade podem variar conforme o anúncio ativo.
            </p>
          </div>
          <div>
            <p className="eyebrow">Redirecionamento claro</p>
            <h2>Sem carrinho ou checkout próprio</h2>
            <p>
              O site funciona como vitrine e organização técnica do catálogo. A compra, o
              pagamento e as condições de envio são consultados e finalizados no Mercado Livre.
            </p>
          </div>
        </section>
        <section className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Conteúdo técnico</p>
            <h2>Guias rápidos para escolher melhor</h2>
          </div>
          <div className="article-grid">
            {articleCards.map((article) => (
              <Link href={`/conteudos/${article.slug}`} key={article.slug}>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="final-cta">
          <h2>Encontre o componente que falta no seu projeto.</h2>
          <Link href="/produtos">Ver todos os produtos</Link>
          <a href={storeConfig.mercadoLivreStoreUrl} target="_blank" rel="noopener noreferrer sponsored">
            Comprar pela loja no Mercado Livre ↗
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
