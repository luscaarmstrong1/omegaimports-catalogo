import { SimplePage } from "../simple-page";

export default function TermsPage() {
  return (
    <SimplePage eyebrow="Termos" title="Termos de uso">
      <div className="content-panel">
        <p>
          As informações deste site ajudam a organizar e comparar produtos da OMEGAIMPORTS. Preço,
          disponibilidade, frete, pagamento e condições finais de compra devem ser confirmados no
          anúncio correspondente no Mercado Livre.
        </p>
        <p>
          O conteúdo técnico tem caráter informativo e não substitui avaliação profissional,
          especialmente em instalações elétricas ou aplicações com tensão de rede.
        </p>
      </div>
    </SimplePage>
  );
}
