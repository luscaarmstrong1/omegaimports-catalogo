import { Footer, Header, PageIntro } from "./components";

export function SimplePage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="conteudo">
        <PageIntro eyebrow={eyebrow} title={title}>
          {children}
        </PageIntro>
      </main>
      <Footer />
    </>
  );
}
