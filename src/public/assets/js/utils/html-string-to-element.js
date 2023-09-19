/**
 * @param {string} html 
 * @returns {HTMLElement}
 */
export function htmlStringToElement(html) {
  const template = document.createElement('template')
  template.innerHTML = html
  return template.content.firstElementChild
}