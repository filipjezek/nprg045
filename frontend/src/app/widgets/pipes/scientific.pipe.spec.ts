import { ScientificPipe } from './scientific.pipe';

describe('ScientificPipe', () => {
  let pipe: ScientificPipe;

  beforeEach(() => {
    pipe = new ScientificPipe('en-US');
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should not transform small numbers', () => {
    expect(pipe.transform(12)).toBe('12');
    expect(pipe.transform(-12)).toBe('-12');
    expect(pipe.transform(105.57832)).toBe('105.5783');
    expect(pipe.transform(-1000.999)).toBe('-1,000.999');

    expect(pipe.transform(0.0046)).toBe('0.0046');
    expect(pipe.transform(-0.0046)).toBe('-0.0046');
  });

  it('should transform long numbers', () => {
    expect(pipe.transform(123456789)).toBe('1.23e8');
    expect(pipe.transform(-123456789)).toBe('-1.23e8');
    expect(pipe.transform(0.000057832)).toBe('5.78e-5');
    expect(pipe.transform(-0.000057832)).toBe('-5.78e-5');
  });
});
