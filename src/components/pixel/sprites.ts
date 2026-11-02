/**
 * Pixel-art sprites. Each sprite is a grid of single-character palette keys;
 * '.' is transparent. Kept dependency-free so scripts/build-icons.mjs can
 * import it directly with Node's type stripping.
 */
export interface Sprite {
  w: number;
  h: number;
  rows: string[];
  palette: Record<string, string>;
}

export const INK = {
  outline: '#4A3F35',
  eye: '#3A332B',
  body: '#FBF8F3',
  shade: '#E4D9C8',
  blush: '#E2A68E',
  moss: '#7C8A68',
  mossDark: '#5E6A4D',
  mossLight: '#A6B092',
  clay: '#B87A5E',
  clayDark: '#94604A',
  clayLight: '#D59E83',
  gold: '#D6AE68',
  goldDark: '#B68D4C',
  goldLight: '#EED6A1',
  moon: '#E9DDC4',
  moonShade: '#CDBE9F',
  wood: '#C9A27A',
  woodDark: '#9C7A55'
};

const ghostPalette = {
  o: INK.outline,
  w: INK.body,
  s: INK.shade,
  k: INK.eye,
  p: INK.blush
};

const sprite = (rows: string[], palette: Record<string, string>): Sprite => ({
  w: rows[0].length,
  h: rows.length,
  rows,
  palette
});

const GHOST_TOP = [
  '................',
  '......oooo......',
  '....oowwwwoo....',
  '...owwwwwwwwo...',
  '..owwwwwwwwwso..',
  '..owwwwwwwwwso..'
];
const GHOST_BOTTOM = [
  '..owwwwwwwwwso..',
  '..owwwwwwwwwso..',
  '..owwwwwwwwwso..',
  '..owwwwwwwwwso..',
  '..owwoowwoowso..',
  '...oo..oo..oo...'
];

export const ghostIdle = sprite(
  [
    ...GHOST_TOP,
    '..owwkwwwwkwso..',
    '..owwkwwwwkwso..',
    '..owpwkwwkwpso..',
    '..owwwwkkwwwso..',
    ...GHOST_BOTTOM
  ],
  ghostPalette
);

export const ghostBlink = sprite(
  [
    ...GHOST_TOP,
    '..owwwwwwwwwso..',
    '..owkkwwwkkwso..',
    '..owpwkwwkwpso..',
    '..owwwwkkwwwso..',
    ...GHOST_BOTTOM
  ],
  ghostPalette
);

export const ghostHappy = sprite(
  [
    '................',
    '.....oooooo.....',
    '....owwwwwwo....',
    '...owwwwwwwwo...',
    '..owwwwwwwwwso..',
    '..owwkwwwwkwso..',
    '..owkwkwwkwkso..',
    '..owwwwwwwwwso..',
    '..owpwkwwkwpso..',
    '..owwwwkkwwwso..',
    ...GHOST_BOTTOM
  ],
  ghostPalette
);

/** Disc helper used for round sprites (yarn, sun, moon). */
function disc(
  size: number,
  pick: (x: number, y: number, d: number, cx: number, cy: number) => string
): string[] {
  const c = (size - 1) / 2;
  const rows: string[] = [];
  for (let y = 0; y < size; y++) {
    let row = '';
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - c, y - c);
      row += pick(x, y, d, c, c);
    }
    rows.push(row);
  }
  return rows;
}

const YARN_SIZE = 14;
export const yarn = sprite(
  disc(YARN_SIZE, (x, y, d, c) => {
    const r = c + 0.45;
    if (d > r) return '.';
    if (d > r - 1.05) return 'o';
    if ((x - y + 40) % 4 === 0) return 'Y';
    if ((x + y) % 5 === 0 && x + y < 13) return 'l';
    return 'y';
  }),
  { o: INK.mossDark, y: INK.moss, Y: INK.mossDark, l: INK.mossLight }
);

export const yarnClay = sprite(yarn.rows, {
  o: INK.clayDark,
  y: INK.clay,
  Y: INK.clayDark,
  l: INK.clayLight
});

export const sun = sprite(
  [
    '.....G.....',
    '.G...G...G.',
    '..G.....G..',
    '....ggg....',
    '...glggg...',
    'GG.ggggg.GG',
    '...ggggd...',
    '....gdd....',
    '..G.....G..',
    '.G...G...G.',
    '.....G.....'
  ],
  { g: INK.gold, G: INK.goldDark, l: INK.goldLight, d: INK.goldDark }
);

export const moon = sprite(
  [
    '...mmmm....',
    '.mmmmM.....',
    '.mmmM......',
    'mmmM....*..',
    'mmmM.......',
    'mmmM.......',
    'mmmM.....*.',
    'mmmM.......',
    '.mmmM......',
    '.mmmmM.....',
    '...mmmm....'
  ],
  { m: INK.moon, M: INK.moonShade, '*': INK.goldLight }
);

export const needles = sprite(
  [
    'k..........k',
    '.n........n.',
    '..n......n..',
    '...n....n...',
    '....n..n....',
    '.....nn.....',
    '.....NN.....',
    '....N..N....',
    '...N....N...',
    '..N......N..',
    '.N........N.',
    'N..........N'
  ],
  { n: INK.wood, N: INK.woodDark, k: INK.clay }
);

/* ------------------------------------------------------------------------ */
/* Knitted wordmark                                                          */
/* ------------------------------------------------------------------------ */

/**
 * Sweater-style letters: one char = one stitch ('#' = contrast yarn).
 * Vertical strokes are two stitches thick, like intarsia lettering.
 */
