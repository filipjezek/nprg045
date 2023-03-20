import {
  state,
  style,
  transition,
  trigger,
  useAnimation,
} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
} from '@angular/core';
import { dialogClose, dialogOpen } from 'src/app/animations';
import { Dialog } from 'src/app/dialog';

@Component({
  selector: 'mozaik-sql-help',
  templateUrl: './sql-help.component.html',
  styleUrls: ['./sql-help.component.scss'],
  animations: [
    trigger('appear', [
      state(
        'closing',
        style({
          height: 0,
        })
      ),
      transition(':enter', [useAnimation(dialogOpen)]),
      transition('* => closing', [useAnimation(dialogClose)]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SqlHelpComponent extends Dialog implements OnInit {
  public static readonly selector = 'sql-help-dialog';

  constructor(el: ElementRef<HTMLElement>) {
    super(el);
  }

  ngOnInit(): void {}
}
