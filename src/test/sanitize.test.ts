import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../utils/sanitize';

describe('sanitizeHtml', () => {
  it('allows safe HTML tags', () => {
    expect(sanitizeHtml('<b>bold</b>')).toBe('<b>bold</b>');
    expect(sanitizeHtml('<em>italic</em>')).toBe('<em>italic</em>');
    expect(sanitizeHtml('<strong>strong</strong>')).toBe('<strong>strong</strong>');
    expect(sanitizeHtml('<sub>sub</sub>')).toBe('<sub>sub</sub>');
    expect(sanitizeHtml('<sup>sup</sup>')).toBe('<sup>sup</sup>');
  });

  it('strips dangerous tags', () => {
    expect(sanitizeHtml('<script>alert("xss")</script>')).toBe('');
    expect(sanitizeHtml('<img src=x onerror=alert(1)>')).toBe('');
    expect(sanitizeHtml('<iframe src="evil.com"></iframe>')).toBe('');
  });

  it('strips dangerous attributes', () => {
    expect(sanitizeHtml('<b onclick="alert(1)">text</b>')).toBe('<b>text</b>');
    expect(sanitizeHtml('<span onmouseover="alert(1)">text</span>')).toBe('<span>text</span>');
  });

  it('allows class and style attributes', () => {
    expect(sanitizeHtml('<span class="math">x</span>')).toBe('<span class="math">x</span>');
  });

  it('handles plain text', () => {
    expect(sanitizeHtml('Hello world')).toBe('Hello world');
  });
});
