
import { GoogleGenAI } from "@google/genai";
import { Project } from "../types";

// Fix: Updated initialization to use named parameters and avoid fallback values as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a concise summary of the project's current status and next steps.
 */
export const generateProjectSummary = async (project: Project): Promise<string> => {
  try {
    // Fix: Updated to use 'gemini-3-flash-preview' for basic text tasks and correctly accessed response.text property
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Summarize the status and next steps for this architectural project in 2 sentences.
        Project Title: ${project.project_title}
        Current Status: ${project.status}
        Progress: ${project.percent_complete}%
        Context: The project budget and costs are in Nigerian Naira (₦).
        Role: Project Manager Context.
      `,
    });
    return response.text || "No summary available.";
  } catch (error) {
    console.error("AI Error", error);
    return "Could not generate AI summary.";
  }
};

/**
 * Generates a professional email template for various project communication types.
 */
export const generateEmailTemplate = async (type: string, clientName: string, projectName: string): Promise<string> => {
    try {
        // Fix: Switched to recommended 'gemini-3-flash-preview' model
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Write a professional, warm, short email body (no subject line) from an Architectural Firm to client ${clientName} regarding project ${projectName}.
            Context: ${type}. Currency used is Nigerian Naira (₦).
            Keep it under 50 words.`
        });
        return response.text || "Email generation failed.";
    } catch (e) {
        return "Email generation failed.";
    }
}

/**
 * Generates a brand-consistent password reset email template.
 */
export const generatePasswordResetEmail = async (email: string): Promise<string> => {
  try {
    // Fix: Switched to recommended 'gemini-3-flash-preview' model
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Write a professional, minimalist password reset email from "Atelier Anj" to a user at ${email}.
        Maintain a premium architectural firm brand voice (sophisticated, clear, reassuring).
        Include a placeholder where a [Reset Link] would go.
        Keep the total word count around 60 words.
      `,
    });
    return response.text || "A reset link has been sent to your email.";
  } catch (error) {
    return "A reset link has been sent to your email.";
  }
};
