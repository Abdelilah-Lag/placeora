export function cloudinaryImageUrl(url: string, width: number, height?: number) {
  if (!url.startsWith("https://res.cloudinary.com/")) return url;
  const dimensions = height ? `c_fill,w_${width},h_${height}` : `c_limit,w_${width}`;
  return url.replace("/upload/", `/upload/${dimensions},q_auto,f_auto/`);
}
