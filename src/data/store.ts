export const storeConfig = {
  name: "OMEGAIMPORTS",
  tagline: "A peça certa para o seu projeto avançar.",
  signature: "OMEGAIMPORTS — tecnologia, componentes e cuidado em cada pedido.",
  mercadoLivreStoreUrl: "https://www.mercadolivre.com.br/pagina/omegaimports",
  email: "",
  whatsapp: "",
  instagram: "",
  youtube: "",
  gaId: process.env.NEXT_PUBLIC_GA_ID ?? "",
  clarityId: process.env.NEXT_PUBLIC_CLARITY_ID ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://omegaimports.catalogo.local",
};

export const categoryDescriptions: Record<string, string> = {
  "Placas e microcontroladores":
    "Módulos e placas para prototipagem, IoT, automação e integração com sensores.",
  "Comunicação GSM, GPRS e RF":
    "Componentes para conectividade móvel, rádio frequência, antenas e pigtails.",
  "GPS e localização":
    "Módulos, antenas e acessórios para rastreamento, telemetria e localização.",
  "Sensores e medição":
    "Sensores, transformadores de corrente e itens para leitura de sinais elétricos.",
  "Fontes e alimentação":
    "Fontes, conversores e equipamentos de alimentação para bancada e circuitos.",
  "Automação e comando":
    "Contatores, chaves, supressores e componentes para comando elétrico.",
  "Conectores e instalação":
    "Conectores, prensa-cabos e itens de montagem para instalações organizadas.",
  "Componentes eletrônicos":
    "Componentes discretos, reguladores, resistores, varistores e peças de reposição.",
  Prototipagem:
    "Materiais para montagem, testes e validação de circuitos eletrônicos.",
  "Instrumentos de bancada":
    "Equipamentos para testes, desenvolvimento, manutenção e bancada técnica.",
};

export const articleCards = [
  {
    slug: "como-escolher-sensor-corrente",
    title: "Como escolher um sensor de corrente",
    summary:
      "Critérios práticos para comparar sensores invasivos, não invasivos, faixas de corrente e aplicação.",
  },
  {
    slug: "sct013-vs-zmct123a",
    title: "Diferenças entre SCT-013 e ZMCT123A",
    summary:
      "Quando usar cada família de sensor e quais dados confirmar antes de integrar ao projeto.",
  },
  {
    slug: "alimentar-ttgo-tcall",
    title: "Como alimentar corretamente uma TTGO T-Call",
    summary:
      "Cuidados com tensão, bateria, USB-C e consumo em projetos com GSM/GPRS.",
  },
  {
    slug: "aplicacoes-neo6m",
    title: "Aplicações do módulo GPS NEO-6M",
    summary:
      "Ideias de uso em rastreamento, telemetria, georreferenciamento e protótipos conectados.",
  },
  {
    slug: "fonte-ac-dc-compacta",
    title: "Como escolher uma fonte AC-DC compacta",
    summary:
      "Pontos de atenção para tensão de entrada, saída, corrente e segurança em fontes encapsuladas.",
  },
  {
    slug: "contator-rele-supressor",
    title: "Contator, relé e supressor: diferenças",
    summary:
      "Um guia prudente para entender funções básicas em comandos elétricos e proteção contra ruído.",
  },
];
