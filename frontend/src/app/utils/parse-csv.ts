import { Observable } from 'rxjs';
import * as csv from 'csv/browser/esm';

export function parseCSV(): (src: Observable<string>) => Observable<any[]>;
export function parseCSV<T extends Record<string, any>>(
  columns: (keyof T)[]
): (src: Observable<string>) => Observable<T>;

export function parseCSV(
  columns?: any[]
): (src: Observable<string>) => Observable<any> {
  return (source: Observable<string>) => {
    return new Observable((subscriber) => {
      const parser = csv.parse({
        cast: true,
        columns: columns as string[],
        relax_column_count: true,
      });
      const srcSubscr = source.subscribe({
        next(value) {
          parser.write(value);
        },
        error(error) {
          subscriber.error(error);
        },
        complete() {
          parser.end();
        },
      });

      parser.on('readable', () => {
        let record: any;
        while ((record = parser.read()) !== null) {
          subscriber.next(record);
        }
      });
      parser.on('error', (error) => {
        subscriber.error(error);
      });
      parser.on('end', () => {
        subscriber.complete();
      });

      return () => {
        srcSubscr.unsubscribe();
        parser.end();
      };
    });
  };
}
