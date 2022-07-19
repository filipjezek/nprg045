import { Component, Input, OnInit } from '@angular/core';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { State } from 'src/app/store/reducers';

@Component({
  selector: 'mozaik-stimulus-list',
  templateUrl: './stimulus-list.component.html',
  styleUrls: ['./stimulus-list.component.scss'],
})
export class StimulusListComponent implements OnInit {
  @Input() stimuli: string[];
  faCircleQuestion = faCircleQuestion;
  url$ = this.store.select((x) => x.router.state.url);

  constructor(private store: Store<State>) {}

  ngOnInit(): void {}

  showHelp(index: number) {
    alert(this.stimuli[index]);
  }
}
