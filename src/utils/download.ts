export const downloadZip = (
  filename: string,
  bytes: Uint8Array<ArrayBuffer>,
  mime = 'application/zip'
): void => {
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);

  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};
