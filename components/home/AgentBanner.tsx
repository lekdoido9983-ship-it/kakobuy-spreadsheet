function Box({ w, h, x, y, rot, z }: { w: number; h: number; x: number; y: number; rot: number; z: number }) {
  return (
    <div className="ab-box" style={{ width: w, height: h, left: x, top: y, transform: `rotate(${rot}deg)`, zIndex: z }}>
      <span>KAKOBUY</span>
    </div>
  );
}

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
        <div className="ab-boxes" aria-hidden>
          <Box w={190} h={110} x={90} y={150} rot={-3} z={3} />
          <Box w={170} h={100} x={40} y={50} rot={4} z={2} />
          <Box w={150} h={90} x={130} y={-5} rot={-6} z={1} />
        </div>
      </div>
    </section>
  );
}
