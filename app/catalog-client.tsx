"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { openMercadoLivreProduct, trackEvent } from "@/src/lib/analytics";
import { formatPrice, searchProducts } from "@/src/lib/catalog";
import type { Product } from "@/src/types/product";

export function CatalogClient({
  products,
  categories,
  initialCategory = "",
}: {
  products: Product[];
  categories: string[];
  initialCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [condition, setCondition] = useState("");
  const [kit, setKit] = useState("");
  const [sort, setSort] = useState("relevancia");

  const filtered = useMemo(() => {
    const searched = searchProducts(products, query);
    return searched
      .filter((product) => !category || product.category === category)
      .filter((product) => !condition || product.condition === condition)
      .filter((product) => {
        if (!kit) return true;
        if (kit === "unidade") return product.quantityInKit === 1;
        return product.quantityInKit > 1;
      })
      .sort((a, b) => {
        if (sort === "az") return a.name.localeCompare(b.name, "pt-BR");
        if (sort === "za") return b.name.localeCompare(a.name, "pt-BR");
        if (sort === "kit") return b.quantityInKit - a.quantityInKit;
        if (sort === "destaques") return Number(b.featured) - Number(a.featured);
        return (a.priority ?? 99) - (b.priority ?? 99);
      });
  }, [products, query, category, condition, kit, sort]);

  const suggestions = query ? searchProducts(products, query).slice(0, 6) : [];

  return (
    <section className="catalog-shell" aria-label="Catálogo de produtos">
      <div className="filter-panel">
        <label>
          Busca
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              trackEvent("search", { query: event.target.value });
            }}
            placeholder="O que você precisa para o seu projeto?"
          />
        </label>
        {suggestions.length > 0 ? (
          <div className="suggestions" aria-label="Sugestões de busca">
            {suggestions.map((product) => (
              <Link href={`/produtos/${product.slug}`} key={product.id}>
                {product.shortName}
              </Link>
            ))}
            <span>Ver todos os resultados abaixo</span>
          </div>
        ) : null}
        <label>
          Categoria
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">Todas</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Condição
          <select value={condition} onChange={(event) => setCondition(event.target.value)}>
            <option value="">Todas</option>
            <option value="novo">Novo</option>
            <option value="usado">Usado</option>
          </select>
        </label>
        <label>
          Oferta
          <select value={kit} onChange={(event) => setKit(event.target.value)}>
            <option value="">Todas</option>
            <option value="unidade">Unidade</option>
            <option value="kit">Kits e quantidades</option>
          </select>
        </label>
        <label>
          Ordenar
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="relevancia">Mais relevantes</option>
            <option value="destaques">Destaques</option>
            <option value="az">Nome A-Z</option>
            <option value="za">Nome Z-A</option>
            <option value="kit">Maior quantidade por kit</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setCategory("");
            setCondition("");
            setKit("");
            setSort("relevancia");
          }}
        >
          Limpar filtros
        </button>
      </div>
      <div className="catalog-results">
        <div className="result-line">
          <strong>{filtered.length}</strong> resultado{filtered.length === 1 ? "" : "s"}
          <span>Valores e disponibilidade devem ser confirmados no Mercado Livre.</span>
        </div>
        {filtered.length ? (
          <div className="product-grid">
            {filtered.map((product, index) => (
              <article className="product-card" key={product.id}>
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
                    <button
                      type="button"
                      className="buy-link"
                      onClick={() =>
                        openMercadoLivreProduct(product, {
                          origin: "catalogo",
                          cta: "Ver oferta no Mercado Livre",
                          position: index + 1,
                        })
                      }
                    >
                      Ver oferta no Mercado Livre ↗
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>Nenhum produto encontrado</h2>
            <p>Revise a busca ou limpe os filtros para ver todo o catálogo.</p>
          </div>
        )}
      </div>
    </section>
  );
}
