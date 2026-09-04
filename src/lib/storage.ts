import { supabaseClient } from './supabase';

const MAX_KB = 500;
const MAX_DIM = 1920;

async function comprimirImagen(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  if (file.size <= MAX_KB * 1024) return file;
  const imageCompression = (await import('browser-image-compression')).default;
  return imageCompression(file, {
    maxSizeMB: MAX_KB / 1024,
    maxWidthOrHeight: MAX_DIM,
    useWebWorker: true,
  });
}

function extensionDe(file: File): string {
  const name = file.name || 'archivo';
  const parts = name.split('.');
  const ext = parts.length > 1 ? parts.pop() || '' : '';
  return ext || (file.type.split('/')[1] || 'bin').replace('octet-stream', 'bin');
}

export async function blobURLDemo(file: File): Promise<string> {
  const processed = await comprimirImagen(file);
  return URL.createObjectURL(processed);
}

export async function subirArchivo(
  file: File,
  bucket: string,
  folder: string,
): Promise<{ url: string | null; error?: string }> {
  if (!supabaseClient) {
    return { url: null, error: 'Debes iniciar sesión.' };
  }
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) {
    return { url: null, error: 'Debes iniciar sesión.' };
  }
  try {
    const processed = await comprimirImagen(file);
    const path = (folder || user.id) + '/' + Date.now() + '.' + extensionDe(processed);
    const { error: upErr } = await supabaseClient.storage.from(bucket).upload(path, processed, { upsert: false });
    if (upErr) return { url: null, error: 'Error al subir archivo: ' + upErr.message };
    const { data: urlData, error: urlErr } = await supabaseClient.storage
      .from(bucket)
      .createSignedUrl(path, 7 * 24 * 60 * 60);
    if (urlErr) return { url: null, error: 'Error al subir archivo: ' + urlErr.message };
    return { url: urlData.signedUrl };
  } catch (err) {
    return { url: null, error: 'Error al subir archivo: ' + (err instanceof Error ? err.message : String(err)) };
  }
}