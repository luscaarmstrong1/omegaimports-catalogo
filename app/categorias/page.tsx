import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header, PageIntro } from "../components";
import { getCategories } from "@/src/lib/catalog";

export const metadata: Metadata = {
  title: "Categorias",
  description: "Categorias do catálogo OMEGAIMPORTS para eletrônica, automação e energia.",
};

export default function CategoriasPage() {
  return (
    <>
      <Header />
      <main id="conteudo">
        <PageIntro eyebrow="Categorias" title="Navegue por família de produto">
          <p>Cada categoria reúne produtos ativos, textos introdutórios e acesso rápido às ofertas.</p>
        </PageIntro>
        <div className="category-grid page-grid">
          {getCategories().map((category) => (
            <Link href={`/categorias/${category.slug}`} className="category-card" key={category.slug}>
              <span>{category.count}</span>
              <h2>{category.name}</h2>
              <p>{category.description}</p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
