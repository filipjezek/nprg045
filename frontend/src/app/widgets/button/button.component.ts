import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  HostBinding,
} from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { promiseTimeout } from '../../utils/promise-timeout';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'mozaik-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  animations: [
    trigger('rippleEffect', [
      transition(
        ':enter',
        [
          style({
            left: '{{rippleX}}px',
            top: '{{rippleY}}px',
            opacity: 0.6,
            width: 0,
            height: 0,
          }),
          animate(
            '0.3s linear',
            style({
              left: '{{endLeft}}px',
              top: '{{endTop}}px',
              height: '{{rippleSize}}px',
              width: '{{rippleSize}}px',
              opacity: 0,
            })
          ),
        ],
        {
          params: {
            rippleSize: 100,
            rippleX: 50,
            rippleY: 50,
            endLeft: 0,
            endTop: 0,
          },
        }
      ),
    ]),
  ],
})
export class ButtonComponent implements OnInit {
  @ViewChild('ripple', { static: false }) _ripple: ElementRef<HTMLSpanElement>;
  @ViewChild('button', { static: false })
  _button: ElementRef<HTMLButtonElement>;

  @HostBinding('class.loading') @Input() loading = false;

  @Input() styles: { [key: string]: any };
  @Input() disabled = false;
  @Input() type = 'button';
  @Input() link: any[];

  active = false;
  rippleX: number;
  rippleY: number;
  rippleSize: number;

  faCircleNotch = faCircleNotch;

  constructor() {}

  async onClick(e: MouseEvent) {
    if (this.disabled || this.loading) {
      e.stopPropagation();
      e.preventDefault();
      return false;
    }
    this.active = false;
    const rect = this._button.nativeElement.getBoundingClientRect();
    this.rippleX = e.clientX - rect.left;
    this.rippleY = e.clientY - rect.top;
    this.rippleSize =
      Math.sqrt(rect.width * rect.width + rect.height * rect.height) * 2;
    await promiseTimeout();
    this.active = true;
    return true;
  }

  ngOnInit() {}
}
