import { AcronymPipe } from './acronym.pipe';

describe('AcronymPipe', () => {
  let pipe: AcronymPipe;

  beforeEach(() => {
    pipe = new AcronymPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should only keep uppercase letters and numbers', () => {
    expect(pipe.transform('abcdef123')).toBe('123');
    expect(pipe.transform('FooBarBar')).toBe('FBB');
    expect(pipe.transform('$hel lo$')).toBe('');
    expect(pipe.transform('1HH1')).toBe('1HH1');
  });
});
