export function formatSymbolName(name: string): string {
  return name.split(/\s+/).map((word, index) => {
    if (index === 0) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    if (word.length > 1) {
      return word.toLowerCase();
    }
    return word;
  }).join(' ');

}