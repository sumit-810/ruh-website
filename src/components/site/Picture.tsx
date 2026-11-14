import { images } from '@/data/images.js';
import { cn } from '@/lib/utils';

type Meta = { w: number; h: number; widths: number[]; alt?: string; src?: string };
const manifest = images as Record<string, Meta>;

type Props = {
  image: string | null | undefined;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
};

const set = (key: string, m: Meta, ext: string) => m.widths.map((w) => `/assets/img/${key}-${w}.${ext} ${w}w`).join(', ');
const fallback = (key: string, m: Meta) => `/assets/img/${key}-${m.widths.find((w) => w >= 960) || m.widths[m.widths.length - 1]}.jpg`;

/** Responsive <picture> for a generated image key (AVIF → WebP → JPEG). width/height prevent layout shift. */
export function Picture({ image, alt = '', sizes = '100vw', priority = false, className, imgClassName }: Props) {
  const m = image ? manifest[image] : undefined;
  if (!image || !m) {
    return <div className={cn('aspect-[4/5] bg-sand', className)} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true} />;
  }
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={set(image, m, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set(image, m, 'webp')} sizes={sizes} />
      <img
        src={fallback(image, m)}
        srcSet={set(image, m, 'jpg')}
        sizes={sizes}
        width={m.w}
        height={m.h}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        className={cn('h-full w-full object-cover', imgClassName)}
      />
    </picture>
  );
}

/** Art-directed <picture>: `wide` from `media` upwards, `tall` below it. Only the matching image downloads. */
export function ArtPicture({ wide, tall, media = '(min-width: 900px)', alt = '', sizes = '100vw', priority = false, className, imgClassName }: Omit<Props, 'image'> & { wide: string; tall: string; media?: string }) {
  const W = manifest[wide];
  const T = manifest[tall];
  if (!W || !T) return <Picture image={W ? wide : tall} alt={alt} sizes={sizes} priority={priority} className={className} imgClassName={imgClassName} />;
  const sources = (key: string, m: Meta, mq?: string) =>
    (['avif', 'webp', 'jpg'] as const).map((ext) => (
      <source key={key + ext + (mq || '')} media={mq} type={`image/${ext === 'jpg' ? 'jpeg' : ext}`} srcSet={set(key, m, ext)} sizes={sizes} />
    ));
  return (
    <picture className={className}>
      {sources(wide, W, media)}
      {sources(tall, T)}
      <img src={fallback(tall, T)} width={T.w} height={T.h} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : undefined} className={cn('h-full w-full object-cover', imgClassName)} />
    </picture>
  );
}

/** Smallest JPEG URL — for tiny thumbnails (bag lines, search hits). */
export const thumb = (key: string | null | undefined) => {
  const m = key ? manifest[key] : undefined;
  return m && key ? `/assets/img/${key}-${m.widths[0]}.jpg` : '';
};
