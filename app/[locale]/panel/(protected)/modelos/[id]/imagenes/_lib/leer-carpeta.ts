/** Lee recursivamente los archivos de una carpeta soltada sobre la pantalla. */
export async function leerArchivosSoltados(
  dataTransfer: DataTransfer,
): Promise<File[]> {
  const items = Array.from(dataTransfer.items);
  const entries = items
    .map((item) =>
      "webkitGetAsEntry" in item ? item.webkitGetAsEntry() : null,
    )
    .filter((entry): entry is FileSystemEntry => !!entry);

  if (entries.length === 0) {
    return Array.from(dataTransfer.files);
  }

  const files: File[] = [];
  await Promise.all(entries.map((entry) => walk(entry, files)));
  return files;
}

async function walk(entry: FileSystemEntry, out: File[]): Promise<void> {
  if (entry.isFile) {
    const file = await new Promise<File>((resolve, reject) =>
      (entry as FileSystemFileEntry).file(resolve, reject),
    );
    out.push(file);
    return;
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    let batch: FileSystemEntry[];
    do {
      batch = await new Promise<FileSystemEntry[]>((resolve, reject) =>
        reader.readEntries(resolve, reject),
      );
      await Promise.all(batch.map((child) => walk(child, out)));
    } while (batch.length > 0);
  }
}
