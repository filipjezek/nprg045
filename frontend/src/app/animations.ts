import { animation, style, animate, query } from '@angular/animations';

export const fade = animation([
  style({
    opacity: '{{ start }}',
  }),
  animate('{{ time }}', style({ opacity: '{{ end }}' })),
]);

export const dialogOpen = animation([
  style({ height: 0, overflowY: 'hidden', overflowX: 'hidden' }),
  query('*', style({ opacity: 0 })),
  animate('0.1s ease-out', style({ height: '*' })),
  query('*', animate('0.15s 0.1s ease-in-out', style({ opacity: 1 }))),
]);

export const dialogClose = animation([
  style({ height: '*', overflowY: 'hidden', overflowX: 'hidden' }),
  query('*', animate('0.05s ease-in-out', style({ opacity: 0 }))),
  query('*', style({ opacity: 0 })),
  animate('0.07s 0.04s ease-in', style({ height: 0 })),
]);
