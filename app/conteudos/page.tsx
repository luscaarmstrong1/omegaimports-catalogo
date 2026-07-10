import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header, PageIntro } from "../components";
import { articleCards } from "@/src/data/store";

export const metadata: Metadata = {
  title: "Conteúdos técnicos",
  description: "Guias rápidos e prudentes para escolher componentes eletrônicos e de automação.",
};

export default function ConteudosPage() {
  return (
    <>
      <Header />
      <main id="conteudo">
        <PageIntro eyebrow="Conteúdos" title="Guias técnicos para projetos">
          <p>
            Textos objetivos para orientar escolhas de componentes. Em instalações elétricas,
            consulte sempre um profissional qualificado.
          </p>
        </PageIntro>
        <div className="article-grid page-grid">
          {articleCards.map((article) => (
            <Link href={`/conteudos/${article.slug}`} key={article.slug}>
              <h2>{article.title}</h2>
              <p>{article.summary}</p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
