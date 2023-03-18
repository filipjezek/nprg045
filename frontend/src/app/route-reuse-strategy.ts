import {
  ActivatedRouteSnapshot,
  BaseRouteReuseStrategy,
} from '@angular/router';

/**
 * This is here in order to prevent reinitialization of expensive components
 * e.g. when loading DS connections -> per neuron value,
 * the graph should stay and only display additional data
 */
export class MozaikRouteReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    return (
      curr.routeConfig === future.routeConfig ||
      future.component === curr.component
    );
  }
}