const KNIT_FONT: Record<string, string[]> = {
  R: ['#####.', '##..##', '##..##', '#####.', '##.##.', '##..##', '##..##'],
  A: ['.####.', '##..##', '##..##', '######', '##..##', '##..##', '##..##'],
  G: ['.####.', '##..##', '##....', '##.###', '##..##', '##..##', '.####.'],
  I: ['####', '.##.', '.##.', '.##.', '.##.', '.##.', '####']
};

/** Yarn colourways: tones are [highlight, mid, shade, groove]. */
const YARNS = {
  clay: { keys: 'ABCD', tones: [INK.clayLight, INK.clay, INK.clayDark, '#7A4E3C'] },
  gold: { keys: 'EFGH', tones: [INK.goldLight, INK.gold, INK.goldDark, '#957238'] },
  moss: { keys: 'IJKL', tones: [INK.mossLight, INK.moss, INK.mossDark, '#4A543C'] },
  cream: { keys: 'MNOP', tones: [INK.body, INK.shade, INK.moonShade, '#B3A383'] }
};
type Yarn = keyof typeof YARNS;

/**
 * One knit stitch (stockinette "V"): two slanted legs meeting in a point.
 * Stitches sit on a 6×5 grid but are 6px tall, so each V's point overlaps
 * the gap between the legs of the stitch below — that nesting is what makes
 * it read as fabric. Digits index a yarn's tones; '.' shows the groove.
 */
const STITCH = ['01..12', '01..12', '.0112.', '.0112.', '..12..', '..12..'];
const SW = 6;
const SH = 5;
/** Colourwork chart for one letter: picks the yarn of the stitch at (row, col). */
export type KnitPattern = (r: number, c: number) => Yarn;

/** A few classic sweater colourwork motifs. */
export const KNIT_PATTERNS = {
  stripes: (a: Yarn, b: Yarn): KnitPattern => (r) => (Math.floor(r / 2) % 2 ? b : a),
  checks: (a: Yarn, b: Yarn): KnitPattern => (r, c) => ((r + c) % 2 ? b : a),
  chevron: (a: Yarn, b: Yarn, c3: Yarn): KnitPattern => (r, c) => [a, b, c3][(r + Math.abs(c * 2 - 5) / 2 + 9) % 3 | 0],
  diagonal: (a: Yarn, b: Yarn): KnitPattern => (r, c) => ((r + c) % 3 === 0 ? b : a),
  dots: (a: Yarn, b: Yarn): KnitPattern => (r) => (r % 2 ? b : a)
};

/**
 * The word knitted letter by letter: each letter is its own little piece of
 * stockinette with its own colourwork, outlined like the ghost. No background.
 */
export function knitLetters(word: string, patterns: KnitPattern[]): Sprite {
  const glyphs = [...word].map((ch) => KNIT_FONT[ch]);
  const rows = glyphs[0].length;
  const cols = glyphs.reduce((n, g) => n + g[0].length, 0) + glyphs.length - 1;

  // 1. Chart: which yarn each stitch uses (null = no stitch).
  const chart: (Yarn | null)[][] = Array.from({ length: rows }, () => Array<Yarn | null>(cols).fill(null));
  let col = 0;
  glyphs.forEach((g, i) => {
    const pattern = patterns[i % patterns.length];
    g.forEach((line, r) =>
      [...line].forEach((ch, c) => {
        if (ch === '#') chart[r][col + c] = pattern(r, c);
      })
    );
    col += g[0].length + 1;
  });

  // 2. Groove underlay, then V's from the bottom row up so points overlap.
  const w = cols * SW + 2;
  const h = rows * SH + 1 + 2;
  const grid = Array.from({ length: h }, () => Array<string>(w).fill('.'));
  const tile = (r: number, c: number, fn: (x: number, y: number, t: string) => void) => {
    for (let ty = 0; ty < STITCH.length; ty++)
      for (let tx = 0; tx < SW; tx++) fn(1 + c * SW + tx, 1 + r * SH + ty, STITCH[ty][tx]);
  };
  chart.forEach((line, r) =>
    line.forEach((yarn, c) => {
      if (!yarn) return;
      // Groove only within the stitch's own 6×5 cell; the 6th row is its point.
      tile(r, c, (x, y, t) => {
        if (y < 1 + (r + 1) * SH || t !== '.') grid[y][x] = YARNS[yarn].keys[3];
      });
    })
  );
  for (let r = rows - 1; r >= 0; r--)
    chart[r].forEach((yarn, c) => {
      if (!yarn) return;
      tile(r, c, (x, y, t) => {
        if (t !== '.') grid[y][x] = YARNS[yarn].keys[+t];
      });
    });

  // 3. Outline every empty pixel touching yarn (4-neighbourhood).
  const filled = (x: number, y: number) =>
    y >= 0 && y < h && x >= 0 && x < w && grid[y][x] !== '.' && grid[y][x] !== 'o';
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (grid[y][x] === '.' && (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)))
        grid[y][x] = 'o';

  const palette: Record<string, string> = { o: INK.outline };
  for (const { keys, tones } of Object.values(YARNS)) [...keys].forEach((k, i) => (palette[k] = tones[i]));
  return sprite(
    grid.map((r) => r.join('')),
    palette
  );
}

const { stripes, checks, chevron, diagonal, dots } = KNIT_PATTERNS;
export const knitWordmark = knitLetters('RAGGI', [
  stripes('clay', 'cream'),
  checks('moss', 'cream'),
  chevron('gold', 'clay', 'cream'),
  diagonal('moss', 'gold'),
  dots('clay', 'gold')
]);

export const sprites = { ghostIdle, ghostBlink, ghostHappy, yarn, yarnClay, sun, moon, needles, knitWordmark };
export type SpriteName = keyof typeof sprites;
