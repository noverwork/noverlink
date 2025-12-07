import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn utility', () => {
  it('should merge single class', () => {
    expect(cn('text-red-500')).toBe('text-red-500');
  });

  it('should merge multiple classes', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;

    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe(
      'base active'
    );
  });

  it('should merge tailwind classes correctly', () => {
    // Later class should override earlier conflicting class
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should handle array of classes', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
  });

  it('should handle undefined and null values', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });

  it('should handle empty string', () => {
    expect(cn('')).toBe('');
  });

  it('should handle object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe(
      'text-red-500'
    );
  });

  it('should merge complex tailwind utilities', () => {
    expect(cn('px-4 py-2', 'px-2')).toBe('py-2 px-2');
    expect(cn('hover:bg-red-500', 'hover:bg-blue-500')).toBe('hover:bg-blue-500');
  });
});
