import { Component, Input, OnInit } from '@angular/core';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { State } from 'src/app/store/reducers';
import { selectCurrentRoute } from 'src/app/store/selectors/router.selectors';

@Component({
  selector: 'mozaik-stimulus-list',
  templateUrl: './stimulus-list.component.html',
  styleUrls: ['./stimulus-list.component.scss'],
})
export class StimulusListComponent implements OnInit {
  @Input() stimuli: string[];
  faCircleQuestion = faCircleQuestion;
  route$ = this.store.select(selectCurrentRoute);

  constructor(private store: Store<State>) {}

  ngOnInit(): void {}

  showHelp(index: number) {
    alert(this.stimuli[index]);
  }
}
