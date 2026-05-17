import React from 'react';
import { ContentBlock } from '../../types';

interface RichTextRendererProps {
  blocks: ContentBlock[];
}

export default function RichTextRenderer({ blocks }: RichTextRendererProps) {
  if (!Array.isArray(blocks)) return null;

  return (
    <div className="space-y-8">
      {blocks.map((block) => {
        // Base styles
        const baseClasses = `leading-relaxed transition-all break-words`;
        
        // Dynamic classes based on schema
        const styleClasses = [
          block.style.bold ? 'font-bold' : 'font-normal',
          block.style.italic ? 'italic' : '',
          block.style.alignment === 'center' ? 'text-center' : 
          block.style.alignment === 'right' ? 'text-right' : 
          block.style.alignment === 'justify' ? 'text-justify' : 'text-left',
        ];

        // Specific typography scaling
        let typeScale = 'text-lg font-serif text-zinc-300';
        if (block.style.fontSize === 'small') typeScale = 'text-sm text-zinc-400';
        if (block.style.fontSize === 'large') typeScale = 'text-2xl font-serif text-white';
        if (block.style.fontSize === 'xl') typeScale = 'text-4xl md:text-5xl font-serif text-white leading-tight';

        return (
          <p 
            key={block.id}
            className={`${baseClasses} ${styleClasses.join(' ')} ${typeScale}`}
            style={{
              textDecoration: [
                block.style.underline ? 'underline' : '',
                block.style.strikethrough ? 'line-through' : ''
              ].filter(Boolean).join(' ')
            }}
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
