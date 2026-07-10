import { SimplePage } from "../simple-page";

export default function ComoComprarPage() {
  return (
    <SimplePage eyebrow="Como comprar" title="A compra é finalizada no Mercado Livre">
      <ol className="steps">
        <li>Encontre o produto pelo catálogo, busca ou categoria.</li>
        <li>Confira modelo, quantidade, condição e observações do anúncio.</li>
        <li>Clique em “Comprar no Mercado Livre”.</li>
        <li>Consulte preço, frete e prazo atualizados no anúncio.</li>
        <li>Finalize o pagamento no ambiente do Mercado Livre.</li>
        <li>Acompanhe o pedido pela sua conta do Mercado Livre.</li>
      </ol>
      <p className="redirect-note">
        O site da OMEGAIMPORTS é uma vitrine. Os valores e condições válidos são os exibidos no
        anúncio no momento da compra.
      </p>
    </SimplePage>
  );
}
