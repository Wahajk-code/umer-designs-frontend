'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/client/cn';
import { fallbackImageFor } from '@/lib/stock-images';

/** Must mirror `images.remotePatterns` in next.config.ts. */
const ALLOWED_HOSTS = new Set(['images.unsplash.com', 'res.cloudinary.com']);

function isRenderable(src: ImageProps['src']): boolean {
  if (!src) return false;
  if (typeof src !== 'string') return true; // static import
  if (src.startsWith('/') && !src.startsWith('//')) return true; // local asset
  try {
    const url = new URL(src);
    return url.protocol === 'https:' && ALLOWED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Drop-in `next/image` replacement that never breaks the page: a missing URL,
 * a host next/image isn't configured for (which would otherwise throw), or a
 * 404 at load time all fall back to a known-good stock photo (`fallbackSrc`,
 * defaulting to one picked from the alt text), and only if that also fails to
 * the brand's striped placeholder.
 */
export function SafeImage({
  src,
  fallbackSrc,
  alt,
  className,
  onError,
  ...rest
}: ImageProps & { fallbackSrc?: string }) {
  fallbackSrc ??= fallbackImageFor(String(alt || 'image'));
  const [failedSrc, setFailedSrc] = useState<ImageProps['src'] | null>(null);
  const failed = failedSrc !== null && failedSrc === src;

  if ((!isRenderable(src) || failed) && fallbackSrc && fallbackSrc !== src) {
    return <SafeImage src={fallbackSrc} fallbackSrc={fallbackSrc} alt={alt} className={className} {...rest} />;
  }

  if (!isRenderable(src) || failed) {
    const sized = !rest.fill && rest.width && rest.height;
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn('placeholder-stripes', rest.fill ? 'absolute inset-0' : 'h-full w-full', className)}
        style={sized ? { width: Number(rest.width), height: Number(rest.height) } : undefined}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        setFailedSrc(src);
        onError?.(e);
      }}
      {...rest}
    />
  );
}
