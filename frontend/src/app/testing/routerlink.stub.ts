import { Directive, Input } from '@angular/core';

@Directive({ selector: '[routerLink]' })
export class RouterLinkStub {
  @Input() queryParams: { [key: string]: any };
  @Input() routerLink: string | any[];
}
