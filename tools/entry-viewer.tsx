import { createRoot } from 'react-dom/client';
import { useEffect, useState, useCallback, useRef } from 'react';
import pages, { design, notes, MAIN_COUNT, appendixHome } from '../slides/agent-harness-engineering/index.tsx';
import { PageProvider } from '@open-slide/core';
const vars: Record<string, string> = {
  '--osd-bg': design.palette.bg, '--osd-text': design.palette.text, '--osd-accent': design.palette.accent,
  '--osd-font-display': design.fonts.display, '--osd-font-body': design.fonts.body,
  '--osd-size-hero': design.typeScale.hero + 'px', '--osd-size-body': design.typeScale.body + 'px', '--osd-radius': design.radius + 'px',
};
(window as any).__deckAnimate = true;
const N = pages.length;
function initial() {
  const m = /^#?p?(\d+)$/.exec(location.hash);
  const n = m ? Number(m[1]) : 1;
  return Math.min(Math.max(n, 1), N) - 1;
}
function useScale(showNotes: boolean, present: boolean) {
  const calc = () => {
    const w = window.innerWidth - (present ? 0 : 32);
    const h = window.innerHeight - (present ? 0 : showNotes ? 260 : 96);
    return Math.max(0.1, Math.min(w / 1920, h / 1080));
  };
  const [s, setS] = useState(calc);
  useEffect(() => { const f = () => setS(calc()); f(); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, [showNotes, present]);
  return s;
}

/* Laser pointer: a red dot with a short fading trail, drawn on a canvas over the slide. */
function Laser({ on, w, h }: { on: boolean; w: number; h: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pts = useRef<{ x: number; y: number; t: number }[]>([]);
  const inside = useRef(false);
  useEffect(() => {
    if (!on) { pts.current = []; return; }
    const cv = ref.current!;
    const host = cv.parentElement!;
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      inside.current = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      pts.current.push({ x, y, t: performance.now() });
    };
    const leave = () => { inside.current = false; };
    window.addEventListener('pointermove', move);
    host.addEventListener('pointerleave', leave);
    let raf = 0;
    const draw = () => {
      const ctx = cv.getContext('2d')!;
      const dpr = window.devicePixelRatio || 1;
      if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const now = performance.now();
      pts.current = pts.current.filter((p) => now - p.t < 220);
      const r = Math.max(5, Math.min(w, h) * 0.009);
      const P = pts.current;
      for (let k = 1; k < P.length; k++) {
        const a = 1 - (now - P[k].t) / 220;
        ctx.strokeStyle = `rgba(255,40,40,${0.45 * a})`;
        ctx.lineWidth = r * 1.2 * a;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(P[k - 1].x, P[k - 1].y); ctx.lineTo(P[k].x, P[k].y); ctx.stroke();
      }
      const last = P[P.length - 1];
      if (last && inside.current) {
        const g = ctx.createRadialGradient(last.x, last.y, 0, last.x, last.y, r * 3);
        g.addColorStop(0, 'rgba(255,60,60,0.55)'); g.addColorStop(1, 'rgba(255,60,60,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(last.x, last.y, r * 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff2a2a'; ctx.beginPath(); ctx.arc(last.x, last.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(last.x, last.y, r * 0.35, 0, Math.PI * 2); ctx.fill();
      } else if (last && !inside.current) { /* keep trail only */ }
      if (last && now - last.t >= 220 && inside.current) pts.current = [last]; // keep the dot when still
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave); const ctx = cv.getContext('2d'); ctx?.clearRect(0, 0, cv.width, cv.height); };
  }, [on, w, h]);
  return <canvas ref={ref} className="laser" style={{ width: w, height: h, display: on ? 'block' : 'none' }} />;
}

function App() {
  const [i, setI] = useState(initial);
  const [showNotes, setShowNotes] = useState(false);
  const [present, setPresent] = useState(false);
  const [laser, setLaser] = useState(false);
  const [idle, setIdle] = useState(false);
  const scale = useScale(showNotes, present);
  // 主線頁：上一頁／下一頁只在主線裡走。附錄頁：不能往下翻；往回＝回到自己的主頁。
  const go = useCallback((d: number) => setI((x) => {
    const home = appendixHome[x];
    if (home !== undefined) return d < 0 ? home : x;
    return Math.min(Math.max(x + d, 0), MAIN_COUNT - 1);
  }), []);
  const inAppendix = appendixHome[i] !== undefined;
  useEffect(() => { try { history.replaceState(null, '', '#p' + (i + 1)); } catch {} }, [i]);
  useEffect(() => {
    const f = () => { const m = /^#?p?(\d+)$/.exec(location.hash); if (m) { const n = Math.min(Math.max(Number(m[1]), 1), N) - 1; setI(n); } };
    window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f);
  }, []);
  // click zones sit on top of the slide; if an in-slide link is under the pointer, follow it instead of paging
  const zoneClick = useCallback((d: number) => (e: any) => {
    const els = document.elementsFromPoint(e.clientX, e.clientY);
    const a = els.find((el) => el.tagName === 'A' && (el as HTMLAnchorElement).getAttribute('href')?.startsWith('#')) as HTMLAnchorElement | undefined;
    if (a) { location.hash = a.getAttribute('href')!; return; }
    go(d);
  }, [go]);

  const enterPresent = useCallback(() => {
    setPresent(true);
    const el = document.documentElement as any;
    try { const r = el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen?.(); r?.catch?.(() => {}); } catch {}
  }, []);
  const exitPresent = useCallback(() => {
    setPresent(false);
    const d = document as any;
    try { if (d.fullscreenElement) d.exitFullscreen(); else if (d.webkitFullscreenElement) d.webkitExitFullscreen(); } catch {}
  }, []);
  useEffect(() => {
    const f = () => { const d = document as any; if (!d.fullscreenElement && !d.webkitFullscreenElement) setPresent(false); };
    document.addEventListener('fullscreenchange', f); document.addEventListener('webkitfullscreenchange', f);
    return () => { document.removeEventListener('fullscreenchange', f); document.removeEventListener('webkitfullscreenchange', f); };
  }, []);
  // hide the mouse cursor after 2s of stillness while presenting (unless the laser is on)
  useEffect(() => {
    if (!present) { setIdle(false); return; }
    let t: any; const wake = () => { setIdle(false); clearTimeout(t); t = setTimeout(() => setIdle(true), 2000); };
    wake(); window.addEventListener('pointermove', wake);
    return () => { clearTimeout(t); window.removeEventListener('pointermove', wake); };
  }, [present]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); go(1); }
      else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); go(-1); }
      else if (e.key === 'Home') setI(0);
      else if (e.key === 'End') setI(MAIN_COUNT - 1);
      else if (e.key === 'n' || e.key === 'N') setShowNotes((v) => !v);
      else if (e.key === 'f' || e.key === 'F' || e.key === 'F5') { e.preventDefault(); present ? exitPresent() : enterPresent(); }
      else if (e.key === 'Escape' && present) exitPresent();
      else if (e.key === 'l' || e.key === 'L') setLaser((v) => !v);
      else if (e.key === 'r' || e.key === 'R') window.dispatchEvent(new Event('deck-replay'));
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [go, present, enterPresent, exitPresent]);

  const Comp = pages[i];
  const note = notes[i];
  const fw = 1920 * scale, fh = 1080 * scale;
  return (
    <div className={'app' + (present ? ' present' : '') + (present && idle && !laser ? ' idle' : '')}>
      <div className="stage">
        <div className={'frame' + (laser ? ' lasering' : '')} style={{ width: fw, height: fh }}>
          <div style={{ width: 1920, height: 1080, overflow: 'hidden', position: 'relative', transform: `scale(${scale})`, transformOrigin: '0 0', background: design.palette.bg, ...(vars as any) }}>
            <PageProvider key={i} value={{ index: i, total: N }}><Comp /></PageProvider>
          </div>
          {!laser && <button className="hit left" aria-label="上一頁" onClick={zoneClick(-1)} />}
          {!laser && <button className="hit right" aria-label="下一頁" onClick={zoneClick(1)} style={inAppendix ? { cursor: 'default' } : undefined} />}
          <Laser on={laser} w={fw} h={fh} />
        </div>
      </div>
      {showNotes && !present && <div className="notes" style={{ width: Math.max(fw, 320) }}><div className="nl">講者備註 · {inAppendix ? '附錄' : `第 ${i + 1} 頁`}</div>{note ? note : <span className="dim">（這頁沒有備註）</span>}</div>}
      {!present && (
        <nav className="bar">
          <button onClick={() => go(-1)} disabled={i === 0}>{inAppendix ? '‹ 回主頁' : '‹ 上一頁'}</button>
          {inAppendix ? (
            <span className="pg"><span>附錄</span></span>
          ) : (
            <label className="pg">
              <input id="pg" type="number" min={1} max={MAIN_COUNT} value={i + 1} onChange={(e) => { const v = Number(e.target.value); if (v >= 1 && v <= MAIN_COUNT) setI(v - 1); }} />
              <span>/ {MAIN_COUNT}</span>
            </label>
          )}
          <button onClick={() => go(1)} disabled={inAppendix || i === MAIN_COUNT - 1}>下一頁 ›</button>
          <button className={showNotes ? 'on' : ''} onClick={() => setShowNotes((v) => !v)}>備註 (N)</button>
          <button className={laser ? 'on' : ''} onClick={() => setLaser((v) => !v)}>雷射筆 (L)</button>
          <button onClick={enterPresent}>全螢幕 (F)</button>
        </nav>
      )}
      {present && (
        <div className="pctl">
          <button className={laser ? 'on' : ''} onClick={() => setLaser((v) => !v)} title="雷射筆 (L)">雷射筆</button>
          <span className="pnum">{inAppendix ? '附錄' : `${i + 1} / ${MAIN_COUNT}`}</span>
          <button onClick={exitPresent} title="離開全螢幕 (Esc)">離開</button>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
