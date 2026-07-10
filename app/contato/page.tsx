import { storeConfig } from "@/src/data/store";
import { SimplePage } from "../simple-page";

export default function ContatoPage() {
  const channels = [
    storeConfig.email ? ["E-mail", `mailto:${storeConfig.email}`] : null,
    storeConfig.whatsapp ? ["WhatsApp", storeConfig.whatsapp] : null,
    storeConfig.instagram ? ["Instagram", storeConfig.instagram] : null,
    storeConfig.youtube ? ["YouTube", storeConfig.youtube] : null,
  ].filter(Boolean) as string[][];

  return (
    <SimplePage eyebrow="Contato" title="Canais para dúvidas">
      <div className="content-panel">
        <p>
          Para dúvidas sobre produto, compatibilidade, quantidade, frete ou prazo, utilize o campo de
          perguntas do anúncio correspondente no Mercado Livre.
        </p>
        <a className="primary-buy" href={storeConfig.mercadoLivreStoreUrl} target="_blank" rel="noopener noreferrer sponsored">
          Acessar loja no Mercado Livre ↗
        </a>
        {channels.length ? (
          <ul>{channels.map(([label, href]) => <li key={label}><a href={href}>{label}</a></li>)}</ul>
        ) : null}
      </div>
    </SimplePage>
  );
}
