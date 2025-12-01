import { Environment } from './environment';

describe('Environment enum', () => {
  it('should have development value', () => {
    expect(Environment.Development).toBe('development');
  });

  it('should have production value', () => {
    expect(Environment.Production).toBe('production');
  });

  it('should only have two environments', () => {
    const values = Object.values(Environment);
    expect(values).toHaveLength(2);
    expect(values).toContain('development');
    expect(values).toContain('production');
  });
});
