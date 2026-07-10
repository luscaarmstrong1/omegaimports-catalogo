import Link from "next/link";
import { Footer, Header } from "./components";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="conteudo" className="not-found">
        <p className="eyebrow">404</p>
        <h1>Página não encontrada</h1>
        <p>O endereço pode ter mudado ou o produto pode ter sido removido do catálogo ativo.</p>
        <Link href="/produtos">Ver produtos</Link>
      </main>
      <Footer />
    </>
  );
}
