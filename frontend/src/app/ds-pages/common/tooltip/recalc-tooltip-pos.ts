export function recalcTooltipPos(x: number, y: number, container: Element) {
  const bboxCont = container.getBoundingClientRect();
  const pos: Partial<Directional<string>> = {};

  if (x - bboxCont.left < 100) {
    pos.left = x - bboxCont.left + 10 + 'px';
  } else {
    pos.right = bboxCont.width - x + bboxCont.left + 10 + 'px';
  }
  if (y - bboxCont.top < 100) {
    pos.top = y - bboxCont.top + 10 + 'px';
  } else {
    pos.bottom = bboxCont.height - y + bboxCont.top + 10 + 'px';
  }

  return pos;
}
