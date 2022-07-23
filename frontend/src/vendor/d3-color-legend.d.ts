declare module 'src/vendor/d3-color-legend' {
  import { ScaleSequentialBase } from 'd3';
  function Legend(
    colors: ScaleSequentialBase<any, any>,
    options?: Partial<{
      title: string;
      tickSize: number;
      width: number;
      height: number;
      marginTop: number;
      marginRight: number;
      marginBottom: number;
      marginLeft: number;
      ticks: number;
      tickFormat: string;
      tickValues: number[];
    }>
  ): HTMLElement;
}
