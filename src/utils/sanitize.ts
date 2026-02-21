import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'sub', 'sup', 'br', 'span', 'p', 'ul', 'ol', 'li', 'code'],
    ALLOWED_ATTR: ['class', 'style'],
  });
}
