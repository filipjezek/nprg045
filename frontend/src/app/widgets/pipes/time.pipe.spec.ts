import { TimePipe } from './time.pipe';

fdescribe('TimePipe', () => {
  it('create an instance', () => {
    const pipe = new TimePipe();
    expect(pipe).toBeTruthy();
  });

  it('should convert miliseconds to readable time', () => {
    const pipe = new TimePipe();
    expect(pipe.transform(1000)).toBe('0:01');
    expect(pipe.transform(100)).toBe('0:00');
    expect(pipe.transform(5000)).toBe('0:05');
    expect(pipe.transform(60000)).toBe('1:00');
    expect(pipe.transform(97000)).toBe('1:37');
    expect(pipe.transform(1197000)).toBe('19:57');
  });
});
