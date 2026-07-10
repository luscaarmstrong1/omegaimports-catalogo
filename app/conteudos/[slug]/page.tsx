import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, Header, JsonLd, PageIntro } from "../../components";
import { articleCards } from "@/src/data/store";

export function generateStaticParams() {
  return articleCards.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = articleCards.find((item) => item.slug === params.slug);
  return {
    title: article?.title ?? "Conteúdo técnico",
    description: article?.summary,
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articleCards.find((item) => item.slug === params.slug);
  if (!article) notFound();

  return (
    <>
      <Header />
      <main id="conteudo">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.summary,
            author: { "@type": "Organization", name: "OMEGAIMPORTS" },
          }}
        />
        <PageIntro eyebrow="Conteúdo técnico" title={article.title}>
          <p>{article.summary}</p>
        </PageIntro>
        <article className="content-panel article-body">
          <h2>Como avaliar</h2>
          <p>
            Comece pelo objetivo do projeto, pela faixa elétrica esperada, pelo espaço físico
            disponível e pelos acessórios necessários. Compare a descrição, o modelo e as
            especificações antes de comprar.
          </p>
          <h2>Pontos de atenção</h2>
          <ul>
            <li>Confirme tensão, corrente, quantidade do kit e condição no anúncio.</li>
            <li>Verifique se o componente atende à aplicação pretendida.</li>
            <li>Para tensão de rede ou comandos elétricos, conte com profissional habilitado.</li>
            <li>Use o campo de perguntas do Mercado Livre quando alguma informação não estiver clara.</li>
          </ul>
          <h2>Próximo passo</h2>
          <p>
            Use a busca do catálogo para comparar produtos relacionados e finalize a compra apenas
            depois de confirmar as condições atualizadas no Mercado Livre.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
