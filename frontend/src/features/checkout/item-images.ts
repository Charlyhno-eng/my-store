const imageModules = import.meta.glob("@/assets/items/*.{png,jpg,jpeg,webp,svg}", {
  eager: true,
  import: "default",
});

const itemImages: Record<string, string> = {};

for (const path in imageModules) {
  const normalizedPath = path
    .replace("/src/assets/", "")
    .replace(/^.*assets\//, "");

  itemImages[normalizedPath] = imageModules[path] as string;
}

export { itemImages };
