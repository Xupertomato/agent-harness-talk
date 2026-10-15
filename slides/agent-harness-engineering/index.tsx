import {
  type DesignSystem,
  type Page,
  type SlideMeta,
  Step,
  Steps,
  useSlidePageNumber,
} from '@open-slide/core';
import { Fragment, useEffect, useState, type CSSProperties, type ReactNode } from 'react';

export const design: DesignSystem = {
  palette: { bg: '#f5f8fc', text: '#2a2f37', accent: '#0a1a33' },
  fonts: {
    display:
      '"PingFang TC", "Noto Sans TC", "Noto Sans CJK TC", "Microsoft JhengHei", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    body: '"PingFang TC", "Noto Sans TC", "Noto Sans CJK TC", "Microsoft JhengHei", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  },
  typeScale: { hero: 128, body: 34 },
  radius: 6,
};

const c = {
  muted: '#5b6573',
  dim: '#8a929e',
  line: 'rgba(10, 26, 51, 0.5)',
  hair: 'rgba(10, 26, 51, 0.14)',
  panel: '#ffffff',
  cyanSoft: 'rgba(10, 26, 51, 0.06)',
  amber: '#b85f00',
  amberLine: 'rgba(184, 95, 0, 0.5)',
  amberSoft: 'rgba(184, 95, 0, 0.07)',
  mutedSoft: 'rgba(10, 26, 51, 0.035)',
  grid: 'rgba(10, 26, 51, 0.04)',
  gridMajor: 'rgba(10, 26, 51, 0.08)',
};

const mono = '"SF Mono", "JetBrains Mono", Menlo, Consolas, monospace';

type Tone = 'cyan' | 'amber' | 'muted';

const toneColor = (t: Tone) =>
  t === 'amber' ? c.amber : t === 'muted' ? c.muted : 'var(--osd-accent)';
const toneLine = (t: Tone) => (t === 'amber' ? c.amberLine : t === 'muted' ? c.hair : c.line);
const toneSoft = (t: Tone) => (t === 'amber' ? c.amberSoft : t === 'muted' ? c.mutedSoft : c.cyanSoft);

const canvas: CSSProperties = {
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  position: 'relative',
  fontFamily: 'var(--osd-font-body)',
  color: 'var(--osd-text)',
  backgroundColor: 'var(--osd-bg)',
  backgroundPosition: '-1px -1px',
};

const p0: CSSProperties = { margin: 0 };

const Tick = ({
  top,
  left,
  right,
  bottom,
}: {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}) => {
  const edge = `2px solid ${c.line}`;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        right,
        bottom,
        width: 26,
        height: 26,
        borderTop: top !== undefined ? edge : undefined,
        borderBottom: bottom !== undefined ? edge : undefined,
        borderLeft: left !== undefined ? edge : undefined,
        borderRight: right !== undefined ? edge : undefined,
      }}
    />
  );
};

const Ticks = () => (
  <>
    <Tick top={40} left={48} />
    <Tick top={40} right={48} />
    <Tick bottom={40} left={48} />
    <Tick bottom={40} right={48} />
  </>
);

const Footer = () => {
  const { current } = useSlidePageNumber();
  const main = MAIN_COUNT;
  return (
    <div
      style={{
        position: 'absolute',
        left: 140,
        right: 140,
        bottom: 36,
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: mono,
        fontSize: 20,
        letterSpacing: '0.14em',
        color: c.dim,
      }}
    >
      <span>AGENT SYSTEM × HARNESS ENGINEERING</span>
      <span>
        {current > main ? '附錄' : `${String(current).padStart(2, '0')} / ${String(main).padStart(2, '0')}`}
      </span>
    </div>
  );
};

type StageName = '資訊' | '模型判斷' | '把關' | '行動' | '狀態・驗收';

const CRUMBS: { name: string; model?: boolean }[] = [
  { name: '資訊' },
  { name: '模型判斷', model: true },
  { name: '把關' },
  { name: '行動' },
  { name: '狀態・驗收' },
];

const Crumbs = ({ stage }: { stage: StageName }) => (
  <div style={{ position: 'absolute', top: 82, right: 140, display: 'flex', alignItems: 'center', gap: 5 }} aria-hidden="true">
    {CRUMBS.map((cr, i) => {
      const active = cr.name === stage;
      return (
        <Fragment key={cr.name}>
          {i > 0 ? <span style={{ fontSize: 15, color: c.dim, lineHeight: 1 }}>›</span> : null}
          <span
            style={{
              fontSize: 17,
              lineHeight: 1.2,
              fontWeight: active ? 800 : 500,
              padding: '4px 11px',
              borderRadius: 999,
              whiteSpace: 'nowrap',
              boxSizing: 'border-box',
              color: active ? '#ffffff' : c.muted,
              background: active ? (cr.model ? c.muted : 'var(--osd-accent)') : cr.model ? c.mutedSoft : 'transparent',
              border: active
                ? `1.5px solid ${cr.model ? c.muted : 'var(--osd-accent)'}`
                : cr.model
                  ? `1.5px dashed ${c.dim}`
                  : `1.5px solid ${c.hair}`,
            }}
          >
            {cr.name}
          </span>
        </Fragment>
      );
    })}
  </div>
);

const NavRow = ({ back, next }: { back?: { to: Page; label: string }; next?: { to: Page; label: string } }) => (
  <div style={{ position: 'absolute', right: 140, bottom: 82, display: 'flex', alignItems: 'baseline', gap: 40 }}>
    {back ? <BackLink to={back.to} label={back.label} /> : null}
    {next ? (
      <span style={{ fontSize: 20, lineHeight: 1.2, color: c.muted }}>
        細節：
        <a
          data-link="detail"
          href={'#p' + (pages.indexOf(next.to) + 1)}
          style={{ color: 'var(--osd-accent)', textDecoration: 'none', fontWeight: 600 }}
        >
          {next.label} →
        </a>
      </span>
    ) : null}
  </div>
);

const BackLink = ({ to, label }: { to: Page; label: string }) => (
  <a
    data-link="back"
    href={'#p' + (pages.indexOf(to) + 1)}
    style={{
      fontSize: 20,
      lineHeight: 1.2,
      color: 'var(--osd-accent)',
      textDecoration: 'none',
      fontWeight: 600,
    }}
  >
    ← 回到 {label}
  </a>
);

const DetailLinks = ({ items }: { items: { label: string; to: Page }[] }) => (
  <div
    style={{
      marginTop: 14,
      textAlign: 'right',
      fontSize: 20,
      lineHeight: 1.4,
      color: c.muted,
      display: 'flex',
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
      columnGap: 26,
    }}
  >
    <span>細節：</span>
    {items.map((it) => (
      <a
        key={it.label}
        data-link="detail"
        href={'#p' + (pages.indexOf(it.to) + 1)}
        style={{ color: 'var(--osd-accent)', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
      >
        {it.label} →
      </a>
    ))}
  </div>
);

const Frame = ({
  scope,
  intro,
  title,
  children,
  stage,
  back,
  next,
}: {
  scope?: ReactNode;
  intro?: ReactNode;
  title: ReactNode;
  children: ReactNode;
  stage?: StageName;
  back?: { to: Page; label: string };
  next?: { to: Page; label: string };
}) => (
  <div style={{ ...canvas, padding: '84px 140px 100px', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: 29, flexShrink: 0 }} aria-hidden="true" />
    {stage ? <Crumbs stage={stage} /> : null}
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 60,
        fontWeight: 800,
        lineHeight: 1.2,
        margin: '18px 0 0',
      }}
    >
      {title}
    </h2>
    {scope ? (
      <div style={{ fontSize: 24, lineHeight: 1.3, fontWeight: 400, color: c.muted, marginTop: 8 }}>{scope}</div>
    ) : null}
    {intro ? <div style={{ fontSize: 26, lineHeight: 1.3, fontWeight: 400, color: c.muted, marginTop: 10 }}>{intro}</div> : null}
    <div style={{ marginTop: scope || intro ? 16 : 44, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 24 }}>
      {children}
    </div>
    {back || next ? <NavRow back={back} next={next} /> : null}
    <Ticks />
    <Footer />
  </div>
);

const Divider = ({ no = 1, name, q }: { no?: number; name: string; q: string }) => (
  <div style={{ ...canvas, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
    <div style={{ fontFamily: mono, fontSize: 30, letterSpacing: '0.2em', color: 'var(--osd-accent)' }}>PART 0{no}</div>
    <h1 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 200, fontWeight: 900, lineHeight: 1.1, margin: '24px 0 0', letterSpacing: '0.04em' }}>{name}</h1>
    <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.4, marginTop: 36, color: c.muted }}>{q}</div>
    <Ticks />
    <Footer />
  </div>
);

