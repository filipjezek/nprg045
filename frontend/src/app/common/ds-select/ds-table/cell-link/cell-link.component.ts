import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { LinkWrapper } from '../../user-sql-functions/make-link';
import { DSCell, DSCELL_VAL } from '../cell-generic/cell-generic.component';

@Component({
  selector: 'mozaik-cell-link',
  templateUrl: './cell-link.component.html',
  styleUrls: ['./cell-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellLinkComponent implements OnInit, DSCell<LinkWrapper> {
  constructor(@Inject(DSCELL_VAL) public value: LinkWrapper) {}

  ngOnInit(): void {}
}
