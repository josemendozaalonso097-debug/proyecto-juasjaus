export function createBrandBackground(theme) {
  const primary = theme?.primaryColor || '#f20d0d';
  const secondary = theme?.secondaryColor || '#6e0404';
  let style;
  if (theme?.colorStyle === 'solid') style = { background: primary };
  else if (theme?.colorStyle === 'mesh') {
    style = { background: `radial-gradient(circle at 10% 20%, ${primary}, transparent 58%), radial-gradient(circle at 90% 80%, ${secondary}, ${primary})` };
  } else {
    style = { background: `linear-gradient(135deg, ${primary}, ${secondary})` };
  }
  if (theme?.heroImageUrl) {
    const imageOverlay = theme.colorStyle === 'solid'
      ? `linear-gradient(135deg, ${primary}cc, ${primary}cc)`
      : theme.colorStyle === 'mesh'
        ? `radial-gradient(circle at 10% 20%, ${primary}dd, transparent 62%), radial-gradient(circle at 90% 80%, ${secondary}dd, ${primary}dd)`
        : `linear-gradient(135deg, ${primary}dd, ${secondary}dd)`;
    style.backgroundImage = `${imageOverlay}, url("${theme.heroImageUrl}")`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
  }
  return style;
}
