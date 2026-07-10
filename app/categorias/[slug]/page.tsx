import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogClient } from "../../catalog-client";
import { Footer, Header, PageIntro } from "../../components";
import { activeProducts, getCategories, getCategoryBySlug } from "@/src/lib/catalog";

export function generateStaticParams() {
  return getCategories().map((category) => ({ slug: category.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const category = getCategoryBySlug(params.slug);
  return {
    title: category?.name ?? "Categoria",
    description: category?.description,
  };
}

export default function CategoriaPage({ params }: { params: { slug: string } }) {
  const category = getCategoryBySlug(params.slug);
  if (!category) notFound();
  const categories = getCategories();
  return (
    <>
      <Header />
      <main id="conteudo">
        <PageIntro eyebrow="Categoria" title={category.name}>
          <p>{category.description}</p>
        </PageIntro>
        <CatalogClient
          products={activeProducts}
          categories={categories.map((item) => item.name)}
          initialCategory={category.name}
        />
      </main>
      <Footer />
    </>
  );
}
