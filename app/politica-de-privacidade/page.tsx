import { SimplePage } from "../simple-page";

export default function PrivacyPage() {
  return (
    <SimplePage eyebrow="Privacidade" title="Política de privacidade">
      <div className="content-panel">
        <p>
          Este site funciona como vitrine de catálogo. Não cria contas, não processa pagamentos e não
          armazena dados de checkout. A compra ocorre no Mercado Livre.
        </p>
        <p>
          Métricas opcionais, como cliques e buscas, podem ser usadas futuramente para melhorar a
          navegação, sempre por chaves configuradas em variáveis de ambiente.
        </p>
      </div>
    </SimplePage>
  );
}
