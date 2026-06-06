import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Database, Loader2, Table } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { articleService } from '../../services/articleService';

export default function SpreadsheetImportSection() {
  const [data, setData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();

    reader.onload = (evt) => {
      if (fileExt === 'csv') {
        Papa.parse(file, { header: true, complete: (res) => setData(res.data) });
      } else {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' });
        setData(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]));
      }
    };
    reader.readAsBinaryString(file);
  };

  const processImport = async () => {
    setImporting(true);
    for (const row of data) {
      if (!row.title) continue;
      await addDoc(collection(db, 'articles'), {
        title: row.title,
        full_story: row.full_story,
        slug: articleService.generateSlug(row.title),
        status: 'draft',
        createdAt: serverTimestamp()
      });
    }
    setImporting(false);
    setData([]);
    alert('Import complete');
  };

  return (
    <div className="space-y-8 bg-zinc-900/30 p-8 border border-white/5">
      <h2 className="text-xl font-serif">Spreadsheet Ingestion</h2>
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv,.xlsx" />
      
      {!data.length ? (
        <button onClick={() => fileInputRef.current?.click()} className="p-12 border border-dashed border-white/10 w-full flex flex-col items-center gap-4 hover:border-reserve-accent transition-all">
          <FileSpreadsheet size={32} />
          <span className="uppercase text-[10px] tracking-widest">Select CSV or Excel File</span>
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-[10px] uppercase text-zinc-500">{data.length} rows ready to import</p>
          <button onClick={processImport} disabled={importing} className="bg-white text-black px-8 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            {importing ? <Loader2 className="animate-spin" size={14}/> : <Database size={14}/>}
            Execute Import
          </button>
        </div>
      )}
    </div>
  );
}
