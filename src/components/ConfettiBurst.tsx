type ConfettiBurstProps = {
  width?: number;
  height?: number;
  cx?: number;
  cy?: number;
  colors?: string[];
  particleCount?: number;
  duration?: number;
};

export default function ConfettiBurst({
  width = 420,
  height = 500,
  cx = 210,
  cy = 210,
  colors = ["#F2754A", "#FFB347", "#E3B27B", "#FFD37A", "#1D9E75"],
  particleCount = 40,
  duration = 1100,
}: ConfettiBurstProps) {
  const particles = Array.from({ length: particleCount }, (_, index) => {
    const angle = (Math.PI * 2 * index) / particleCount + (Math.random() - 0.5) * 0.45;
    const travel = 140 + Math.random() * 140;
    const x = Math.cos(angle) * travel;
    const y = Math.sin(angle) * travel;
    const size = 9 + Math.random() * 6;
    const shape = index % 2 === 0 ? "circle" : "bar";
    const spin = 180 + Math.random() * 360;
    const delay = Math.random() * 0.2;

    return {
      key: `${index}-${Math.random().toString(36).slice(2, 8)}`,
      x,
      y,
      size,
      shape,
      color: colors[index % colors.length],
      delay,
      spin,
    };
  });

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
      style={{ width, height, left: 0, top: 0 }}
    >
      <style>{`
        @keyframes confetti-pop {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.7) rotate(0deg);
          }
          12% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--spin));
          }
        }
      `}</style>

      {particles.map((particle) => (
        <span
          key={particle.key}
          className="absolute block"
          style={{
            left: `${cx}px`,
            top: `${cy}px`,
            width: particle.shape === "circle" ? `${particle.size}px` : `${particle.size * 1.7}px`,
            height: particle.shape === "circle" ? `${particle.size}px` : `${particle.size * 0.7}px`,
            background: particle.color,
            borderRadius: particle.shape === "circle" ? "9999px" : "9999px",
            opacity: 0,
            boxShadow: `0 0 8px ${particle.color}`,
            animation: `confetti-pop ${duration}ms cubic-bezier(0.2, 0.7, 0.3, 1) forwards`,
            animationDelay: `${particle.delay}s`,
            transform: "translate(-50%, -50%)",
            ["--dx" as string]: `${particle.x}px`,
            ["--dy" as string]: `${particle.y}px`,
            ["--spin" as string]: `${particle.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}
