/** Deterministic “random” images from Picsum (by id / seed). */

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function placeholderPostImage(id: string, w = 900, h = 600): string {
  return `https://picsum.photos/seed/${hashSeed(`p-${id}`)}/${w}/${h}`;
}

export function placeholderAvatar(id: string, size = 128): string {
  return `https://picsum.photos/seed/${hashSeed(`a-${id}`)}/${size}/${size}`;
}

export function placeholderBanner(seed: string, w = 1200, h = 360): string {
  return `https://picsum.photos/seed/${hashSeed(`b-${seed}`)}/${w}/${h}`;
}
