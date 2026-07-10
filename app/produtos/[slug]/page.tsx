import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer, Header, JsonLd, ProductCard } from "../../components";
import { activeProducts, formatPrice, getProductBySlug, getRelatedProducts } from "@/src/lib/catalog";

export function generateStaticParams() {
  return activeProducts.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return { title: "Produto não encontrado" };
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/produtos/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [product.image],
      type: "website",
    },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();
  const related = getRelatedProducts(product);

  return (
    <>
      <Header />
      <main id="conteudo">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.shortDescription,
            image: product.gallery,
            sku: product.mlbId,
            category: product.category,
            url: `/produtos/${product.slug}`,
            offers: {
              "@type": "Offer",
              url: product.mercadoLivreUrl,
              priceCurrency: product.currency,
              price: product.price,
              availability: "https://schema.org/InStock",
            },
          }}
        />
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Início</Link>
          <Link href="/produtos">Produtos</Link>
          <span>{product.shortName}</span>
        </nav>
        <section className="product-detail">
          <div className="gallery">
            {product.gallery.map((image) => (
              <img src={image} alt={`Imagem de ${product.name}`} key={image} />
            ))}
          </div>
          <div className="detail-copy">
            <p className="eyebrow">{product.category}</p>
            <h1>{product.name}</h1>
            <dl className="quick-specs">
              <div>
                <dt>Código MLB</dt>
                <dd>{product.mlbId}</dd>
              </div>
              <div>
                <dt>Condição</dt>
                <dd>{product.condition === "novo" ? "Novo" : "Usado"}</dd>
              </div>
              <div>
                <dt>Quantidade</dt>
                <dd>{product.quantityInKit > 1 ? `Kit com ${product.quantityInKit}` : "Unidade"}</dd>
              </div>
              <div>
                <dt>Valor</dt>
                <dd>{formatPrice(product)}</dd>
              </div>
            </dl>
            <p className="redirect-note">
              A compra, o pagamento e as condições de entrega serão consultados e finalizados no
              Mercado Livre.
            </p>
            <a className="primary-buy" href={product.mercadoLivreUrl} target="_blank" rel="noopener noreferrer sponsored">
              Ver oferta no Mercado Livre ↗
            </a>
          </div>
        </section>
        <section className="detail-sections">
          <article>
            <h2>Descrição</h2>
            <p>{product.fullDescription}</p>
          </article>
          <article>
            <h2>Destaques</h2>
            <ul>{product.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          <article>
            <h2>Aplicações</h2>
            <ul>{product.applications.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          {product.specifications.length ? (
            <article>
              <h2>Especificações técnicas</h2>
              <dl className="spec-table">
                {product.specifications.map((item) => (
                  <div key={`${item.label}-${item.value}`}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ) : null}
          {product.packageContents.length ? (
            <article>
              <h2>Conteúdo da embalagem</h2>
              <ul>{product.packageContents.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          ) : null}
          {product.warnings?.length ? (
            <article>
              <h2>Observações importantes</h2>
              <ul>{product.warnings.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          ) : null}
        </section>
        <section className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Relacionados</p>
            <h2>Produtos próximos por categoria ou aplicação</h2>
          </div>
          <div className="product-grid">
            {related.map((item, index) => (
              <ProductCard product={item} index={index} key={item.id} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
