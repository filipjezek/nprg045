import { TestBed } from '@angular/core/testing';
import { SQLBuilder, SQLBuilderFactory } from './sql-builder';
import { FORMAT_SQL } from './format-sql';

describe('SQLBuilder', () => {
  let factory: SQLBuilderFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FORMAT_SQL,
          useValue: jasmine.createSpy('formatSQL'),
        },
      ],
    });
    factory = TestBed.inject(SQLBuilderFactory);
  });

  it('should get aggregated columns', () => {
    const builder = factory.create(`SELECT a, COUNT(b), MIN(c) FROM (
      SELECT i, COUNT(j) FROM data
    )`);
    expect(builder.getAggregatedCols()).toEqual(['COUNT(b)', 'MIN(c)']);
  });

  it('should get column names', () => {
    const builder = factory.create(`SELECT a, COUNT(b) as bb, MIN(c) FROM (
      SELECT i, COUNT(j) FROM data
    )`);
    expect(builder.getColumnNames()).toEqual(['a', 'bb', 'MIN(c)']);
  });

  describe('extracting sort column', () => {
    it('should extract sort column', () => {
      const builder = factory.create('SELECT * FROM data ORDER BY a');
      expect(builder.extractSortColumn()).toEqual({ key: 'a', asc: true });
    });
    it('should extract sort direction', () => {
      const builder = factory.create('SELECT * FROM data ORDER BY a DESC');
      expect(builder.extractSortColumn()).toEqual({ key: 'a', asc: false });
    });
    it('should handle no sort column', () => {
      const builder = factory.create('SELECT * FROM data');
      expect(builder.extractSortColumn()).toEqual(null);
    });
    it('should handle multiple sort columns', () => {
      const builder = factory.create('SELECT * FROM data ORDER BY a, b');
      expect(builder.extractSortColumn()).toEqual({ key: 'a', asc: true });
    });
  });

  describe('stringifying', () => {
    it('should stringify basic query', () => {
      const builder = factory.create('SELECT a, b, c FROM data');
      expect(builder.toString()).toBe('SELECT `a`, `b`, `c` FROM `data`');
    });

    it('should stringify query with conditions and ordering', () => {
      const builder = factory.create(
        'SELECT a, b, c FROM data WHERE a > b GROUP BY g HAVING i = 5 ORDER BY a, b ASC, c DESC'
      );
      expect(builder.toString()).toBe(
        'SELECT `a`, `b`, `c` FROM `data` WHERE `a` > `b` GROUP BY `g` HAVING `i` = 5 ORDER BY `a` ASC, `b` ASC, `c` DESC'
      );
    });

    it('should stringify complicated conditions', () => {
      const builder = factory.create(
        'SELECT a, b, c FROM data WHERE a > b AND a IN (1, 2, 3) AND (j - 4 < a OR b IS NULL AND (a - 3 + 17 / 2 = 5 OR a - 3 + c = d))'
      );
      expect(builder.toString()).toBe(
        'SELECT `a`, `b`, `c` FROM `data` WHERE ((`a` > `b`) AND (`a` IN (1, 2, 3))) AND (((`j` - 4) < `a`) OR ((`b` IS NULL) AND ((((`a` - 3) + (17 / 2)) = 5) OR (((`a` - 3) + `c`) = `d`))))'
      );
    });

    it('should stringify property access', () => {
      const builder = factory.create(
        'SELECT a->b->0->c FROM data WHERE a->(1+b) < 4'
      );
      expect(builder.toString()).toBe(
        'SELECT `a`->`b`->0->`c` FROM `data` WHERE (`a`->(1 + `b`)) < 4'
      );
    });

    it('should stringify function calls', () => {
      const builder = factory.create(
        'SELECT a->substr(1, 2), COUNT(c), LOWER(a + 2) FROM data'
      );
      expect(builder.toString()).toBe(
        'SELECT `a`->`substr`(1, 2), COUNT(`c`), LOWER(`a` + 2) FROM `data`'
      );
    });

    it('should stringify set operations', () => {
      const builder = factory.create(
        'SELECT * FROM adata UNION SELECT * FROM bdata EXCEPT SELECT * FROM cdata UNION ALL SELECT * FROM ddata INTERSECT SELECT * FROM edata ORDER BY a'
      );
      expect(builder.toString()).toBe(
        'SELECT * FROM `adata` UNION SELECT * FROM `bdata` EXCEPT SELECT * FROM `cdata` UNION ALL SELECT * FROM `ddata` INTERSECT SELECT * FROM `edata` ORDER BY `a` ASC'
      );
    });

    it('should stringify joins', () => {
      const builder = factory.create(
        'SELECT * FROM adata a JOIN bdata b ON a.c = b.c LEFT JOIN cdata c USING d'
      );
      expect(builder.toString()).toBe(
        'SELECT * FROM `adata` `a` INNER JOIN `bdata` `b` ON `a`.`c` = `b`.`c`, LEFT JOIN `cdata` `c` USING `d`'
      );
    });

    it('should stringify subqueries', () => {
      const builder = factory.create(
        'SELECT a.*, (SELECT name FROM v WHERE MAX(c) = a.c) FROM adata a JOIN (SELECT * FROM data) b ON a.id = b.id WHERE g NOT IN (SELECT a FROM data)'
      );
      expect(builder.toString()).toBe(
        'SELECT `a`.*, (SELECT `name` FROM `v` WHERE MAX(`c`) = `a`.`c`) FROM `adata` `a` INNER JOIN (SELECT * FROM `data`) `b` ON `a`.`id` = `b`.`id` WHERE `g` NOT IN (SELECT `a` FROM `data`)'
      );
    });

    it('should stringify subqueries 2', () => {
      const builder = factory.create(
        'SELECT * FROM (SELECT * FROM data) WHERE a = b'
      );
      expect(builder.toString()).toBe(
        'SELECT * FROM (SELECT * FROM `data`) `default` WHERE `a` = `b`'
      );
    });
  });

  it('should add where conditions', () => {
    const builder = factory
      .create('SELECT a, b FROM data')
      .andWhere('s < 5')
      .andWhere('c IN (1,2,3)')
      .andWhere('f - 4 = 2');
    expect(builder.toString()).toBe(
      'SELECT `a`, `b` FROM `data` WHERE (`s` < 5) AND ((`c` IN (1, 2, 3)) AND ((`f` - 4) = 2))'
    );
  });

  it('should add having conditions', () => {
    const builder = factory
      .create('SELECT a, b FROM data GROUP BY d')
      .andHaving('s < 5')
      .andHaving('c IN (1,2,3)')
      .andHaving('f - 4 = 2');
    expect(builder.toString()).toBe(
      'SELECT `a`, `b` FROM `data` GROUP BY `d` HAVING (`s` < 5) AND ((`c` IN (1, 2, 3)) AND ((`f` - 4) = 2))'
    );
  });

  it('should add where condition to set operation', () => {
    const builder = factory
      .create('SELECT a, b FROM data UNION SELECT * FROM bdata')
      .andWhere('s < 5');
    expect(builder.toString()).toBe(
      'SELECT * FROM (SELECT `a`, `b` FROM `data` UNION (SELECT * FROM `bdata`)) WHERE `s` < 5'
    );
  });

  it('should wrap statement', () => {
    const builder = factory
      .create('SELECT a, b FROM data WHERE 1 ORDER BY g')
      .wrap();
    expect(builder.toString()).toBe(
      'SELECT * FROM (SELECT `a`, `b` FROM `data` WHERE 1 ORDER BY `g` ASC)'
    );
  });

  describe('escaping values', () => {
    it('should escape null', () => {
      expect(SQLBuilder.escapeValue(null)).toBe('NULL');
      expect(SQLBuilder.escapeValue(undefined)).toBe('NULL');
    });

    it('should escape number', () => {
      expect(SQLBuilder.escapeValue(1.3)).toBe('1.3');
    });

    it('should escape string', () => {
      spyOn(SQLBuilder, 'sanitizeStr').and.returnValue('foo bar');
      expect(SQLBuilder.escapeValue('hello')).toBe("'foo bar'");
    });

    it('should escape boolean', () => {
      expect(SQLBuilder.escapeValue(true)).toBe('TRUE');
      expect(SQLBuilder.escapeValue(false)).toBe('FALSE');
    });

    it('should escape array', () => {
      expect(SQLBuilder.escapeValue([1, 2, ['a']])).toBe("@[1, 2, @['a']]");
    });

    it('should escape object', () => {
      expect(SQLBuilder.escapeValue({ foo: 1, bar: 2, baz: ['a', {}] })).toBe(
        "@{'foo': 1,'bar': 2,'baz': @['a', @{}]}"
      );
    });
  });
});