const Close = ({
  statement,
  children,
  bridge,
  next,
}: {
  tag?: string;
  statement: ReactNode;
  children?: ReactNode;
  bridge?: ReactNode;
  next: ReactNode;
}) => (
  <div style={{ ...canvas, padding: '0 160px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 72,
        fontWeight: 900,
        lineHeight: 1.25,
        margin: '28px 0 0',
      }}
    >
      {statement}
    </h2>
    {children}
    <div
      style={{
        marginTop: 64,
        paddingTop: 36,
        borderTop: `1.5px solid ${c.line}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 64,
      }}
    >
      <div style={{ flex: 1 }}>{bridge}</div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: mono, fontSize: 24, letterSpacing: '0.14em', color: c.dim }}>NEXT →</div>
        <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.4, color: 'var(--osd-accent)', marginTop: 8 }}>{next}</div>
      </div>
    </div>
    <Ticks />
    <Footer />
  </div>
);

const Hi = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      color: 'var(--osd-accent)',
      fontWeight: 800,
      background: 'linear-gradient(transparent 62%, rgba(10, 26, 51, 0.12) 62%)',
    }}
  >
    {children}
  </span>
);

const Warm = ({ children }: { children: ReactNode }) => <span style={{ color: c.amber }}>{children}</span>;

const Label = ({ children, tone = 'cyan' }: { children: ReactNode; tone?: Tone }) => (
  <div style={{ fontFamily: mono, fontSize: 22, lineHeight: 1.3, letterSpacing: '0.12em', color: toneColor(tone) }}>
    {children}
  </div>
);

const Pill = ({
  children,
  tone = 'cyan',
  size = 22,
  solid = false,
}: {
  children: ReactNode;
  tone?: Tone;
  size?: number;
  solid?: boolean;
}) => (
  <span
    style={{
      display: 'inline-block',
      fontSize: size,
      fontWeight: 700,
      lineHeight: 1.2,
      padding: size > 22 ? '10px 20px' : '7px 16px',
      borderRadius: 999,
      border: solid ? '1.5px solid var(--osd-accent)' : `1.5px solid ${toneLine(tone)}`,
      color: solid ? '#ffffff' : toneColor(tone),
      background: solid ? 'var(--osd-accent)' : toneSoft(tone),
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

const Panel = ({
  children,
  tone = 'cyan',
  style,
}: {
  children: ReactNode;
  tone?: Tone;
  style?: CSSProperties;
}) => (
  <div
    style={{
      boxSizing: 'border-box',
      border: `1.5px solid ${toneLine(tone)}`,
      background: tone === 'cyan' ? c.panel : toneSoft(tone),
      borderRadius: 'var(--osd-radius)',
      padding: '26px 32px',
      ...style,
    }}
  >
    {children}
  </div>
);

const TRow = ({
  cols,
  head = false,
  pad = 18,
  size = 26,
  children,
}: {
  cols: string;
  head?: boolean;
  pad?: number;
  size?: number;
  children: ReactNode;
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: cols,
      columnGap: 32,
      alignItems: 'start',
      padding: head ? '0 0 14px' : `${pad}px 0`,
      borderBottom: `1px solid ${head ? c.line : c.hair}`,
      fontSize: head ? 22 : size,
      fontWeight: head ? 700 : 400,
      lineHeight: 1.45,
      letterSpacing: head ? '0.08em' : undefined,
      color: head ? 'var(--osd-accent)' : 'var(--osd-text)',
    }}
  >
    {children}
  </div>
);

const Cover: Page = () => (
  <div style={{ ...canvas, padding: '0 160px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <h1
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 'var(--osd-size-hero)',
        fontWeight: 900,
        lineHeight: 1.05,
        letterSpacing: '-0.01em',
        margin: 0,
      }}
    >
      Agent System
      <br />
      with <Hi>Harness</Hi>
      <br />
      Engineering
    </h1>
    <p style={{ fontSize: 46, lineHeight: 1.45, color: c.muted, margin: '52px 0 0' }}>
      模型越來越強，
      <br />
      哪些交給它，哪些留給人？
    </p>
    <HorseMark />
    <Ticks />
    <Footer />
  </div>
);

const KNIGHT =
  'M790 1254Q827 1277 827 1316Q827 1341 812.0 1369.5Q797 1398 797 1420Q797 1466 855 1496Q940 1415 947.5 1370.5Q955 1326 955 1313Q955 1266 921 1254H925Q925 1253 923 1253Q1459 913 1504 0H534Q521 56 521 114Q521 274 723.5 415.5Q926 557 926 670Q926 678 925 685Q859 518 742 518Q742 518 732 518Q642 372 539 372Q535 372 532 372L580 476L473 396Q359 424 332 507Q420 736 420 926Q420 953 418 979Q466 1088 565 1192Q568 1202 568 1211Q568 1239 545.5 1252.0Q523 1265 523 1300Q523 1337 543 1403Q647 1376 703 1254ZM533 999V983Q537 953 545 953H566Q635 953 635 1002Q635 1036 678 1084H672Q576 1084 539 1020ZM424 549V525Q424 496 452 496H462Q534 511 534 564L527 598Q465 598 424 549ZM922 1174 974 1085Q1349 816 1355 52H1432Q1387 902 922 1174Z';

const Strap = ({ d, w = 30 }: { d: string; w?: number }) => (
  <g>
    <path d={d} style={{ fill: 'none', stroke: 'var(--osd-accent)', strokeWidth: w + 16, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
    <path d={d} style={{ fill: 'none', stroke: 'var(--osd-bg)', strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
  </g>
);

const HorseMark = () => (
  <svg
    width={600}
    height={560}
    viewBox="300 -20 1640 1530"
    style={{ position: 'absolute', right: 110, top: 250 }}
    aria-hidden="true"
  >
    <g transform="translate(0,1496) scale(1,-1)">
      <path d={KNIGHT} style={{ fill: 'var(--osd-accent)' }} />
    </g>
    <Strap d="M760,300 C700,520 620,780 540,1010" />
    <Strap d="M760,300 C700,280 650,262 610,250" w={24} />
    <Strap d="M620,880 C540,860 460,840 380,828" />
    <Strap d="M540,1010 C760,1120 1100,1180 1920,1150" w={22} />
    <circle cx={540} cy={1010} r={40} style={{ fill: 'var(--osd-bg)', stroke: 'var(--osd-accent)', strokeWidth: 16 }} />
  </svg>
);

const Hook: Page = () => (
  <div style={{ ...canvas, padding: '0 160px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <p style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.22, margin: 0, maxWidth: 1560 }}>
      "The more it reasons the more unpredictable it becomes."
    </p>
    <p style={{ fontSize: 30, lineHeight: 1.4, color: c.muted, margin: '28px 0 0' }}>
      — Ilya Sutskever，Safe Superintelligence 共同創辦人
    </p>
    <div style={{ width: 160, height: 3, background: 'var(--osd-accent)', margin: '64px 0' }} />
    <p style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.5, margin: 0 }}>
      模型越強，我們越想多交給它；
      <br />
      但它越會推理，就<Hi>越難掌握</Hi>。
    </p>
    <Ticks />
    <Footer />
  </div>
);



const Leg = ({ no, name, q }: { no: string; name: string; q: string }) => (
  <div
    style={{
      flex: 1,
      minWidth: 0,
      boxSizing: 'border-box',
      border: `1.5px solid ${c.line}`,
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '20px 36px',
    }}
  >
    <Label>PART {no}</Label>
    <p style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.3, margin: '6px 0 0' }}>{name}</p>
    <p style={{ fontSize: 28, lineHeight: 1.5, color: c.muted, margin: '6px 0 0', whiteSpace: 'nowrap' }}>{q}</p>
  </div>
);

const LegArrow = () => (
  <div style={{ alignSelf: 'center', width: 56, textAlign: 'center', fontFamily: mono, fontSize: 34, color: c.dim }}>→</div>
);

/* The equation on the outline page: starts balanced, then the model grows and the Harness shrinks.
   Animates only inside the deck viewer (window.__deckAnimate); elsewhere (export, editor) it renders the end state.
   Press R in the viewer to replay. */
const ShiftEquation = () => {
  const animate = typeof window !== 'undefined' && (window as any).__deckAnimate === true;
  const [shift, setShift] = useState(!animate);
  useEffect(() => {
    if (!animate) return;
    let t = setTimeout(() => setShift(true), 700);
    const replay = () => { clearTimeout(t); setShift(false); t = setTimeout(() => setShift(true), 600); };
    window.addEventListener('deck-replay', replay);
    return () => { clearTimeout(t); window.removeEventListener('deck-replay', replay); };
  }, [animate]);
  const ease = 'all 1.6s cubic-bezier(.45,0,.2,1)';
  return (
    <div style={{ marginTop: 56, height: 230, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', whiteSpace: 'nowrap', fontWeight: 800 }}>
        <span style={{ fontSize: 72, lineHeight: 1.2 }}>Agent ＝</span>
        <span style={{ fontSize: shift ? 132 : 72, lineHeight: 1.2, marginLeft: 28, transition: ease }}>模型</span>
        <span style={{ fontSize: shift ? 52 : 72, margin: '0 22px', transition: ease }}>＋</span>
        <span style={{ fontSize: shift ? 36 : 72, color: 'var(--osd-accent)', transition: ease }}>Harness</span>
        <span style={{ fontSize: 26, fontWeight: 400, color: c.muted, marginLeft: 24, opacity: shift ? 1 : 0, transition: 'opacity .8s ease 1.2s' }}>
          只守使用者的要求
        </span>
      </div>
    </div>
  );
};

const Theme: Page = () => (
  <Frame title="In A Nutshell">
    <div style={{ display: 'flex' }}>
      <Leg no="01" name="看懂" q="手上的工具怎麼運作？" />
      <LegArrow />
      <Leg no="02" name="判斷" q="哪些交給模型、哪些控制？" />
      <LegArrow />
      <Leg no="03" name="動手" q="自己提供工具，從哪開始？" />
    </div>
    <ShiftEquation />
    <p style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.5, margin: '44px 0 0' }}>
      模型越來越強，Harness 越來越薄；<Hi>我們過去幫模型做的，正在過期</Hi>。
    </p>
  </Frame>
);

const Act1: Page = () => <Divider no={1} name="看懂" q="手上的 Agent 工具，是怎麼運作的？" />;

const Request = ({ tag, text, guess }: { tag: string; text: string; guess: string }) => (
  <div
    style={{
      width: 806,
      boxSizing: 'border-box',
      border: `1.5px solid ${c.line}`,
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '26px 32px',
    }}
  >
    <Label>{tag}</Label>
    <p style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.4, margin: '10px 0 0' }}>{text}</p>
    <p style={{ fontSize: 26, lineHeight: 1.4, color: c.muted, margin: '10px 0 0' }}>{guess}</p>
  </div>
);

const Feature = ({ name, desc }: { name: string; desc: ReactNode }) => (
  <div
    style={{
      width: 806,
      boxSizing: 'border-box',
      borderLeft: '4px solid var(--osd-accent)',
      background: c.cyanSoft,
      padding: '24px 32px',
    }}
  >
    <p style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.3, margin: 0 }}>{name}</p>
    <p style={{ fontSize: 28, lineHeight: 1.5, color: c.muted, margin: '10px 0 0' }}>{desc}</p>
  </div>
);


const Quad = ({ text, pill, tone = 'cyan' }: { text: string; pill: string; tone?: Tone }) => (
  <div
    style={{
      boxSizing: 'border-box',
      border: `1.5px solid ${toneLine(tone)}`,
      background: tone === 'amber' ? c.amberSoft : c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '24px 30px',
      minHeight: 190,
    }}
  >
    <p style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.4, margin: 0 }}>{text}</p>
    <div style={{ marginTop: 16 }}>
      <Pill tone={tone}>{pill}</Pill>
    </div>
  </div>
);

const axis: CSSProperties = { fontSize: 24, fontWeight: 700, color: c.muted, lineHeight: 1.35 };

const RideCard = ({ term, like, desc, who }: { term: string; like: string; desc: string; who: string }) => (
  <div
    style={{
      flex: 1,
      boxSizing: 'border-box',
      border: `1.5px solid ${c.line}`,
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '36px 48px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
      <span style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.1 }}>{term}</span>
      <span style={{ fontSize: 30, color: c.muted }}>{like}</span>
    </div>
    <p style={{ fontSize: 32, lineHeight: 1.5, color: c.muted, margin: 0 }}>{desc}</p>
    <div style={{ height: 1.5, background: c.line }} />
    <p style={{ fontSize: 38, fontWeight: 800, margin: 0 }}>{who}</p>
  </div>
);


const FlowBox = ({ x, y, w, text }: { x: number; y: number; w: number; text: string }) => (
  <g>
    <rect x={x} y={y} width={w} height={80} rx={8} style={{ fill: c.panel, stroke: 'var(--osd-accent)', strokeWidth: 2 }} />
    <text
      x={x + w / 2}
      y={y + 49}
      textAnchor="middle"
      style={{ fill: 'var(--osd-text)', fontSize: 26, fontWeight: 700, fontFamily: 'var(--osd-font-body)' }}
    >
      {text}
    </text>
  </g>
);

const FlowDiamond = ({ cx, cy, l1, l2, fs = 22 }: { cx: number; cy: number; l1: string; l2?: string; fs?: number }) => (
  <g>
    <polygon
      points={`${cx},${cy - 58} ${cx + 96},${cy} ${cx},${cy + 58} ${cx - 96},${cy}`}
      style={{ fill: c.panel, stroke: c.muted, strokeWidth: 2 }}
    />
    <text
      x={cx}
      y={l2 ? cy - 6 : cy + 8}
      textAnchor="middle"
      style={{ fill: 'var(--osd-text)', fontSize: fs, fontWeight: 700, fontFamily: 'var(--osd-font-body)' }}
    >
      {l1}
    </text>
    {l2 ? (
      <text
        x={cx}
        y={cy + 22}
        textAnchor="middle"
        style={{ fill: 'var(--osd-text)', fontSize: fs, fontWeight: 700, fontFamily: 'var(--osd-font-body)' }}
      >
        {l2}
      </text>
    ) : null}
  </g>
);

const FlowEdge = ({ d, dashed = false }: { d: string; dashed?: boolean }) => (
  <path
    d={d}
    markerEnd="url(#osd-ah-flow)"
    style={{ fill: 'none', stroke: c.muted, strokeWidth: 2, strokeDasharray: dashed ? '8 7' : undefined }}
  />
);

const FlowNote = ({ x, y, text, anchor = 'middle' }: { x: number; y: number; text: string; anchor?: 'middle' | 'start' }) => (
  <text x={x} y={y} textAnchor={anchor} style={{ fill: c.muted, fontSize: 20, fontFamily: 'var(--osd-font-body)' }}>
    {text}
  </text>
);

const ModelTag = ({ x, y, w }: { x: number; y: number; w: number }) => (
  <g>
    <rect x={x + w / 2 - 38} y={y - 34} width={76} height={28} rx={14} style={{ fill: 'var(--osd-accent)' }} />
    <text x={x + w / 2} y={y - 14} textAnchor="middle" style={{ fill: '#ffffff', fontSize: 17, fontWeight: 700, fontFamily: 'var(--osd-font-body)' }}>
      模型
    </text>
  </g>
);

const QAFlow = () => (
  <svg width={1640} height={420} viewBox="0 0 1640 420" aria-label="知識問答 Workflow 流程圖">
    <defs>
      <marker id="osd-ah-flow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" style={{ fill: c.muted }} />
      </marker>
    </defs>
    <FlowEdge d="M200,130 H262" />
    <FlowEdge d="M486,130 H562" />
    <FlowEdge d="M758,130 H850" />
    <FlowEdge d="M1110,130 H1170" />
    <FlowEdge d="M1370,130 H1420" />
    <FlowEdge d="M660,188 V300" />
    <FlowBox x={0} y={90} w={200} text="收到問題" />
    <FlowBox x={264} y={90} w={222} text="檢索文件" />
    <FlowDiamond cx={660} cy={130} l1="找到相關文件？" fs={19} />
    <ModelTag x={852} y={90} w={258} />
    <FlowBox x={852} y={90} w={258} text="產生回答" />
    <FlowBox x={1172} y={90} w={198} text="附上出處" />
    <FlowBox x={1422} y={90} w={218} text="回覆使用者" />
    <rect x={540} y={302} width={240} height={80} rx={8} style={{ fill: c.cyanSoft, stroke: 'var(--osd-accent)', strokeWidth: 3 }} />
    <text x={660} y={351} textAnchor="middle" style={{ fill: 'var(--osd-accent)', fontSize: 27, fontWeight: 800, fontFamily: 'var(--osd-font-body)' }}>
      轉人工處理
    </text>
    <FlowNote x={804} y={118} text="是" />
    <FlowNote x={680} y={254} text="否" anchor="start" />
  </svg>
);

const Trait = ({ k, v }: { k: string; v: string }) => (
  <div style={{ flex: 1 }}>
    <div style={{ fontSize: 22, letterSpacing: '0.08em', color: c.muted }}>{k}</div>
    <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.45, marginTop: 6 }}>{v}</div>
  </div>
);

const Traits = ({ dev, good, cost }: { dev: string; good: string; cost: string }) => (
  <div style={{ display: 'flex', gap: 40, borderTop: `1.5px solid ${c.line}`, paddingTop: 24 }}>
    <Trait k="開發者在做的事" v={dev} />
    <Trait k="擅長" v={good} />
    <Trait k="代價" v={cost} />
  </div>
);


const SpecStop = ({ name, who, eg }: { name: string; who: ReactNode; eg: ReactNode }) => (
  <div style={{ width: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
    <span style={{ width: 3, height: 26, background: 'var(--osd-accent)' }} />
    <span style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.35, textAlign: 'center' }}>{name}</span>
    <span style={{ fontSize: 26, lineHeight: 1.45, textAlign: 'center' }}>{who}</span>
    <span style={{ fontSize: 23, lineHeight: 1.5, color: c.muted, textAlign: 'center' }}>{eg}</span>
  </div>
);




const Corner = ({ pos, children }: { pos: CSSProperties; children: ReactNode }) => (
  <div style={{ position: 'absolute', ...pos }}>
    <Pill size={26}>{children}</Pill>
  </div>
);


const EraRow = ({ field, before, after, tag }: { field: string; before: ReactNode; after: ReactNode; tag?: string }) => (
  <TRow cols="200px 1fr 1fr">
    <div style={{ fontSize: 28, fontWeight: 700 }}>
      {field}
      {tag ? (
        <div style={{ marginTop: 8 }}>
          <Pill size={18} tone="muted">
            {tag}
          </Pill>
        </div>
      ) : null}
    </div>
    <div style={{ fontSize: 28, color: c.muted }}>{before}</div>
    <div style={{ fontSize: 28, fontWeight: 600 }}>{after}</div>
  </TRow>
);

const TrackCell = ({ children, tone = 'cyan', strong = false }: { children: ReactNode; tone?: Tone; strong?: boolean }) => (
  <div style={{ position: 'relative', paddingTop: 18 }}>
    <span
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 14,
        height: 14,
        borderRadius: 999,
        background: tone === 'amber' ? c.amber : tone === 'muted' ? c.dim : 'var(--osd-accent)',
        boxShadow: '0 0 0 5px var(--osd-bg)',
      }}
    />
    <div
      style={{
        marginTop: 12,
        fontSize: strong ? 32 : 25,
        fontWeight: strong ? 900 : 400,
        lineHeight: 1.4,
        color: tone === 'amber' ? c.amber : tone === 'muted' ? c.muted : undefined,
      }}
    >
      {children}
    </div>
  </div>
);

const TrackRow = ({ label, sub, children, muted = false }: { label: string; sub?: string; children: ReactNode; muted?: boolean }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr 1fr', columnGap: 32, position: 'relative' }}>
    <div style={{ position: 'absolute', left: 212, right: 0, top: 6, height: 2, background: muted ? c.hair : c.line }} />
    <div style={{ paddingTop: 10 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: muted ? c.muted : 'var(--osd-accent)' }}>{label}</div>
      {sub ? <div style={{ fontSize: 20, color: c.dim, marginTop: 2 }}>{sub}</div> : null}
    </div>
    {children}
  </div>
);

const LessonQuote = ({ label, children }: { label: string; children: ReactNode }) => (
  <div style={{ borderLeft: '4px solid var(--osd-accent)', padding: '4px 0 4px 28px' }}>
    <Label>{label}</Label>
    <div style={{ marginTop: 10 }}>{children}</div>
  </div>
);

const BitterLesson: Page = () => (
  <Frame title="The Bitter Lesson：模型變強，補能力的控制就該放寬">
    <LessonQuote label="原理 · RICH SUTTON · 2019（意譯）">
      <p style={{ fontSize: 34, lineHeight: 1.4, margin: 0 }}>「算力越多就越強的方法，終究<b>勝過人寫進去的知識</b>。」</p>
      <p style={{ fontSize: 26, lineHeight: 1.5, margin: '8px 0 0' }}>
        放到 Agent：<Hi>模型變強了，替它補的控制就該放寬；不放寬，就從幫手變成阻礙。</Hi>
      </p>
    </LessonQuote>
    <p style={{ fontSize: 24, letterSpacing: '0.04em', color: c.muted, margin: '36px 0 14px' }}>實例：Lance Martin 的 Open Deep Research</p>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: 40, marginBottom: 10 }}>
      <div style={{ fontFamily: mono, fontSize: 22, color: c.muted }}>2024 年底</div>
      <div style={{ fontFamily: mono, fontSize: 22, color: c.muted }}>2025 年初</div>
      <div style={{ fontFamily: mono, fontSize: 22, color: c.muted }}>改寫兩次後</div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: 40, position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 6, height: 2, background: c.line }} />
      <TrackCell>
        <div style={{ fontSize: 23, fontWeight: 400, color: c.muted, marginBottom: 6 }}>模型：工具呼叫還不可靠</div>
        <div style={{ fontSize: 32, fontWeight: 900 }}>固定分工流程</div>
        <div style={{ fontSize: 22, fontWeight: 400, color: c.muted, marginTop: 4 }}>
          先拆章節、分頭寫、再合併 <Pill size={18}>補能力</Pill>
        </div>
      </TrackCell>
      <TrackCell tone="amber">
        <div style={{ fontSize: 23, fontWeight: 400, color: c.muted, marginBottom: 6 }}>模型：工具呼叫變可靠了</div>
        <div style={{ fontSize: 32, fontWeight: 900 }}>結構反而礙事</div>
        <div style={{ fontSize: 22, fontWeight: 400, color: c.muted, marginTop: 4 }}>固定流程用不了新工具</div>
      </TrackCell>
      <TrackCell>
        <div style={{ fontSize: 23, fontWeight: 400, color: c.muted, marginBottom: 6 }}>模型：持續變強</div>
        <div style={{ fontSize: 32, fontWeight: 900 }}>拆掉結構</div>
        <div style={{ fontSize: 22, fontWeight: 400, color: c.muted, marginTop: 4 }}>
          Agent 自己規劃研究，
          <br />
          排進 Deep Research Bench 前十
        </div>
      </TrackCell>
    </div>
    <div style={{ marginTop: 36 }}>
      <LessonQuote label="LANCE MARTIN · 他自己的三個教訓（意譯）">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['1', '看清楚設計裡，假設了模型做不到什麼'],
            ['2', '模型進步時，重新檢查這些假設'],
            ['3', '讓結構容易拆掉'],
          ].map(([no, t]) => (
            <div key={no} style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
              <span style={{ fontFamily: mono, fontSize: 26, fontWeight: 700, color: 'var(--osd-accent)', width: 22 }}>{no}.</span>
              <span style={{ fontSize: 28, lineHeight: 1.45 }}>{t}</span>
            </div>
          ))}
        </div>
      </LessonQuote>
    </div>
  </Frame>
);

const Milestone = ({ when, title, desc, tag, warn = false }: { when: string; title: string; desc: string; tag?: string; warn?: boolean }) => (
  <div style={{ width: 528, boxSizing: 'border-box', borderTop: '3px solid var(--osd-accent)', paddingTop: 22 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <span style={{ fontFamily: mono, fontSize: 24, letterSpacing: '0.08em', color: 'var(--osd-accent)' }}>{when}</span>
      {tag ? <Pill size={20}>{tag}</Pill> : null}
    </div>
    <p style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.3, margin: '10px 0 0', color: warn ? c.amber : undefined }}>{title}</p>
    <p style={{ fontSize: 26, lineHeight: 1.5, color: c.muted, margin: '10px 0 0' }}>{desc}</p>
  </div>
);

const Lesson = ({ no, text }: { no: string; text: string }) => (
  <div
    style={{
      width: 528,
      boxSizing: 'border-box',
      display: 'flex',
      gap: 16,
      alignItems: 'baseline',
      border: `1.5px solid ${c.line}`,
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '18px 24px',
    }}
  >
    <span style={{ fontFamily: mono, fontSize: 24, color: 'var(--osd-accent)' }}>{no}</span>
    <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.4 }}>{text}</span>
  </div>
);

const Stage = ({ when, title, desc, tag, warn = false }: { when: string; title: string; desc: ReactNode; tag?: string; warn?: boolean }) => (
  <div style={{ width: 500, display: 'flex', flexDirection: 'column', gap: 10 }}>
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: 999,
        background: warn ? c.amber : 'var(--osd-accent)',
        boxShadow: '0 0 0 6px var(--osd-bg)',
        position: 'relative',
      }}
    />
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
      <span style={{ fontFamily: mono, fontSize: 26, letterSpacing: '0.06em', color: c.muted }}>{when}</span>
      {tag ? <Pill size={20}>{tag}</Pill> : null}
    </div>
    <p style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.3, margin: 0, color: warn ? c.amber : undefined }}>{title}</p>
    <p style={{ fontSize: 28, lineHeight: 1.6, margin: 0 }}>{desc}</p>
  </div>
);

const LoopBox = ({ x, y, text }: { x: number; y: number; text: string }) => (
  <g>
    <rect
      x={x - 125}
      y={y - 38}
      width={250}
      height={76}
      rx={8}
      style={{ fill: c.panel, stroke: 'var(--osd-accent)', strokeWidth: 2 }}
    />
    <text
      x={x}
      y={y + 9}
      textAnchor="middle"
      style={{ fill: 'var(--osd-text)', fontSize: 25, fontWeight: 700, fontFamily: 'var(--osd-font-body)' }}
    >
      {text}
    </text>
  </g>
);

const LoopDiagram = ({ w = 680 }: { w?: number }) => (
  <svg width={w} height={(w * 540) / 680} viewBox="0 0 680 540" aria-label="Agent Loop 示意圖">
    <defs>
      <marker id="osd-ah-loop" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" style={{ fill: 'var(--osd-accent)' }} />
      </marker>
    </defs>
    <path d="M455,116 A200,200 0 0 1 538,308" markerEnd="url(#osd-ah-loop)" style={{ fill: 'none', stroke: 'var(--osd-accent)', strokeWidth: 2.5 }} />
    <path d="M408,468 A200,200 0 0 1 272,468" markerEnd="url(#osd-ah-loop)" style={{ fill: 'none', stroke: 'var(--osd-accent)', strokeWidth: 2.5 }} />
    <path d="M142,308 A200,200 0 0 1 225,116" markerEnd="url(#osd-ah-loop)" style={{ fill: 'none', stroke: 'var(--osd-accent)', strokeWidth: 2.5 }} />
    <LoopBox x={340} y={80} text="模型：決定下一步" />
    <LoopBox x={513} y={380} text="Harness：執行" />
    <LoopBox x={167} y={380} text="結果回到模型" />
    <text x={340} y={262} textAnchor="middle" style={{ fill: c.muted, fontSize: 26, fontFamily: 'var(--osd-font-body)' }}>
      直到完成，
    </text>
    <text x={340} y={300} textAnchor="middle" style={{ fill: c.muted, fontSize: 26, fontFamily: 'var(--osd-font-body)' }}>
      或停下來問人
    </text>
  </svg>
);

const Example = ({ title, steps }: { title: string; steps: ReactNode }) => (
  <Panel style={{ width: 880 }}>
    <Label>{title}</Label>
    <p style={{ fontSize: 30, lineHeight: 1.55, margin: '12px 0 0' }}>{steps}</p>
  </Panel>
);

const TraceRow = ({ n, saw, did, key3 = false }: { n: string; saw: string; did: string; key3?: boolean }) => (
  <TRow cols="70px 1fr 1fr" pad={14} size={28}>
    <div style={{ fontFamily: mono, color: c.muted }}>{n}</div>
    <div style={{ fontWeight: key3 ? 800 : 400, color: key3 ? 'var(--osd-accent)' : undefined }}>{saw}</div>
    <div style={{ fontWeight: key3 ? 800 : 400, color: key3 ? 'var(--osd-accent)' : undefined }}>{did}</div>
  </TRow>
);


const ScenarioRow = ({
  name,
  what,
  wf,
  agent,
  lesson,
  tone = 'cyan',
}: {
  name: string;
  what: string;
  wf: string;
  agent: string;
  lesson: string;
  tone?: Tone;
}) => (
  <TRow cols="300px 1fr 1fr 1fr">
    <div>
      <div style={{ fontSize: 28, fontWeight: 800, color: toneColor(tone) }}>{name}</div>
      <div style={{ fontSize: 22, color: c.muted, marginTop: 6 }}>{what}</div>
    </div>
    <div style={{ fontSize: 25 }}>{wf}</div>
    <div style={{ fontSize: 25 }}>{agent}</div>
    <div style={{ fontSize: 25, fontWeight: 700, color: toneColor(tone) }}>{lesson}</div>
  </TRow>
);

const Reason = ({
  name,
  sub,
  tone,
  desc,
  future,
}: {
  name: string;
  sub: string;
  tone: Tone;
  desc: string;
  future: string;
}) => (
  <div
    style={{
      width: 528,
      boxSizing: 'border-box',
      border: `1.5px solid ${toneLine(tone)}`,
      background: tone === 'cyan' ? c.panel : toneSoft(tone),
      borderRadius: 'var(--osd-radius)',
      padding: '28px 32px',
      minHeight: 420,
    }}
  >
    <p style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.25, margin: 0, color: toneColor(tone) }}>{name}</p>
    <div style={{ marginTop: 8 }}>
      <Pill tone={tone}>{sub}</Pill>
    </div>
    <p style={{ fontSize: 29, lineHeight: 1.5, margin: '18px 0 0' }}>{desc}</p>
    <div style={{ height: 1, background: toneLine(tone), margin: '20px 0' }} />
    <p style={{ fontSize: 26, lineHeight: 1.5, color: c.muted, margin: 0 }}>{future}</p>
  </div>
);

const ReasonCard = ({ name, meaning, eg, handle }: { name: string; meaning: ReactNode; eg: ReactNode; handle: ReactNode }) => (
  <div
    style={{
      width: 804,
      boxSizing: 'border-box',
      border: `1.5px solid ${c.line}`,
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '32px 40px',
      minHeight: 400,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <p style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.25, margin: 0 }}>{name}</p>
    <p style={{ fontSize: 29, lineHeight: 1.5, margin: '12px 0 0' }}>{meaning}</p>
    <p style={{ fontSize: 25, lineHeight: 1.5, color: c.muted, margin: '10px 0 18px' }}>例：{eg}</p>
    <p style={{ fontSize: 27, lineHeight: 1.5, margin: 'auto 0 0', paddingTop: 18, borderTop: `1px solid ${c.hair}` }}>{handle}</p>
  </div>
);

const ThreeReasons: Page = () => (
  <Frame title="每一個控制，先問它為什麼存在">
    <div style={{ display: 'flex', gap: 32 }}>
      <Steps>
        <Step>
          <ReasonCard
            name="守要求"
            meaning="工作本身的規定"
            eg={<>deny 規則擋 rm -rf；<br />模型寫的程式不能在 prod 跑</>}
            handle={
              <>
                一直緊：模型再強都需要 → <b style={{ color: 'var(--osd-accent)' }}>做成強制</b>
              </>
            }
          />
        </Step>
        <Step>
          <ReasonCard
            name="補能力"
            meaning="替模型做它還做不到的判斷"
            eg={<>每個動作都問人；模型會判斷<br />危險了，就換成 auto mode</>}
            handle={
              <>
                暫時緊：先收緊、標記理由；<b>模型變強就放寬</b>
              </>
            }
          />
        </Step>
      </Steps>
    </div>
    <p style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.5, margin: '26px 0 0' }}>
      補能力的控制過期了，就會變成<span style={{ color: c.amber, fontWeight: 800 }}>限制</span>；模型變強時，最先放寬的就是它。
    </p>
  </Frame>
);

const NodeRow = ({ node, reason, tone, after }: { node: string; reason: string; tone: Tone; after: string }) => (
  <TRow cols="360px 180px 1fr" pad={24} size={28}>
    <div style={{ fontWeight: 700 }}>{node}</div>
    <div>
      <Pill tone={tone}>{reason}</Pill>
    </div>
    <div style={{ color: tone === 'amber' ? 'var(--osd-text)' : c.muted }}>{after}</div>
  </TRow>
);

const FlowRow = ({ node, reason, how }: { node: string; reason: string; how: ReactNode }) => (
  <TRow cols="380px 160px 1fr" pad={22} size={28}>
    <div style={{ fontWeight: 700 }}>{node}</div>
    <div>
      <Pill size={24}>{reason}</Pill>
    </div>
    <div>{how}</div>
  </TRow>
);

const Researcher = ({
  who,
  idea,
  text,
  pill,
  tone,
}: {
  who: string;
  idea: string;
  text: string;
  pill: string;
  tone: Tone;
}) => (
  <div
    style={{
      width: 806,
      boxSizing: 'border-box',
      border: `1.5px solid ${toneLine(tone)}`,
      background: tone === 'cyan' ? c.panel : toneSoft(tone),
      borderRadius: 'var(--osd-radius)',
      padding: '26px 32px',
    }}
  >
    <Label tone={tone}>{who}</Label>
    <p style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.35, margin: '12px 0 0' }}>{idea}</p>
    <p style={{ fontSize: 28, lineHeight: 1.5, color: c.muted, margin: '10px 0 16px' }}>{text}</p>
    <Pill tone={tone}>{pill}</Pill>
  </div>
);

const Arrange = ({ from, to }: { from: string; to: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 38, lineHeight: 1.4 }}>
    <span style={{ fontWeight: 800, width: 220 }}>{from}</span>
    <span style={{ fontFamily: mono, color: c.dim }}>→</span>
    <span>{to}</span>
  </div>
);

const RecapCard = ({ k, v, children }: { k: string; v: string; children: ReactNode }) => (
  <Panel style={{ flex: 1, padding: '34px 40px 40px' }}>
    <p style={{ fontSize: 48, fontWeight: 900, color: 'var(--osd-accent)', margin: 0 }}>{k}</p>
    <p style={{ fontSize: 30, color: c.muted, margin: '8px 0 36px' }}>{v}</p>
    {children}
  </Panel>
);

const StageTag = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      fontSize: 30,
      fontWeight: 800,
      padding: '10px 18px',
      border: `1.5px solid ${c.line}`,
      borderRadius: 'var(--osd-radius)',
      background: c.mutedSoft,
    }}
  >
    {children}
  </span>
);

const SplitRow = ({ k, model, harness, head = false }: { k: string; model: ReactNode; harness: ReactNode; head?: boolean }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '200px 1fr 1fr',
      borderBottom: `1px solid ${head ? c.line : c.hair}`,
      fontSize: head ? 20 : 26,
      lineHeight: 1.45,
    }}
  >
    <div style={{ padding: head ? '0 0 10px' : '11px 0', fontWeight: 900, fontSize: head ? 20 : 28 }}>{k}</div>
    <div
      style={{
        padding: head ? '0 20px 10px' : '11px 20px',
        background: head ? undefined : c.mutedSoft,
        color: head ? c.muted : undefined,
        fontFamily: head ? mono : undefined,
        letterSpacing: head ? '0.12em' : undefined,
      }}
    >
      {model}
    </div>
    <div
      style={{
        padding: head ? '0 20px 10px' : '11px 20px',
        borderLeft: head ? undefined : '3px solid var(--osd-accent)',
        color: head ? 'var(--osd-accent)' : undefined,
        fontFamily: head ? mono : undefined,
        letterSpacing: head ? '0.12em' : undefined,
      }}
    >
      {harness}
    </div>
  </div>
);

const Part1Close: Page = () => (
  <Close
    statement={<span style={{ fontSize: 60 }}>每一格都是判斷與控制的分界；<Hi>這條線，正在移動</Hi>。</span>}
    next="第二部分：判斷"
    bridge={
      <>
        <p style={{ fontSize: 30, color: c.muted, margin: 0 }}>這些都是別人做好的 Harness。</p>
        <p style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.5, margin: '8px 0 0' }}>換我們提供工具時，每個控制要不要做、做多緊？</p>
      </>
    }
  >
    <div style={{ marginTop: 36 }}>
      <SplitRow head k="" model="模型判斷" harness="HARNESS 控制" />
      <SplitRow k="資訊" model="什麼時候展開、讀哪個檔" harness="什麼一直放著、什麼只放索引" />
      <SplitRow k="把關" model="送出什麼動作、危不危險" harness="擋、問、放行；做錯了能退到哪裡" />
      <SplitRow k="行動" model="用哪個工具、交給哪個 Agent" harness="有哪些工具、能接哪些 Agent、在哪裡執行" />
      <SplitRow k="狀態・驗收" model="記什麼、什麼時候說完成" harness="什麼一定留下、什麼才算完成" />
    </div>
  </Close>
);

// ===== Part 1 (rebuilt): Harness components =====

const SourceNote = ({ children }: { children: ReactNode }) => (
  <p style={{ fontSize: 20, lineHeight: 1.4, color: c.dim, margin: '22px 0 0' }}>{children}</p>
);

const JudgeBand = ({ model, harness }: { model: ReactNode; harness: ReactNode }) => (
  <div
    style={{
      display: 'flex',
      border: `1.5px solid ${c.line}`,
      borderRadius: 'var(--osd-radius)',
      overflow: 'hidden',
      background: c.panel,
    }}
  >
    <div style={{ flex: 1, padding: '16px 28px', background: c.mutedSoft }}>
      <div style={{ fontFamily: mono, fontSize: 20, letterSpacing: '0.12em', color: c.muted }}>模型判斷</div>
      <div style={{ fontSize: 27, lineHeight: 1.45, marginTop: 6 }}>{model}</div>
    </div>
    <div style={{ flex: 1, padding: '16px 28px', borderLeft: '3px solid var(--osd-accent)' }}>
      <div style={{ fontFamily: mono, fontSize: 20, letterSpacing: '0.12em', color: 'var(--osd-accent)' }}>HARNESS 控制</div>
      <div style={{ fontSize: 27, lineHeight: 1.45, marginTop: 6 }}>{harness}</div>
    </div>
  </div>
);

const StripBox = ({ who, text, pill, model = false, w = 210 }: { who: string; text: ReactNode; pill: string; model?: boolean; w?: number }) => (
  <div
    style={{
      ...(model ? { width: w, flexShrink: 0 } : { flex: 1, minWidth: 0 }),
      height: 178,
      boxSizing: 'border-box',
      border: `1.5px solid ${model ? c.hair : c.line}`,
      background: model ? c.mutedSoft : c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '12px 18px',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <span style={{ fontFamily: mono, fontSize: 18, letterSpacing: '0.12em', color: model ? c.muted : 'var(--osd-accent)' }}>{who}</span>
    <p style={{ fontSize: 23, lineHeight: 1.35, margin: '4px 0 0', flex: 1 }}>{text}</p>
    <div>
      <Pill tone={model ? 'muted' : 'cyan'} size={19}>{pill}</Pill>
    </div>
  </div>
);

const K = ({ children }: { children: ReactNode }) => (
  <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>{children}</span>
);

const MAP_COLS = '160px 1fr 36px 230px 36px 1fr 36px 1fr 36px 1fr';
const MAP_HAIR = `1px solid ${c.hair}`;
const B = ({ children }: { children: ReactNode }) => <b style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{children}</b>;

const MapLabel = ({ row, navy = false, big = false, children }: { row: number; navy?: boolean; big?: boolean; children: ReactNode }) => (
  <div
    style={{
      gridColumn: 1,
      gridRow: row,
      borderTop: MAP_HAIR,
      padding: big ? '30px 8px 0 0' : '12px 8px 0 0',
      fontSize: big ? 25 : 21,
      fontWeight: 800,
      lineHeight: 1.4,
      color: navy ? 'var(--osd-accent)' : c.muted,
    }}
  >
    {children}
  </div>
);

const MapRowCells = ({
  row,
  cols,
  render,
}: {
  row: number;
  cols: ReactNode[];
  render: (n: ReactNode, i: number) => ReactNode;
}) => (
  <>
    {[0, 2, 3, 4].map((gc, i) => {
      const col = [2, 6, 8, 10][i];
      return (
        <div
          key={`c${row}-${col}`}
          style={{
            gridColumn: col,
            gridRow: row,
            borderTop: MAP_HAIR,
            borderLeft: `2px solid rgba(10, 26, 51, 0.22)`,
            padding: '28px 14px 28px',
            textWrap: 'pretty',
          }}
        >
          {render(cols[i], i)}
        </div>
      );
    })}
    {[3, 5, 7, 9].map((col) => (
      <div key={`g${row}-${col}`} style={{ gridColumn: col, gridRow: row, borderTop: MAP_HAIR }} />
    ))}
  </>
);

const Fix = ({ name, children }: { name: string; children: ReactNode }) => (
  <p style={{ margin: '0 0 6px', fontSize: 21, lineHeight: 1.4 }}>
    <span style={{ color: 'var(--osd-accent)', fontWeight: 800, whiteSpace: 'nowrap' }}>{name}</span>：<span style={{ whiteSpace: 'nowrap' }}>{children}</span>
  </p>
);

const MapGap = () => <div style={{ width: 40, flexShrink: 0 }} />;

const LOOP_NODES: { name: string; verb: string; v: string; deg: number; model?: boolean }[] = [
  { name: '資訊', verb: '看', v: '準備模型這一輪要看的', deg: 198 },
  { name: '模型判斷', verb: '想', v: '只輸出下一步要做什麼', deg: 270, model: true },
  { name: '把關', verb: '擋', v: '擋下不該做的動作', deg: 342 },
  { name: '行動', verb: '做', v: '真正去執行', deg: 54 },
  { name: '狀態・驗收', verb: '記', v: '記住結果、檢查做完沒', deg: 126 },
];

const HarnessMap: Page = () => {
  const W = 1640, H = 660, cx = 820, cy = 330, rx = 610, ry = 255;
  const pt = (d: number) => [cx + rx * Math.cos((d * Math.PI) / 180), cy + ry * Math.sin((d * Math.PI) / 180)];
  const mids = LOOP_NODES.map((n) => n.deg + 36);
  return (
    <Frame title="模型只負責想；看、擋、做、記，都靠 Harness">
      <div style={{ position: 'relative', width: W, height: H, marginTop: 10 }}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={c.line} strokeWidth={2} />
          {mids.map((d) => {
            const [x, y] = pt(d);
            const r = (d * Math.PI) / 180;
            const ang = (Math.atan2(ry * Math.cos(r), -rx * Math.sin(r)) * 180) / Math.PI;
            return <path key={d} d="M -11 -9 L 9 0 L -11 9 z" fill={c.muted} transform={`translate(${x} ${y}) rotate(${ang})`} />;
          })}
        </svg>
        {LOOP_NODES.map((n) => {
          const [x, y] = pt(n.deg);
          return (
            <div
              key={n.name}
              style={{
                position: 'absolute',
                left: x - 160,
                top: y - 68,
                width: 320,
                height: 136,
                boxSizing: 'border-box',
                padding: '12px 24px',
                borderRadius: 'var(--osd-radius)',
                border: n.model ? `2px dashed ${c.line}` : '2px solid var(--osd-accent)',
                background: n.model ? '#eef0f4' : c.panel,
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: mono, fontSize: 18, letterSpacing: '0.14em', color: n.model ? c.muted : 'var(--osd-accent)' }}>{n.model ? '模型' : 'HARNESS'}</div>
              <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.25, color: n.model ? c.muted : undefined }}>{n.name}</div>
              <div style={{ fontSize: 22, color: c.muted, marginTop: 2, whiteSpace: 'nowrap' }}><b style={{ color: n.model ? c.muted : 'var(--osd-accent)' }}>{n.verb}</b>：{n.v}</div>
            </div>
          );
        })}
      </div>
      <DetailLinks items={[{ label: '最小的 Harness', to: MinHarnessPage }]} />
    </Frame>
  );
};

const RouteCard = ({ term, who, good, cost }: { term: string; who: ReactNode; good: string; cost: string }) => (
  <Panel style={{ flex: 1, padding: '24px 36px' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
      <span style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.1 }}>{term}</span>
      <span style={{ fontSize: 28 }}>{who}</span>
    </div>
    <p style={{ fontSize: 23, lineHeight: 1.6, color: c.muted, margin: '12px 0 0' }}>
      擅長：{good}
      <br />
      代價：{cost}
    </p>
  </Panel>
);

const RouteSpectrum: Page = () => (
  <Frame stage="模型判斷" title="模型判斷：越往右，越多決定交給模型">
    <div style={{ display: 'flex', gap: 40 }}>
      <RouteCard term="Workflow" who="設計者事先排好路線" good="可預期、好測、出錯好查" cost="沒畫到的狀況，只能轉人工" />
      <RouteCard term="Loop" who="模型每一輪決定下一步" good="預想不到的狀況" cost="每次路徑不同，要靠把關與驗收" />
    </div>
    <div
      style={{
        height: 26,
        marginTop: 44,
        borderRadius: 13,
        background: 'linear-gradient(90deg, rgba(10, 26, 51, 0.06), rgba(10, 26, 51, 0.35) 45%, #0a1a33)',
        border: `1px solid ${c.hair}`,
      }}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <SpecStop name="固定流程" who="設計者決定每一步" eg="例：固定格式的報表產生" />
      <SpecStop name="流程中讓模型選分支" who={<>設計者排路線，<br />模型選岔路</>} eg="例：我們用 LangGraph 建的 graph" />
      <SpecStop name="Loop ＋ 強制檢查點" who={<>模型決定路線，<br />設計者設關卡</>} eg={<>例：Claude Code 修測試，<br />改檔前要確認</>} />
      <SpecStop name="開放的 Loop" who={<>模型決定一切，<br />做到夠了為止</>} eg={<>例：Claude Code 開<br />bypassPermissions 模式：<br />權限全開、不再問人</>} />
    </div>
    <p style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.5, margin: '40px 0 0' }}>
      越往右，越能應付沒想到的狀況；<Hi>代價是要靠把關與驗收</Hi>。
    </p>
  </Frame>
);

// ===== Element pages (Part 1 main line) =====

const INFO_ROWS: { label: string; sub?: string; idx: ReactNode; full: ReactNode }[] = [
  { label: 'Skill', idx: <>每個 Skill 的<K>一行描述</K></>, full: <K>Skill 全文</K> },
  { label: '工具', idx: <>MCP 工具<K>只列名稱</K></>, full: <K>完整定義（schema）</K> },
  { label: '規則', idx: <>工作目錄以上每一層的 <K>CLAUDE.md／AGENTS.md</K></>, full: <>子目錄的 <K>CLAUDE.md</K></> },
  { label: '記憶', sub: '跨 session 的狀態', idx: <>auto memory 的目錄<K>（MEMORY.md）</K></>, full: <K>每一則記憶的內容</K> },
];

const InfoPage: Page = () => (
  <Frame stage="資訊" title="資訊：只放索引，用到才載入">
    <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr 120px 1fr', gridTemplateRows: '80px repeat(4, 94px)', marginTop: 40 }}>
      <div style={{ gridColumn: 1, gridRow: 1, display: 'flex', alignItems: 'center', fontSize: 20, color: c.muted, whiteSpace: 'nowrap' }}>以 Claude Code 為例</div>
      <div
        style={{
          gridColumn: 2,
          gridRow: '1 / span 5',
          background: c.panel,
          border: '2px solid var(--osd-accent)',
          borderRadius: 'var(--osd-radius)',
        }}
      />
      <div
        style={{
          gridColumn: 4,
          gridRow: '1 / span 5',
          background: c.mutedSoft,
          border: `1.5px solid ${c.hair}`,
          borderRadius: 'var(--osd-radius)',
        }}
      />
      <div style={{ gridColumn: 2, gridRow: 1, display: 'flex', alignItems: 'center', gap: 16, padding: '0 34px' }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--osd-accent)', whiteSpace: 'nowrap' }}>一直放著</span>
        <span style={{ fontSize: 24, color: c.muted, whiteSpace: 'nowrap' }}>只有索引</span>
      </div>
      <div style={{ gridColumn: 3, gridRow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      </div>
      <div style={{ gridColumn: 4, gridRow: 1, display: 'flex', alignItems: 'center', gap: 16, padding: '0 34px' }}>
        <span style={{ fontSize: 32, fontWeight: 800, whiteSpace: 'nowrap' }}>完整內容</span>
        <span style={{ fontSize: 24, color: c.muted, whiteSpace: 'nowrap' }}>模型決定要用才載入</span>
      </div>
      {INFO_ROWS.map((r, i) => {
        const row = i + 2;
        const cell: CSSProperties = { gridRow: row, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderTop: `1px solid ${c.hair}` };
        return (
          <Fragment key={r.label}>
            <div style={{ ...cell, gridColumn: 1, borderTop: `1px solid ${c.hair}` }}>
              <span style={{ fontSize: 28, fontWeight: 800 }}>{r.label}</span>
              {r.sub ? <span style={{ fontSize: 20, color: c.muted, marginTop: 4, whiteSpace: 'nowrap' }}>{r.sub}</span> : null}
            </div>
            <div style={{ ...cell, gridColumn: 2, margin: '0 2px', padding: '0 32px', fontSize: 26, lineHeight: 1.45 }}><div>{r.idx}</div></div>
            <div style={{ ...cell, gridColumn: 3, alignItems: 'center', fontSize: 34, color: c.dim, borderTop: 'none' }}>→</div>
            <div style={{ ...cell, gridColumn: 4, margin: '0 2px', padding: '0 32px', fontSize: 26, lineHeight: 1.45 }}><div>{r.full}</div></div>
          </Fragment>
        );
      })}
    </div>
    <p style={{ fontSize: 26, lineHeight: 1.5, margin: '24px 0 0' }}>
      左欄放得越多，context 越擠，規則也<b>越容易被忽略</b>。
    </p>
    <div style={{ marginTop: 24 }}>
      <JudgeBand model="什麼時候展開、讀哪個檔" harness={<>什麼一直放著、什麼<b>只放索引</b></>} />
    </div>
    <DetailLinks items={[{ label: 'Context 組裝', to: ContextPage }]} />
  </Frame>
);

const GateRowItem = ({ k, children }: { k: string; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 30, padding: '22px 0', borderBottom: `1px solid ${c.hair}` }}>
    <div style={{ width: 230, flexShrink: 0, fontSize: 28, fontWeight: 800, color: 'var(--osd-accent)' }}>{k}</div>
    <div style={{ flex: 1, fontSize: 25, lineHeight: 1.6 }}>{children}</div>
  </div>
);

const GatePage: Page = () => (
  <Frame stage="把關" title="把關：能退回的才放寬，退不回的才擋">
    <div style={{ borderTop: `1.5px solid ${c.line}` }}>
      <GateRowItem k="引導與強制">
        規則寫進 context 是引導，照不照做由模型判斷；檢查在模型之外是強制，<b>越靠近執行越難繞過</b>：<K>Hook → 權限規則 → 沙箱。</K>
      </GateRowItem>
      <GateRowItem k="能不能退回">
        做錯了退得回來（例如編輯前自動存檔），就能放寬；<b>退不回的</b>，例如部署、寄信、資料送出去，才需要擋。
      </GateRowItem>
      <GateRowItem k="交給模型把關">
        由分類器判斷危不危險，例如 Claude Code 的 auto mode；但工作上明確的規定，<b>仍要寫成強制</b>。
      </GateRowItem>
    </div>
    <div style={{ marginTop: 32 }}>
      <JudgeBand model="這一步要不要做、危不危險" harness={<>哪些<b>一定擋</b>、哪些要問、做錯能退到哪</>} />
    </div>
    <DetailLinks items={[{ label: '引導與強制', to: GateLayers }, { label: '復原', to: RecoveryPage }]} />
  </Frame>
);

const ActCell = ({ name, line, level }: { name: string; line: string; level: 0 | 1 | 2 | 3 }) => {
  const bg = ['rgba(10, 26, 51, 0.03)', 'rgba(10, 26, 51, 0.09)', 'rgba(10, 26, 51, 0.16)', 'var(--osd-accent)'][level];
  const bar = [4, 8, 12, 0][level];
  const solid = level === 3;
  return (
    <div
      style={{
        boxSizing: 'border-box',
        border: `1.5px solid ${solid ? 'var(--osd-accent)' : c.line}`,
        borderLeft: solid ? '1.5px solid var(--osd-accent)' : `${bar}px solid var(--osd-accent)`,
        background: bg,
        color: solid ? '#ffffff' : undefined,
        borderRadius: 'var(--osd-radius)',
        padding: '20px 30px',
        height: 132,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.3 }}>{name}</div>
      <div style={{ fontSize: 22, lineHeight: 1.45, marginTop: 6, color: solid ? 'rgba(255,255,255,0.88)' : c.muted }}>{line}</div>
    </div>
  );
};

const ActHead = ({ children }: { children: ReactNode }) => (
  <div style={{ fontFamily: 'var(--osd-font-body)', fontSize: 24, fontWeight: 800, color: c.muted, padding: '0 4px' }}>{children}</div>
);

const ActionPage: Page = () => (
  <Frame stage="行動" title="行動：從工具到 Agent，判斷交出去越來越多">
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', columnGap: 24, rowGap: 16, alignItems: 'center' }}>
      <div />
      <ActHead>Harness 自己的</ActHead>
      <ActHead>從外面接進來</ActHead>
      <ActHead>工具</ActHead>
      <ActCell name="工具呼叫" line="模型決定呼叫哪個，Harness 執行" level={0} />
      <ActCell name="MCP" line="外部的工具和資料，判斷仍在我們的模型" level={1} />
      <ActHead>Agent</ActHead>
      <ActCell name="子 Agent" line="交出一段探索，拿回一份摘要" level={2} />
      <ActCell name="A2A" line="整段判斷交給別人的 Agent" level={3} />
    </div>
    <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--osd-accent)', textAlign: 'right', margin: '14px 0 0' }}>
      交出去的判斷越來越多 ↘
    </p>
    <div style={{ marginTop: 20 }}>
      <JudgeBand model="呼叫哪個工具、交給哪個 Agent" harness={<><b>有哪些</b>工具、能接哪些 Agent、在哪裡執行</>} />
    </div>
    <DetailLinks
      items={[
        { label: 'Tool calling', to: ToolPage },
        { label: 'Subagent', to: SubagentPage },
        { label: 'MCP', to: McpPage },
        { label: 'A2A', to: A2aPage },
        { label: 'Agent Card', to: AgentCardPage },
      ]}
    />
  </Frame>
);

const StateCard = ({ name, when, strong = false, children }: { name: string; when: string; strong?: boolean; children: ReactNode }) => (
  <Panel
    style={{
      flex: 1,
      padding: '24px 30px 26px',
      border: strong ? '2px solid var(--osd-accent)' : `1.5px solid ${c.line}`,
      background: c.panel,
    }}
  >
    <div style={{ fontSize: 22, color: c.muted }}>{when}</div>
    <div style={{ fontSize: 30, fontWeight: 800, marginTop: 4, color: strong ? 'var(--osd-accent)' : undefined }}>{name}</div>
    <p style={{ fontSize: 24, lineHeight: 1.6, margin: '12px 0 0' }}>{children}</p>
  </Panel>
);

const StateGroup = ({ k, v, flex, children }: { k: string; v: string; flex: number; children: ReactNode }) => (
  <div style={{ flex, display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, paddingBottom: 10, borderBottom: '3px solid var(--osd-text)', marginBottom: 18 }}>
      <span style={{ fontSize: 32, fontWeight: 800 }}>{k}</span>
      <span style={{ fontSize: 24, color: c.muted }}>{v}</span>
    </div>
    <div style={{ flex: 1, display: 'flex', gap: 24, alignItems: 'stretch' }}>{children}</div>
  </div>
);

const StatePage: Page = () => (
  <Frame stage="狀態・驗收" title="狀態・驗收：結束的時候，留下什麼、算不算完成">
    <div style={{ display: 'flex', gap: 40, alignItems: 'stretch' }}>
      <StateGroup k="狀態" v="留下什麼" flex={2}>
        <StateCard when="context 滿了" name="壓縮">
          舊的對話摘要掉。Harness 決定<K><b>哪些一定重新載入</b></K>；對話中交代的規則，<K>可能不見。</K>
        </StateCard>
        <StateCard when="session 結束" name="記憶">
          模型自己記下的筆記，下次開頭由 ① 資訊載入；<b>模型寫的</b>，<K>不能當規則。</K>
        </StateCard>
      </StateGroup>
      <StateGroup k="驗收" v="算不算完成" flex={1}>
        <StateCard when="任務結束" name="完成判定">
          模型不再呼叫工具，就算完成——<b>完成，是模型的判斷</b>。要真的完成，得在結束前<K>加一道檢查</K>，例如<K>自動跑測試。</K>
        </StateCard>
      </StateGroup>
    </div>
    <div style={{ marginTop: 36 }}>
      <JudgeBand model="該記什麼、做完了沒" harness={<><b>哪些一定留下</b>、結束前檢查什麼</>} />
    </div>
    <DetailLinks
      items={[
        { label: 'Compaction', to: CompactPage },
        { label: 'Memory', to: MemoryPage },
        { label: '完成判定', to: VerifyPage },
      ]}
    />
  </Frame>
);

const ListItem = ({ k, v }: { k: ReactNode; v?: ReactNode }) => (
  <div style={{ padding: '10px 0', borderBottom: `1px solid ${c.hair}`, display: 'flex', alignItems: 'baseline', gap: 16 }}>
    <span style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.4 }}>{k}</span>
    {v ? <span style={{ fontSize: 21, lineHeight: 1.4, color: c.muted }}>{v}</span> : null}
  </div>
);

const ListPanel = ({ label, strong = false, children, style }: { label: ReactNode; strong?: boolean; children: ReactNode; style?: CSSProperties }) => (
  <div
    style={{
      flex: 1,
      boxSizing: 'border-box',
      border: strong ? '2px solid var(--osd-accent)' : `1.5px solid ${c.line}`,
      background: strong ? c.panel : c.mutedSoft,
      borderRadius: 'var(--osd-radius)',
      padding: '20px 30px 12px',
      ...style,
    }}
  >
    <div style={{ fontSize: 26, fontWeight: 800, color: strong ? 'var(--osd-accent)' : c.muted, paddingBottom: 6 }}>{label}</div>
    {children}
  </div>
);

const MIN_ROWS: { pill: string; muted?: boolean; has: string; no: string }[] = [
  { pill: '資訊', has: '每一層的 AGENTS.md，全部放進去', no: '用到才載入、Skill、記憶' },
  { pill: '模型判斷', muted: true, has: '一個 while 迴圈；模型不再呼叫工具就結束', no: '—' },
  { pill: '把關', has: '只有回合數、花費兩個上限', no: '權限規則、Hook、沙箱、復原' },
  { pill: '行動', has: '四個工具：跑指令、讀檔、寫檔、改檔', no: '子 Agent、MCP、A2A' },
  { pill: '狀態・驗收', has: '太長就摘要，保留最近的對話', no: '跨 session 的記憶、完成前的檢查' },
];

const MinHarnessPage: Page = () => (
  <Frame back={{ to: HarnessMap, label: 'Harness 地圖' }} title="最小的 Harness：一個迴圈、四個工具就能跑">
    <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr 1fr', columnGap: 24 }}>
      <div />
      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--osd-accent)', padding: '0 0 12px 14px' }}>最小版有的</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: c.muted, padding: '0 0 12px 14px' }}>還沒有的</div>
      {MIN_ROWS.map((r) => (
        <Fragment key={r.pill}>
          <div style={{ borderTop: MAP_HAIR, padding: '20px 0', display: 'flex', alignItems: 'center' }}>
            <Pill tone={r.muted ? 'muted' : 'cyan'} size={23}>{r.pill}</Pill>
          </div>
          <div style={{ borderTop: MAP_HAIR, borderLeft: '2px solid rgba(10, 26, 51, 0.22)', padding: '20px 14px', fontSize: 27, lineHeight: 1.5, display: 'flex', alignItems: 'center' }}>{r.has}</div>
          <div style={{ borderTop: MAP_HAIR, borderLeft: `2px solid ${c.hair}`, padding: '20px 14px', fontSize: 27, lineHeight: 1.5, color: c.muted, display: 'flex', alignItems: 'center' }}>{r.no}</div>
        </Fragment>
      ))}
    </div>
    <p style={{ ...p0, fontSize: 24, lineHeight: 1.5, color: c.muted, marginTop: 26 }}>約 90 行 Python，沒有用任何 Agent 框架。</p>
  </Frame>
);

const ContextPage: Page = () => (
  <Frame stage="資訊" scope="以 Claude Code 為例" back={{ to: InfoPage, label: '① 資訊' }} title="Context 組裝：模型看到什麼，由 Harness 決定">
    <div style={{ display: 'flex', gap: 36 }}>
      <ListPanel label="開工前就載入：一直放著" strong>
        <ListItem k="System prompt" />
        <ListItem k="CLAUDE.md／AGENTS.md" v="工作目錄以上的每一層" />
        <ListItem k="Auto memory" v="模型自己記的筆記，前 200 行或 25KB" />
        <ListItem k="每個 Skill 的一行描述" />
        <ListItem k="MCP 工具" v="只列名稱" />
      </ListPanel>
      <ListPanel label="用到才載入：平常只放索引">
        <ListItem k="Skill 全文" v="模型決定要用時" />
        <ListItem k="MCP 工具的完整 schema" v="透過 tool search 找到時" />
        <ListItem k="子目錄的 CLAUDE.md" v="碰到那個目錄的檔案時" />
        <ListItem k="檔案內容" v="模型決定要讀時" />
      </ListPanel>
    </div>
    <div style={{ marginTop: 30 }}>
      <JudgeBand model="什麼時候展開、讀哪個檔、用哪個工具" harness={<>什麼一直放著、什麼<b>只放索引</b></>} />
    </div>
    <p style={{ fontSize: 28, lineHeight: 1.5, margin: '26px 0 0' }}>
      一直放著的越多，context 越擠：官方建議 CLAUDE.md 控制在 200 行以內，<Hi>越長越佔 context，遵守度也越低</Hi>。
    </p>
  </Frame>
);

const FlowCard = ({ no, children, strong = false }: { no: string; children: ReactNode; strong?: boolean }) => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', padding: '9px 0', borderBottom: `1px solid ${c.hair}` }}>
    <span style={{ fontFamily: mono, fontSize: 22, color: 'var(--osd-accent)' }}>{no}</span>
    <span style={{ fontSize: 26, lineHeight: 1.4, fontWeight: strong ? 800 : 400 }}>{children}</span>
  </div>
);

const CallStep = ({ no, who, text, sub, model = false }: { no: string; who: string; text: ReactNode; sub: ReactNode; model?: boolean }) => (
  <div
    style={{
      width: 370,
      boxSizing: 'border-box',
      border: `1.5px solid ${model ? c.hair : c.line}`,
      borderLeft: model ? `1.5px solid ${c.hair}` : '4px solid var(--osd-accent)',
      background: model ? c.mutedSoft : c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '16px 22px',
    }}
  >
    <div style={{ fontFamily: mono, fontSize: 20, letterSpacing: '0.1em', color: model ? c.muted : 'var(--osd-accent)' }}>
      {no} · {who}
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.4, marginTop: 6 }}>{text}</div>
    <div style={{ fontSize: 21, lineHeight: 1.5, color: c.muted, marginTop: 6 }}>{sub}</div>
  </div>
);

const ToolPage: Page = () => (
  <Frame stage="行動" back={{ to: ActionPage, label: '④ 行動' }} title="Tool calling：工具描述就是 prompt">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch' }}>
      <CallStep no="1" who="HARNESS" text="把工具定義放進 context" sub={<>名稱、描述、參數 schema；<br />每一輪都佔 token</>} />
      <StageArrow />
      <CallStep no="2" who="模型" text="輸出 tool_use，然後停下" sub={<>一段 JSON 請求；<br />一次可以並行好幾個</>} model />
      <StageArrow />
      <CallStep no="3" who="HARNESS" text="執行，回傳 tool_result" sub={<>在本機、沙箱或遠端執行；<br />結果太長就截斷</>} />
      <StageArrow />
      <CallStep no="4" who="模型" text="讀結果，決定下一步" sub={<>再呼叫工具，<br />或直接回答</>} model />
    </div>
    <p style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.5, margin: '48px 0 0' }}>
      模型只看描述決定要不要用；<Hi>描述寫不清楚，它就選不對工具</Hi>。
    </p>
    <div style={{ marginTop: 48 }}>
      <JudgeBand model="用哪個工具、填什麼參數" harness={<>有哪些工具、<b>描述怎麼寫</b>、在哪裡執行、結果怎麼回來</>} />
    </div>
  </Frame>
);

const McpSide = ({ name }: { name: string }) => (
  <div
    style={{
      boxSizing: 'border-box',
      border: `1.5px solid ${c.line}`,
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '10px 18px',
      fontSize: 23,
      fontWeight: 700,
      textAlign: 'center',
    }}
  >
    {name}
  </div>
);

const CostRow = ({ cost, fix }: { cost: ReactNode; fix: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1.25fr', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${c.hair}` }}>
    <div style={{ fontSize: 25, lineHeight: 1.45, color: c.muted }}>{cost}</div>
    <div style={{ fontFamily: mono, fontSize: 26, color: c.dim, textAlign: 'center' }}>→</div>
    <div style={{ fontSize: 25, lineHeight: 1.45 }}>{fix}</div>
  </div>
);

