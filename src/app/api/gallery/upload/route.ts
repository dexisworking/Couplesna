import { NextResponse } from 'next/server';
import { uploadGalleryFiles } from '@/lib/server/couplesna';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const albumId = String(formData.get('albumId') || '');
    const files = formData
      .getAll('files')
      .filter((value): value is File => value instanceof File && value.size > 0);

    if (!albumId) {
      return NextResponse.json({ error: 'Missing album ID.' }, { status: 400 });
    }

    await uploadGalleryFiles(albumId, files);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed.' },
      { status: 500 }
    );
  }
}
