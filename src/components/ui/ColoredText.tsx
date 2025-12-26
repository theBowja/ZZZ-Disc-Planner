import React from 'react';

// A simple unescape function
const unescapeHtml = (text: string) => {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
};

const ColoredText = ({ text }: { text: string }) => {
  if (!text) return null;

  const unescapedText = unescapeHtml(text);

  const parts = unescapedText.split(/(<color=.*?>|<\/color>)/g);

  const elements: React.ReactNode[] = [];
  let currentColor: string | null = null;
  let key = 0;

  for (const part of parts) {
    if (part.startsWith('<color=')) {
      const match = part.match(/<color=(.*?)>/);
      if (match) {
        currentColor = match[1];
      }
    } else if (part === '</color>') {
      currentColor = null;
    } else if (part) {
      key++;
      if (currentColor) {
        elements.push(<span key={key} style={{ color: currentColor }}>{part}</span>);
      } else {
        elements.push(<React.Fragment key={key}>{part}</React.Fragment>);
      }
    }
  }

  return <>{elements}</>;
};

export default ColoredText;