const McpPage: Page = () => (
  <Frame stage="行動" back={{ to: ActionPage, label: '④ 行動' }} title="MCP：外部工具接進來，判斷仍在我們的模型">
    <div style={{ display: 'flex', gap: 56, alignItems: 'center' }}>
      <div style={{ width: 600, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginBottom: 12 }}>
          <div style={{ width: 220 }}>
            <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--osd-accent)' }}>MCP CLIENT</div>
            <div style={{ fontSize: 20, lineHeight: 1.4, color: c.muted, marginTop: 4 }}>在 Harness 裡</div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ width: 200 }}>
            <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--osd-accent)' }}>MCP SERVER</div>
            <div style={{ fontSize: 20, lineHeight: 1.4, color: c.muted, marginTop: 4 }}>把外部系統包成工具</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <McpSide name="Claude Code" />
            <McpSide name="OpenCode" />
            <McpSide name="自己的 Agent" />
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ height: 2, background: 'var(--osd-accent)' }} />
            <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: 'var(--osd-accent)', margin: '10px 0' }}>MCP</div>
            <div style={{ height: 2, background: 'var(--osd-accent)' }} />
          </div>
          <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <McpSide name="Jira" />
            <McpSide name="Drive" />
            <McpSide name="內部 DB" />
          </div>
        </div>
        <p style={{ fontSize: 26, lineHeight: 1.5, margin: '24px 0 0' }}>
          外接工具和資料的共同標準：<br />一個 MCP server <b>寫一次</b>，<br />支援 MCP 的 Harness <b>都能接</b>。
        </p>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1.25fr', paddingBottom: 10, borderBottom: `1px solid ${c.line}`, fontSize: 22, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--osd-accent)' }}>
          <div>接多了的代價</div>
          <div />
          <div>Harness 的解法</div>
        </div>
        <CostRow cost="工具定義擠滿 context" fix={<><b>用到才載入</b>：Claude Code 預設只列名稱，<br />透過 tool search 才載入 schema</>} />
        <CostRow cost="每個中間結果都要經過模型" fix={<>讓<b>模型寫程式</b>呼叫工具，<br />中間資料在執行環境裡處理</>} />
        <p style={{ fontSize: 22, lineHeight: 1.5, color: c.muted, margin: '14px 0 0' }}>
          Anthropic 的例子：改成寫程式呼叫後，同一個任務從 15 萬 token 降到 2,000 token。
        </p>
      </div>
    </div>
    <div style={{ marginTop: 36 }}>
      <JudgeBand model="呼叫哪個工具，或寫哪段程式" harness={<>接哪些 server、定義<b>何時載入</b>、程式在哪裡執行</>} />
    </div>
  </Frame>
);

const LADDER_COLS = '200px 330px 560px 1fr';

const Gate = ({ no, when, title, how, who, ours }: { no: string; when: string; title: string; how: ReactNode; who: string; ours: boolean }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '150px 1fr 150px',
      gap: 18,
      alignItems: 'center',
      boxSizing: 'border-box',
      border: `1.5px solid ${c.line}`,
      borderLeft: ours ? '4px solid var(--osd-accent)' : `4px solid ${c.hair}`,
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '12px 20px',
    }}
  >
    <div>
      <div style={{ fontFamily: mono, fontSize: 18, color: c.muted }}>{no} · {when}</div>
      <div style={{ fontSize: 27, fontWeight: 800, marginTop: 2 }}>{title}</div>
    </div>
    <div style={{ fontSize: 23, lineHeight: 1.45 }}>{how}</div>
    <div style={{ textAlign: 'right' }}>
      <span
        style={{
          display: 'inline-block',
          fontSize: 21,
          fontWeight: 700,
          padding: '4px 14px',
          borderRadius: 999,
          border: ours ? '1.5px solid var(--osd-accent)' : `1.5px solid ${c.hair}`,
          color: ours ? 'var(--osd-accent)' : c.muted,
          background: ours ? c.panel : c.mutedSoft,
        }}
      >
        {who}
      </span>
    </div>
  </div>
);

const A2aSide = ({ title, lines, ours }: { title: string; lines: ReactNode; ours: boolean }) => (
  <div
    style={{
      width: 230,
      flexShrink: 0,
      boxSizing: 'border-box',
      border: ours ? '2px solid var(--osd-accent)' : `2px dashed ${c.hair}`,
      background: ours ? c.panel : c.mutedSoft,
      borderRadius: 12,
      padding: '22px 20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: 28, fontWeight: 900, color: ours ? 'var(--osd-accent)' : c.muted }}>{title}</div>
    <div style={{ fontSize: 21, lineHeight: 1.5, color: c.muted, marginTop: 10 }}>{lines}</div>
  </div>
);

const A2aPage: Page = () => (
  <Frame stage="行動" back={{ to: ActionPage, label: '④ 行動' }} title="A2A：判斷整段交給別人的 Agent">
    <p style={{ fontSize: 26, lineHeight: 1.5, color: c.muted, margin: '0 0 22px' }}>
      MCP 接進來的是工具和資料，判斷還在我們的模型；A2A 接進來的是另一個 Agent，中間的判斷在對方。
    </p>
    <div style={{ display: 'flex', gap: 22, alignItems: 'stretch' }}>
      <A2aSide ours title="我們" lines={<>Agent 與 Harness<br />交出工作</>} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Gate no="1" when="出發前" title="交給誰" how={<>讀對方的名片（Agent Card）挑對象；<br />名片可以簽章，細節在 Agent Card</>} who="我們決定" ours />
        <Gate no="2" when="送出時" title="給多少權限" how={<>送出一張工作單（Task），附上身分憑證；<br />對方依自己的規則決定能做什麼</>} who="對方決定" ours={false} />
        <Gate no="3" when="執行中" title="中途的把關" how={<>工作單可能停下來要資料、要授權；<br />破壞性動作前的核准，會丟回我們</>} who="我們決定" ours />
        <Gate no="4" when="回來時" title="怎麼驗收" how={<>工作單結束：完成、失敗、取消或被拒絕；<br />協定不保證結果是對的</>} who="我們決定" ours />
      </div>
      <A2aSide ours={false} title="對方" lines={<>別人的模型<br />＋別人的 Harness<br />過程看不到</>} />
    </div>
    <p style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.5, margin: '24px 0 0' }}>
      <Hi>交給誰、中途誰核准、回來怎麼驗收</Hi>，留在我們這邊。
    </p>
    <div style={{ marginTop: 18 }}>
      <JudgeBand model="交給哪個 Agent、交代什麼；中間的判斷在對方" harness={<>能接哪些 Agent、<b>誰來核准</b>、回來的怎麼驗收</>} />
    </div>
  </Frame>
);

const CARD_ROWS: { t: string; title?: string; who?: string; note?: string; model?: boolean }[] = [
  { t: '{' },
  { t: '  "name": "報表摘要 Agent",' },
  { t: '  "description": "依產品彙整每週報表，標出異常批次",', title: '會做什麼', who: '模型', note: '放進 prompt，決定要不要交出去', model: true },
  { t: '  "skills": [{ "name": "週報摘要", "description": "…", … }],', title: '有哪些能力', who: '模型', note: '每項的名稱和描述也放進 prompt', model: true },
  { t: '  "provider": { "organization": "資料平台組" },' },
  { t: '  "supportedInterfaces": [{ "url": "https://…/a2a", … }],', title: '去哪裡找我', who: 'Harness', note: '連線位置與格式' },
  { t: '  "capabilities": { "streaming": true },', title: '進度怎麼回報', who: 'Harness', note: '能不能即時推送' },
  { t: '  "securitySchemes": { "sso": { "oauth2SecurityScheme": … } },', title: '要什麼身分', who: 'Harness', note: '照這裡設定驗證，例如公司 SSO' },
  { t: '  "signatures": [ … ]', title: '防偽造', who: 'Harness', note: '可以先驗章，再相信內容' },
  { t: '}' },
];

const AgentCardPage: Page = () => (
  <Frame stage="行動" back={{ to: ActionPage, label: '④ 行動' }} title="Agent Card：交出去之前，先讀對方的名片">
    <Label>放在固定網址 /.well-known/agent-card.json（虛構範例）</Label>
    <div style={{ position: 'relative', marginTop: 12 }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 800,
          border: `1.5px solid ${c.line}`,
          background: c.panel,
          borderRadius: 'var(--osd-radius)',
        }}
      />
      <div style={{ position: 'relative', padding: '10px 0' }}>
        {CARD_ROWS.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', minHeight: 33 }}>
            <div
              style={{
                width: 800,
                flexShrink: 0,
                boxSizing: 'border-box',
                padding: '3px 22px 3px 18px',
                borderLeft: r.title ? (r.model ? `4px solid ${c.hair}` : '4px solid var(--osd-accent)') : '4px solid transparent',
                background: r.model ? c.mutedSoft : 'transparent',
              }}
            >
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 18,
                  whiteSpace: 'pre',
                  color: r.title ? (r.model ? c.muted : 'var(--osd-accent)') : c.dim,
                }}
              >
                {r.t}
              </span>
            </div>
            {r.title ? (
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ width: 28, height: 2, background: r.model ? c.hair : 'var(--osd-accent)', marginRight: 14 }} />
                <div
                  style={{
                    fontSize: 22,
                    lineHeight: 1.4,
                    padding: '3px 12px',
                    borderLeft: r.model ? `4px solid ${c.hair}` : '4px solid var(--osd-accent)',
                    background: r.model ? c.mutedSoft : 'transparent',
                  }}
                >
                  <b>{r.title}</b>
                  <span style={{ color: r.model ? c.muted : 'var(--osd-accent)', fontWeight: 700 }}>　{r.who}：</span>
                  {r.note}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
    <p style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.5, margin: '24px 0 0' }}>
      判斷一交出去就收不回來，所以 Gemini CLI 把關兩次：<Hi>接誰由人寫進設定，每次交出去預設先問人</Hi>。
    </p>
    <div style={{ marginTop: 18 }}>
      <JudgeBand model="要不要交出去、交給哪個 Agent（看描述）" harness={<>接哪些 Agent、怎麼驗證身分、<b>交出去前先問人</b></>} />
    </div>
  </Frame>
);

