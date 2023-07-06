import { Store } from '@ngrx/store';
import * as d3Lasso from 'd3-lasso';
import { addSelectedNodes } from 'src/app/store/actions/model.actions';
import { State } from 'src/app/store/reducers';
import { SVGRef, AnySelection } from 'src/app/utils/svg-ref';
import { Injectable } from '@angular/core';

/**
 * factory method to allow dependency injection and improve testability
 */
@Injectable({
  providedIn: 'root',
})
export class LassoFeatureFactory {
  public createLassoFeature(svg: SVGRef, store: Store<State>) {
    return new LassoFeature(svg, store);
  }
}

export class LassoFeature {
  private lasso: d3Lasso.Lasso;

  constructor(private svg: SVGRef, private store: Store<State>) {
    this.initLasso();
  }

  public rebind(items: AnySelection) {
    this.lasso.items(items);
  }

  private initLasso() {
    this.lasso = d3Lasso
      .lasso()
      .closePathSelect(true)
      .closePathDistance(1000)
      .hoverSelect(false)
      .targetArea(this.svg.rootEl)
      .on('start', () => {
        this.lasso
          .items()
          .classed('not-possible', true)
          .classed('selected', false);
      })
      .on('draw', () => {
        this.lasso
          .possibleItems()
          .classed('not-possible', false)
          .classed('possible', true);
        this.lasso
          .notPossibleItems()
          .classed('not-possible', true)
          .classed('possible', false);
      })
      .on('end', () => {
        this.lasso.items().classed('not-possible possible', false);
        const data = this.lasso.selectedItems().data();
        if (data.length) {
          this.store.dispatch(addSelectedNodes({ nodes: data }));
        }
      });
    this.svg.rootEl.call(this.lasso);
  }
}
