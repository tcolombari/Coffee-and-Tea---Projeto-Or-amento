import { GoogleGenAI } from "@google/genai";
import { QuoteResult, StlFile } from "../types";

const SYSTEM_INSTRUCTION = `
Você é um assistente especializado em orçamentos para impressão 3D de resina de alta fidelidade.
Seu objetivo é gerar textos de proposta comercial formais e atraentes baseados nos dados técnicos fornecidos.
O tom deve ser profissional, valorizando a qualidade da máquina "Elegoo Saturn 4 Ultra 12K" e o acabamento.
A moeda é BRL (R$).
`;

export const generateAiQuote = async (
  files: StlFile[],
  totals: QuoteResult,
  settings: any
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not configured");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const fileListString = files.map(f => `- ${f.name} (Volume: ${f.volumeCm3.toFixed(2)} cm³, Altura: ${f.heightMm.toFixed(1)}mm)`).join('\n');
  
  const prompt = `
    Gere uma proposta comercial formal para um cliente.
    
    Detalhes do Projeto:
    - Equipamento: Elegoo Saturn 4 Ultra (Resolução 12K)
    - Total de Arquivos: ${files.length}
    - Lista de Peças:
    ${fileListString}
    
    Custos Calculados:
    - Custo de Material (Resina): R$ ${totals.resinCost.toFixed(2)}
    - Custo de Energia e Depreciação: R$ ${(totals.energyCost + totals.depreciationCost).toFixed(2)}
    - Acabamento/Pós-processamento: R$ ${totals.postProcessingCost.toFixed(2)}
    
    Valor Final Sugerido: R$ ${totals.total.toFixed(2)}
    
    Por favor, crie um texto de email ou mensagem para o cliente explicando o valor, destacando a qualidade 12K da impressão e o cuidado no acabamento.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || "Não foi possível gerar a proposta.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Falha ao se comunicar com a IA.");
  }
};