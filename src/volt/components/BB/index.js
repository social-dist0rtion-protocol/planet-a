import React from 'react';
import yabbcode from 'ya-bbcode';

const parser = new yabbcode();

parser.registerTag('color', {
  type: 'replace',
  open: (attr) => {
      return `<span style="color: ${attr}">`;
  },
  close: '</span>'
});

parser.registerTag('ol', {
  type: 'replace',
  open: '<ol>',
  close: '</ol>'
});

parser.registerTag('ul', {
  type: 'replace',
  open: '<ul>',
  close: '</ul>'
});

parser.registerTag('li', {
  type: 'replace',
  open: '<li>',
  close: null
});

parser.registerTag('size', {
  type: 'replace',
  open: (attr) => {
      return `<span>`;
  },
  close: '</span>'
});

export default function BB({ children, as: Component = 'div' }) {
  const html = React.useMemo(() => parser.parse(children), [children]);
  return <Component dangerouslySetInnerHTML={{__html: html}} />;
}