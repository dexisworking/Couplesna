import { NextResponse } from 'next/server';
import { deleteGalleryImage } from '@/lib/server/couplesna';

type RouteContext = {
  params: Promise<{
    imageId: string;
  }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { imageId } = await context.params;
    await deleteGalleryImage(imageId);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed.' },
      { status: 500 }
    );
  }
}
