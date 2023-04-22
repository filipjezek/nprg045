import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Host,
  Inject,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { DSCell, DSCELL_VAL } from '../cell-generic/cell-generic.component';
import { diffMeta } from '../../sql/user-sql-functions/make-diff';
import { DsRowDirective } from '../ds-row.directive';
import { ViewChild } from '@angular/core';
import { TemplateRef } from '@angular/core';
import { ViewRef } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { MultiviewPartitionComponent } from 'src/app/widgets/multiview/multiview-partition/multiview-partition.component';

@Component({
  selector: 'mozaik-cell-keyvalue',
  templateUrl: './cell-keyvalue.component.html',
  styleUrls: ['./cell-keyvalue.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellKeyvalueComponent
  implements
    OnInit,
    DSCell<Record<string, number | string | boolean>>,
    AfterViewInit
{
  @ViewChild('popupTemplate') private popupTemplate: TemplateRef<any>;
  private popupViewRef: ViewRef;

  popupWidth = 0;
  popupLeft = 0;

  constructor(
    @Inject(DSCELL_VAL) public value: Record<string, number | string | boolean>,
    private row: DsRowDirective,
    private el: ElementRef<HTMLElement>
  ) {}

  ngAfterViewInit(): void {
    this.popupViewRef = this.popupTemplate.createEmbeddedView(null);
  }

  ngOnInit(): void {}

  isDiff(val: any) {
    return diffMeta in val;
  }

  showPopup() {
    this.popupLeft =
      this.el.nativeElement.getBoundingClientRect().left -
      this.getRowHTMLElement().getBoundingClientRect().left -
      MultiviewPartitionComponent.minSize / 2;
    this.popupWidth =
      this.el.nativeElement.clientWidth + MultiviewPartitionComponent.minSize;
    this.row.viewContainer.insert(this.popupViewRef);
  }

  hidePopup() {
    this.row.viewContainer.detach();
  }

  private getRowHTMLElement() {
    let el: Node = this.row.viewContainer.element.nativeElement;
    return el instanceof HTMLElement ? el : el.parentElement;
  }
}
