import {useEffect,useLayoutEffect,useRef} from 'react';
import {parseMeterReadout} from './meterReadout';

const DURATION = 450;
const RELEASE = /^Pon las puntas$/;

/**
 * Animación solo visual del display: cuando cambia la lectura, el número rueda desde el valor anterior hasta el nuevo,
 * como en un multímetro real. Se escribe directo en el elemento (sin re-renderizar) y no toca la lectura verdadera:
 * la salida accesible, la libreta y las exportaciones siguen usando el valor final al instante.
 */
export function useRollingLcd(target: string, enabled: boolean) {
  const element = useRef<SVGTextElement>(null);
  const shown = useRef(target);
  const frame = useRef(0);
  useLayoutEffect(() => {
    cancelAnimationFrame(frame.current);
    const el = element.current;
    if (!el) return;
    const reduced = (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.classList.contains('modo-reduced');
    const to = parseMeterReadout(target), from = parseMeterReadout(shown.current);
    /* Al soltar las puntas la lectura no desaparece de golpe: cae a cero y recién entonces aparece el aviso. */
    if (enabled && !reduced && from && !to && RELEASE.test(target.trim()) && from.value !== 0) {
      const prev = shown.current, size = prev.length > 12 ? 13 : prev.length > 9 ? 17 : 24, original = el.style.fontSize, begin = performance.now(), start = from.value;
      el.style.fontSize = size + 'px';
      el.textContent = prev;
      const fall = (now: number) => {
        const k = Math.min(1, (now - begin) / DURATION), eased = 1 - Math.pow(1 - k, 3);
        if (k >= 1) { shown.current = target; el.style.fontSize = original; el.textContent = target; return; }
        const text = prev.replace(from.token, ((start * (1 - eased)) / from.factor).toFixed(from.digits).replace('.', ','));
        shown.current = text;
        el.textContent = text;
        frame.current = requestAnimationFrame(fall);
      };
      frame.current = requestAnimationFrame(fall);
      return;
    }
    const same = !!to && !!from && target.replace(to.token, '#') === shown.current.replace(from.token, '#');
    if (!enabled || reduced || !to || !from || !same || to.value === from.value) {
      shown.current = target;
      el.textContent = target;
      return;
    }
    const a = from.value, b = to.value, start = performance.now();
    el.textContent = shown.current;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / DURATION), eased = 1 - Math.pow(1 - k, 3), v = a + (b - a) * eased;
      const text = k >= 1 ? target : target.replace(to.token, (v / to.factor).toFixed(to.digits).replace('.', ','));
      shown.current = text;
      el.textContent = text;
      if (k < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  }, [target, enabled]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  return element;
}