const GateBox = ({ no, name, how, limit }: { no: string; name: string; how: ReactNode; limit: ReactNode }) => (
  <div
    style={{
      width: 374,
      boxSizing: 'border-box',
      border: `1.5px solid ${c.line}`,
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
      <span style={{ fontFamily: mono, fontSize: 24, color: 'var(--osd-accent)' }}>{no}</span>
      <span style={{ fontSize: 30, fontWeight: 900 }}>{name}</span>
    </div>
    <div style={{ fontSize: 23, lineHeight: 1.5 }}>{how}</div>
    <div style={{ fontSize: 21, lineHeight: 1.5, color: c.muted, borderTop: `1px solid ${c.hair}`, paddingTop: 10, marginTop: 'auto' }}>
      限制：{limit}
    </div>
  </div>
);

const GateRow = ({ no, name, how, limit }: { no: string; name: string; how: ReactNode; limit: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '36px 150px 1fr 1fr', columnGap: 20, alignItems: 'baseline', padding: '12px 0', borderBottom: `1px solid ${c.hair}` }}>
    <span style={{ fontFamily: mono, fontSize: 24, color: 'var(--osd-accent)' }}>{no}</span>
    <span style={{ fontSize: 28, fontWeight: 900 }}>{name}</span>
    <span style={{ fontSize: 23, lineHeight: 1.45 }}>{how}</span>
    <span style={{ fontSize: 21, lineHeight: 1.45, color: c.muted }}>{limit}</span>
  </div>
);

const ZoneHead = ({ who, word, sub, model = false }: { who: string; word: string; sub: ReactNode; model?: boolean }) => (
  <div>
    <div style={{ fontFamily: mono, fontSize: 20, letterSpacing: '0.12em', color: model ? c.muted : 'var(--osd-accent)' }}>{who}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 4 }}>
      <span style={{ fontSize: 48, fontWeight: 900, color: model ? c.muted : 'var(--osd-accent)' }}>{word}</span>
      <span style={{ fontSize: 26 }}>{sub}</span>
    </div>
  </div>
);

const GuideStep = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      boxSizing: 'border-box',
      border: `1.5px dashed ${c.line}`,
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '12px 18px',
      fontSize: 24,
      lineHeight: 1.45,
      textAlign: 'center',
    }}
  >
    {children}
  </div>
);

const GateLayers: Page = () => (
  <Frame stage="把關" scope="以 Claude Code 為例" back={{ to: GatePage, label: '③ 把關' }} title="引導與強制：越靠近執行，越難被繞過">
    <div style={{ display: 'flex', gap: 32, alignItems: 'stretch' }}>
      <div
        style={{
          width: 440,
          flexShrink: 0,
          boxSizing: 'border-box',
          border: `2px dashed ${c.line}`,
          background: c.mutedSoft,
          borderRadius: 12,
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <ZoneHead who="模型判斷" word="引導" sub="規則寫進 context" model />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, marginTop: 6 }}>
          <GuideStep>CLAUDE.md、Skill 寫下規則</GuideStep>
          <DownArrow />
          <GuideStep>模型讀到規則</GuideStep>
          <DownArrow />
          <GuideStep>照不照做，<b>由模型判斷</b></GuideStep>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          boxSizing: 'border-box',
          border: '2px solid var(--osd-accent)',
          background: c.panel,
          borderRadius: 12,
          padding: '24px 32px 16px',
        }}
      >
        <ZoneHead who="HARNESS 控制" word="強制" sub={<>檢查<b>在模型之外</b>：不照做，也做不成</>} />
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '36px 150px 1fr 1fr', columnGap: 20, paddingBottom: 8, borderBottom: `1px solid ${c.line}`, fontSize: 20, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--osd-accent)' }}>
            <span />
            <span>哪一層</span>
            <span>怎麼擋</span>
            <span>限制</span>
          </div>
          <GateRow no="1" name="Hook" how="工具執行前，跑自己寫的程式" limit="比對盡力而為；失敗或逾時，預設放行" />
          <GateRow no="2" name="權限規則" how="deny → ask → allow，取第一個符合的" limit="比對不到用路徑呼叫、或包在 sh -c 裡的指令" />
          <GateRow no="3" name="沙箱" how="作業系統限制能碰的檔案與網路" limit="只管 shell 指令；預設關閉" />
        </div>
        <p style={{ fontSize: 24, lineHeight: 1.5, fontWeight: 400, margin: '16px 0 0' }}>
          把關本身也能<b>交給模型</b>：由分類器判斷危不危險，例如 Claude Code 的 auto mode。
        </p>
      </div>
    </div>
    <p style={{ fontSize: 23, lineHeight: 1.5, color: c.muted, margin: '22px 0 0' }}>
      官方文件也這麼建議：要硬擋，用權限規則而不是 Hook；要確保網路限制成立，規則要搭配沙箱。
    </p>
  </Frame>
);

const AutoBox = ({ who, text, strong = false }: { who: string; text: ReactNode; strong?: boolean }) => (
  <div
    style={{
      boxSizing: 'border-box',
      border: strong ? '2px solid var(--osd-accent)' : `1.5px solid ${c.line}`,
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '16px 24px',
    }}
  >
    <div style={{ fontFamily: mono, fontSize: 20, letterSpacing: '0.12em', color: strong ? 'var(--osd-accent)' : c.muted }}>{who}</div>
    <div style={{ fontSize: 27, lineHeight: 1.45, marginTop: 4 }}>{text}</div>
  </div>
);

const DownArrow = () => <div style={{ fontFamily: mono, fontSize: 26, color: c.dim, textAlign: 'center', lineHeight: 1.3 }}>↓</div>;

const RecoveryPage: Page = () => (
  <Frame stage="把關" scope="比較 Claude Code、OpenCode、Codex" back={{ to: GatePage, label: '③ 把關' }} title="復原：做錯了能不能退，決定要擋多嚴">
    <Cmp3Row head k="" a="Claude Code" b="OpenCode" c3="Codex" />
    <Cmp3Row k="何時記下" a="每次送出 prompt 前" b={<>每一步的前後，<br />替整個工作目錄拍快照</>} c3={<>不記<br />（舊版的檔案快照已移除）</>} />
    <Cmp3Row k="退得回什麼" a={<>Claude 用編輯工具改的檔；<br />對話可分開或一起退</>} b={<>整個工作目錄，含 bash 改的；<br />對話一起退</>} c3="只退對話，檔案不動" />
    <Cmp3Row k="限制" a={<>bash 指令改的檔、<br />子 agent 的編輯不追蹤</>} b="專案必須是 git repo" c3={<>改靠沙箱圈住<br />能碰的範圍</>} />
    <div style={{ marginTop: 22, border: `1.5px dashed ${c.line}`, borderRadius: 'var(--osd-radius)', padding: '12px 24px', fontSize: 25, lineHeight: 1.55 }}>
      <b>三家都退不回：</b>已經送到外面的，例如 production 部署、寄出的信、資料送出外部；auto mode 預設擋下的，也大多是這一類。
    </div>
    <p style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.5, margin: '22px 0 0' }}>
      能退回的，就能放寬；<Hi>退不回的，才需要擋</Hi>。
    </p>
    <div style={{ marginTop: 20 }}>
      <JudgeBand model="做什麼動作" harness={<>哪些記下來、退得到哪裡；<b>退不回的先擋</b></>} />
    </div>
  </Frame>
);

const Cmp3Row = ({ k, a, b, c3, head = false }: { k: ReactNode; a: ReactNode; b: ReactNode; c3: ReactNode; head?: boolean }) => (
  <TRow cols="190px 1fr 1fr 1fr" head={head} size={24} pad={14}>
    <div style={head ? undefined : { color: c.muted, fontWeight: 700 }}>{k}</div>
    <div>{a}</div>
    <div>{b}</div>
    <div>{c3}</div>
  </TRow>
);

const Unstated = () => <span style={{ color: c.dim }}>官方未細列</span>;

const CompactPage: Page = () => (
  <Frame stage="狀態・驗收" scope="比較 Claude Code、OpenCode、Codex" back={{ to: StatePage, label: '⑤ 狀態・驗收' }} title="Compaction：壓縮後，什麼一定留下">
    <Cmp3Row head k="" a="Claude Code" b="OpenCode" c3="Codex" />
    <Cmp3Row
      k="何時觸發"
      a="接近 context 上限"
      b={<>接近上限，預留 10% 緩衝<br />（至少 1.6 萬 token）</>}
      c3={<>用到 context 的 90%<br />（可以設得更低）</>}
    />
    <Cmp3Row
      k="怎麼壓"
      a={<>先清掉舊的工具輸出，<br />再把對話換成結構化摘要</>}
      b={<>依固定模板寫摘要：目標、需求、<br />決定、進度、下一步、相關檔案；<br />之後只更新同一份</>}
      c3={<>OpenAI 模型：交給 API 壓縮，<br />回傳加密的摘要；<br />其他模型：自己寫交接摘要</>}
    />
    <Cmp3Row
      k="一定留下"
      a={<>從磁碟重新載入：CLAUDE.md、<br />auto memory、plan、<br />最近改的 5 個檔、用過的 Skill</>}
      b={<>AGENTS.md 每次重新送；<br />最近約 1.5 萬 token 的對話<br />（工具輸出截到 1,250 字）</>}
      c3={<>重新注入系統指示、AGENTS.md；<br />最近的使用者訊息<br />（2 萬 token 內）</>}
    />
    <Cmp3Row
      k="原始對話"
      a="存在本機，可以接續或還原"
      b="仍然保存，只是不再送給模型"
      c3="存在本機，可以接續"
    />
    <p style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.5, margin: '28px 0 0' }}>
      三家都是模型寫摘要；<Hi>差別在「一定留下」的清單，Harness 寫得多明確</Hi>。
    </p>
    <div style={{ marginTop: 24 }}>
      <JudgeBand model="摘要寫什麼" harness={<>何時壓縮、保留多少、<b>哪些一定重新載入</b></>} />
    </div>
  </Frame>
);



const MemoryPage: Page = () => (
  <Frame stage="狀態・驗收" scope="比較 Claude Code、OpenCode、Codex" back={{ to: StatePage, label: '⑤ 狀態・驗收' }} title="Memory：誰來寫，新 session 帶進多少">
    <Cmp3Row head k="" a="Claude Code" b="OpenCode" c3="Codex" />
    <Cmp3Row
      k="人寫的指示檔"
      a={<>CLAUDE.md（也讀 AGENTS.md）；<br />工作目錄以上每一層</>}
      b={<>AGENTS.md；全域，加上目前<br />目錄往上到專案根目錄每一層</>}
      c3={<>AGENTS.md；全域，加上<br />專案根目錄到目前目錄每一層</>}
    />
    <Cmp3Row
      k="指示檔上限"
      a="建議 200 行以內"
      b="程式裡沒有設上限"
      c3="合計 32 KiB，超過就不再加入"
    />
    <Cmp3Row
      k="模型自己記的"
      a={<>Auto memory，<b>預設開</b>；<br />工作中自己判斷要不要記</>}
      b={<>沒有；<br />/init 由人觸發，產生 AGENTS.md</>}
      c3={<>Memories，<b>預設關</b>；<br />對話閒置後，在背景萃取</>}
    />
    <Cmp3Row
      k="新 session"
      a={<>自動載入記憶的<br />前 200 行或 25KB</>}
      b={<>只有 AGENTS.md；<br />過去的對話不會帶進來</>}
      c3={<>載入記憶摘要，上限 2,500 token；<br />細節用到才查</>}
    />
    <p style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.5, margin: '28px 0 0' }}>
      Claude Code 和 Codex 都說：記憶只是 context；<Hi>一定要遵守的規則，寫在人寫的檔案裡</Hi>。
    </p>
    <div style={{ marginTop: 24 }}>
      <JudgeBand model="記什麼" harness={<>誰能寫、存在哪裡、何時載入、<b>載入多少</b></>} />
    </div>
  </Frame>
);

const VerifyPage: Page = () => (
  <Frame stage="狀態・驗收" scope="以 Claude Code 為例" back={{ to: StatePage, label: '⑤ 狀態・驗收' }} title="完成判定：「完成了」是模型的判斷">
    <div style={{ display: 'flex', alignItems: 'stretch' }}>
      <div style={{ width: 420 }}>
        <AutoBox who="模型" text="「完成了」" />
      </div>
      <StageArrow />
      <div style={{ width: 640 }}>
        <AutoBox who="STOP HOOK" text={<><b>跑測試、lint</b>，檢查有沒有附上出處</>} strong />
      </div>
      <StageArrow />
      <div style={{ flex: 1 }}>
        <AutoBox who="過了" text="才真的結束" />
      </div>
    </div>
    <ReturnArrow from={760} to={210} text="沒過：exit 2，不讓它停，回去繼續做" id="osd-ah-verify" />
    <p style={{ fontSize: 26, lineHeight: 1.5, margin: '18px 0 0' }}>
      同一套 Hook 機制：掛在工具執行前是<b>把關</b>，掛在模型要結束時是<b>驗收</b>。
    </p>
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 22, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 24, color: c.muted, marginRight: 8 }}>證據要來自模型以外：</span>
      <Pill size={24}>測試通過</Pill>
      <Pill size={24}>lint 沒有錯誤</Pill>
      <Pill size={24}>回答附上出處</Pill>
      <Pill size={24}>外部系統的狀態</Pill>
    </div>
    <div style={{ marginTop: 32 }}>
      <JudgeBand model="什麼時候說完成" harness="什麼才算完成" />
    </div>
    <p style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.5, margin: '26px 0 0' }}>
      「完成了」不是證據；<Hi>Harness 可以否決它</Hi>。
    </p>
  </Frame>
);

const Act2: Page = () => <Divider no={2} name="判斷" q="換我們來做，哪些交給模型？" />;

const StageBox = ({ who, text, pill, model = false }: { who: string; text: ReactNode; pill: string; model?: boolean }) => (
  <div
    style={{
      width: 280,
      height: 270,
      boxSizing: 'border-box',
      border: `1.5px solid ${model ? c.hair : c.line}`,
      background: model ? c.mutedSoft : c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '22px 24px',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <span style={{ fontFamily: mono, fontSize: 22, letterSpacing: '0.12em', color: model ? c.muted : 'var(--osd-accent)' }}>{who}</span>
    <p style={{ fontSize: 29, fontWeight: 800, lineHeight: 1.45, margin: '12px 0 0', flex: 1 }}>{text}</p>
    <div>
      <Pill tone={model ? 'muted' : 'cyan'}>{pill}</Pill>
    </div>
  </div>
);

const StageArrow = ({ w = 60 }: { w?: number }) => (
  <div style={{ width: w, flexShrink: 0, textAlign: 'center', fontFamily: mono, fontSize: 34, color: c.dim, alignSelf: 'center' }}>→</div>
);

const ReturnArrow = ({ from, to, text, id, up = false }: { from: number; to: number; text: string; id: string; up?: boolean }) => (
  <svg width={1640} height={up ? 64 : 86} viewBox={up ? '0 0 1640 64' : '0 0 1640 86'} style={{ flexShrink: 0, display: 'block' }} aria-hidden="true">
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" style={{ fill: c.muted }} />
      </marker>
    </defs>
    <path
      d={up ? `M${from},62 V36 H${to} V58` : `M${from},0 V40 H${to} V6`}
      markerEnd={`url(#${id})`}
      style={{ fill: 'none', stroke: c.muted, strokeWidth: 2, strokeDasharray: '8 7' }}
    />
    <text x={(from + to) / 2} y={up ? 26 : 74} textAnchor="middle" style={{ fill: c.muted, fontSize: 22, fontFamily: 'var(--osd-font-body)' }}>
      {text}
    </text>
  </svg>
);

const PointRow = ({
  name,
  q,
  where,
  mech,
  analog,
  pill,
  tone,
}: {
  name: string;
  q: string;
  where: string;
  mech: string;
  analog: string;
  pill: string;
  tone: Tone;
}) => (
  <TRow cols="290px 200px 1fr 220px 150px">
    <div>
      <span style={{ fontSize: 32, fontWeight: 900 }}>{name}</span>
      <span style={{ fontSize: 22, color: c.muted, marginLeft: 12 }}>{q}</span>
    </div>
    <div style={{ color: c.muted }}>{where}</div>
    <div>{mech}</div>
    <div style={{ color: c.muted }}>{analog}</div>
    <div>
      <Pill tone={tone}>{pill}</Pill>
    </div>
  </TRow>
);

const PointLine = ({ name, q, mech }: { name: string; q: string; mech: string }) => (
  <TRow cols="520px 1fr" pad={20} size={32}>
    <div>
      <span style={{ fontSize: 38, fontWeight: 900 }}>{name}</span>
      <span style={{ fontSize: 28, color: c.muted, marginLeft: 16 }}>{q}</span>
    </div>
    <div>{mech}</div>
  </TRow>
);


const Mech = ({ name, text }: { name: string; text: string }) => (
  <Panel style={{ width: 800 }}>
    <div style={{ fontFamily: mono, fontSize: 28, color: 'var(--osd-accent)' }}>{name}</div>
    <p style={{ fontSize: 30, lineHeight: 1.5, margin: '10px 0 0' }}>{text}</p>
  </Panel>
);

const Layer = ({ label, items, inner = false, children }: { label: string; items: ReactNode; inner?: boolean; children?: ReactNode }) => (
  <div
    style={{
      flex: 1,
      boxSizing: 'border-box',
      border: inner ? '2px solid var(--osd-accent)' : `1.5px ${children ? 'dashed' : 'solid'} ${c.line}`,
      background: inner ? c.cyanSoft : children ? 'transparent' : c.mutedSoft,
      borderRadius: 'var(--osd-radius)',
      padding: '18px 24px',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{ fontSize: 26, fontWeight: 800, color: inner ? 'var(--osd-accent)' : c.muted }}>{label}</div>
    <div style={{ fontSize: 24, lineHeight: 1.5, marginTop: 6 }}>{items}</div>
    {children ? <div style={{ flex: 1, display: 'flex', marginTop: 16 }}>{children}</div> : null}
  </div>
);

const Rule = ({ head, eg }: { head: string; eg: string }) => (
  <div>
    <p style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.4, margin: 0 }}>{head}</p>
    <p style={{ fontSize: 26, lineHeight: 1.5, color: c.muted, margin: '6px 0 0' }}>{eg}</p>
  </div>
);


const McpNode = ({ x, y, text }: { x: number; y: number; text: string }) => (
  <g>
    <rect x={x} y={y} width={150} height={56} rx={6} style={{ fill: c.panel, stroke: c.line, strokeWidth: 1.5 }} />
    <text
      x={x + 75}
      y={y + 35}
      textAnchor="middle"
      style={{ fill: 'var(--osd-text)', fontSize: 20, fontFamily: 'var(--osd-font-body)' }}
    >
      {text}
    </text>
  </g>
);

const McpLine = ({ x1, y1, x2, y2, hot = false }: { x1: number; y1: number; x2: number; y2: number; hot?: boolean }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: hot ? 'var(--osd-accent)' : c.muted, strokeWidth: 1.5 }} />
);

const McpSides = ({ ox }: { ox: number }) => (
  <g>
    <McpNode x={ox} y={30} text="Claude Code" />
    <McpNode x={ox} y={140} text="OpenCode" />
    <McpNode x={ox} y={250} text="Codex" />
    <McpNode x={ox + 260} y={30} text="Jira" />
    <McpNode x={ox + 260} y={140} text="Drive" />
    <McpNode x={ox + 260} y={250} text="內部 DB" />
  </g>
);


const Rung = ({
  no,
  name,
  mech,
  desc,
  pill,
  solid,
  indent,
}: {
  no: string;
  name: string;
  mech: string;
  desc: string;
  pill: string;
  solid: boolean;
  indent: number;
}) => (
  <div
    style={{
      marginLeft: indent,
      width: 1260 - indent,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      gap: 28,
      border: solid ? '2px solid var(--osd-accent)' : `1.5px solid ${c.line}`,
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '18px 28px',
      marginBottom: 16,
    }}
  >
    <span style={{ fontFamily: mono, fontSize: 44, fontWeight: 700, color: 'var(--osd-accent)', width: 44 }}>{no}</span>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.35, margin: 0 }}>
        {name}
        <span style={{ fontSize: 24, fontWeight: 400, color: c.muted, marginLeft: 16 }}>{mech}</span>
      </p>
      <p style={{ fontSize: 26, lineHeight: 1.5, color: c.muted, margin: '6px 0 0' }}>{desc}</p>
    </div>
    <Pill solid={solid} size={24}>
      {pill}
    </Pill>
  </div>
);


const Bullet = ({ children }: { children: ReactNode }) => (
  <li style={{ fontSize: 28, lineHeight: 1.5, marginTop: 14 }}>{children}</li>
);

const SVCol = ({ label, q, main, eg, aside }: { label: string; q: string; main: string; eg: ReactNode; aside: string }) => (
  <Panel style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18, padding: '32px 40px' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
      <span style={{ fontSize: 40, fontWeight: 900, color: 'var(--osd-accent)' }}>{label}</span>
      <span style={{ fontSize: 28, color: c.muted }}>{q}</span>
    </div>
    <p style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.4, margin: 0 }}>{main}</p>
    <div style={{ fontSize: 30, lineHeight: 1.7 }}>{eg}</div>
    <p style={{ fontSize: 24, lineHeight: 1.5, color: c.muted, margin: 'auto 0 0', paddingTop: 18, borderTop: `1px solid ${c.hair}` }}>
      {aside}
    </p>
  </Panel>
);


const Side = ({
  word,
  tone,
  where,
  how,
  use,
}: {
  word: string;
  tone: Tone;
  where: string;
  how: string;
  use: ReactNode;
}) => (
  <div
    style={{
      width: 806,
      boxSizing: 'border-box',
      border: `2px solid ${toneLine(tone)}`,
      background: tone === 'cyan' ? c.panel : toneSoft(tone),
      borderRadius: 'var(--osd-radius)',
      padding: '34px 40px',
    }}
  >
    <p style={{ fontSize: 88, fontWeight: 900, lineHeight: 1.1, margin: 0, color: toneColor(tone) }}>{word}</p>
    <div style={{ marginTop: 30 }}>
      <Label tone="muted">放在哪裡</Label>
      <p style={{ fontSize: 32, lineHeight: 1.45, margin: '6px 0 0' }}>{where}</p>
    </div>
    <div style={{ marginTop: 22 }}>
      <Label tone="muted">會發生什麼</Label>
      <p style={{ fontSize: 32, lineHeight: 1.45, margin: '6px 0 0' }}>{how}</p>
    </div>
    <div style={{ marginTop: 22 }}>
      <Label tone="muted">用在哪裡</Label>
      <p style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.45, margin: '6px 0 0' }}>{use}</p>
    </div>
  </div>
);


const Who = ({ who, items, verdict, tone }: { who: string; items: string; verdict: string; tone: Tone }) => (
  <div
    style={{
      width: 528,
      boxSizing: 'border-box',
      border: `1.5px solid ${toneLine(tone)}`,
      background: tone === 'cyan' ? c.panel : toneSoft(tone),
      borderRadius: 'var(--osd-radius)',
      padding: '26px 30px',
      minHeight: 300,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <p style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.3, margin: 0, color: toneColor(tone) }}>{who}</p>
    <p style={{ fontSize: 28, lineHeight: 1.5, margin: '14px 0 0', flex: 1 }}>{items}</p>
    <div style={{ marginTop: 16 }}>
      <Pill tone={tone}>{verdict}</Pill>
    </div>
  </div>
);

const TriggerRow = ({ who, items, verdict, strong = false }: { who: string; items: string; verdict: ReactNode; strong?: boolean }) => (
  <div style={{ padding: '22px 0', borderBottom: `1px solid ${c.hair}` }}>
    <p style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>
      {who}
      <span style={{ fontSize: 26, fontWeight: 400, color: c.muted, marginLeft: 16 }}>{items}</span>
    </p>
    <p style={{ fontSize: 32, lineHeight: 1.4, margin: '8px 0 0', fontWeight: strong ? 800 : 400 }}>→ {verdict}</p>
  </div>
);

const Practice = ({ text, point }: { text: string; point: string }) => (
  <TRow cols="1fr 200px">
    <div style={{ fontSize: 30 }}>{text}</div>
    <div>
      <Pill>{point}</Pill>
    </div>
  </TRow>
);

const FixRow = ({ k, children }: { k: string; children: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', columnGap: 16, padding: '12px 0', borderTop: `1px solid ${c.hair}` }}>
    <div style={{ fontSize: 22, color: c.muted, paddingTop: 3 }}>{k}</div>
    <div style={{ fontSize: 26, lineHeight: 1.5 }}>{children}</div>
  </div>
);

const FixCard = ({ word, when, children }: { word: string; when: string; children: ReactNode }) => (
  <Panel style={{ flex: 1, padding: '22px 34px 12px' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 10 }}>
      <span style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.1, color: 'var(--osd-accent)' }}>{word}</span>
      <span style={{ fontSize: 30, fontWeight: 800 }}>{when}</span>
    </div>
    {children}
  </Panel>
);

const HarnessEng: Page = () => (
  <Frame title="Harness Engineering：該收緊的收緊，該放寬的放寬">
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 28 }}>
      <span style={{ fontSize: 40, fontWeight: 900 }}>
        <Hi>Humans steer.</Hi> Agents execute.
      </span>
      <span style={{ fontSize: 22, color: c.muted }}>Ryan Lopopolo · OpenAI, 2026-02</span>
    </div>
    <div style={{ display: 'flex', gap: 36, marginTop: 30 }}>
      <FixCard word="收緊" when="Agent 出錯時">
        <FixRow k="先問原因">
          缺資訊？→ 補資訊
          <br />
          缺回饋？→ 補驗收
          <br />
          都不缺，才收緊控制：只收最小、標記理由
        </FixRow>
        <FixRow k="例">規則在壓縮後被忘了 → 寫進 CLAUDE.md</FixRow>
      </FixCard>
      <FixCard word="放寬" when="模型升級時">
        <FixRow k="做什麼">
          逐一檢查補能力的結構：
          <br />
          還需要嗎？不需要就放寬
        </FixRow>
        <FixRow k="例">
          Open Deep Research 拆掉固定分工；
          <br />
          Claude Code auto mode 逐版放寬 push：
          <br />
          現在任何分支都放行，force push 仍擋
        </FixRow>
      </FixCard>
    </div>
    <p style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.5, margin: '34px 0 0' }}>
      收緊時標記理由，放寬時才找得到；<Hi>兩件事一直做，就是 Harness Engineering</Hi>。
    </p>
  </Frame>
);

const CycleBox = ({ no, text, h = 170 }: { no: string; text: ReactNode; h?: number }) => (
  <div
    style={{
      width: 357,
      height: h,
      boxSizing: 'border-box',
      border: `1.5px solid ${c.line}`,
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '20px 24px',
    }}
  >
    <span style={{ fontFamily: mono, fontSize: 24, color: 'var(--osd-accent)' }}>{no}</span>
    <p style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.4, margin: '8px 0 0' }}>{text}</p>
  </div>
);

const CycleArrow = () => (
  <div style={{ width: 70, textAlign: 'center', fontFamily: mono, fontSize: 34, color: c.dim, alignSelf: 'center' }}>→</div>
);


const Chip = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      fontSize: 34,
      fontWeight: 800,
      padding: '10px 26px',
      border: `1.5px solid ${c.line}`,
      borderRadius: 'var(--osd-radius)',
      background: c.panel,
    }}
  >
    {children}
  </span>
);

const Part2Close: Page = () => (
  <Close
    statement={<>補能力的會放寬，守要求的不會；<br /><Hi>放不放，用證據決定</Hi>。</>}
    next="第三部分：動手"
    bridge={
      <>
        <p style={{ fontSize: 30, color: c.muted, margin: 0 }}>原則有了。</p>
        <p style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.5, margin: '8px 0 0' }}>換我們提供工具：留下什麼、交給誰、誰來做？</p>
      </>
    }
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 44 }}>
      <Arrange from="守要求" to={<><b>做成強制</b><span style={{ fontWeight: 400, color: c.muted }}>；模型再強都不放寬</span></>} />
      <Arrange from="補能力" to={<><b>先收緊</b>、標記理由<span style={{ fontWeight: 400, color: c.muted }}>；模型升級就檢查能否放寬</span></>} />
    </div>
  </Close>
);

const Act4: Page = () => <Divider no={3} name="動手" q="自己提供工具，從哪裡開始？" />;

const Nine = ({ value, caption, hot = false }: { value: string; caption: string; hot?: boolean }) => (
  <div
    style={{
      width: 388,
      boxSizing: 'border-box',
      border: `1.5px solid ${hot ? c.line : c.hair}`,
      background: hot ? c.panel : c.mutedSoft,
      borderRadius: 'var(--osd-radius)',
      padding: '26px 28px',
    }}
  >
    <div style={{ fontFamily: mono, fontSize: 84, fontWeight: 700, lineHeight: 1.1, color: hot ? 'var(--osd-accent)' : 'var(--osd-text)' }}>
      {value}
    </div>
    <p style={{ fontSize: 28, lineHeight: 1.4, color: c.muted, margin: '12px 0 0' }}>{caption}</p>
  </div>
);

type WhyKind = '補能力' | '守要求';

const WHY_STYLE: Record<WhyKind, { border: string; background: string; label: string }> = {
  補能力: { border: `1.5px solid ${c.amberLine}`, background: c.amberSoft, label: c.amber },
  守要求: { border: '2px solid var(--osd-accent)', background: c.panel, label: 'var(--osd-accent)' },
};

