/* ==========================================================================
   legacy.ts — leitura do formato do Butcher Duck, o CMS de onde o manual veio.
   ========================================================================== */

/**
 * Converte o HTML do CMS antigo (h3/ul/li/strong) para o dialeto acima. Usado
 * ao importar um arquivo exportado do Butcher Duck.
 */
export function fromLegacyHtml(html: string): string {
  return html
    .replace(/\r/g, '')
    .replace(/<h[1-6][^>]*>/gi, '\n## ')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/li>/gi, '')
    .replace(/<\/(ul|ol|p|div)>/gi, '\n')
    .replace(/<(ul|ol|p|div)[^>]*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(strong|b)>/gi, '**')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .split('\n')
    .map((line) => line.trim())
    .filter((line, i, all) => line || all[i - 1])
    .join('\n')
    .trim()
}
