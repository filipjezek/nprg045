export function colorFromString(str: string) {
  // java string hash
  let hash = 0;
  for (let i = str.length; i > 0; i--) {
    hash = str.charCodeAt(i - 1) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;
    // to ensure we have two chars
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
}
