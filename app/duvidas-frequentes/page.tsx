import { JsonLd } from "../components";
import { SimplePage } from "../simple-page";

const faqs = [
  ["A compra é feita neste site?", "Não. Este site organiza o catálogo e direciona para o anúncio correspondente no Mercado Livre."],
  ["O pagamento é realizado onde?", "O pagamento é consultado e finalizado no ambiente do Mercado Livre."],
  ["O preço mostrado é atualizado?", "Quando houver preço no catálogo, ele vem da última exportação fornecida. Confirme sempre o valor no anúncio."],
  ["Como conferir a quantidade do kit?", "Confira a etiqueta do produto, o título do anúncio e a página do Mercado Livre antes de comprar."],
  ["Os produtos são novos ou usados?", "A condição exibida vem da exportação de anúncios. Confirme a informação no Mercado Livre."],
  ["Como verificar compatibilidade?", "Compare modelo, especificações e aplicação. Em caso de dúvida, use o campo de perguntas do anúncio."],
  ["O frete é calculado onde?", "O frete é calculado pelo Mercado Livre no anúncio e no checkout da plataforma."],
  ["Como funciona a devolução?", "As regras e procedimentos são os informados pelo Mercado Livre para a compra realizada."],
  ["Posso comprar mais de uma unidade?", "Sim, quando o anúncio permitir. Também podem existir kits ou lotes em páginas separadas."],
  ["Onde faço perguntas sobre o produto?", "Use o campo de perguntas do anúncio correspondente no Mercado Livre."],
];

export default function FAQPage() {
  return (
    <SimplePage eyebrow="FAQ" title="Dúvidas frequentes">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(([question, answer]) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          })),
        }}
      />
      <div className="faq-list">
        {faqs.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </SimplePage>
  );
}
