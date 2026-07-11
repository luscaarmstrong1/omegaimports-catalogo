export const siteConfig = {
  name: "OMEGAIMPORTS",
  founded: "23 de dezembro de 2024",
  tagline: "Tecnologia, componentes e cuidado em cada pedido.",
  description:
    "Módulos, sensores, fontes e dispositivos para prototipagem, telemetria, medição e automação.",
  site: "https://luscaarmstrong1.github.io",
  base: "/omegaimports-catalogo",
  productionUrl: "https://luscaarmstrong1.github.io/omegaimports-catalogo/",
  marketplaceUrl: "https://www.mercadolivre.com.br/pagina/omegaimports",
  whatsappNumber: process.env.PUBLIC_WHATSAPP_NUMBER || "",
  gaId: process.env.PUBLIC_GA_ID || "",
  clarityId: process.env.PUBLIC_CLARITY_ID || "",
};

export const categories = [
  {
    label: "Placas e Microcontroladores",
    slug: "placas-e-microcontroladores",
    description: "ESP32, módulos de desenvolvimento e hardware para sistemas embarcados.",
  },
  {
    label: "IoT, GSM e Comunicação",
    slug: "iot-gsm-e-comunicacao",
    description: "Conectividade GSM, GPRS, RF e módulos para telemetria.",
  },
  {
    label: "GPS e Localização",
    slug: "gps-e-localizacao",
    description: "Módulos e antenas para rastreamento, telemetria e navegação.",
  },
  {
    label: "Sensores e Medição",
    slug: "sensores-e-medicao",
    description: "Monitoramento de corrente, energia e variáveis de processo.",
  },
  {
    label: "Fontes e Alimentação",
    slug: "fontes-e-alimentacao",
    description: "Fontes compactas, reguladores e componentes para alimentação de circuitos.",
  },
  {
    label: "Automação e Comando",
    slug: "automacao-e-comando",
    description: "Contatores, relés e dispositivos para acionamento e controle.",
  },
  {
    label: "Componentes Eletrônicos",
    slug: "componentes-eletronicos",
    description: "Resistores, varistores, reguladores e componentes para montagem eletrônica.",
  },
  {
    label: "Conectores e Instalação",
    slug: "conectores-e-instalacao",
    description: "Conectores, proteção, montagem e itens para instalações organizadas.",
  },
  {
    label: "Instrumentos de Bancada",
    slug: "instrumentos-de-bancada",
    description: "Equipamentos para testes, manutenção, bancada e desenvolvimento técnico.",
  },
] as const;

export const guides = [
  {
    slug: "como-escolher-sensor-corrente",
    title: "Como escolher um sensor de corrente",
    summary: "Critérios práticos para comparar faixa, instalação, tipo de saída e aplicação.",
  },
  {
    slug: "ttgo-tcall-alimentacao-cuidados",
    title: "TTGO T-Call: alimentação e cuidados de integração",
    summary: "Pontos de atenção ao usar ESP32, SIM800L, USB-C, bateria e antena em projetos IoT.",
  },
  {
    slug: "como-escolher-fonte-ac-dc-compacta",
    title: "Como escolher uma fonte AC-DC compacta",
    summary: "Como avaliar tensão, corrente, isolamento, ambiente e margem de operação.",
  },
] as const;
