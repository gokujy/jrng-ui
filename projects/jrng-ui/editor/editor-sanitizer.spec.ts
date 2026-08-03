import { jIsSafeEditorUrl, jSanitizeEditorHtml } from './editor-sanitizer';

describe('editor sanitization', () => {
  it('removes executable elements, handlers, styles, and unsafe URLs', () => {
    const html = jSanitizeEditorHtml(
      `<p onclick="run()" style="color:red">Safe<script>alert(1)</script></p>
       <a href="javascript:alert(1)" onmouseover="run()">Link</a>
       <img src="data:image/svg+xml,unsafe" onerror="run()">
       <iframe src="https://example.com"></iframe><svg><script>run()</script></svg>`,
      document,
    );
    expect(html).toContain('<p>Safe</p>');
    expect(html).toContain('<a>Link</a>');
    expect(html).toContain('<img>');
    expect(html).not.toMatch(/script|iframe|svg|onclick|onerror|style=|javascript:|data:/i);
  });

  it('allows raster image data URLs and rejects executable image data', () => {
    expect(
      jSanitizeEditorHtml(
        '<img src="data:image/png;base64,aGVsbG8=" alt="Customer logo">' +
          '<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=">',
        document,
      ),
    ).toBe('<img src="data:image/png;base64,aGVsbG8=" alt="Customer logo"><img>');
  });

  it('preserves safe rich-text media attributes and constrained inline styles', () => {
    expect(
      jSanitizeEditorHtml(
        '<p style="line-height: 1.6; background-image: url(javascript:bad())">Text</p>' +
          '<img src="https://example.com/customer.png" style="width: 50%; position: fixed" data-j-align="right">' +
          '<video src="https://example.com/demo.mp4" controls></video>',
        document,
      ),
    ).toBe(
      '<p style="line-height: 1.6">Text</p>' +
        '<img src="https://example.com/customer.png" style="width: 50%" data-j-align="right">' +
        '<video src="https://example.com/demo.mp4" controls=""></video>',
    );
  });

  it('preserves supported formatting and secures new-window links', () => {
    const html = jSanitizeEditorHtml(
      `<h2>Title</h2><p><strong>Important</strong> <a href="https://example.com" target="_blank">details</a></p>`,
      document,
    );
    expect(html).toContain('<h2>Title</h2>');
    expect(html).toContain('<strong>Important</strong>');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('allows supported protocols and rejects executable protocols', () => {
    expect(jIsSafeEditorUrl('https://example.com', document)).toBe(true);
    expect(jIsSafeEditorUrl('/products/1', document)).toBe(true);
    expect(jIsSafeEditorUrl('mailto:user@example.com', document)).toBe(true);
    expect(jIsSafeEditorUrl('javascript:alert(1)', document)).toBe(false);
    expect(jIsSafeEditorUrl('data:text/html,unsafe', document)).toBe(false);
  });
});
