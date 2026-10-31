// hands a downloaded or generated file to the browser as a download
export const saveFile = (data: BlobPart, fileName: string, type?: string) => {
  const url = window.URL.createObjectURL(data instanceof Blob && !type ? data : new Blob([data], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
