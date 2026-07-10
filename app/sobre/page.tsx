import { SimplePage } from "../simple-page";

export default function SobrePage() {
  return (
    <SimplePage eyebrow="Sobre" title="Sobre a OMEGAIMPORTS">
      <div className="content-panel">
        <p>
          A OMEGAIMPORTS atua com componentes e equipamentos para eletrônica, automação, energia,
          prototipagem e desenvolvimento de projetos. O catálogo reúne módulos, sensores, fontes,
          conectores, instrumentos e diferentes opções de kits.
        </p>
        <p>
          Este site organiza as informações dos produtos e direciona a compra para os anúncios da
          OMEGAIMPORTS no Mercado Livre.
        </p>
        <h2>Compromisso</h2>
        <p>
          Cada pedido é separado e conferido de acordo com as informações do anúncio, com atenção ao
          modelo, à quantidade e à condição do produto.
        </p>
      </div>
    </SimplePage>
  );
}
