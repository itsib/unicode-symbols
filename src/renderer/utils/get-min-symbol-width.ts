
export function getMinSymbolWidth(iconSize: number) {
  if (iconSize < 26 || iconSize > 50) {
    throw new Error('Unsupported icon size');
  }
  if (iconSize >= 26 && iconSize < 30) {
    return 60;
  } else if (iconSize >= 30 && iconSize < 34) {
    return 65;
  } else if (iconSize >= 34 && iconSize < 38) {
    return 72;
  } else if (iconSize >= 38 && iconSize < 42) {
    return 76;
  } else if (iconSize >= 42 && iconSize < 46) {
    return 84;
  } else if (iconSize >= 46 && iconSize < 50) {
    return 92;
  } else {
    return 100;
  }
}