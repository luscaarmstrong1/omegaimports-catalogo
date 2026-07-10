import Link from "next/link";
import { activeProducts, formatPrice, getCategories } from "@/src/lib/catalog";
import { storeConfig } from "@/src/data/store";
import type { Product } from "@/src/types/product";

export function Header() {
  const categories = getCategories().slice(0, 8);
  return (
    <header className="site-header">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Página inicial OMEGAIMPORTS">
          <span className="brand-mark">Ω</span>
          <span>
            <strong>OMEGAIMPORTS</strong>
            <small>componentes e soluções técnicas</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <Link href="/produtos">Produtos</Link>
          <Link href="/categorias">Categorias</Link>
          <Link href="/ofertas">Ofertas</Link>
          <Link href="/conteudos">Conteúdos</Link>
          <Link href="/sobre">Sobre</Link>
          <Link href="/como-comprar">Como comprar</Link>
        </nav>
        <details className="mobile-menu">
          <summary aria-label="Abrir menu">Menu</summary>
          <nav aria-label="Menu mobile">
            <Link href="/produtos">Produtos</Link>
            <Link href="/categorias">Categorias</Link>
            <Link href="/ofertas">Ofertas</Link>
            <Link href="/conteudos">Conteúdos</Link>
            <Link href="/sobre">Sobre</Link>
            <Link href="/como-comprar">Como comprar</Link>
            {categories.map((category) => (
              <Link href={`/categorias/${category.slug}`} key={category.slug}>
                {category.name}
              </Link>
            ))}
          </nav>
        </details>
        <a className="ml-button" href={storeConfig.mercadoLivreStoreUrl} target="_blank" rel="noopener noreferrer sponsored">
          Ver loja no Mercado Livre
        </a>
      </div>
    </header>
  );
}

export function Footer() {
  const categories = getCategories().slice(0, 7);
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <strong>OMEGAIMPORTS</strong>
          <p>{storeConfig.signature}</p>
          <p className="fine-print">
            Este site apresenta o catálogo da OMEGAIMPORTS. Preços, disponibilidade, frete,
            pagamento e condições finais de compra devem ser confirmados no anúncio correspondente
            no Mercado Livre.
          </p>
        </div>
        <div>
          <h2>Categorias</h2>
          {categories.map((category) => (
            <Link href={`/categorias/${category.slug}`} key={category.slug}>
              {category.name}
            </Link>
          ))}
        </div>
        <div>
          <h2>Institucional</h2>
          <Link href="/produtos">Produtos</Link>
          <Link href="/sobre">Sobre</Link>
          <Link href="/como-comprar">Como comprar</Link>
          <Link href="/duvidas-frequentes">Dúvidas frequentes</Link>
          <Link href="/contato">Contato</Link>
          <Link href="/politica-de-privacidade">Política de privacidade</Link>
          <Link href="/termos-de-uso">Termos de uso</Link>
        </div>
        <div>
          <h2>Mercado Livre</h2>
          <a className="ml-button" href={storeConfig.mercadoLivreStoreUrl} target="_blank" rel="noopener noreferrer sponsored">
            Comprar pela loja
          </a>
        </div>
      </div>
    </footer>
  );
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={`Imagem de ${product.name}`} loading="lazy" />
        <span>{product.condition === "novo" ? "Novo" : "Usado"}</span>
      </div>
      <div className="product-body">
        <p className="eyebrow">{product.category}</p>
        <h2>{product.name}</h2>
        <p>{product.shortDescription}</p>
        <div className="product-meta">
          <span>{product.quantityInKit > 1 ? `Kit com ${product.quantityInKit}` : "Unidade"}</span>
          <span>{formatPrice(product)}</span>
        </div>
        <div className="card-actions">
          <Link href={`/produtos/${product.slug}`}>Ver detalhes</Link>
          <a
            className="buy-link"
            href={product.mercadoLivreUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            data-product-id={product.id}
            data-position={index + 1}
          >
            Ver oferta no Mercado Livre ↗
          </a>
        </div>
      </div>
    </article>
  );
}

export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="page-intro">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      <div>{children}</div>
    </section>
  );
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function TrustBand() {
  return (
    <section className="trust-band" aria-label="Informações de confiança">
      <div>
        <strong>Compra finalizada no Mercado Livre</strong>
        <span>Pagamento, frete e condições são conferidos no anúncio.</span>
      </div>
      <div>
        <strong>Pedidos separados e conferidos</strong>
        <span>Atenção ao modelo, quantidade e condição informados.</span>
      </div>
      <div>
        <strong>Informações técnicas organizadas</strong>
        <span>Catálogo preparado para comparação e atualização.</span>
      </div>
      <div>
        <strong>{activeProducts.length} produtos ativos</strong>
        <span>Dados importados da exportação de anúncios fornecida.</span>
      </div>
    </section>
  );
}
