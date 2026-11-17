export default function AgentBanner() {
  return (
    <section className="px-4 py-10 site-wrap mx-auto">
      <div className="ab-banner">
        <div className="relative z-10">
          <h2 className="ab-title">
            Looking for <mark>the best</mark>
            <br />
            agent to ship goods
            <br />
            from <span>China?</span>
          </h2>
          <a href="https://ikako.vip/r/RepTitan" target="_blank" rel="noopener noreferrer" className="ab-btn">
            <span aria-hidden>🎟️</span>
            Free coupons
          </a>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/boxes.png" alt="" className="ab-img" loading="lazy" decoding="async" />
      </div>
    </section>
  );
}
