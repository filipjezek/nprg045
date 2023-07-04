import {
  state,
  style,
  transition,
  trigger,
  useAnimation,
} from '@angular/animations';
import { Component, Input } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { dialogClose, dialogOpen } from 'src/app/animations';
import { Dialog } from 'src/app/dialog';
import { NetworkNode } from 'src/app/store/reducers/model.reducer';
import { RadioOption } from 'src/app/widgets/button-radio/button-radio.component';

export interface AddNeuronResult {
  neuron: number;
  replace: boolean;
}

@Component({
  selector: 'mozaik-add-neuron',
  templateUrl: './add-neuron.component.html',
  styleUrls: ['./add-neuron.component.scss'],
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
})
export class AddNeuronComponent extends Dialog {
  static readonly selector = 'add-neuron-dialog';

  @Input() set nodes(n: NetworkNode[]) {
    this._nodes = n;
    this.sequences = this.getSequences();
  }
  get nodes() {
    return this._nodes;
  }
  private _nodes: NetworkNode[];
  sequences: string;

  addTypes: RadioOption[] = [
    { label: 'Add to selection', value: 'add' },
    { label: 'Replace selection', value: 'replace' },
  ];
  form = new FormGroup({
    neuron: new FormControl<number>(null, [
      Validators.required,
      Validators.min(0),
      (ctrl: AbstractControl) => {
        if (ctrl.value === null) return null;
        const val = +ctrl.value;
        return this.nodes[val] ? null : { nonexistentNode: val };
      },
    ]),
    addType: new FormControl<'add' | 'replace'>('add'),
  });

  submit() {
    const val = this.form.value;
    this.value.emit({
      neuron: +val.neuron,
      replace: val.addType == 'replace',
    } as AddNeuronResult);
  }

  getSequences() {
    if (!this.nodes) return '';
    const res = [];
    let start: number = null;
    for (let i = 0; i <= this.nodes.length; ++i) {
      if (start === null && this.nodes[i]) start = i;
      else if (start !== null && !this.nodes[i]) {
        res.push(`${start} - ${i - 1}`);
        start = null;
      }
    }
    return res.join('\n');
  }
}
