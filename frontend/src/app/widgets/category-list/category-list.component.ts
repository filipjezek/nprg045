import { Component, Input, OnInit, Pipe, PipeTransform } from '@angular/core';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { State } from 'src/app/store/reducers';
import { selectCurrentRoute } from 'src/app/store/selectors/router.selectors';

@Component({
  selector: 'mozaik-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
})
export class CategoryListComponent implements OnInit {
  @Input() data: string[];
  @Input() header: string;
  @Input() param: string;
  @Input() labelTransform: (val: string, index: number) => any = null;
  faCircleQuestion = faCircleQuestion;
  route$ = this.store.select(selectCurrentRoute);

  constructor(private store: Store<State>) {}

  ngOnInit(): void {}

  showHelp(index: number) {
    alert(this.data[index]);
  }
}

@Pipe({ name: 'wrap' })
export class WrapPipe implements PipeTransform {
  transform(value: string, param: string) {
    return { [param]: value };
  }
}
