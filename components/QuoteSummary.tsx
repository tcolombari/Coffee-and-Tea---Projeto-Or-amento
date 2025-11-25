import React, { useState } from 'react';
import { QuoteResult } from '../types';
import { FileText, Loader2, Copy, Check, Sparkles, Download, Pen } from 'lucide-react';
import { generateAiQuote } from '../services/geminiService';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { APP_LOGO_URL } from '../constants';

interface QuoteSummaryProps {
  totals: QuoteResult;
  files: any[];
  settings: any;
}

const QuoteSummary: React.FC<QuoteSummaryProps> = ({ totals, files, settings }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [projectName, setProjectName] = useState("");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleAiGenerate = async () => {
    setAiLoading(true);
    try {
      const text = await generateAiQuote(files, totals, settings);
      setAiText(text);
    } catch (e) {
      setAiText("Erro ao gerar proposta. Verifique a chave de API.");
    } finally {
      setAiLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (aiText) {
      navigator.clipboard.writeText(aiText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor = [44, 36, 27]; // #2C241B
    const accentColor = [212, 163, 115]; // #D4A373

    // --- Header ---
    // Background strip
    doc.setFillColor(44, 36, 27);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Coffee and Tea Studio", 20, 18);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(212, 163, 115); // Accent
    doc.text("ORÇAMENTO DE IMPRESSÃO 3D (RESINA)", 20, 26);
    
    // Project Info
    const pName = projectName.trim() || "Projeto Sem Nome";
    const date = new Date().toLocaleDateString('pt-BR');
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Projeto: ${pName}`, 20, 55);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Data: ${date}`, 20, 61);
    doc.text(`Equipamento: Elegoo Saturn 4 Ultra (12K)`, 20, 67);

    // --- Files Table ---
    const tableData = files.map(f => [
      f.name,
      `${f.volumeCm3.toFixed(2)} cm³`,
      `${f.weightG.toFixed(1)} g`
    ]);

    // Cast doc to any to access autoTable plugin method
    (doc as any).autoTable({
      startY: 75,
      head: [['Nome do Arquivo', 'Volume', 'Peso Est.']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: [255,255,255] },
      styles: { fontSize: 9 },
    });

    // --- Costs ---
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo de Custos", 20, finalY);

    const costData = [
      ["Material (Resina)", formatCurrency(totals.resinCost)],
      ["Energia", formatCurrency(totals.energyCost)],
      ["Depreciação Equip.", formatCurrency(totals.depreciationCost)],
      ["Pós-Processamento", formatCurrency(totals.postProcessingCost)],
      ["Subtotal", formatCurrency(totals.subtotal)],
      ["Total com Margem", formatCurrency(totals.total)]
    ];

    // Cast doc to any to access autoTable plugin method
    (doc as any).autoTable({
      startY: finalY + 5,
      body: costData,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 1 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 100 },
        1: { halign: 'right' }
      }
    });

    // --- AI Text / Proposal Text ---
    const textY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Proposta Comercial", 20, textY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    
    const proposalText = aiText || "Orçamento gerado automaticamente pelo sistema Coffee and Tea Studio. Agradecemos a preferência.";
    
    // Split text to fit width
    const splitText = doc.splitTextToSize(proposalText, pageWidth - 40);
    doc.text(splitText, 20, textY + 8);

    // --- Footer ---
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Coffee and Tea Studio - Resin Printing Services", pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`Orcamento_${pName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="flex flex-col h-full bg-coffee-900">
      <div className="p-4 border-b border-coffee-800 bg-coffee-800/50">
        <h2 className="text-sm font-bold uppercase tracking-wider text-coffee-400 flex items-center gap-2 mb-3">
          <FileText size={16} /> Resumo Financeiro
        </h2>
        
        {/* Project Name Input */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Nome do Projeto..."
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full bg-coffee-950 border border-coffee-700 text-coffee-100 text-xs rounded px-8 py-2 focus:outline-none focus:border-coffee-400"
          />
          <Pen size={12} className="absolute left-2.5 top-2.5 text-coffee-600" />
        </div>
      </div>

      <div className="p-4 space-y-3 flex-none">
        <div className="p-4 bg-gradient-to-br from-coffee-800 to-coffee-900 rounded-lg border border-coffee-700 shadow-inner">
           <div className="flex justify-between items-end mb-1">
             <span className="text-sm text-coffee-400 font-medium">Valor Total</span>
             <span className="text-3xl font-bold text-white tracking-tight">{formatCurrency(totals.total)}</span>
           </div>
           <div className="flex justify-between items-center text-xs text-coffee-600 border-t border-coffee-700/50 pt-2 mt-2">
             <span>Lucro Estimado</span>
             <span className="text-green-500 font-medium">+{formatCurrency(totals.profit)}</span>
           </div>
        </div>
      </div>

      <div className="px-4 py-2 space-y-2 text-sm flex-none">
        <Row label="Resina" value={totals.resinCost} />
        <Row label="Energia" value={totals.energyCost} />
        <Row label="Depreciação" value={totals.depreciationCost} />
        <Row label="Pós-Produção" value={totals.postProcessingCost} />
        <div className="h-px bg-coffee-700 my-2" />
        <Row label="Custo Operacional" value={totals.subtotal} strong />
      </div>

      <div className="p-4 mt-auto border-t border-coffee-800 space-y-3">
        <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAiGenerate}
              disabled={aiLoading || files.length === 0}
              className="py-2 bg-coffee-800 hover:bg-coffee-700 text-coffee-100 rounded border border-coffee-600 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="animate-spin w-3 h-3" /> : <Sparkles className="w-3 h-3 text-purple-300" />}
              {aiLoading ? "Gerando..." : "Gerar Texto IA"}
            </button>
            <button
              onClick={generatePDF}
              disabled={files.length === 0}
              className="py-2 bg-coffee-400 hover:bg-coffee-300 text-coffee-950 rounded font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-coffee-900/50"
            >
              <Download className="w-3 h-3" />
              Baixar PDF
            </button>
        </div>

        {aiText && (
          <div className="relative group">
             <div className="absolute -top-10 right-0 flex gap-2">
                <button 
                  onClick={copyToClipboard}
                  className="bg-coffee-700 text-white p-1.5 rounded hover:bg-coffee-600 transition shadow-lg"
                  title="Copiar Texto"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
             </div>
             <textarea 
                readOnly
                value={aiText} 
                className="w-full h-24 text-[10px] bg-coffee-950 border border-coffee-700 rounded p-2 text-coffee-300 resize-none custom-scrollbar focus:outline-none focus:border-coffee-400"
             />
          </div>
        )}
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string, value: number, strong?: boolean }> = ({ label, value, strong }) => (
  <div className={`flex justify-between items-center ${strong ? 'font-semibold text-coffee-100' : 'text-coffee-300'}`}>
    <span>{label}</span>
    <span className="font-mono opacity-80">
      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
    </span>
  </div>
);

export default QuoteSummary;