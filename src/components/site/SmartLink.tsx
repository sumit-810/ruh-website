import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router';

/** Internal paths ("/shop") use client-side navigation; anchors and external URLs stay plain links. */
export const SmartLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>(function SmartLink(
  { href, ...rest },
  ref,
) {
  if (href.startsWith('/') && !href.startsWith('//')) return <Link ref={ref} to={href} {...rest} />;
  return <a ref={ref} href={href} {...rest} />;
});
