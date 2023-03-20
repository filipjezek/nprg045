export class LinkWrapper {
  constructor(public index: number) {}
}

export function makeLink(index: number) {
  return new LinkWrapper(index);
}
