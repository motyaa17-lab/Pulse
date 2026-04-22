export async function fileToAvatarDataUrl(
  file: File,
  opts?: { maxSize?: number; quality?: number; preferType?: 'image/webp' | 'image/jpeg' },
): Promise<string> {
  const maxSize = opts?.maxSize ?? 512;
  const quality = opts?.quality ?? 0.82;
  const preferType = opts?.preferType ?? 'image/webp';

  if (!file.type.startsWith('image/')) throw new Error('not_image');

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no_canvas');
    ctx.drawImage(bitmap, 0, 0, w, h);

    const tryType = (t: string) =>
      new Promise<string>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('to_blob_failed'));
              return;
            }
            const fr = new FileReader();
            fr.onload = () => resolve(String(fr.result));
            fr.onerror = () => reject(new Error('file_read_failed'));
            fr.readAsDataURL(blob);
          },
          t,
          quality,
        );
      });

    // Prefer webp when available; fallback to jpeg.
    try {
      return await tryType(preferType);
    } catch {
      return await tryType('image/jpeg');
    }
  } finally {
    bitmap.close();
  }
}
