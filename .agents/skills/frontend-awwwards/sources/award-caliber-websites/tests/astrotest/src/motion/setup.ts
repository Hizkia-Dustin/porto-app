// Global motion for this site: runs once on the client, before the first page initializes.
import { setLoaderFormat } from '../engine';

export function setupMotion() {
  setLoaderFormat((p) => String(Math.round(p)).padStart(3, '0'));
}
