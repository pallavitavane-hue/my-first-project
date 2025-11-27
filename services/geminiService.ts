import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const analyzeFinances = async (transactions: Transaction[]): Promise<{ summary: string; tips: string[] }> => {
  if (!apiKey) throw new Error("API Key not found");

  const txData = transactions.slice(0, 50).map(t => 
    `${t.date}: ${t.type.toUpperCase()} - ${t.title} ($${t.amount}) [${t.category}]`
  ).join("\n");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Analyze these financial transactions and provide a brief summary of spending habits and 3 actionable tips to save money. Return JSON.\n\nTransactions:\n${txData}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "A 2-3 sentence summary of financial health" },
          tips: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "3 actionable saving tips"
          }
        },
        required: ["summary", "tips"]
      },
    },
  });

  const raw = response.text;
  if (!raw) return { summary: "Unable to analyze.", tips: [] };

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return { summary: "Error parsing insights.", tips: [] };
  }
};

export const suggestCategory = async (title: string, amount: number): Promise<string> => {
   if (!apiKey) return "Other";
   
   try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Categorize this transaction: "${title}" amount $${amount}. Return only the category name from this list: Food, Rent, Utilities, Transport, Entertainment, Health, Shopping, Salary, Freelance, Investments, Other.`,
      });
    return response.text?.trim() || "Other";
   } catch (e) {
       return "Other";
   }
}