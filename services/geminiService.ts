
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

export const geminiService = {
  analyzeFinances: async (transactions: Transaction[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Aggregate data for cleaner prompt
    const summary = transactions.reduce((acc: any, t) => {
      acc[t.type] = (acc[t.type] || 0) + t.amount;
      acc.categories[t.category] = (acc.categories[t.category] || 0) + t.amount;
      return acc;
    }, { income: 0, expense: 0, categories: {} });

    const prompt = `
      Act as a high-end financial advisor. Analyze these spending patterns (in INR) for the user:
      Total Income: ₹${summary.income}
      Total Expenses: ₹${summary.expense}
      Category Breakdown: ${JSON.stringify(summary.categories)}
      
      Please provide:
      1. A professional summary of their financial health.
      2. One specific actionable tip to improve savings.
      3. A prediction of where they might be in 3 months if this trend continues.
      Keep it encouraging but realistic. Format with Markdown.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "Unable to generate insights at this time.";
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return "The AI financial advisor is currently offline. Please try again later.";
    }
  }
};
