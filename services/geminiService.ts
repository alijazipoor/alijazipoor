
import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosisResult } from "../types";

// Always use named parameter for apiKey and directly reference process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const diagnoseModemIssue = async (model: string, issue: string): Promise<DiagnosisResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Diagnose a modem repair issue. 
                 Model: ${model}
                 Reported Issue: ${issue}
                 Provide the response in Persian.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            possibleCauses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of possible technical causes for the issue"
            },
            suggestedSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Step-by-step repair or testing instructions"
            }
          },
          required: ["possibleCauses", "suggestedSteps"]
        }
      }
    });

    // .text is a property, not a method.
    if (response.text) {
      return JSON.parse(response.text.trim()) as DiagnosisResult;
    }
    return null;
  } catch (error) {
    console.error("AI Diagnosis failed:", error);
    return null;
  }
};