const WhyReasonCard = ({ kind, children }: { kind: WhyKind; children: ReactNode }) => {
  const st = WHY_STYLE[kind];
  return (
    <div style={{ border: st.border, background: st.background, borderRadius: 'var(--osd-radius)', padding: '14px 16px' }}>
      <div style={{ fontSize: 27, lineHeight: 1.4 }}>{children}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: st.label, marginTop: 6 }}>{kind}</div>
    </div>
  );
};

const TABLE_COLS = '150px 1fr 48px 1fr 48px 1fr 48px 1fr';

const RowLabel = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 26, fontWeight: 700, color: c.muted, lineHeight: 1.45 }}>{children}</div>
);

const JobCell = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 25, lineHeight: 1.45, color: c.muted }}>{children}</div>
);

const NodeBox = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      border: '2px solid var(--osd-accent)',
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      fontFamily: mono,
      fontSize: 28,
      fontWeight: 700,
      textAlign: 'center',
      padding: '16px 8px',
    }}
  >
    {children}
  </div>
);

const TableArrow = () => (
  <span style={{ fontFamily: mono, fontSize: 30, color: c.dim, alignSelf: 'center', textAlign: 'center' }}>→</span>
);

const Gap = () => <div />;

const Reasons = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
);

const RedrawBefore: Page = () => (
  <Frame title="LPQM Agent 的每個節點，都在補能力或守要求">
    <p style={{ fontSize: 28, color: c.muted, margin: '0 0 20px' }}>2025.03 · 用 LangGraph 打造 · 給 RD 工程師用的 service</p>
    <Steps>
      <div style={{ display: 'grid', gridTemplateColumns: TABLE_COLS, alignItems: 'center' }}>
        <div />
        <NodeBox>Extractor</NodeBox>
        <TableArrow />
        <NodeBox>Clarifier</NodeBox>
        <TableArrow />
        <NodeBox>Plan &amp; Execute</NodeBox>
        <TableArrow />
        <NodeBox>Summarizer</NodeBox>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: TABLE_COLS,
          alignItems: 'start',
          marginTop: 18,
          paddingTop: 16,
          borderTop: `1px solid ${c.hair}`,
        }}
      >
        <RowLabel>做什麼</RowLabel>
        <JobCell>依術語表，<br />找出問句裡的術語</JobCell>
        <Gap />
        <JobCell>主體、方式不明確，<br />就先反問</JobCell>
        <Gap />
        <JobCell>先排步驟，<br />再用表格工具照著執行</JobCell>
        <Gap />
        <JobCell>整理工具呼叫過程，<br />說明結果怎麼來</JobCell>
      </div>
      <Step>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: TABLE_COLS,
            alignItems: 'start',
            marginTop: 16,
            paddingTop: 16,
            borderTop: `1px solid ${c.hair}`,
          }}
        >
          <RowLabel>為什麼存在</RowLabel>
          <Reasons>
            <WhyReasonCard kind="補能力">術語表太大，<br />放不進 prompt</WhyReasonCard>
            <WhyReasonCard kind="守要求">欄位值必須<br /><b>100% 正確</b></WhyReasonCard>
          </Reasons>
          <Gap />
          <Reasons>
            <WhyReasonCard kind="補能力">模型不會<br />主動反問</WhyReasonCard>
          </Reasons>
          <Gap />
          <Reasons>
            <WhyReasonCard kind="補能力">模型不照計畫走，<br />難查又不穩</WhyReasonCard>
            <WhyReasonCard kind="守要求">模型寫的程式，<br />不能在 prod 執行</WhyReasonCard>
          </Reasons>
          <Gap />
          <Reasons>
            <WhyReasonCard kind="守要求">讓使用者確認，<br />操作符合他的要求</WhyReasonCard>
          </Reasons>
        </div>
      </Step>
      <Step>
        <p style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.5, margin: '32px 0 0' }}>
          那麼，哪些會留下來？
        </p>
      </Step>
    </Steps>
  </Frame>
);

const GoneItem = ({ node, what }: { node: string; what: string }) => (
  <div style={{ padding: '16px 0', borderTop: `1px solid ${c.hair}`, fontSize: 27, lineHeight: 1.45, color: c.muted }}>
    <span style={{ fontFamily: mono, fontSize: 24 }}>{node}</span>
    <br />
    {what}
  </div>
);

const KeptRow = ({ item, kind }: { item: string; kind: WhyKind | '業務知識' }) => {
  const isInfo = kind === '業務知識';
  const color = isInfo ? c.muted : WHY_STYLE[kind].label;
  const border = isInfo ? `1.5px solid ${c.line}` : WHY_STYLE[kind].border;
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        padding: '14px 0',
        borderTop: `1px solid ${c.hair}`,
      }}
    >
      <span style={{ fontSize: 28, lineHeight: 1.4 }}>{item}</span>
      <span
        style={{
          flexShrink: 0,
          whiteSpace: 'nowrap',
          fontSize: 21,
          fontWeight: 800,
          color,
          border,
          borderRadius: 999,
          padding: '2px 14px',
        }}
      >
        {kind}
      </span>
    </div>
  );
};

const RedrawAfter: Page = () => (
  <Frame title="LPQM Agent 也跟著重構：補能力的拆掉，守要求的留下">
    <div style={{ display: 'flex', gap: 40, alignItems: 'stretch' }}>
      <Panel tone="muted" style={{ flex: 1, padding: '24px 32px 8px' }}>
        <p style={{ fontSize: 32, fontWeight: 800, color: c.muted, margin: '0 0 8px' }}>交給通用 Harness</p>
        <GoneItem node="Extractor" what="固定在最前面篩術語" />
        <GoneItem node="Clarifier" what="只在一開始判斷要不要問" />
        <GoneItem node="Plan & Execute" what="先排步驟的規劃結構" />
        <GoneItem node="Summarizer" what="另外用一個模型寫說明" />
      </Panel>
      <Panel style={{ flex: 1, padding: '24px 32px 8px' }}>
        <p style={{ fontSize: 32, fontWeight: 800, margin: '0 0 8px' }}>留下來的</p>
        <KeptRow item="術語表" kind="業務知識" />
        <KeptRow item="主體與方式的判斷框架" kind="業務知識" />
        <KeptRow item="查詢時檢查欄位值" kind="守要求" />
        <KeptRow item="只開放設計好的表格操作" kind="守要求" />
        <KeptRow item="回覆時附上操作清單" kind="守要求" />
      </Panel>
    </div>
    <p style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.5, margin: '36px 0 0' }}>
      迴圈交給通用 Harness；<Hi>業務知識和守要求留下，換到更好的位置</Hi>。
    </p>
  </Frame>
);

const SideList = ({ title, tone, children }: { title: string; tone: Tone; children: ReactNode }) => (
  <div
    style={{
      width: 740,
      boxSizing: 'border-box',
      border: `1.5px solid ${toneLine(tone)}`,
      background: tone === 'cyan' ? c.panel : toneSoft(tone),
      borderRadius: 'var(--osd-radius)',
      padding: '30px 36px',
    }}
  >
    <p style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.35, margin: 0, color: toneColor(tone) }}>{title}</p>
    <ul style={{ margin: '8px 0 0', paddingLeft: 32 }}>{children}</ul>
  </div>
);

const DeliverRow = ({ item, who }: { item: ReactNode; who: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, padding: '18px 0', borderBottom: `1px solid ${c.hair}` }}>
    <span style={{ fontSize: 28, lineHeight: 1.4 }}>{item}</span>
    <Pill size={22}>{who}</Pill>
  </div>
);

const OutsideRow = ({ item, why }: { item: string; why: string }) => (
  <div style={{ padding: '14px 0', borderBottom: `1px solid ${c.hair}` }}>
    <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.4 }}>{item}</div>
    <div style={{ fontSize: 23, lineHeight: 1.45, color: c.muted, marginTop: 4 }}>{why}</div>
  </div>
);

const PluginDelivery: Page = () => (
  <Frame title="Plugin 是包裝，不能錯的要做在外面">
    <div style={{ display: 'flex', gap: 40, alignItems: 'stretch' }}>
      <div
        style={{
          flex: 1,
          boxSizing: 'border-box',
          border: '2px dashed var(--osd-accent)',
          borderRadius: 16,
          padding: '24px 36px 12px',
        }}
      >
        <div style={{ fontFamily: mono, fontSize: 24, letterSpacing: '0.14em', color: 'var(--osd-accent)' }}>PLUGIN</div>
        <p style={{ fontSize: 30, fontWeight: 700, margin: '6px 0 6px' }}>裝進 Plugin</p>
        <DeliverRow item={<><b>Skill</b>：術語表、判斷框架</>} who="使用者也能寫" />
        <DeliverRow item={<><b>MCP</b> 工具的連線設定</>} who="我們" />
        <DeliverRow item={<><b>Hook</b>：回覆前檢查有沒有附上操作清單</>} who="我們" />
      </div>
      <Panel style={{ flex: 1, background: '#ffffff', padding: '24px 36px 12px' }}>
        <p style={{ fontSize: 30, fontWeight: 700, margin: '0 0 6px' }}>留在 Plugin 外面</p>
        <OutsideRow item="欄位值檢查" why="寫在 MCP server 端，Harness 被繞過也擋得住" />
        <OutsideRow item="只開放設計好的表格操作" why="工具只提供這些操作，模型寫的程式碰不到 prod" />
        <OutsideRow item="權限" why="做在資料來源或前端" />
        <OutsideRow item="測試題" why="拿來驗證整包，不是給模型用的" />
      </Panel>
    </div>
  </Frame>
);

const OurWork: Page = () => (
  <Frame title="我們的工作：補能力的那部分正在過期">
    <p style={{ fontSize: 28, lineHeight: 1.4, fontWeight: 400, color: c.muted, margin: '0 0 16px' }}>把同一個問題，問在我們自己身上</p>
    <Steps>
      <TRow cols="500px 1fr 440px" head>
        <div>我們做的事</div>
        <div>為什麼存在</div>
        <div>會不會過期</div>
      </TRow>
      <Step>
        <TRow cols="500px 1fr 440px" pad={24} size={30}>
          <div style={{ fontWeight: 800 }}>把需求寫成 graph、做成 service</div>
          <div>補能力：使用者不會寫程式、模型不夠強、<K>通用 Harness 還不存在</K></div>
          <div>會，<b>正在過期</b></div>
        </TRow>
      </Step>
      <Step>
        <TRow cols="500px 1fr 440px" pad={24} size={30}>
          <div style={{ fontWeight: 800 }}>整理術語與業務規則</div>
          <div>資訊：本來就在使用者身上，我們只是轉譯</div>
          <div>轉譯會過期，<K>使用者能自己寫 Skill</K></div>
        </TRow>
      </Step>
      <Step>
        <TRow cols="500px 1fr 440px" pad={24} size={30}>
          <div style={{ fontWeight: 800 }}>讓不能錯的事不可能錯</div>
          <div>守要求</div>
          <div>不會</div>
        </TRow>
      </Step>
    </Steps>
    <p style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.5, margin: '44px 0 0' }}>
      我們過去的工作量，大宗是補能力；<Hi>它正在過期</Hi>。
    </p>
  </Frame>
);

const VerbRow = ({ verb, name, children }: { verb: string; name: string; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, padding: '15px 0', borderBottom: `1px solid ${c.hair}` }}>
    <span style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.2, color: 'var(--osd-accent)', width: 44, flexShrink: 0 }}>{verb}</span>
    <div style={{ fontSize: 25, lineHeight: 1.45 }}>
      <b>{name}</b>
      <div style={{ color: c.muted, fontSize: 24, marginTop: 2 }}>{children}</div>
    </div>
  </div>
);

const PlanBox = ({ children, navy = false, sub }: { children: ReactNode; navy?: boolean; sub?: ReactNode }) => (
  <div
    style={{
      boxSizing: 'border-box',
      border: navy ? '2px solid var(--osd-accent)' : `1.5px solid ${c.line}`,
      background: navy ? 'var(--osd-accent)' : c.panel,
      color: navy ? '#fff' : undefined,
      borderRadius: 'var(--osd-radius)',
      padding: '14px 22px',
      fontSize: 26,
      fontWeight: 800,
      lineHeight: 1.4,
    }}
  >
    {children}
    {sub ? <div style={{ fontSize: 21, fontWeight: 400, color: navy ? 'rgba(255,255,255,0.85)' : c.muted, marginTop: 2 }}>{sub}</div> : null}
  </div>
);

const PlanArrow = ({ label }: { label?: string }) => (
  <div style={{ textAlign: 'center', color: c.dim, fontSize: 24, lineHeight: 1.3, padding: '6px 0' }}>
    ↓{label ? <span style={{ fontSize: 22, marginLeft: 12, color: c.muted }}>{label}</span> : null}
  </div>
);

const OrgAgentPage: Page = () => (
  <Frame title="職能型 Agent：沒人在線上，放寬要一類一類來">
    <div style={{ display: 'flex', gap: 56, alignItems: 'flex-start' }}>
      <div style={{ flex: 11 }}>
        <div style={{ fontSize: 28, fontWeight: 800, paddingBottom: 8, borderBottom: `1.5px solid ${c.line}` }}>線上沒人，五格各要改什麼</div>
        <VerbRow verb="看" name="資訊">從事件本身組 context；<K>記憶跟著職位</K>，不跟著某個人</VerbRow>
        <VerbRow verb="想" name="模型判斷">入口是 Workflow，依觸發類型分流；裡面再用 Loop</VerbRow>
        <VerbRow verb="擋" name="把關">不能當場問人，事前寫成規則</VerbRow>
        <VerbRow verb="做" name="行動">用自己的身分，權限最小化</VerbRow>
        <VerbRow verb="記" name="狀態・驗收">每次都要對；留紀錄，非同步通知負責人</VerbRow>
      </div>
      <div style={{ flex: 9 }}>
        <div style={{ fontSize: 28, fontWeight: 800, paddingBottom: 8, borderBottom: `1.5px solid ${c.line}` }}>實例：Azure SRE Agent</div>
        <p style={{ fontSize: 24, lineHeight: 1.5, color: c.muted, margin: '14px 0 14px' }}>每個 response plan、每個排程任務，分開設定</p>
        <PlanBox sub="人核准">Review</PlanBox>
        <PlanArrow label="先跑 2–4 週" />
        <PlanBox>一直被核准的那一類</PlanBox>
        <PlanArrow />
        <PlanBox navy>Autonomous</PlanBox>
      </div>
    </div>
    <p style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.5, margin: '26px 0 0' }}>
      越自主，<Hi>守要求越重要</Hi>；放寬，一個觸發一個觸發來。
    </p>
  </Frame>
);

const WhoBuilds: Page = () => (
  <Frame title="大部分需求使用者自己做；要每次都對的才找我們">
    <div style={{ display: 'flex', gap: 36 }}>
      <FixCard word="使用者自己做" when="大部分需求">
        <FixRow k="什麼情況">
          代表使用者本人；
          <br />
          結果看一次就好、拿來探索
        </FixRow>
        <FixRow k="怎麼做">
          通用 Harness，
          <br />
          加上自己寫的 Skill
        </FixRow>
      </FixCard>
      <FixCard word="需要我們" when="任一條成立">
        <FixRow k="什麼情況">
          線上沒有人：代表單位或流程；
          <br />
          或要每次都對：重複使用、拿去做決策
        </FixRow>
        <FixRow k="我們負責">
          身分與權限、事前的強制、
          <br />
          測試題與 eval
        </FixRow>
        <FixRow k="分工">
          需求單位給題目和標準答案；
          <br />
          我們大量、重複地檢查
        </FixRow>
      </FixCard>
    </div>
    <p style={{ fontSize: 22, lineHeight: 1.5, color: c.muted, margin: '18px 0 0' }}>資料規定與成本看部門，沒有通用答案，跟需求單位一起決定。</p>
    <p style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.5, margin: '22px 0 0' }}>
      使用者知道什麼是對的；<Hi>我們負責讓它每次都對</Hi>。
    </p>
  </Frame>
);

const CaseRow = ({ step, qa, form }: { step: string; qa: string; form: string }) => (
  <TRow cols="300px 1fr 1fr" pad={22}>
    <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--osd-accent)' }}>{step}</div>
    <div style={{ fontSize: 26 }}>{qa}</div>
    <div style={{ fontSize: 26 }}>{form}</div>
  </TRow>
);

const Check = ({ name, q }: { name: string; q: string }) => (
  <TRow cols="200px 1fr" pad={24}>
    <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--osd-accent)' }}>{name}</div>
    <div style={{ fontSize: 32 }}>{q}</div>
  </TRow>
);

const Guarantee = ({ text }: { text: string }) => (
  <div
    style={{
      width: 430,
      boxSizing: 'border-box',
      border: `1.5px solid ${c.line}`,
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '18px 24px',
      fontSize: 28,
      fontWeight: 700,
      lineHeight: 1.4,
    }}
  >
    {text}
  </div>
);

const Option = ({ no, name, desc, fit }: { no: string; name: string; desc: string; fit?: string }) => (
  <div
    style={{
      width: 806,
      minHeight: 250,
      boxSizing: 'border-box',
      border: `1.5px solid ${c.line}`,
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '24px 30px',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
      <span style={{ fontFamily: mono, fontSize: 32, color: 'var(--osd-accent)' }}>{no}</span>
      <span style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.35 }}>{name}</span>
    </div>
    <p style={{ fontSize: 27, lineHeight: 1.5, color: c.muted, margin: '10px 0 0', flex: 1 }}>{desc}</p>
    {fit ? (
      <div style={{ marginTop: 12 }}>
        <Pill>{fit}</Pill>
      </div>
    ) : null}
  </div>
);

const Takeaway = ({ no, title, text }: { no: string; title: string; text: ReactNode }) => (
  <TRow cols="100px 300px 1fr" pad={26}>
    <div style={{ fontFamily: mono, fontSize: 44, color: 'var(--osd-accent)', lineHeight: 1.1 }}>{no}</div>
    <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.35 }}>{title}</div>
    <div style={{ fontSize: 30, lineHeight: 1.5, color: c.muted }}>{text}</div>
  </TRow>
);

const Fate = ({ title, tone, why, items }: { title: string; tone: Tone; why: ReactNode; items: string }) => (
  <div
    style={{
      flex: 1,
      boxSizing: 'border-box',
      border: `1.5px solid ${toneLine(tone)}`,
      background: tone === 'cyan' ? c.panel : toneSoft(tone),
      borderRadius: 'var(--osd-radius)',
      padding: '28px 34px',
    }}
  >
    <p style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.3, margin: 0, color: toneColor(tone) }}>{title}</p>
    <p style={{ fontSize: 28, lineHeight: 1.5, margin: '12px 0 0' }}>{why}</p>
    <p style={{ fontSize: 28, lineHeight: 1.5, color: c.muted, margin: '8px 0 0' }}>{items}</p>
  </div>
);

const BackToIlya: Page = () => (
  <Frame title="哪些交給模型，哪些留給人？">
    <div style={{ display: 'flex', gap: 28 }}>
      <Fate title="會被吸收" tone="cyan" why={<>因為<b>能力不足</b>而存在的</>} items="補能力的流程與提示" />
      <Fate title="要有人提供" tone="cyan" why={<>因為<b>知識在人身上</b>而存在的</>} items="業務規則、術語、什麼才算對" />
      <Fate title="要有人負責" tone="cyan" why={<>因為<b>責任與授權</b>而存在的</>} items="核准、承擔後果、驗收" />
    </div>
    <p style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.45, margin: '64px 0 0' }}>
      模型越強，可以放得越寬；
      <br />
      <Hi>知識和責任，留在人這邊</Hi>。
    </p>
  </Frame>
);

const QA: Page = () => (
  <div style={{ ...canvas, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <div
      style={{
        fontFamily: mono,
        fontSize: 220,
        fontWeight: 700,
        lineHeight: 1,
        color: 'transparent',
        WebkitTextStroke: '2px var(--osd-accent)',
      }}
    >
      Q &amp; A
    </div>
    <p style={{ fontSize: 44, fontWeight: 700, margin: '48px 0 0' }}>謝謝大家</p>
    <p style={{ fontSize: 30, color: c.muted, margin: '16px 0 0' }}>歡迎提問：今天的內容，或手上的 Agent 需求</p>
    <Ticks />
    <Footer />
  </div>
);

const Ref = ({ who, what }: { who: string; what: string }) => (
  <div style={{ padding: '5px 0', borderBottom: `1px solid ${c.hair}`, lineHeight: 1.35 }}>
    <span style={{ fontSize: 23, fontWeight: 700 }}>{who}</span>
    <span style={{ fontSize: 20, color: c.muted, marginLeft: 12 }}>{what}</span>
  </div>
);

const References: Page = () => (
  <Frame scope="產品資料查證於 2026 年 10 月" title="參考資料">
    <div style={{ display: 'flex', gap: 60 }}>
      <div style={{ flex: 1 }}>
        <Ref who="Rich Sutton" what="The Bitter Lesson, 2019" />
        <Ref who="Lance Martin" what="Learning the Bitter Lesson, 2025-07" />
        <Ref who="Ilya Sutskever" what="NeurIPS 2024 演講（Computing 報導）" />
        <Ref who="Ryan Lopopolo (OpenAI)" what="Harness engineering, 2026-02" />
        <Ref who="Mitchell Hashimoto" what="My AI Adoption Journey, 2026-02" />
        <Ref who="Barbaste et al." what="Harness Engineering: A Source-Code Study of Eleven Systems, 2026-07" />
        <Ref who="Vivek Trivedy" what="The Anatomy of an Agent Harness, 2026-03" />
        <Ref who="Anthropic Engineering" what="Writing effective tools for agents, 2025-09" />
        <Ref who="Anthropic Engineering" what="Code execution with MCP, 2025-11" />
        <Ref who="Anthropic Engineering" what="Demystifying evals for AI agents, 2026-01" />
        <Ref who="Anthropic" what="How we built our multi-agent research system, 2025-06" />
        <Ref who="Qianyu Meng et al." what="Agent Harness for LLM Agents: A Survey, 2026-04" />
        <Ref who="Harrison Chase (LangChain)" what="Introducing ambient agents, 2025-01" />
        <Ref who="Gartner" what="Agentic AI 專案預測, 2025-06" />
      </div>
      <div style={{ flex: 1 }}>
        <Ref who="Claude Code 官方文件" what="context window、memory、permissions、permission modes、hooks、sandboxing、checkpointing、settings、subagents" />
        <Ref who="Claude API 官方文件" what="tool use" />
        <Ref who="Claude Agent SDK、Codex SDK、OpenCode SDK" what="官方文件" />
        <Ref who="Deep Agents 官方文件" what="context engineering、subagents" />
        <Ref who="OpenCode 官方文件與原始碼" what="permissions、server、compaction" />
        <Ref who="Codex 官方文件與原始碼" what="sandboxing、memories、compaction" />
        <Ref who="Gemini CLI 官方文件與原始碼" what="auto memory、remote subagents（A2A）" />
        <Ref who="Google ADK 原始碼" what="RemoteA2aAgent" />
        <Ref who="A2A Protocol" what="Specification 1.0；Linux Foundation 公告，2026-04" />
        <Ref who="OpenAI" what="Introducing OpenAI Frontier, 2026-02" />
        <Ref who="Microsoft、AWS、Datadog 官方文件" what="Azure SRE Agent、AWS DevOps Agent、Datadog Bits AI SRE" />
        <Ref who="Microsoft Entra 官方文件" what="Agent ID governance（sponsors）" />
        <Ref who="Claude Managed Agents 官方文件" what="vaults" />
        <Ref who="Model Context Protocol 規格" what="elicitation、tasks" />
      </div>
    </div>
  </Frame>
);

// ===== Added pages: Subagent, Evidence, DeliverTo, AgentLadder =====

const SubBox = ({ title, children }: { title: string; children: ReactNode }) => (
  <div
    style={{
      width: 300,
      boxSizing: 'border-box',
      border: '2px solid var(--osd-accent)',
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '22px 20px',
    }}
  >
    <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.3, color: 'var(--osd-accent)' }}>{title}</div>
    {children}
  </div>
);

const SubArrow = ({ text, back = false }: { text: string; back?: boolean }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 22, lineHeight: 1.4, fontWeight: 700, color: 'var(--osd-accent)' }}>{text}</div>
    <svg width={160} height={26} viewBox="0 0 160 26" aria-hidden="true" style={{ display: 'block' }}>
      {back ? (
        <>
          <line x1={18} y1={13} x2={160} y2={13} style={{ stroke: 'var(--osd-accent)', strokeWidth: 2.5 }} />
          <polygon points="0,13 20,4 20,22" style={{ fill: 'var(--osd-accent)' }} />
        </>
      ) : (
        <>
          <line x1={0} y1={13} x2={142} y2={13} style={{ stroke: 'var(--osd-accent)', strokeWidth: 2.5 }} />
          <polygon points="160,13 140,4 140,22" style={{ fill: 'var(--osd-accent)' }} />
        </>
      )}
    </svg>
  </div>
);

const SubMini = ({ title, sub, children, w = 300 }: { title: string; sub?: ReactNode; children?: ReactNode; w?: number }) => (
  <div
    style={{
      width: w,
      boxSizing: 'border-box',
      border: '2px solid var(--osd-accent)',
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '10px 20px',
    }}
  >
    <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3, color: 'var(--osd-accent)' }}>{title}</div>
    {children}
    {sub ? <div style={{ fontSize: 21, lineHeight: 1.4, color: c.muted, marginTop: 4 }}>{sub}</div> : null}
  </div>
);

const SubWhenItem = ({ no, k, children, link }: { no: number; k: string; children: ReactNode; link?: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', columnGap: 10, alignItems: 'baseline', padding: '6px 0', borderTop: no > 1 ? `1px solid ${c.hair}` : 'none' }}>
    <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, color: 'var(--osd-accent)' }}>{no}</div>
    <div style={{ fontSize: 22, lineHeight: 1.45 }}>
      <span style={{ fontSize: 25, fontWeight: 800 }}>{k}</span>
      {link}
      <br />
      {children}
    </div>
  </div>
);

