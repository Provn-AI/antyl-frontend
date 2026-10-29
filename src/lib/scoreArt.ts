// One SVG used everywhere (LinkedIn image, share page, modal) so they always match.
const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: 800 + r * Math.cos(a), y: 460 + r * Math.sin(a) };
};

const f = (n: number) => n.toFixed(1);

const star = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`;

const leaf = (x: number, y: number, rot: number) =>
  `<path d="M0 -32Q17 0 0 32Q-17 0 0 -32Z" transform="translate(${f(x)} ${f(y)}) rotate(${rot})" fill="url(#leaf)"/>`;

function wreath(): string {
  const angles = [142, 150, 158, 166, 174, 182, 190, 198, 206];
  const s = polar(250, 138);
  const e = polar(250, 210);
  let out = `<path d="M${f(s.x)} ${f(s.y)}A250 250 0 0 1 ${f(e.x)} ${f(e.y)}" fill="none" stroke="#FFB43F" stroke-width="5" stroke-linecap="round"/>`;
  for (const a of angles) {
    const o = polar(266, a);
    const i = polar(234, a + 2);
    out += leaf(o.x, o.y, a - 30) + leaf(i.x, i.y, a + 30);
  }
  return out;
}

export const SCORE_ART_RATIO = 760 / 520;
// Where the centre of the ring sits inside the artwork (0 to 1, from the top)
export const SCORE_ART_RING_CENTER_Y = (460 - 150) / 520;

export function scoreArtSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="420 150 760 520" width="760" height="520">
<defs>
  <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFA24F"/><stop offset="1" stop-color="#F2603A"/></linearGradient>
  <linearGradient id="crown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFDB7E"/><stop offset="1" stop-color="#FFB63D"/></linearGradient>
  <linearGradient id="leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD670"/><stop offset="1" stop-color="#FFA43E"/></linearGradient>
  <radialGradient id="inner" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFF4EA"/></radialGradient>
  <filter id="blur" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="16"/></filter>
</defs>

<ellipse cx="800" cy="662" rx="160" ry="26" fill="#FFAE66" opacity="0.4" filter="url(#blur)"/>

<g>${wreath()}</g>
<g transform="translate(1600 0) scale(-1 1)">${wreath()}</g>

<g stroke="#FFC247" stroke-width="9" stroke-linecap="round">
  <line x1="684" y1="190" x2="702" y2="222"/>
  <line x1="633" y1="226" x2="668" y2="248"/>
  <line x1="916" y1="190" x2="898" y2="222"/>
  <line x1="967" y1="226" x2="932" y2="248"/>
</g>

<circle cx="800" cy="460" r="185" fill="url(#inner)" stroke="url(#ring)" stroke-width="40"/>

<path d="M742 246L736 196L768 220L800 170L832 220L864 196L858 246Z" fill="url(#crown)" stroke="url(#crown)" stroke-width="10" stroke-linejoin="round"/>
<circle cx="736" cy="194" r="8" fill="#FFC247"/>
<circle cx="800" cy="166" r="9" fill="#FFC247"/>
<circle cx="864" cy="194" r="8" fill="#FFC247"/>

<path d="${star(510, 310, 34)}" fill="#FF8A3D"/>
<path d="${star(1157, 492, 26)}" fill="#FF8A3D"/>
<circle cx="1060" cy="313" r="7" fill="#FFA04D"/>
<circle cx="445" cy="441" r="7" fill="#FFA04D"/>
<circle cx="1110" cy="615" r="7" fill="#FFA04D"/>
</svg>`;
}

export function scoreArtDataUri(): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(scoreArtSvg())}`;
}