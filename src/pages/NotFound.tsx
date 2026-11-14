import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { SmartLink } from '@/components/site/SmartLink';
import { ArrowLink } from '@/components/site/ArrowLink';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" noindex />
      <section className="container-x flex min-h-[70vh] flex-col items-center justify-center gap-6 py-24 text-center">
        <p className="eyebrow">404</p>
        <h1 className="display-lg">
          This page has <em>slipped away.</em>
        </h1>
        <p className="lede">The link may be old, or the page may not exist yet.</p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          <Button asChild>
            <SmartLink href="/">Return home</SmartLink>
          </Button>
          <ArrowLink href="/shop">Shop all</ArrowLink>
        </div>
      </section>
    </>
  );
}
