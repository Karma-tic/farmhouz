export default function Home() {
  return (
    <main id="main">
      <section data-daylight="0" className="grid min-h-screen place-items-center">
        <h1 className="display display-xl">Farmhouze</h1>
      </section>
      <section data-daylight="0.36" className="min-h-screen" />
      <section data-daylight="0.6" className="min-h-screen" />
      <section data-daylight="0.85" className="theme-night min-h-screen" />
      <section data-daylight="1" className="theme-night min-h-screen" />
    </main>
  );
}
