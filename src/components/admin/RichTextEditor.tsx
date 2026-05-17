import React from 'react';
import { 
  Plus, 
  Trash2, 
  Bold, 
  Italic, 
  Underline, 
  Type, 
  AlignCenter, 
  AlignLeft, 
  AlignRight, 
  AlignJustify,
  GripVertical,
  Strikethrough
} from 'lucide-react';
import { ContentBlock, ContentFontSize, ContentAlignment } from '../../types';

interface RichTextEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export default function RichTextEditor({ blocks, onChange }: RichTextEditorProps) {
  const addBlock = () => {
    const newBlock: ContentBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'paragraph',
      text: '',
      style: {
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        fontSize: 'medium',
        alignment: 'left'
      }
    };
    onChange([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onChange(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const updateStyle = (id: string, styleUpdates: Partial<ContentBlock['style']>) => {
    const block = blocks.find(b => b.id === id);
    if (block) {
      updateBlock(id, {
        style: { ...block.style, ...styleUpdates }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Story Content Blocks</h3>
        <button 
          onClick={addBlock}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-reserve-accent hover:text-white transition-colors"
        >
          <Plus size={14} /> Add Paragraph
        </button>
      </div>

      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div key={block.id} className="group relative bg-zinc-950/50 border border-white/5 hover:border-white/10 transition-all p-6">
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
              <button disabled className="cursor-grab text-zinc-700 hover:text-zinc-500"><GripVertical size={16} /></button>
            </div>

            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-black border border-white/10 rounded-sm overflow-hidden">
                  <button 
                    onClick={() => updateStyle(block.id, { bold: !block.style.bold })}
                    className={`p-2 hover:bg-white/5 transition-colors ${block.style.bold ? 'text-reserve-accent bg-white/5' : 'text-zinc-500'}`}
                  >
                    <Bold size={14} />
                  </button>
                  <button 
                    onClick={() => updateStyle(block.id, { italic: !block.style.italic })}
                    className={`p-2 hover:bg-white/5 transition-colors ${block.style.italic ? 'text-reserve-accent bg-white/5' : 'text-zinc-500'}`}
                  >
                    <Italic size={14} />
                  </button>
                  <button 
                    onClick={() => updateStyle(block.id, { underline: !block.style.underline })}
                    className={`p-2 hover:bg-white/5 transition-colors ${block.style.underline ? 'text-reserve-accent bg-white/5' : 'text-zinc-500'}`}
                  >
                    <Underline size={14} />
                  </button>
                  <button 
                    onClick={() => updateStyle(block.id, { strikethrough: !block.style.strikethrough })}
                    className={`p-2 hover:bg-white/5 transition-colors ${block.style.strikethrough ? 'text-reserve-accent bg-white/5' : 'text-zinc-500'}`}
                  >
                    <Strikethrough size={14} />
                  </button>
                </div>

                <div className="flex items-center bg-black border border-white/10 rounded-sm overflow-hidden">
                  {(['small', 'medium', 'large', 'xl'] as ContentFontSize[]).map(size => (
                    <button 
                      key={size}
                      onClick={() => updateStyle(block.id, { fontSize: size })}
                      className={`px-3 py-2 text-[9px] uppercase tracking-tighter hover:bg-white/5 transition-colors ${block.style.fontSize === size ? 'text-reserve-accent bg-white/5' : 'text-zinc-500'}`}
                    >
                      {size === 'xl' ? 'XL' : size[0]}
                    </button>
                  ))}
                </div>

                <div className="flex items-center bg-black border border-white/10 rounded-sm overflow-hidden">
                  <button 
                    onClick={() => updateStyle(block.id, { alignment: 'left' })}
                    className={`p-2 hover:bg-white/5 transition-colors ${block.style.alignment === 'left' ? 'text-reserve-accent bg-white/5' : 'text-zinc-500'}`}
                  >
                    <AlignLeft size={14} />
                  </button>
                  <button 
                    onClick={() => updateStyle(block.id, { alignment: 'center' })}
                    className={`p-2 hover:bg-white/5 transition-colors ${block.style.alignment === 'center' ? 'text-reserve-accent bg-white/5' : 'text-zinc-500'}`}
                  >
                    <AlignCenter size={14} />
                  </button>
                  <button 
                    onClick={() => updateStyle(block.id, { alignment: 'right' })}
                    className={`p-2 hover:bg-white/5 transition-colors ${block.style.alignment === 'right' ? 'text-reserve-accent bg-white/5' : 'text-zinc-500'}`}
                  >
                    <AlignRight size={14} />
                  </button>
                  <button 
                    onClick={() => updateStyle(block.id, { alignment: 'justify' })}
                    className={`p-2 hover:bg-white/5 transition-colors ${block.style.alignment === 'justify' ? 'text-reserve-accent bg-white/5' : 'text-zinc-500'}`}
                  >
                    <AlignJustify size={14} />
                  </button>
                </div>
              </div>

              <button 
                onClick={() => removeBlock(block.id)}
                className="p-2 text-zinc-700 hover:text-rose-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <textarea 
              value={block.text}
              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
              placeholder="Start typing paragraph..."
              className={`w-full bg-transparent border-none focus:ring-0 p-0 resize-none min-h-[100px] leading-relaxed transition-all
                ${block.style.bold ? 'font-bold' : 'font-normal'}
                ${block.style.italic ? 'italic' : ''}
                ${block.style.underline ? 'underline' : ''}
                ${block.style.strikethrough ? 'line-through' : ''}
                ${block.style.fontSize === 'small' ? 'text-sm' : 
                  block.style.fontSize === 'large' ? 'text-2xl' : 
                  block.style.fontSize === 'xl' ? 'text-4xl font-serif' : 'text-lg font-serif'}
                ${block.style.alignment === 'center' ? 'text-center' : 
                  block.style.alignment === 'right' ? 'text-right' : 
                  block.style.alignment === 'justify' ? 'text-justify' : 'text-left'}
              `}
              style={{
                textDecoration: `${block.style.underline ? 'underline' : ''} ${block.style.strikethrough ? 'line-through' : ''}`.trim()
              }}
            />
          </div>
        ))}

        {blocks.length === 0 && (
          <div className="py-20 border border-dashed border-white/5 flex flex-col items-center justify-center gap-4 text-zinc-600">
            <Type size={32} />
            <p className="text-xs uppercase tracking-widest">No content blocks yet</p>
            <button 
              onClick={addBlock}
              className="px-6 py-2 bg-white/5 text-white text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors border border-white/10"
            >
              Add First Block
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
