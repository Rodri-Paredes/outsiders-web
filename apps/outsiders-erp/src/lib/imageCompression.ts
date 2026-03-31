import imageCompression from 'browser-image-compression';

/**
 * Comprime una imagen antes de ser subida al servidor
 * @param imageFile El archivo de imagen original
 * @returns El archivo de imagen comprimido
 */
export async function compressImage(imageFile: File): Promise<File> {
  const options = {
    maxSizeMB: 1, // Tamaño máximo de 1MB
    maxWidthOrHeight: 1920, // Resolución máxima de 1920px (ej. 1080p extendido)
    useWebWorker: true, // Usa hilos en paralelo para no bloquear la UI
  };

  try {
    const compressedFile = await imageCompression(imageFile, options);
    
    // browser-image-compression devuelve un Blob o File, 
    // nos aseguramos de devolver siempre un objeto File
    return new File([compressedFile], imageFile.name, {
      type: compressedFile.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Error al comprimir la imagen:', error);
    // Si falla la compresión, devolvemos la imagen original
    // para no interrumpir el flujo del usuario
    return imageFile;
  }
}
