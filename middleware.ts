import { NextRequest, NextResponse } from 'next/server';

/**
 * Legacy URL canonicalization for the module workspace.
 *
 * The workspace used to live on `/module/[id]?phase=…&lesson=…&ex=…`.
 * Those query URLs are permanent-redirected to the crawlable path routes
 * (`/lesson/[n]`, `/lab`, `/examples[/[n]]`, `/quiz`), and the redundant
 * first-index paths (`/lesson/1`, `/examples/1`) redirect to their short
 * canonical forms so exactly one URL per page is ever served.
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const rootMatch = pathname.match(/^\/module\/([^/]+)\/?$/);
  if (rootMatch && [...searchParams.keys()].length > 0) {
    const id = rootMatch[1];
    const phase = searchParams.get('phase');
    const lesson = Math.max(0, Number(searchParams.get('lesson') ?? '0') || 0);
    const example = Math.max(0, Number(searchParams.get('ex') ?? '0') || 0);

    let target: string;
    if (phase === 'lab') {
      target = `/module/${id}/lab`;
    } else if (phase === 'quiz') {
      target = `/module/${id}/quiz`;
    } else if (phase === 'examples') {
      target = example > 0
        ? `/module/${id}/examples/${example + 1}`
        : `/module/${id}/examples`;
    } else {
      target = lesson > 0
        ? `/module/${id}/lesson/${lesson + 1}`
        : `/module/${id}`;
    }
    return NextResponse.redirect(new URL(target, request.url), 308);
  }

  const lessonOne = pathname.match(/^\/module\/([^/]+)\/lesson\/1\/?$/);
  if (lessonOne) {
    return NextResponse.redirect(
      new URL(`/module/${lessonOne[1]}`, request.url),
      308
    );
  }

  const exampleOne = pathname.match(/^\/module\/([^/]+)\/examples\/1\/?$/);
  if (exampleOne) {
    return NextResponse.redirect(
      new URL(`/module/${exampleOne[1]}/examples`, request.url),
      308
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/module/:path*'],
};