const SubagentPage: Page = () => (
  <Frame stage="行動" scope="以 Claude Code 為例" back={{ to: ActionPage, label: '④ 行動' }} next={{ to: DebatePage, label: '互相辯論' }} title="Subagent：過程不必留下、或需要另一雙眼睛時，才開">
    <div style={{ display: 'flex', alignItems: 'center', width: 900 }}>
      <SubMini title="主 Agent" sub="對話、讀過的檔案" />
      <div style={{ width: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
        <SubArrow text="交代一段工作" />
        <SubArrow text="只回傳摘要" back />
      </div>
      <SubMini title="子 Agent" w={440} sub="搜尋結果、log、檔案內容都留在這裡">
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.4 }}>全新的 context</div>
      </SubMini>
    </div>
    <div style={{ display: 'flex', gap: 28, marginTop: 14, alignItems: 'stretch' }}>
      <div
        style={{
          flex: 1.3,
          boxSizing: 'border-box',
          border: '2px solid var(--osd-accent)',
          background: c.panel,
          borderRadius: 'var(--osd-radius)',
          padding: '14px 28px 8px',
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--osd-accent)', marginBottom: 4 }}>什麼時候開</div>
        <SubWhenItem no={1} k="過程很髒，結果很小">搜尋、翻 log、讀大量檔案；主 Agent 之後只要結論</SubWhenItem>
        <SubWhenItem
          no={2}
          k="需要另一雙眼睛"
        >
          審查只看 diff 和標準，看不到原本的推理，不會偏袒自己寫的東西
        </SubWhenItem>
        <SubWhenItem no={3} k="要不同的權限或模型">例如唯讀的探索；把探索交給便宜的模型</SubWhenItem>
        <SubWhenItem no={4} k="真的能平行的大範圍探索">方向互相獨立、任務值得多花 token</SubWhenItem>
      </div>
      <div
        style={{
          flex: 1,
          boxSizing: 'border-box',
          border: `1.5px solid ${c.hair}`,
          background: c.mutedSoft,
          borderRadius: 'var(--osd-radius)',
          padding: '14px 28px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 800, color: c.muted, marginBottom: 8 }}>什麼時候不開</div>
        <div style={{ fontSize: 22, lineHeight: 1.45, color: c.muted, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>要來回修改、反覆調整</div>
          <div>規劃、實作、測試共用大量 context</div>
          <div>一句話就說得完的小改動</div>
          <div>在意速度：子 Agent 要從零收集 context</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ borderTop: `1px solid ${c.hair}`, paddingTop: 10, marginTop: 10, fontSize: 22, lineHeight: 1.4 }}>
          代價：多 Agent 大約多用 <b>15 倍 token</b>
        </div>
      </div>
    </div>
    <p style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.5, margin: '12px 0 0' }}>
      判斷只有一個：<Hi>主 Agent 之後，還要不要看這段過程</Hi>。
    </p>
    <div style={{ marginTop: 12 }}>
      <JudgeBand model="要不要開子 Agent、交代什麼" harness={<>子 Agent <b>看得到什麼</b>、有哪些工具、能開幾層</>} />
    </div>
  </Frame>
);

const DebateNode = ({ x, y, t, color, r = 24 }: { x: number; y: number; t: string; color: string; r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r} style={{ fill: '#ffffff', stroke: color, strokeWidth: 2.5 }} />
    <text x={x} y={y + 8} textAnchor="middle" style={{ fontSize: 22, fontWeight: 800, fill: color }}>{t}</text>
  </g>
);

const DebateCard = ({ rec, diagram, title, lines }: { rec?: boolean; diagram: ReactNode; title: string; lines: ReactNode }) => (
  <div
    style={{
      flex: 1,
      boxSizing: 'border-box',
      border: rec ? '2px solid var(--osd-accent)' : `1.5px solid ${c.hair}`,
      background: rec ? c.panel : c.mutedSoft,
      borderRadius: 'var(--osd-radius)',
      padding: '12px 24px 14px',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{ height: 122, display: 'flex', justifyContent: 'center' }}>{diagram}</div>
    <div style={{ fontSize: 29, fontWeight: 800, marginTop: 10, color: rec ? 'var(--osd-accent)' : undefined }}>{title}</div>
    <div style={{ fontSize: 22, lineHeight: 1.5, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>{lines}</div>
  </div>
);

const DebatePage: Page = () => {
  const navy = 'var(--osd-accent)';
  const grey = c.muted;
  const Arr = ({ id, col }: { id: string; col: string }) => (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" style={{ fill: col }} />
      </marker>
    </defs>
  );
  return (
    <Frame stage="行動" scope="以 Claude Code 為例" back={{ to: SubagentPage, label: 'Subagent' }} title={<>子 Agent 要互相辯論：<br />主 Agent 轉述，或改用 Agent teams</>}>
      <div style={{ borderLeft: '3px solid var(--osd-accent)', background: c.mutedSoft, padding: '8px 24px', fontSize: 24, lineHeight: 1.4, marginTop: 14 }}>
        開兩個子 Agent，一個當正方、一個當反方，辯論這個問題
      </div>
      <p style={{ fontSize: 23, lineHeight: 1.4, color: c.muted, margin: '8px 0 0' }}>
        為什麼要辯：單一 Agent 找到一個說得通的解釋就容易停下；<b>互相反駁</b>，留下來的結論比較可靠。
      </p>
      <div style={{ display: 'flex', gap: 24, marginTop: 14, alignItems: 'stretch' }}>
        <DebateCard
          rec
          title="主 Agent 當主持人"
          diagram={
            <svg width={262} height={122} viewBox="0 0 300 140" aria-hidden="true">
              <Arr id="osd-ah-debate-a1" col={navy} />
              <line x1={138} y1={52} x2={74} y2={92} style={{ stroke: navy, strokeWidth: 2.5 }} markerStart="url(#osd-ah-debate-a1)" markerEnd="url(#osd-ah-debate-a1)" />
              <line x1={162} y1={52} x2={226} y2={92} style={{ stroke: navy, strokeWidth: 2.5 }} markerStart="url(#osd-ah-debate-a1)" markerEnd="url(#osd-ah-debate-a1)" />
              <DebateNode x={150} y={28} t="主" color={navy} r={26} />
              <DebateNode x={60} y={110} t="正" color={navy} />
              <DebateNode x={240} y={110} t="反" color={navy} />
            </svg>
          }
          lines={
            <>
              <div>把正方的論點帶給反方、再把反駁帶回來，<span style={{ whiteSpace: 'nowrap' }}>一輪一輪轉</span></div>
              <div>一般 subagent 就做得到</div>
              <div style={{ color: c.muted }}>每一輪都回到主 Agent 的 context</div>
            </>
          }
        />
        <DebateCard
          title="子 Agent 直接互傳"
          diagram={
            <svg width={262} height={122} viewBox="0 0 300 140" aria-hidden="true">
              <Arr id="osd-ah-debate-b1" col={grey} />
              <line x1={140} y1={50} x2={70} y2={88} style={{ stroke: c.dim, strokeWidth: 1.5 }} />
              <line x1={160} y1={50} x2={230} y2={88} style={{ stroke: c.dim, strokeWidth: 1.5 }} />
              <line x1={90} y1={114} x2={210} y2={114} strokeDasharray="7 5" style={{ stroke: grey, strokeWidth: 2.5 }} markerStart="url(#osd-ah-debate-b1)" markerEnd="url(#osd-ah-debate-b1)" />
              <DebateNode x={150} y={28} t="主" color={grey} r={26} />
              <DebateNode x={60} y={110} t="正" color={grey} />
              <DebateNode x={240} y={110} t="反" color={grey} />
            </svg>
          }
          lines={
            <>
              <div>開的時候給名字、帶 SendMessage 工具，就能傳給其他有名字的 Agent</div>
              <div style={{ color: c.muted }}>名單是啟動當下的快照，比它晚開的不在上面</div>
            </>
          }
        />
        <DebateCard
          title="Agent teams"
          diagram={
            <svg width={262} height={122} viewBox="0 0 300 140" aria-hidden="true">
              <rect x={184} y={4} width={114} height={28} rx={6} style={{ fill: '#ffffff', stroke: c.dim, strokeWidth: 1.5 }} />
              <text x={241} y={24} textAnchor="middle" style={{ fontSize: 16, fontWeight: 700, fill: grey }}>共用任務清單</text>
              <line x1={133} y1={50} x2={62} y2={90} style={{ stroke: c.dim, strokeWidth: 1.5 }} />
              <line x1={150} y1={54} x2={150} y2={86} style={{ stroke: c.dim, strokeWidth: 1.5 }} />
              <line x1={167} y1={50} x2={238} y2={90} style={{ stroke: c.dim, strokeWidth: 1.5 }} />
              <line x1={74} y1={114} x2={126} y2={114} style={{ stroke: grey, strokeWidth: 2.5 }} />
              <line x1={174} y1={114} x2={226} y2={114} style={{ stroke: grey, strokeWidth: 2.5 }} />
              <path d="M60,129 Q150,144 240,129" fill="none" style={{ stroke: grey, strokeWidth: 2.5 }} />
              <DebateNode x={150} y={28} t="主" color={grey} r={26} />
              <DebateNode x={50} y={110} t="甲" color={grey} />
              <DebateNode x={150} y={110} t="乙" color={grey} />
              <DebateNode x={250} y={110} t="丙" color={grey} />
            </svg>
          }
          lines={
            <>
              <div>teammate 之間直接傳訊息、共用任務清單</div>
              <div style={{ color: c.muted }}>實驗功能，預設關閉；只在互動模式，<br />SDK 和 -p 不會開</div>
            </>
          }
        />
      </div>
      <p style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.5, margin: '16px 0 0' }}>
        要辯論，<Hi>預設由主 Agent 轉述</Hi>；Agent teams 還在實驗，SDK 裡也不會開。
      </p>
      <div style={{ marginTop: 12 }}>
        <JudgeBand model="論點怎麼回、誰被說服" harness={<><b>誰能傳給誰</b>、別的 Agent 的訊息不能當成使用者同意</>} />
      </div>
    </Frame>
  );
};

const LoopStep = ({ no, title, sub }: { no: string; title: string; sub: ReactNode }) => (
  <div
    style={{
      flex: 1,
      boxSizing: 'border-box',
      border: '2px solid var(--osd-accent)',
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '20px 26px',
    }}
  >
    <div style={{ fontFamily: mono, fontSize: 22, letterSpacing: '0.1em', color: 'var(--osd-accent)' }}>{no}</div>
    <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.35, marginTop: 4 }}>{title}</div>
    <div style={{ fontSize: 23, lineHeight: 1.5, color: c.muted, marginTop: 8 }}>{sub}</div>
  </div>
);

const EvidencePage: Page = () => (
  <Frame title="控制要加還是要拆：先留紀錄，再用測試題決定">
    <div style={{ display: 'flex', alignItems: 'stretch' }}>
      <LoopStep no="01" title="留下執行紀錄" sub={<>每一步看了什麼、<br />呼叫什麼工具、結果如何</>} />
      <StageArrow />
      <LoopStep no="02" title="失敗變成測試題" sub="從真實的失敗開始，幾十題就能起步" />
      <StageArrow />
      <LoopStep no="03" title="換模型就重跑" sub="決定哪些控制可以拆、哪裡要補" />
    </div>
    <ReturnArrow from={1387} to={253} text="每換一次模型，就再走一圈" id="osd-ah-evidence" />
    <div style={{ marginTop: 22 }}>
      <Label>同一組測試題，兩種算法</Label>
      <div
        style={{
          display: 'flex',
          marginTop: 12,
          border: `1.5px solid ${c.line}`,
          borderRadius: 'var(--osd-radius)',
          overflow: 'hidden',
          background: c.panel,
        }}
      >
        <div style={{ flex: 1, padding: '20px 32px', background: c.mutedSoft }}>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.35, color: c.muted }}>試幾次會對</div>
          <div style={{ fontSize: 26, lineHeight: 1.45, marginTop: 6, color: c.muted }}>k 次裡至少一次成功</div>
          <div style={{ fontSize: 23, lineHeight: 1.45, marginTop: 6, color: c.muted }}>適合看補能力：模型做不做得到</div>
        </div>
        <div style={{ flex: 1, padding: '20px 32px', borderLeft: '3px solid var(--osd-accent)' }}>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.35, color: 'var(--osd-accent)' }}>每次都對</div>
          <div style={{ fontSize: 26, lineHeight: 1.45, marginTop: 6 }}>k 次<b>全部成功</b></div>
          <div style={{ fontSize: 23, lineHeight: 1.45, marginTop: 6 }}>適合看守要求：能不能放心交出去</div>
        </div>
      </div>
    </div>
    <p style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.5, margin: '34px 0 0' }}>
      鬆緊不靠感覺：<Hi>紀錄指出哪裡錯，測試題決定能不能放</Hi>。
    </p>
  </Frame>
);

const DelivCard = ({ head, rows }: { head: string; rows: { k: string; v: ReactNode }[] }) => (
  <div
    style={{
      flex: 1,
      boxSizing: 'border-box',
      border: `1.5px solid ${c.line}`,
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '22px 30px 8px',
    }}
  >
    <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.3, color: 'var(--osd-accent)', paddingBottom: 10, borderBottom: `1.5px solid ${c.line}` }}>{head}</div>
    {rows.map((r, i) => (
      <div key={i} style={{ padding: '14px 0', borderBottom: i < rows.length - 1 ? `1px solid ${c.hair}` : undefined }}>
        <div style={{ fontSize: 20, lineHeight: 1.3, color: c.muted }}>{r.k}</div>
        <div style={{ fontSize: 25, lineHeight: 1.45, marginTop: 4, minHeight: 72 }}>{r.v}</div>
      </div>
    ))}
  </div>
);

const DeliverToPage: Page = () => (
  <Frame title="交給誰用，決定交付形式">
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <DelivCard
          head="使用者自己用"
          rows={[
            { k: '情境', v: <>使用者在自己的<br />Harness 裡互動</> },
            { k: '交付形式', v: <><b>Plugin</b>：Skill、MCP 連線、Hook</> },
            { k: '人在不在線上', v: '在，隨時可以核准' },
          ]}
        />
      </div>
      <div style={{ flex: 1 }}>
        <DelivCard
          head="個人型 Agent"
          rows={[
            { k: '情境', v: '個人型 Agent 要操作我們的系統' },
            { k: '交付形式', v: <><b>System Agent</b>：工具，或整個任務</> },
            { k: '人在不在線上', v: '在，但在對方那一端' },
          ]}
        />
      </div>
      <div style={{ flex: 1 }}>
        <DelivCard
          head="事件觸發"
          rows={[
            { k: '情境', v: '告警、排程、工單觸發，沒人開口' },
            { k: '交付形式', v: <><b>職能型 Agent</b>：<br />Harness 用 SDK 嵌進服務</> },
            { k: '人在不在線上', v: '不在，把關要事前設計好' },
          ]}
        />
      </div>
    </div>
    <div
      style={{
        marginTop: 14,
        border: '2px solid var(--osd-accent)',
        background: c.panel,
        borderRadius: 'var(--osd-radius)',
        padding: '16px 30px',
        fontSize: 27,
        lineHeight: 1.45,
      }}
    >
      <b style={{ color: 'var(--osd-accent)' }}>三條路共用：</b>
      寫在 server 端的檢查——欄位值檢查、設計好的表格操作、權限
    </div>
  </Frame>
);

const LADDER2_COLS = '20px 330px 340px 470px 1fr';

const LadderRow = ({
  level,
  what,
  how,
  who,
  eg,
}: {
  level: 1 | 2 | 3;
  what: ReactNode;
  how: ReactNode;
  who: ReactNode;
  eg: ReactNode;
}) => {
  const bar = level === 1 ? { w: 3, bg: c.hair } : level === 2 ? { w: 8, bg: 'rgba(10, 26, 51, 0.35)' } : { w: 14, bg: 'var(--osd-accent)' };
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: LADDER2_COLS,
        columnGap: 28,
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: `1px solid ${c.hair}`,
        background: level === 1 ? c.mutedSoft : level === 3 ? c.panel : 'transparent',
        fontSize: 25,
        lineHeight: 1.45,
      }}
    >
      <div style={{ alignSelf: 'stretch', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: -12, bottom: -12, width: bar.w, background: bar.bg }} />
      </div>
      <div style={{ fontWeight: 800, fontSize: 28, color: level === 3 ? 'var(--osd-accent)' : undefined }}>{what}</div>
      <div>{how}</div>
      <div style={level === 3 ? { color: 'var(--osd-accent)' } : level === 1 ? { color: c.muted } : undefined}>{who}</div>
      <div style={{ color: c.muted, fontSize: 23 }}>{eg}</div>
    </div>
  );
};

const CompRow = ({ k, a, b, head = false }: { k: string; a: string; b: string; head?: boolean }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr 1fr', columnGap: 28, padding: '8px 0', borderBottom: `1px solid ${c.hair}`, fontSize: 22, lineHeight: 1.45, fontWeight: head ? 700 : 400, color: head ? c.muted : undefined }}>
    <div style={{ fontWeight: 700 }}>{k}</div>
    <div>{a}</div>
    <div>{b}</div>
  </div>
);

const LadderHead = ({ n, children }: { n: string; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, fontSize: 26, lineHeight: 1.4 }}>
    <span style={{ fontFamily: 'var(--osd-font-mono, monospace)', fontWeight: 700, color: 'var(--osd-accent)' }}>{n}</span>
    <span>{children}</span>
  </div>
);

const Sub = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 22, fontWeight: 400, color: c.muted, lineHeight: 1.4, marginTop: 2 }}>{children}</div>
);

const SysBox = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      width: 220,
      boxSizing: 'border-box',
      textAlign: 'center',
      border: `1.5px solid ${c.line}`,
      background: c.panel,
      borderRadius: 'var(--osd-radius)',
      padding: '12px 8px',
      fontSize: 26,
      fontWeight: 800,
      lineHeight: 1.35,
    }}
  >
    {children}
  </div>
);

const SysPath = ({ ok, children }: { ok: boolean; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, fontSize: 25, lineHeight: 1.5, color: ok ? 'var(--osd-accent)' : c.amber }}>
    <span style={{ fontWeight: 800, width: 28, flexShrink: 0 }}>{ok ? '✓' : '✗'}</span>
    <span>{children}</span>
  </div>
);

const AgentLadderPage: Page = () => (
  <Frame title="System Agent：對方缺判斷，才值得長成一個 Agent">
    <LadderHead n="①">
      <b>交出多少</b>：對方的 Agent 缺的是什麼？
    </LadderHead>
    <div style={{ marginTop: 10 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: LADDER2_COLS,
          columnGap: 28,
          paddingBottom: 8,
          borderBottom: `1px solid ${c.line}`,
          fontSize: 21,
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: 'var(--osd-accent)',
        }}
      >
        <div />
        <div>對方缺什麼</div>
        <div>我們交什麼</div>
        <div>判斷在誰</div>
        <div>例子</div>
      </div>
      <LadderRow level={1} what="知識" how="Skill" who="全在對方的模型" eg="術語表、判斷框架" />
      <LadderRow
        level={2}
        what={<>動作<Sub>碰不到我們的系統</Sub></>}
        how="MCP 工具"
        who={<>怎麼用，對方的模型判斷；<br />不能錯的，我們在 server 端擋</>}
        eg={<>查詢內部資料，<br />附欄位值檢查</>}
      />
      <LadderRow
        level={3}
        what={<>判斷<Sub>要懂這個領域，<br />才知道怎麼問、怎麼查</Sub></>}
        how={<>長成 System Agent<Sub>A2A，或包成 MCP 工具</Sub></>}
        who={<><b>我們的模型</b>判斷，<b>品質我們負責</b></>}
        eg="先反問，再規劃查詢"
      />
    </div>
    <div style={{ marginLeft: 80, marginTop: 16, borderLeft: '4px solid var(--osd-accent)', paddingLeft: 28, paddingTop: 10 }}>
      <LadderHead n="②">
        <b>用誰的權限</b>：操作系統時，身分怎麼走？
      </LadderHead>
      <div id="osd-ah-sysagent-chain" style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
        <SysBox>使用者</SysBox>
        <span style={{ fontSize: 28, color: c.dim }}>→</span>
        <SysBox>個人型 Agent</SysBox>
        <span style={{ fontSize: 28, color: c.dim }}>→</span>
        <SysBox>System Agent</SysBox>
        <span style={{ fontSize: 28, color: c.dim }}>→</span>
        <SysBox>系統</SysBox>
      </div>
      <div id="osd-ah-sysagent-paths" style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SysPath ok>帶著<b>使用者的身分</b>，系統用這個身分查權限</SysPath>
        <SysPath ok={false}>用 System Agent 自己的高權限 → <b>權限破口</b></SysPath>
      </div>
    </div>
    <p style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.5, margin: '18px 0 0' }}>
      缺判斷才長成 Agent；操作系統時，<Hi>用的是原始使用者的權限</Hi>。
    </p>
  </Frame>
);

export const meta: SlideMeta = {
  title: 'Agent System with Harness Engineering',
  createdAt: '2026-10-12T00:07:16.057Z',
};

// 主線：上一頁／下一頁只在這裡走
const mainPages: Page[] = [
  Cover,
  Hook,
  Theme,
  Act1,
  HarnessMap,
  InfoPage,
  RouteSpectrum,
  GatePage,
  ActionPage,
  StatePage,
  Part1Close,
  Act2,
  ThreeReasons,
  BitterLesson,
  HarnessEng,
  EvidencePage,
  Part2Close,
  Act4,
  RedrawBefore,
  RedrawAfter,
  PluginDelivery,
  DeliverToPage,
  AgentLadderPage,
  OrgAgentPage,
  OurWork,
  WhoBuilds,
  BackToIlya,
  QA,
  References,
];

// 附錄：只能從主線的「細節」連結進來，也只能回到自己的主頁
const appendix: [Page, Page][] = [
  [MinHarnessPage, HarnessMap],
  [ContextPage, InfoPage],
  [GateLayers, GatePage],
  [RecoveryPage, GatePage],
  [ToolPage, ActionPage],
  [SubagentPage, ActionPage],
  [DebatePage, SubagentPage],
  [McpPage, ActionPage],
  [A2aPage, ActionPage],
  [AgentCardPage, ActionPage],
  [CompactPage, StatePage],
  [MemoryPage, StatePage],
  [VerifyPage, StatePage],
];

const pages: Page[] = [...mainPages, ...appendix.map(([p]) => p)];
export const MAIN_COUNT = mainPages.length;
/** 附錄頁對應的主頁 index（主線頁為 undefined） */
export const appendixHome: (number | undefined)[] = pages.map((p) => {
  const hit = appendix.find(([a]) => a === p);
  return hit ? pages.indexOf(hit[1]) : undefined;
});

export default pages;

export const notes: (string | undefined)[] = [
  `【開場 3 分鐘】
今天的主題是 Agent System 與 Harness Engineering。封面的問題就是今天要回答的：模型越來越強，哪些交給它，哪些留給人？正文大約 50 分鐘，最後留 10 分鐘 Q&A。
封面的馬與韁繩：Harness 原本就是「馬具」的意思——今天談的，就是怎麼駕馭一股很強的力量。`,
  `先讓引言停留幾秒。
Ilya 說：模型越會推理，就越難預測。
這就是封面那個問題難的地方：模型越強，我們越想多交給它；但它越會推理，就越難掌握。交得越多越省事，也越不知道它會怎麼做。
所以不能全交、也不能全不交——要拿捏鬆緊。下一頁。`,
  `（操作：進到這頁約 1 秒後，等式會自動從平衡變成「模型大、Harness 小」；想再演示一次按 R。匯出 PDF 時只顯示結束狀態。）
這頁是整場的大綱（In A Nutshell）。先看上面三個部分：看懂、判斷、動手。Ilya 說的是：模型越強越難掌握——所以要拿捏鬆緊。
三個部分各自回答一個問題：看懂，手上的工具怎麼運作；判斷，哪些交給模型、哪些控制；動手，自己提供工具，從哪開始。每一部分結束時，會給封面的問題一個階段性的答案。
中間的等式：Agent 等於模型加 Harness。模型負責判斷，Harness 負責控制。今天談的是鬆緊——哪些判斷交給模型、哪些由 Harness 控制；放得越寬，模型的自由度越高。整場只用兩個動作描述它怎麼變：放寬、收緊。
往下看，比重在移動：模型越來越強，越來越多判斷交給模型。例如 Bitter Lesson 講的通用方法終究勝出；Claude Code 的 auto mode 一版一版放寬 push；規則從 prompt 移到設定檔。
但 Harness 不會消失。把資料、工具、執行環境接上的「管線」還在，只是正在變成通用的——Claude Code、Codex 這類通用 Harness 已經內建。我們自己要寫的，最後只剩使用者的要求：什麼不能錯、什麼才算對。
所以我們過去幫模型做的 Harness（像 LPQM Agent 那張 graph，很多節點是在補模型的能力）正在過期；守要求的部分不會——第三部分會拆給大家看。這也是為什麼才要問清楚，哪些該放、哪些要留。
等式出處：LangChain〈The Anatomy of an Agent Harness〉（Vivek Trivedy，2026-03）：Agent = Model + Harness；Harness 是模型以外的所有程式、設定與執行邏輯。
被問到「Agent 這個詞比 Harness 早」：Harness 是新名字，指的是一直都在的那一半——以前叫 scaffold、agent framework、orchestration，我們用 LangGraph 建的 graph 也是。模型越強，差異越在外面那一圈，所以才需要一個名字。類比：MLOps 這個詞比模型訓練晚很多，但訓練一直都有 pipeline。
重點句：模型越來越強，Harness 越來越薄；我們過去幫模型做的，正在過期。`,
  `【第一部分・看懂 17 分鐘】
問題：手上的 Agent 工具，是怎麼運作的？
第 3 頁的等式右邊有兩項，現在拆開 Harness——控制的那一半。
先講 Harness 是什麼、路線由誰決定；接著把 Harness 的元件一個一個拆開：每個元件裡，哪部分交給模型判斷、哪部分由 Harness 控制。`,
  `這頁是第一部分的地圖。先說一個前提：模型只會輸出文字；所謂「呼叫工具」，也只是輸出一段請求，真正去查資料、改檔案的是 Harness。不管 Workflow 的每個節點、還是 Loop 的每一輪，都會繞這個圈一次：給資訊、模型決定、檢查能不能做、真正去做、留下結果並確認；然後進下一輪。只有灰色虛線、標著「模型」的那一格是模型，其他四格都標著 HARNESS。業界談 Harness，多半指交給模型決定的那一端；今天把 Workflow 也算進來，兩者都在駕馭模型，差在自由度。
每格有哪些機制（不在投影片上，口頭帶或後面各頁講）。資訊：System prompt、AGENTS.md、Skill、工具清單。模型判斷：Workflow 或 Loop，也就是下一步誰決定。把關：Hook、權限規則、沙箱、auto mode、復原。行動：工具、子 Agent、MCP、A2A。狀態・驗收：Compaction、Memory、完成前的檢查。
接下來五頁，一格一頁，順著圈走；每頁右下角有「細節」連結，可以跳到附錄。右上角的小條會標出現在講到哪一格。每格的重點，在各頁的重點句裡講。
另一種拆法（被問到）：survey 的六元件 H = (E, T, C, S, L, V)：執行迴圈、工具註冊、context 管理、狀態、生命週期 hook、評估介面；各對應一種出錯——跑不停、亂用工具、context 爆掉、丟狀態、副作用沒人看到、行為看不見。我們用「判斷與控制」來分，方便談鬆緊。
最小的 Harness 長什麼樣，附錄第一頁有（右下角「細節」連結），被問到再跳過去。
重點句（標題）：模型只負責想；看、擋、做、記，都靠 Harness。看＝準備模型這一輪要看的；擋＝擋下不該做的動作；做＝真正去執行；記＝記住結果、檢查做完沒。後面五頁一格一頁，可以用這四個字回扣：這頁講的是「擋」。`,
  `資訊是地圖的第一格（① 資訊）：每一輪開頭，模型看到的東西是 Harness 組出來的。這頁以 Claude Code 為例（左上角有標），依官方文件（memory、skills，2026-10）。
這頁一列一組：左邊一直放著的只是索引，右邊的完整內容等用到才載入。
Skill：每個 Skill 的一行描述一直在 context 裡，模型決定要用，才載入全文。
工具：MCP 工具只列名稱，完整的 schema 透過 tool search 找到才載入。
規則：工作目錄以上每一層的 CLAUDE.md 或 AGENTS.md 開場就載入；子目錄的 CLAUDE.md 要碰到那個目錄的檔案才載入。
記憶：這一列是之前 session 留下的狀態。Claude Code 的 auto memory 是模型自己寫的筆記，存在每個專案一個資料夾裡（同一個 repo 的所有 session 共用）：MEMORY.md 是目錄，一則記憶一行，開場載入前 200 行或 25KB；每一則記憶的內容各自一個檔案，模型需要時才用檔案工具讀。這就是 ⑤ 狀態寫下來、下一次經由 ① 資訊讀回來。
表格外還有兩樣：system prompt 整份一直放著；檔案內容沒有索引，模型決定讀才讀。
取捨：左欄放得越多，context 越擠，規則也越容易被忽略；官方建議 CLAUDE.md 控制在 200 行以內。
下方的帶子：什麼時候展開由模型判斷；什麼一直放、什麼只放索引，是 Harness 的設計。
細節在附錄的 Context 組裝（右下角「細節」連結）。
重點句：只放索引，用到才載入。`,
  `這是五格裡的第二格：② 模型判斷——下一步由誰決定。路線由誰決定，有兩種答案。Workflow：設計者事先排好路線，像接駁車；Loop：模型每一輪決定下一步、Harness 執行、結果再回到模型，像計程車。台下多數人都建過 graph，這裡不用多講。
兩端之間是一條光譜。四格各看「誰決定什麼」：固定流程，設計者決定每一步；模型選分支，我們過去用 LangGraph 建的 graph 多半在這裡；Loop 加強制檢查點，例如 Claude Code 修測試、改檔前要人確認；開放的 Loop，例如開 bypassPermissions 的 Claude Code（--dangerously-skip-permissions）：權限全開，每個動作都不再問人。
Workflow 比較便宜、比較快，這是成本選擇，不在今天的範圍；今天只談跟模型強弱有關的判斷。
點出：同一個 Claude Code，換一個權限模式，就從第三格移到第四格——鬆緊是設定出來的，不是產品決定的。
提醒：這是位置的描述，不是推薦。官方文件把 bypassPermissions 定位成「只在隔離的容器或 VM 裡用」；就算在這個模式，明確寫的 deny 規則仍然有效。中間還有 auto mode：不問人，但由另一個模型判斷危不危險——後面把關那段會細講。
大家每天用的 Claude Code、OpenCode、Codex 都在右半邊——這是位置的描述，不是優劣的比較。
重點句：越往右，越多決定交給模型；越能應付沒想到的狀況，代價是要靠把關與驗收。口頭補：模型變強，讓右邊變得可行。鬆緊怎麼拿捏，是第二部分的問題。
下一頁：把關——模型決定要做什麼之後，這個動作能不能做。`,
  `把關是地圖的第三格（③ 把關）：模型決定要做什麼，Harness 決定這個動作能不能做。三件事，由上而下：
一，引導與強制。規則寫進 context（CLAUDE.md、Skill）是引導，照不照做由模型判斷；檢查在模型之外是強制，不照做也做不成。以 Claude Code 為例有三層：Hook、權限規則（deny → ask → allow）、沙箱，越靠近執行越難繞過。官方的建議是：要硬擋，用權限規則而不是 Hook。
二，能退回才能放寬。做錯了退得回來，就不用擋那麼嚴；三家的復原能力差很多，附錄有比較。退不回的，例如部署、寄信、資料送出去，才需要擋。
三，把關也可以交給模型。Claude Code 的 auto mode 由第二個模型（分類器）審動作，危險就擋下。但它不能取代守要求：工作上明確的規定，仍要寫成 deny 規則；對話中說的「不要 push」，壓縮後可能遺失。
細節在附錄：引導與強制、復原（右下角「細節」連結）。
重點句：能退回的才放寬，退不回的才擋。`,
  `行動是地圖的第四格（④ 行動）：Harness 真正去做。這頁是一張 2×2：橫軸是 Harness 自己的，還是從外面接進來的；縱軸是工具，還是 Agent。
左上，工具呼叫：模型決定呼叫哪個，Harness 執行；工具描述本身就是 prompt。右上，MCP：外部的工具和資料接進來，判斷仍在我們的模型。左下，子 Agent：交出一段探索，拿回一份摘要；開子 Agent 是為了隔開 context。右下，A2A：整段判斷交給別人的 Agent。
越往右下，交出去的判斷越多。A2A 業界還沒定調，常見的替代做法是把對方的 Agent 包成 MCP 工具。
細節在附錄五頁：Tool calling、Subagent、MCP、A2A、Agent Card（右下角「細節」連結）。
重點句：從工具到 Agent，判斷交出去越來越多。`,
  `狀態・驗收是地圖的第五格（⑤ 狀態・驗收）。這一格管的是「結束的時候」：有三種結束——context 滿了、session 結束、任務結束。前兩種問留下什麼，是狀態；最後一種問算不算完成，是驗收。
跟 ① 資訊的差別：資訊是每一輪開頭讀進來的，狀態是結束時寫下來的；留下來的東西，下次還是經由資訊再讀進去——地圖上那條虛線就是這個意思。判斷方式：誰、在什麼時候寫的。人事先寫好的規則檔（CLAUDE.md）屬於資訊；壓縮後留下的內容、模型自己記的筆記，屬於狀態。
壓縮：context 滿了就摘要。Claude Code 壓縮後會從磁碟重新載入 CLAUDE.md、auto memory、plan、最近修改的檔案、用過的 Skill；對話中交代的規則，可能不見。
記憶：session 結束，模型自己記下筆記，下次開頭載入。模型寫的筆記不能當規則——規則影響的人越多，越要由人來寫，那就回到 ① 資訊。三家差很多：誰寫、預設開不開、新 session 帶多少，附錄有比較。
完成判定：模型不再呼叫工具，就算完成。要確保真的完成，得加檢查：Stop hook 可以在結束前跑測試、lint，沒過就擋下。
細節在附錄三頁：Compaction、Memory、完成判定（右下角「細節」連結）。
重點句（標題）：結束的時候，留下什麼、算不算完成。完成判定卡上的那句——完成了，是模型的判斷；要真的完成，得加檢查——口頭帶出來。`,
  `第一部分的結論：每一格都是判斷與控制的分界；這條線，正在移動。
這張表就是前面每一頁下方那條帶子收在一起：左邊灰色是交給模型的，右邊深藍是 Harness 控制的。不用逐列唸，挑一兩列帶過，例如：狀態・驗收——記什麼、什麼時候說完成是模型的判斷，什麼一定留下、什麼才算完成是 Harness 控制。
轉場：這些都是別人做好的 Harness。換我們提供工具時，每個控制要不要做、做多緊？這就是第二部分「判斷」要回答的。
這也是給封面問題的第一個階段性答案：看懂了現在的分界在哪裡。`,
  `【第二部分・判斷 10 分鐘】
這一部分是今天的核心：判斷與控制的鬆緊，怎麼拿捏？方法只有一個——每一個控制，先問它為什麼存在。`,
  `每一個控制，先問它為什麼存在（逐張按 →）。只有兩種理由，這頁的例子都是第一部分講過的 Harness 元件。
守要求：工作本身的規定。例如 deny 規則擋 rm -rf；LPQM Agent 被規定「模型寫的程式不能在 prod 跑」。模型再強都需要，做成強制。
為什麼守要求不會過期（口頭帶）：紅燈要停，不是因為駕駛開得不好，開了三十年的老司機也要停。守要求跟能力無關，是因為有人要負責。
補能力：替模型做它還做不到的判斷。例如每個動作都停下來問人（Manual mode）：人在替模型判斷危不危險。模型判斷危險的能力夠了，Claude Code 就把預設換成 auto mode——這已經放寬過一次。先收緊、標記理由；模型變強就放寬。
兩種理由的差別，一句話：守要求一直緊，補能力暫時緊。
成本（更快、更省）是另一種取捨，不在今天範圍，被問到再說。
可能被問：auto mode 能取代守要求嗎？不能。分類器擋的是一般的危險，那是它的判斷；工作上明確的規定，例如某個欄位不准改，仍要寫成 deny 規則——回到第一部分：要不論模型怎麼判斷都擋下，就用強制。auto mode 取代的是「人逐步確認」這個補能力，不是守要求。現成的例子：auto mode 現在預設會直接 push 到 main（後面 Harness Engineering 那頁會講它怎麼一路放寬）。原廠把「push 到 main 要不要問人」當成補能力；如果團隊規定不准直接 push main，那是團隊的守要求——要寫 deny 規則或設遠端的分支保護，原廠的預設不會替你守。
注意：給它資訊和回饋不算補能力——那是給它判斷需要的材料，不是替它判斷，模型再強都需要。
重點句：補能力的控制過期了，就會變成限制；模型變強時，最先放寬的就是它。守要求永遠不放寬。
旁證：比對 11 套 Harness 原始碼的論文作者這樣寫——production 系統投資在 scaffold 上，不是因為模型需要它才能完成任務，而是因為使用者需要安全、穩定、能接進工作流程。換成我們的話：補能力在縮小，守要求留下。`,
  `回到補能力那張卡：為什麼它該放寬？Rich Sutton 的〈The Bitter Lesson〉：算力越多就越強的通用方法，終究勝過把人的知識寫進系統的方法。
怎麼講（一分鐘內）：AI 七十年來有兩類做法——把專家的規則、特徵寫進去；或用通用方法讓系統自己算、自己學。算力每幾年便宜好幾倍，所以長期看，吃算力的方法一定追上。「苦澀」是因為研究者花心血寫進去的知識，最後都被取代。做影像的都親身經歷過：手工特徵被 CNN 取代。
放到 Agent：模型變強了，替它補的控制就該放寬；不放寬，就從幫手變成阻礙。
看時間軸：每個時間點，上面一行小字是當時的模型能力，下面是 Harness 的結構。Lance Martin 的 Open Deep Research，2024 年底工具呼叫還不可靠，所以用固定分工——補能力；2025 年初工具呼叫變可靠了，結構反而礙事；改寫兩次、拆掉結構後，排進 Deep Research Bench 前十。模型能力一動，結構就該跟著動。
下面是他自己在文章〈Learning the Bitter Lesson〉（2025-07）裡寫的三個教訓：1. 看清楚設計裡，假設了模型做不到什麼（原文：consider what LLM performance assumptions are baked into the design）——他當初因為工具呼叫不可靠而避開它，「幾個月後就不是這樣了」。這就是第二部分說的補能力。2. 模型進步時，重新檢查這些假設——他自己承認，工具呼叫變可靠之後，他重新檢查得太慢。3. 讓結構容易拆掉。
保留一句：現在加補能力的結構沒有錯，只是要當成會過期的東西。下一頁把這三個教訓收成兩個動作。
被問到 LangGraph（第 3 點的原文）：他認為框架的抽象可能讓結構更難拆；他仍然用 LangGraph，但只用最底層的 node 和 edge，方便隨時重組。所以問題不在用不用框架，而在結構拆不拆得掉。
注意範圍：該放寬的是「為了補能力」寫死的控制，不是所有流程。守要求的控制不在此列。
備用：對懂強化學習的人可以直說——補能力的分支就是人寫的 policy，模型練得越好，越用不上。Tesla FSD v12 據報導把約 30 萬行手寫 C++ 規則換成端到端神經網路（媒體報導，非官方數字）。
轉場：放寬只是一半；Agent 出錯時，可能要收緊。`,
  `Harness Engineering，採用 OpenAI 的用法：Humans steer. Agents execute. 他們讓 Codex 寫了約一百萬行程式，工程師的工作變成設計環境、說清楚意圖、建立回饋迴路。
這頁把上一頁接起來：維護 Harness 只有兩個動作，收緊和放寬——照時間順序，先收緊、標記理由，模型升級時才放寬。
收緊：時機是 Agent 出錯時，但先別急著收緊。先問原因：缺資訊嗎？就補資訊（context、AGENTS.md、Skill 描述）；缺回饋嗎？就補驗收（測試、Stop 時的檢查）；都不缺，才是能力不足，才收緊控制——只收到通過的最小程度，並標記理由。能用材料解決的，就不要替它判斷。例子：規則在壓縮後被忘了，就寫進 CLAUDE.md（第一部分 compaction 那頁）。
放寬：時機是模型升級時。逐一檢查補能力的控制，還需要嗎？不需要就放寬——具體做法就是把那段結構拆掉。例子就是上一頁的 Open Deep Research；第二個例子是大家手上的 Claude Code。依官方文件（permission modes，2026-10），auto mode 對 push 的預設是一版一版放寬的：v2.1.203 以前，直接 push 到預設分支一律擋下；v2.1.211 以前，只放行起始分支、Claude 自己開的分支和例行 push；現在 push 到目前 repo 的任何分支都放行，不會問人。一直沒放寬的是 force push、把 secrets 帶出 repo、production 部署——放寬的是補能力，守要求沒動。
重點句：收緊時標記理由，放寬時才找得到；兩件事一直做，就是 Harness Engineering。
Mitchell Hashimoto（2026-02）：每次 Agent 犯錯，就設計一個解法，讓它不再犯同樣的錯。
OpenAI 的具體做法：AGENTS.md 當目錄不當百科；架構規則用 linter 與結構測試強制；背景 Agent 持續修正偏離規則的地方。
口頭帶出 ML 類比（頁面上不寫）：出錯時那一半就像訓練模型時的 error analysis 加 eval——先分辨錯誤來源，是資料、標註，還是模型容量；只是調的不是權重，而是工作環境。`,
  `前一頁講了方向：收緊、放寬；Lance 的第二個教訓說模型進步時要重新檢查假設。這頁回答：用什麼檢查。
第一步，留紀錄：每一步模型看到什麼、呼叫什麼工具、結果如何。有一篇 survey 把它列為 Harness 的六個元件之一（評估介面）：只有 log，只能知道工具被呼叫了；有結構化的軌跡，才能知道那一步有沒有讓任務往前。Anthropic 的 evals 文章也強調：要讀很多次執行的紀錄和評分，才知道評分本身準不準。
第二步，失敗變成測試題：Anthropic〈Demystifying evals for AI agents〉（2026-01）的建議是，不用等到有幾百題，「20～50 題從真實失敗來的簡單任務」就是很好的起點；已經上線的，從使用者回報的問題轉成測試題。
第三步，換模型就重跑：這是 Lance 第二個教訓的具體做法。補能力的控制，換了模型重跑發現不需要了，就拆；守要求的，看下面那個指標。
兩種算法：pass@k 是 k 次裡至少一次成功，k 越大分數越高；pass^k 是 k 次全部成功，k 越大分數越低。守要求要看的是後者——每次都對，才能放心交出去。
回扣：第三部分 Plugin 那頁說測試題放在包裝外面、最後「我們負責」那頁的測試題與 eval，都是這一頁。
重點句：鬆緊不靠感覺：紀錄指出哪裡錯，測試題決定能不能放。`,
  `第二部分結論：補能力的會放寬，守要求的不會；放不放，用證據決定。
兩種理由，各自什麼時候放寬：守要求做成強制，模型再強都不放寬；補能力先收緊、標記理由，模型升級就檢查能不能放寬。
轉場：原則有了。換我們自己提供工具時，三個問題：留下什麼（先拿 LPQM Agent 重調一次）、交給誰用、誰來做。這就是第三部分「動手」。`,
  `【第三部分・動手 8 分鐘】
這一部分回答開場的問題：模型變強後，我們還要做什麼？先拋一個命題，再拿真實系統驗證，最後把同一個問題問在自己身上。
命題：以後面對需求，是不是交一個通用 Harness 給使用者就好？我們頂多幫忙做 Skill、做 Plugin？
可以這樣問台下：Claude Code 寫程式這麼順手，知識能加 Skill、操作能力能接工具或 Plugin，都補上之後，就能直接交給其他單位用了嗎？
在這裡停一下，讓問題懸著。不憑感覺回答，拿一個真實系統來驗證：LPQM Data Summary Agent。
這裡說的通用 Harness，指的是引擎（迴圈、工具呼叫、context 管理）；預設要為使用者重新設定——後面要講的就是怎麼重新調鬆緊。`,
  `LPQM Agent 的每個節點，當初為什麼存在？這是 LPQM Data Summary Agent，講者自己做的專案。
先只看上排：四個節點各做什麼。Extractor 依術語表找出問句裡的術語；Clarifier 判斷分析主體、分析方式是否明確，不明確就先反問；接著依條件抓資料（圖上省略）；Plan & Execute 先排步驟，再用設計好的表格工具照著執行；Summarizer 整理工具呼叫過程，說明結果怎麼來。
Extractor 有兩個原因：術語表太大放不進 prompt（補能力）；欄位值必須 100% 正確（守要求）。
Clarifier：當時模型不會主動反問（補能力）。
Plan & Execute 也有兩個：原本是 Plan & ReAct，但執行的模型常不照計畫走，難查又不穩，所以拿掉自由度、強制照計畫執行（補能力——這是收緊）；另外規定 LLM 產生的程式碼不能在 prod 執行，所以設計表格工具讓模型做 tool calling（守要求）。
Summarizer：只給最終表格太單薄，也要讓使用者確認操作符合他的要求（守要求，是我們對「完成」的定義）。
按 → 前先問台下：這些節點，哪些模型變強後會過期？再按 → 揭曉（上面是各節點的原因）。顏色是設計目的：橘色是補能力——第二部分說的，過期後會變成限制的那種；深藍是守要求。
揭曉顏色時口頭說：同一個節點，可能一半會過期、一半不會（Extractor 一橘一藍、Plan & Execute 一橘一藍）；所以要一個一個問它為什麼存在——這就是第二部分的方法。
最後一句是問句，用來翻到下一頁：那麼，哪些會留下來？`,
  `同一個系統，鬆緊重調一次。左邊是交給通用 Harness 的，右邊是留下來的。
左邊都是補能力：術語表放不進 prompt，所以先固定篩一次——現在模型需要時自己查；模型不會主動反問，所以固定一個 Clarifier——現在 Harness 本來就能隨時反問，而且模糊常常要看到資料才出現；執行時偏離計畫，所以強制照計畫走——這是當初收緊來換穩定——鬆緊不是只會往放寬的方向調；Summarizer 另外用一個模型寫說明——現在執行的模型自己就能說明。
右邊只回答一件事：哪些留下來。每一項後面的標籤，就是上一頁那兩種理由的顏色。三項守要求的留下來：查詢時檢查欄位值、只開放設計好的表格操作、回覆時附上操作清單——這些不會因為模型變強而消失。術語表和判斷框架是業務知識，標灰色，留下來是因為它是資訊；過期的是當初補能力的節點結構，知識留了下來——對應結尾的「要有人提供」。
先不說各自放在哪裡，那是下一頁。
口頭回扣第一部分：這些控制還是落在資訊、行動、驗收這幾個著力點上。
重點句：迴圈交給通用 Harness；業務知識和守要求留下，換到更好的位置——這是對命題的第一個回答。
注意：「現在模型做得到」要用舊的測試題重跑過才能說——這也是後面「需要保證每次都對」那一題。`,
  `留下來的，怎麼交出去？Harness 很強了，我們交付的不再是 Agent，而是放進 Harness 的東西：使用者的業務知識寫成 Skill、我們做的工具和強制，打包成 Plugin 一起交出去；再加上一組測試題。
上一頁留下來的每一項，這一頁都要找到位置。知識（術語表、判斷框架）放進 Skill，使用者也能寫。回覆時附上操作清單，以前是 Summarizer 這個節點在守要求；如果只寫成 Skill 裡的一句話，那只是引導，模型可能漏掉，所以用 Hook 在回覆前檢查——例如 Claude Code 的 Stop hook，沒附操作清單就擋下、不讓結束。
欄位值檢查和只開放設計好的表格操作，都做在 MCP server 端，在 Plugin 外面：就算 Harness 被繞過，也擋得住，模型寫的程式碰不到 prod。Plugin 只帶 MCP 的連線設定。權限做在資料來源或前端，LPQM Agent 就是做在前端；測試題拿來驗證整包。
重點句：Plugin 是包裝；真正不能錯的，要做在包裝外面。如果把規則寫成 Plugin 裡的 Skill，那只是引導。
補充（被問到）：Plugin 是 Claude Code 與 claude.ai 的打包格式，其他 Harness 有各自的做法；能跨 Harness 帶著走的是 Skill 和 MCP。Plugin 可以由管理員用 managed settings 統一發布、強制啟用。`,
  `上一頁回答了「留下的放在哪裡」；這頁回答「交給誰用」。命題是「以後是不是交一個通用 Harness 就好」——答案取決於使用的人是誰。
使用者自己用：裝成 Plugin，放進使用者自己的 Harness，人在線上，隨時能核准。
個人型 Agent 要操作我們的系統：我們的團隊把這叫 System Agent——每個公司系統都能被 Agent 使用，個人型 Agent 處理個人的事，透過 System Agent 去操作系統。交付形式是工具，或整個任務；人在線上，但在對方那一端。下一頁細講：什麼時候系統才需要長成一個 Agent。
事件觸發（職能型 Agent，線上沒有人）：告警、排程、工單觸發，沒人開口。做法是把整個 Harness 當函式庫嵌進服務。現在主要的 Harness 都提供 SDK：Claude Agent SDK 給的是跟 Claude Code 一樣的工具、迴圈和 context 管理，Python、TypeScript 都能用，也有 hooks、子 Agent、MCP、權限、session；Codex SDK（TypeScript、Python）可以開 thread、跑任務，官方列的用途包括放進 CI/CD；OpenCode 有 @opencode/sdk，在程式裡直接起一個 OpenCode。框架那邊反過來：LangChain 的 Deep Agents 自稱 agent harness，跑在 LangGraph 的執行環境上。兩邊收斂成同一個形狀：迴圈、工具、Skill、子 Agent、hook、MCP、session。
這一欄是展望，口頭說：目前團隊還沒有這類需求，下下頁再講。
被問到「那以後還用 LangGraph 嗎」：那篇比對 11 套 coding Harness 原始碼的論文發現，沒有一套在 Agent 的執行環境用 LangChain、LangGraph 這類框架，迴圈都是自己寫的；它的建議是，要現成的起點，就用 Harness 的 SDK。但這是 Agent 迴圈的趨勢，不是規則——LPQM Agent 裡真正固定的流程，用 graph 寫仍然合理（回到 Workflow 到 Loop 那頁的左端）。
再下兩頁：System Agent，以及職能型 Agent。
共用的底：三條路後面是同一組 server 端檢查，所以不管從哪條路進來，不能錯的都擋得住——接回上一頁「真正不能錯的，要做在包裝外面」。
重點句：交給誰用，決定交付形式；不能錯的，三條路都靠同一組 server 端檢查。`,
  `上一頁第二欄：個人型 Agent 要操作我們的系統。我們團隊的定義是 System Agent——每個系統都能被 Agent 使用，個人型 Agent 透過 System Agent 操作系統。角度也翻過來：第一部分的 MCP、A2A 是我們用別人的；這頁是我們做的東西被別人的 Agent 用。
① 交出多少。關鍵問題：對方的 Agent 缺的是什麼？缺知識，就給 Skill，判斷全在對方的模型；缺動作（碰不到我們的系統），就給 MCP 工具，怎麼用對方判斷，不能錯的檢查寫在我們 server 端，Harness 被繞過也擋得住；缺判斷（要懂這個領域才知道怎麼問、怎麼查、要不要先反問），才長成 System Agent，由我們的模型判斷，品質我們負責。例子都來自剛拆完的 LPQM Agent：術語表、判斷框架是 Skill；查詢內部資料時的欄位值檢查是 MCP 工具；反問、規劃、整理說明，原本的 Clarifier、Plan & Execute、Summarizer，就是 System Agent 那一層。
為什麼不是每個系統都要長成 Agent：多一層模型，就多一層判斷；判斷交出去，呼叫方只看得到結果；明確的操作包成工具就夠了。
這三種缺口剛好對到第一部分地圖的三格：資訊、行動、模型判斷——缺的越接近判斷，交出去的就越多。
怎麼交：預設包成 MCP 工具；要反問、長時間、沒人在線上，再加 A2A。差別有三點：(a) 對方的 Harness：MCP 幾乎都支援；A2A 少數支援，例如 Gemini CLI、雲端 Agent 平台——coding Harness 裡只有 Gemini CLI 原生支援 A2A，Claude Code、Codex、OpenCode 都沒有；A2A 主要長在 Azure AI Foundry、Copilot Studio、Bedrock AgentCore 這類平台。(b) 需要反問時：MCP 的 elicitation 是問客戶端畫面前的人；A2A 的 input-required 是交回呼叫我們的 Agent，它可以自己回答或再問它的使用者。(c) 長時間任務：MCP 2025-11-25 版規格才加入 Tasks，仍標實驗性；A2A 原生支援輪詢、串流、webhook 推送。兩個入口後面是同一個 System Agent，身分與不能錯的檢查都在我們這邊。細節見附錄的 MCP、A2A、Agent Card 頁。
System Agent 的價值：系統負責人把守要求集中寫一次，所有個人型 Agent 都經過同一套強制。
② 用誰的權限，這是 System Agent 最重要的工程重點：它要用原始使用者的權限操作系統，身分沿著整條鏈傳下去，系統用這個身分查權限；不能用它自己的高權限，否則別人就能借它的權限做事——這是 confused deputy，也就是權限破口。另外，別的 Agent 傳來的訊息不能當成使用者同意（Claude Code 文件明文規定）。
名片補充：Agent Card 放在固定網址，對方模型只會讀到 description 和 skills 的名稱與描述——那是唯一能影響對方「要不要找我們」的地方，要寫清楚會做什麼、不做什麼；但不能靠描述擋人，真正的權限在我們 server 端依呼叫者身分決定。
重點句：缺判斷才長成 Agent；操作系統時，用的是原始使用者的權限。`,
  `這頁是展望，口頭說明：目前團隊還沒有這類需求，這是一種 Agent 型態的想像。
定義：職能型 Agent 在組織裡擔任一個職位，由告警、排程、工單觸發，沒人開口、線上沒人。引擎跟個人型 Agent 一樣，差別都在引擎外面那一圈。
左邊五格，對照第一部分的地圖：看——從事件本身組 context，記憶跟著職位、不跟著某個人；想——入口用 Workflow，依觸發類型分流，裡面再用 Loop；擋——不能當場問人，事前寫成規則；做——用自己的身分，權限最小化（例如 Microsoft Entra 的 agent 身分不能擁有高權限管理角色）；記——每次都要對，留紀錄，非同步通知負責人。
業界實例：Azure SRE Agent、AWS DevOps Agent（自動調查告警與工單）、Datadog Bits AI SRE（調查每個告警）。右邊講 Azure SRE Agent 的執行模式：Review（人核准）與 Autonomous，依每個 response plan 與每個排程任務分開設定；官方建議先用 Review 跑 2–4 週，一直被核准的那一類再切成 Autonomous。這就是第二部分「放不放，用證據決定」，而且是一類一類放。
回扣主線：補能力的會變薄，守要求的不會；越自主，守要求越重要。
重點句：越自主，守要求越重要；放寬，一個觸發一個觸發來。`,
  `把同一個問題，問在我們自己身上：我們替使用者做 Agent，這件事為什麼存在？（逐列按 →）
第一列：把需求寫成 graph、做成 service——這是補能力。使用者不會寫程式、模型不夠強、通用 Harness 還不存在。LPQM Agent 就是例子，而它正在過期。
第二列：術語與業務規則本來就在使用者身上，我們只是轉譯；使用者現在能自己寫 Skill，轉譯會過期。
第三列：讓不能錯的事不可能錯——守要求，不會過期。
第四列：共用的工具與測試方法——看規模與成本，不在今天的兩類裡。
補充：有些部門的資料只能留在需求單位內，這時更傾向讓使用者自己做，因為資料出不來，我們也碰不到。
重點句：我們過去的工作量，大宗是補能力；它正在過期。直接陳述，不修飾。`,
  `這個需求，該誰來做？把前兩頁收成一個分工。
左邊，使用者自己做——大部分需求在這裡：代表使用者本人、用自己的權限、自己看結果，拿來探索、看一次就好。怎麼做：通用 Harness 加上自己寫的 Skill。單看一次答案，使用者是領域專家，判斷得比我們好。
右邊，需要我們——兩個條件任一成立：
一是線上沒有人：代表單位或流程，例如排程、系統事件、寫進共用系統（職能型 Agent）。OpenCode 是例子：TUI 只是連到 server 的用戶端，opencode serve 只啟動 server；引擎一樣，差在線上有沒有人，而 server 沒有多使用者的設計，身分、權限、紀錄要另外補。
二是要每次都對：重複使用、拿去做決策。一次對不代表每次對——同一題跑十次可能錯一次，模型升級後原本對的可能變錯，邊界情況平常遇不到（pass^k：k 次要全對）。
我們負責：身分與權限、事前的強制（例如 LPQM Agent 的欄位值檢查）、測試題與 eval。分工：需求單位知道什麼是對的，提供題目和標準答案；我們知道怎麼大量、重複地檢查——跑多次、換模型重跑、處理輸出不固定的比對——這是 eval，ML 工程師的專業。Anthropic 的建議也是這樣分：domain expert 出題，eval 團隊負責基礎設施；起步只要 20 到 50 題，從真實的失敗挑。
資料規定與成本：看部門，沒有通用答案，跟需求單位一起決定。有些部門的資料只能留在需求單位內，這時更傾向讓使用者自己做。
被問到「把守要求做成強制很難嗎？」：寫一條檢查不難，難的是三件事——先問出哪些規則不能錯；再決定工具切多細，太窄做不了事、太寬等於沒把關；最後用測試題證明它守得住，模型換了還要重跑。
重點句：大部分需求使用者自己做；使用者知道什麼是對的，我們負責讓它每次都對。`,
  `【結尾 3 分鐘】
回到封面的問題：哪些交給模型，哪些留給人？三張卡就是答案。
交給模型的——會被吸收的：因為能力不足而存在的，補能力的流程與提示。注意是「終究會」，不是「現在就會」——哪些已經被吸收，要用測試題驗證。
留給人的有兩種。要有人提供的：因為知識在人身上而存在的，業務規則、術語、什麼才算對。模型再強也不會自己知道。
要有人負責的：因為責任與授權而存在的，核准、承擔後果、驗收。能力會被取代，責任不會。
（成本（更快、更省）是另一種取捨，不在今天範圍，被問到再說。）
講者自己的心得（LPQM Agent）：我花了很久讓那張 graph 能用，現在大部分都能交給通用 Harness。但拆開來看，被取代的是補能力的結構；術語表、判斷框架，是對業務的理解，現在變成 Skill；「不能在 prod 跑模型寫的程式」這條規定，到今天依然成立。如果被問到要不要繼續用 LangGraph：一份比對 11 套 coding Harness 原始碼的研究（2026-07）發現，沒有一套在 agent 迴圈裡用 LangGraph、LangChain 這類框架；LangChain 自己也做了 Deep Agents 這個 Harness。對照第一部分的光譜：graph 適合左半邊、路線事先排好的流程；越往右邊的開放 Loop，越是 Harness 的地盤——不是誰對誰錯，是位置不同。
最後一句回到第 3 頁的鬆緊：哪些判斷交給模型，哪些由 Harness 控制。模型越強，可以放得越寬；知識和責任，留在人這邊。
（可口頭補一句：不再畫好路線讓它照走，而是設計它的工作環境。）`,
  `【Q&A 10 分鐘】
備用素材：外部內容可能夾帶指令（文件、信件裡的文字；Agent 用使用者的身分被騙，後果算在使用者頭上——把關做進工具，不靠模型判斷）；A2A（跨單位的 Agent 協作：把中途判斷交給別人的模型與 Harness；協定處理怎麼溝通，不處理誰負責）；四種交付方式（不一定要用 Agent／個人 Harness＋組織共用能力層／服務型 Agent／現成企業平台，看需求選，不是一路升級）；Deep Agents（LangChain 的 Harness 函式庫，可當服務型 Agent 的引擎）；Karpathy 的 context engineering 與自主程度滑桿、Ilya 的修 bug 例子、METR 的任務時長數據；「模型變強，不是該更寬容嗎？」——Mistral Vibe 在 2026 年把模糊比對的編輯工具換成精確比對：Harness 不再替模型猜要改哪裡，精確度的判斷交還給模型；依我們的定義這是放寬，放寬不等於規則變少（來源：11 套 Harness 原始碼研究）。`,
  undefined,
  `（附錄）最小的 Harness 長什麼樣。一篇比對 11 套 coding Harness 原始碼的論文（Barbaste 等，2026）給了一個約 90 行 Python 的最小版：一個 while 迴圈，模型不再呼叫工具就結束；四個工具——bash、讀檔、寫檔、搜尋取代（改檔工具要求要找的那段字剛好出現一次，否則不改）；每一層的 AGENTS.md 全部放進去；只有回合數與花費兩個上限；超過門檻就摘要，保留 system prompt 和最近 30%。沒有用任何框架。
右欄是最小版還沒有的：用到才載入、Skill、記憶；權限規則、Hook、沙箱、復原；子 Agent、MCP、A2A；跨 session 的記憶、完成前的檢查。作者建議從這裡開始量測，再補實際觀察到的失敗需要的最少東西。
門檻很低：研究用的 Mini-SWE-Agent 約 100 行，自報成績跟大上千倍的系統同一水準（自報、條件不同，只能說門檻低）。production 多出來的程式碼，主要花在安全、穩定、接進流程，第二部分會回來。講完按「回到」連結回 Harness 地圖。
重點句：最小版就能跑；後面補的，大多是為了安全和穩定。`,
  `（附錄）這頁是 ① 資訊的細節。模型每一輪看到的東西，是 Harness 組出來的。以 Claude Code 為例。
左邊一直放著：system prompt、CLAUDE.md 或 AGENTS.md（工作目錄以上每一層）、auto memory（模型跨 session 自己記的筆記，Memory 那頁細講）的前 200 行或 25KB、每個 Skill 的一行描述、MCP 工具只列名稱。
右邊平常只放索引：Skill 全文等模型決定要用才載入；MCP 工具的完整 schema 透過 tool search 找到才載入；子目錄的 CLAUDE.md 要碰到那個目錄的檔案才載入。
下方的帶子：什麼時候展開由模型判斷；什麼一直放、什麼只放索引，是 Harness 的設計。這也是 Skill 的設計重點——一行描述寫不好，模型就不會去展開它。
取捨：官方建議 CLAUDE.md 控制在 200 行以內，越長越佔 context，遵守度也越低。
連到工作：知識問答答錯，常常不是模型不夠聰明，而是該放的沒放、不該放的放太多。
補充：查程式碼，production 的 coding Harness 都不用向量 RAG——論文比對的 11 套，查程式碼都靠 grep、glob 加隨需讀檔。事先檢索塞進 context，是 Harness 決定模型看什麼；讓模型自己 grep，是模型決定——這本身就是一個鬆緊的選擇。`,
  `（附錄）先講為什麼要把關：有些動作做了就收不回來——寄出的信、刪掉的資料、送出的申請。
這頁正式介紹兩個詞，第二部分會一直用到。左右兩區的顏色跟每頁的帶子一樣：
左邊灰色虛線是引導：規則寫進 CLAUDE.md、Skill，進到 context，模型讀到之後照不照做，由模型判斷。所以引導落在「模型判斷」這一側。
右邊深藍實線是強制：檢查在模型之外，不照做也做不成。以 Claude Code 為例有三層：
1. Hook：工具執行前跑自己寫的程式，exit 2 就擋下。限制：比對條件是盡力而為，Hook 失敗或逾時預設放行。
2. 權限規則：deny → ask → allow，取第一個符合的；範圍再小的 allow，也不能在 deny 裡開例外。限制：官方文件自己寫了，deny 規則比對不到用路徑呼叫、或包在 sh -c 裡的同一個程式。
3. 沙箱：作業系統層限制檔案與網路（macOS 用 Seatbelt，Linux 用 bubblewrap），指令怎麼寫都一樣。限制：只管 shell 指令，而且預設關閉。
被問到「Harness 整個被繞過怎麼辦」：再往外還有收到請求的系統自己檢查，例如 Git 服務端的分支保護；那已經不是 Harness 的元件，第三部分 Plugin 那頁會講到。
重點：由上到下，越靠近執行，越難被繞過。官方的建議也是這個方向：要硬擋，用權限規則而不是 Hook；網路限制要搭配沙箱。
再補一個例子：「我寫了 Skill 它為什麼沒用」——Skill 由模型決定何時用，它是引導；Hook 由事件觸發，一定會執行，它是強制。
以上都是寫死的規則。畫面下方那一行是另一個做法：把關本身也交給模型——Claude Code 的 auto mode（新版 v2.1.283 起，在終端機和 VS Code 的預設權限模式就是它）。主模型送出動作，由第二個模型——分類器——判斷危不危險，危險就擋下。分類器看得到使用者訊息、工具呼叫和 CLAUDE.md，看不到工具結果；理由是檔案、網頁裡的惡意內容（prompt injection）沒辦法直接操控它。
退路：連續擋 3 次、或累計擋 20 次，就暫停 auto mode，改回由人確認，這兩個門檻不能調整。它預設擋下的，大多是收不回來的動作：force push、production 部署、資料送出外部等。
限制：對話裡說的「不要 push」這類界線，分類器每次從對話紀錄重讀，壓縮後可能遺失（後面 Compaction 那頁會講）；要硬保證，寫 deny 規則。
重點：判斷可以交給模型，但判斷者看得到什麼、出錯幾次換人，由 Harness 決定。這一行幾乎就是整場主題的縮影。`,
  `（附錄）復原：引導與強制那頁講的是怎麼擋。另一個方向是：做錯了能不能退。能退的，就不用擋那麼嚴。
三家做法不同（依官方文件與開源程式碼，2026-10）：
Claude Code：每次送出 prompt 前，記下 Claude 用編輯工具改過的檔案；/rewind（或按兩次 Esc）可以只退程式碼、只退對話，或一起退。保留最近 100 個 checkpoint，約 30 天後清除。官方文件寫明的限制：bash 指令改的檔（rm、mv、cp）不追蹤；多數子 agent 的編輯不會還原；外部的改動不追蹤；它不能取代版本控制。
OpenCode：在另一個 git 儲存庫裡，每一步的前後替整個工作目錄拍快照，所以 bash 改的檔也退得回來；/undo 會移除最近一則訊息、之後的回覆和檔案改動，/redo 可以還原。限制：專案必須是 git repo；超過 2MB 的未追蹤檔案不拍。
Codex：不記。早期版本有檔案快照，現在的原始碼已經移除（設定只為相容而保留）；回到之前的 prompt 只改對話紀錄，原始碼註解寫明不會還原檔案。它走另一個方向：用沙箱圈住能碰的範圍——工作區外寫不進去、.git 唯讀、網路預設關閉；非互動模式預設要求在 git repo 裡執行。
三種策略：記下自己做的（Claude Code）、記下整個環境（OpenCode）、不記但圈住範圍（Codex）。「退得回」和「圈得住」，都是放寬把關的前提。
三家都退不回的：已經送到外面的——production 部署、寄出的信、資料送出外部。auto mode 預設擋下的，大多就是這一類：force push、production 部署、毀掉 session 開始前就存在的檔案、資料送出外部；反過來，刪掉 Claude 自己這個 session 建立的工作是放行的。
重點句：能退回的，就能放寬；退不回的，才需要擋。這也是第二部分「放寬之前先問什麼」的另一個角度。`,
  `（附錄）行動：先看一次工具呼叫實際發生什麼。依 Claude API 官方文件：
1. Harness 把工具定義放進 context：名稱、描述、參數的 JSON schema。每一輪都放，所以每一輪都佔 token。
2. 模型輸出 tool_use——一段 JSON 請求——然後停下（stop_reason 是 tool_use）。一次可以並行好幾個呼叫。
3. Harness 執行，把 tool_result 放回對話。在哪裡執行（本機、沙箱、遠端）是 Harness 決定的；結果太長會截斷。
4. 模型讀結果，決定下一步。
重點句（標題）：工具描述就是 prompt。模型只看描述決定要不要用；描述寫不清楚，它就選不對工具。
口頭帶三個設計取捨（頁面上不寫；出處 Anthropic〈Writing effective tools for agents〉，2025-09）：描述要寫給新同事看，把隱含背景講明白，改幾個字就可能改變行為，要用 eval 驗證；不要只是包一層 API，把常一起用的步驟合成一個工具；回傳要省 token，分頁、篩選、截斷，Claude Code 預設單次回傳上限 25,000 token。
連到工作：我們給使用者用的工具，描述常常是寫給工程師看的；模型不懂內部術語，就不會選對工具。
補充：不要把每個 API 一對一包成工具；把常一起用的步驟合併成一個設計好的操作，模型比較不會用錯——第三部分的『設計好的表格操作』就是這個。`,
  `（附錄）Tool calling 那頁講的工具，是模型呼叫、Harness 執行、結果放回 context。子 Agent 本質上也是一個工具——在 Claude Code 裡，開子 Agent 就是呼叫 Agent 工具（2.1.63 版以前叫 Task）。差別是：這個工具自己會跑一個迴圈，從全新的 context 開始，看不到主對話，做完只回傳摘要。
什麼時候開，依 Claude Code 官方文件（sub-agents、best practices，2026-10）：
一，過程很髒、結果很小。搜尋結果、log、檔案內容會塞滿主對話、之後又用不到時，交給子 Agent。
二，需要另一雙眼睛。官方建議完成前開一個子 Agent 審 diff：它只看得到 diff 和你給的標準，看不到產生改動的推理，所以不會偏袒自己剛寫的東西——做事的不是打分數的。提醒：這仍是引導，真正不能錯的檢查要用 Hook（⑤ 完成判定那頁）。被要求找問題的審查者通常都會找到一些，要它只回報影響正確性或需求的問題。
三，要不同的權限或模型。內建的 Explore 是唯讀；也可以把探索交給便宜的模型。等於在一段工作上套一層比較緊的 Harness。
四，真的能平行的大範圍探索。Anthropic 的研究系統在這類任務上比單一 Agent 高 90.2%，但多 Agent 大約多用 15 倍 token；要方向互相獨立、任務值得。大多數 coding 任務能平行的部分比研究少。
什麼時候不開，官方列了四種：要來回修改；規劃、實作、測試共用大量 context；一句話說得完的小改動；在意速度——子 Agent 從零開始，要時間收集 context。
判斷收成一句：這段過程，主 Agent 之後還要不要看？不需要、或刻意不讓它看（審查），就開；需要，就留在主對話。
其他設定：子 Agent 的工具可用 tools 白名單、disallowedTools 黑名單限縮，model 欄位指定模型；預設最多往下開三層。
一個提醒：很多人習慣「一個節點一個 Agent」的分工，但 production Harness 開子 Agent 的理由是隔開 context 和獨立的眼光，不是分工。這也是後面 Open Deep Research 拆掉固定分工的原因。
右下角「細節：互相辯論」連到辯論那頁，講完按「回到 Subagent」。`,
  `（附錄）常被問：子 Agent 之間能不能溝通？例如叫主 Agent 開兩個子 Agent 去辯論。依 Claude Code 官方文件（sub-agents、agent teams，2026-10），有三種做法。
一，主 Agent 當主持人：開正方、反方兩個子 Agent，主 Agent 用 SendMessage 把正方的論點帶給反方（SendMessage 可以喚回已完成的子 Agent），再把反駁帶回正方。一般 subagent 就做得到，最穩；代價是每一輪都回到主 Agent 的 context。
二，子 Agent 直接互傳：主 Agent 開子 Agent 時給它名字，子 Agent 又有 SendMessage 工具，啟動時會拿到一份名單，列出 main 和其他有名字的 Agent，可以直接傳訊息。但名單是啟動當下的快照，比它晚開的不在上面；被叫醒的 Agent 會把結果回給叫醒它的那一個，不是回到主對話。做得到，但不順。
三，Agent teams：一個 lead 加幾個 teammate，teammate 之間直接傳訊息、共用任務清單。官方文件的例子就是開五個 teammate、像科學辯論一樣互相反駁彼此的假設——單一 Agent 找到一個說得通的解釋就容易停下來，被第一個假設牽著走；幾個獨立的調查者互相反駁，留下來的比較可能是真正的原因。但它是實驗功能，預設關閉（CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 才開），只在互動模式；用 -p 或 Agent SDK 時不會開 teammate。token 也多很多，每個 teammate 都是獨立的 Claude。
對我們的意義：我們做給別人用的 Agent 多半跑在 SDK 裡，Agent teams 不會開，所以要辯論，預設用第一種。
回到鬆緊的角度：子 Agent 之所以像工具，是因為交出去、拿回來，判斷一直在主 Agent。一旦讓它們彼此對話，就從呼叫工具變成協調一群 Agent，判斷分散到好幾個模型，Harness 要管的事也變多：誰能傳給誰、別的 Agent 的訊息能不能當成使用者的同意——官方寫明不能，任何 Agent 的訊息都不算使用者核准權限。`,
  `（附錄）工具和子 Agent 都是 Harness 自己的；這頁看外部的。
工具多了之後，從哪裡來？MCP 是外接工具和資料的共同標準：server 可以提供工具（模型決定呼叫）、資料（resources，例如 Claude Code 用 @ 引用）和預設提示（prompts，例如變成斜線指令）；這頁聚焦在最常用的工具。兩端：MCP client 在 Harness 裡，負責連線、取得工具清單、轉送呼叫；MCP server 把外部系統（Jira、Drive、內部 DB）包成工具，也可以提供資源和 prompt 範本。一個 MCP server 寫一次，支援 MCP 的 Harness 都能接。被問到 MCP 解決什麼：沒有共同標準時，每個 Harness 和每個系統的組合都要各寫一次整合（3 個 Harness × 3 個系統＝9 份）；有了 MCP，系統寫一次，支援的 Harness 都能用（3＋3＝6 份）。
接多了有兩個代價（Anthropic〈Code execution with MCP〉，2025-11）：
第一，工具定義擠滿 context。Harness 的解法是用到才載入：Claude Code 預設只列 MCP 工具名稱，透過 tool search 找到才載入完整 schema。
第二，每個中間結果都要經過模型——例如把一份逐字稿從一個系統搬到另一個系統，整份內容要被模型讀進來、再寫出去。解法是讓模型寫程式呼叫工具，中間資料在執行環境裡處理掉，只把需要的結果交回模型。文章的例子從 15 萬 token 降到 2,000 token。
伏筆：寫程式呼叫工具要有地方執行程式。LPQM Agent 當時被規定「模型產生的程式不能在 prod 執行」，所以只能選 tool calling——在哪裡執行，是 Harness 的控制，也是第三部分會回來的限制。
A2A 放在 Q&A 備用素材。
補充：MCP 接進來的是工具；如果接進來的是另一個 Agent，就是 A2A。`,
  `（附錄）A2A：Agent 從外面接進來——MCP 的下一步。MCP 接進來的是工具，判斷還在我們的模型，每次呼叫我們都看得到；A2A 接進來的是另一個 Agent，也就是別人的模型加上別人的 Harness，中間的判斷在對方，我們只看得到狀態和交回的結果。依 A2A 1.0 規格（Linux Foundation 開源專案，由 Google 提出）。
這頁是一次委派的完整流程，照時間順序有四個點，每個點都有一道控制：
1 出發前・交給誰：先讀對方的名片（Agent Card），看它會做什麼、要怎麼連、要什麼身分；名片可以簽章，連線也能驗證對方身分。但要接哪些 Agent，是我們自己的決定——信任清單。名片的細節在 Agent Card 那頁。
2 送出時・給多少權限：送出一張工作單（Task），ID 由對方產生。身分驗證沿用標準做法（例如公司 SSO），憑證在協定之外取得，每個請求都要帶；對方驗證之後，依自己的規則決定能做什麼——這一點是對方決定的。
3 執行中・中途的把關：工作單是非同步的——交出去立刻拿到，工作在對方背景跑；進度可以自己定期查、保持連線讓對方即時推送，或給一個網址讓對方事後通知（webhook）。執行中可能停下來要補資料（input-required）或要授權（auth-required）。後者最值得注意：規格舉的例子包括破壞性動作前需要人核准——對方可以把這個決定丟回委派方；委派方如果自己也是被委派的，還能再往上丟，形成一條鏈。判斷交出去了，但需要人核准的那一刻，可以回到我們手上——跟第一部分把關那幾頁是同一件事，只是發生在兩個 Agent 之間。規格也寫明：進入 auth-required 本身不等於授權，授權的範圍要由實作定義。
4 回來時・怎麼驗收：工作單結束有四種：完成、失敗、取消，或對方判斷不做、直接拒絕。結果（Artifact）可以是文字、檔案或結構化資料，結構化資料方便我們用 schema 檢查；但協定只保證怎麼傳，不保證內容是對的——驗收是我們 Harness 的事，接回驗收那頁。
重點句：判斷整段交給別人的 Agent；交給誰、中途誰核准、回來怎麼驗收，留在我們這邊。協定處理怎麼溝通，不處理誰負責：對方做錯了，對使用者負責的仍是委派的這一方。這個問題第三、四部分會回來。
被問到「這跟呼叫一個 API 有什麼不同」：API 回傳確定的結果；A2A 交出去的是一件需要判斷的工作——對方可能反問、要授權、拒絕，而且過程不透明（規格叫 opaque execution：不分享內部的想法、計畫和工具實作）。
現況（被問到）：Linux Foundation 2026 年 4 月公布，超過 150 個組織支持，已整合進 Azure AI Foundry、Copilot Studio、Amazon Bedrock AgentCore；但在 coding Harness 裡很少見——有團隊比對 11 套 coding Harness 的原始碼，只有 Gemini CLI 實作了 A2A server。它的主場是跨組織、跨單位的企業 Agent 協作。
容易混淆（被問到）：ACP（Agent Client Protocol）是編輯器和 Agent 之間的協定，不是 Agent 和 Agent 之間的；IBM 另有一個同名的 Agent Communication Protocol，已經併入 A2A。
業界定調了嗎（被問到）：還沒有。A2A 是跨團隊、跨廠商 Agent 溝通唯一有多家支持的標準；但 Anthropic、OpenAI、Block 把 MCP、AGENTS.md、goose 放進另一個基金會（Agentic AI Foundation），Claude Code、Codex 這類 Harness 也只講 MCP。所以常見的替代做法是把對方的 Agent 包成一個 MCP 工具——能用，但反問只能問到人、長時間任務的支援還在實驗。比較公允的說法是：MCP 接工具和資料、A2A 接 Agent，目前兩者並存。`,
  `（附錄）Agent Card：A2A 那頁第 1 步「交給誰」的細節——對方的名片。一個 JSON，放在固定網址 /.well-known/agent-card.json，也可以從目錄（registry）查或直接設定。這是虛構的範例，欄位名稱照 A2A 1.0 規格。配色跟每頁的帶子一樣：灰色的欄位會放進模型的 prompt，藍色的欄位給 Harness 用。
右邊的標註寫的是「這個欄位是做什麼的」（依規格）；怎麼用，以 Gemini CLI 為例——它是 coding Harness 裡原生支援 A2A 的（依 Gemini CLI 開源程式碼與官方文件，2026-10）。被問到 Claude Code：官方文件沒有 A2A 支援，它的多 Agent 是自家機制（subagent、agent teams）；要接 A2A Agent，得自己用 MCP server 包一層。
Gemini CLI 怎麼收名片：
1. 接哪些遠端 Agent，由人寫在 .gemini/agents/ 底下的 Markdown 設定檔：kind: remote、自己取的 name、名片網址 agent_card_url、身分驗證 auth；放在專案層級就跟團隊共用。這份檔案就是信任清單。注意模型看到的名字，是設定檔裡我們取的，不是名片上對方自己填的 name——名字是對方填的，不能拿來決定信不信任。
2. 啟動時抓名片，照 securitySchemes 設定身分驗證。
3. 只取文字放進 prompt：把設定檔裡我們寫的描述、名片的 description、每項 skill 的名稱和描述，組成一段描述，以 XML 放進 system prompt 的「Available Sub-Agents」——每一輪都在，跟 Tool calling 那頁的工具描述一樣佔 token，也跟 Context 那頁 Skill 的一行描述一樣，是一直放著的索引。連線、身分、簽章這些欄位，模型看不到。
4. 委派是一次工具呼叫，參數是 agent 名稱和要交代的完整內容。
5. 每個遠端 Agent 註冊時，Harness 自動加一條權限規則：呼叫前一律先問使用者——除非使用者自己另外訂了規則。
重點句：判斷一交出去就收不回來，所以 Gemini CLI 把關兩次：接誰由人寫進設定，每次交出去預設先問人。這接回復原那頁：退不回的，才需要擋。
沒做的（被問到）：Gemini CLI 的原始碼裡沒有驗證名片簽章，也沒有截斷描述。另一種做法是 Google ADK：網路抓回來的描述最多 1,024 字，並包成「不可信的引用內容」——因為描述是對方寫的，可能夾帶指令，跟引導與強制那頁 auto mode 的「分類器看不到工具結果」是同一個考量。`,
  `（附錄）狀態：context 有上限，Harness 要決定滿了怎麼辦。這頁把大家每天用的三家並排，依各家官方文件（2026 年 10 月）。
何時觸發：Claude Code 接近上限時；OpenCode 接近上限、預留 10% 緩衝；Codex 用到 context window 的 90%，可以用 model_auto_compact_token_limit 設得更低（取兩者較小的）。
怎麼壓：Claude Code 先清掉舊的工具輸出，必要時再把整段對話換成結構化摘要；OpenCode（V2，依開源程式碼）要求模型照固定模板寫摘要：目標、需求、決定、進度（完成／進行中／卡住）、下一步、最多 15 個相關檔案、重要背景；prompt 明講「不要把 AGENTS.md 和環境資訊寫進摘要，下一個 agent 會另外拿到最新版」；之後的壓縮只更新同一份摘要。Codex 有兩條路（依開源程式碼，2026-10）：用 OpenAI 或 Azure 的模型時，把對話送到 Responses API 的壓縮端點，回傳一個加密、人讀不懂的壓縮項目；用其他模型時，由模型自己寫一份「交接摘要」——內建 prompt 是「為接手的另一個 LLM 寫一份交接摘要：目前進度與關鍵決定、重要限制與使用者偏好、還剩什麼、繼續所需的關鍵資料」，可以用 compact_prompt 換掉。
一定留下：這是差最多的地方。Claude Code 寫得最明確——CLAUDE.md、auto memory、plan、最近修改的 5 個檔案、用過的 Skill（每個最多 5,000 token）都從磁碟重新載入；早期對話裡交代的指示、工具輸出、Hook 加的內容，只剩摘要裡的描述。OpenCode 每次請求都重新送 AGENTS.md，再保留最近約 1.5 萬 token 的對話原文，其中工具輸出截到 1,250 字；預留空間至少 1.6 萬 token，給最後一次回覆和摘要本身用。Codex 重新注入初始 context（系統指示、AGENTS.md、環境資訊），再保留最近的使用者訊息，本地壓縮上限 2 萬 token、API 端壓縮 6.4 萬 token；值得注意的是，它只留「使用者說的話」，模型的回覆和工具輸出都只剩摘要。
原始對話：Claude Code 存在本機（可以 resume、rewind）；OpenCode 仍然保存，只是不再送給模型；Codex 存在本機 ~/.codex/sessions 的 rollout 檔，可以接續。
重點句：三家都是模型寫摘要；差別在「一定留下」的清單，Harness 寫得多明確。這就是「規則要寫進 CLAUDE.md／AGENTS.md，不能只在對話裡講一次」的真正原因。官方文件自己就有例子：auto mode 會把對話裡說的「不要 push」當成界線，但文件明講這個界線不是存成規則，壓縮時那則訊息若被摘要掉，界線就可能跟著消失；要硬保證，寫 deny 規則。
被問到 OpenAI 的原生壓縮：OpenAI 的 Responses API 有一個 compaction endpoint，回傳加密、人讀不懂的壓縮項目；OpenCode 對 OpenAI 模型可以選用它（compaction.type = native）。
Subagent（Subagent 那頁講過，這裡回扣一句）：另一種省 context 的方法是隔開——探索過程留在子 agent 自己的 context，只把摘要帶回主對話。
對照 Deep Agents（備用）：用到 85% 時摘要、保留最近 10%，原始對話另外寫進檔案保存。`,
  `（附錄）Memory 解決跨 session：每個新的 session 都從空的 context 開始，要記得什麼，得靠 Harness 載入。
第一列，人寫的指示檔：三家都有，名字幾乎統一成 AGENTS.md。Claude Code 讀 CLAUDE.md（也能讀 AGENTS.md），工作目錄以上每一層；OpenCode（V2 原始碼）讀全域一份，加上目前目錄往上到專案根目錄每一層的 AGENTS.md，讀檔時還會順手載入附近目錄的 AGENTS.md；Codex 讀全域一份，加上從專案根目錄到目前目錄每一層，越靠近目前目錄的越後面、優先。
第二列，上限：Claude Code 建議 200 行以內；OpenCode 程式裡沒有設上限；Codex 合計 32 KiB，超過的就不再加入——寫太長，後面的規則會直接不見。
第三列，模型自己記的，這是三家差最多的地方：Claude Code 的 auto memory 預設開，模型工作中自己判斷要不要記，分使用者、回饋、專案、參考資料四類；OpenCode 沒有，/init 是人觸發去產生 AGENTS.md；Codex 的 Memories 預設關，開了之後在對話閒置後於背景萃取（依原始碼分兩段：先從每段過往對話萃取記憶，再由一個沒有網路、只能寫本機的子 agent 整併成 MEMORY.md 和一份摘要）。
第四列，新 session：Claude Code 自動載入 MEMORY.md 的前 200 行或 25KB；OpenCode 沒有記憶機制，新 session 只帶 AGENTS.md，過去的對話不會帶進來（除非接續舊的 session）；Codex 只放一份記憶摘要（memory_summary.md，上限 2,500 token），細節在 MEMORY.md 裡，模型覺得需要才去查——又是「只放索引、用到再展開」，跟資訊那頁的 Skill 同一招。
重點句：兩家的官方文件都說，記憶只是 context——Claude Code 說它「不是強制設定」，Codex 說它是「輔助回想」，一定要遵守的放 AGENTS.md。接回把關那頁：要不論模型怎麼判斷都擋下，用強制。
被問到「能不能讓 Agent 自己調鬆緊」：模型自己寫記憶就是起點。各家的原則一致——看規則影響誰。只影響自己的，可以讓 Agent 自己改（Claude Code 的 auto memory、Codex 的 Memories 預設關）；Gemini CLI 的 Auto Memory（實驗功能、預設關）更保守：寫成 patch 放進 inbox，使用者核准後才寫入。影響整個團隊的（進版控的 CLAUDE.md、AGENTS.md），人寫、人審。不能出錯的（禁止清單、權限、沙箱），一律由人提供，沒有一家讓 Agent 自己改。一句話：規則影響的人越多，越要由人來寫。`,
  `（附錄）驗收：模型說「完成了」，這本身是一個判斷。
先解一個可能的疑問：Hook 不是只屬於把關。Hook 是通用機制——在某個事件發生時自動跑你寫的程式；掛在哪個事件，就落在哪個控制點。PreToolUse（工具執行前）是把關，Stop（模型要結束時）是驗收，PostToolUse 可以改完檔就跑 lint 回饋給模型，PreCompact／SessionStart 可以在壓縮前後補資訊，屬於狀態。分類看位置，不看名字。
以 Claude Code 為例：Stop Hook 在模型要結束時觸發，可以跑測試、lint、檢查有沒有附上出處；沒過就 exit 2，不讓它停、回去繼續做。
證據要來自模型以外：測試通過、lint 沒有錯誤、回答附上出處、外部系統的狀態（例如 PR 真的建立了）。
重點句：「完成了」不是證據；Harness 可以否決它。
這也是知識問答的驗收：附上出處，才是證據。`,
];
