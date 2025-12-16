import { GoogleGenAI } from "@google/genai";
import { Vehicle } from "../types";
import { INITIAL_VEHICLES, NAIROBI_ROUTES } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askMatatuAssistant = async (
  userQuery: string,
  currentVehicles: Vehicle[]
): Promise<string> => {
  try {
    const context = `
      You are a smart Nairobi commuter assistant called "MatatuLive AI".
      
      Current Live Traffic Data (Snapshot):
      ${JSON.stringify(currentVehicles.map(v => ({
        sacco: v.sacco,
        route: v.routeId,
        seatsLeft: v.seats.filter(s => !s.isBooked).length,
        etaToNextStop: v.etaMinutes,
        plate: v.plateNumber
      })))}
      
      Routes Available:
      ${JSON.stringify(NAIROBI_ROUTES.map(r => r.name))}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Context: ${context}\n\nUser Question: ${userQuery}`,
      config: {
        tools: [{googleMaps: {}}],
      }
    });

    return response.text || "Sorry, I couldn't get the latest signal from the matatus. Try again!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Network hitch! Just check the map for now.";
  }
};

export const getTripPlan = async (origin: string, destination: string): Promise<{
  summary: string;
  routes: string[];
}> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Plan a public transport trip in Nairobi from ${origin} to ${destination}. 
      Suggest which of these known routes would be best to take: ${NAIROBI_ROUTES.map(r => r.name).join(', ')}.
      Return a JSON object with:
      1. summary: A short friendly explanation of the route (max 2 sentences).
      2. routes: An array of route IDs from the available list that are relevant (e.g. ['route-thika-rd', 'route-langata']).
      `,
      config: {
        responseMimeType: "application/json",
        // No schema here to keep it simple and flexible for the prompt
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return { summary: "Check the map for the best route.", routes: [] };
  } catch (e) {
    console.error(e);
    // Fallback logic for the demo if API fails or plain text is returned
    const routes = [];
    if (origin.toLowerCase().includes('kenyatta') || origin.toLowerCase().includes('juja')) routes.push('route-thika-rd');
    if (destination.toLowerCase().includes('strathmore') || destination.toLowerCase().includes('langata')) routes.push('route-langata');
    return {
      summary: "I recommend taking Thika Road then connecting to Langata Road.",
      routes: routes.length > 0 ? routes : ['route-thika-rd', 'route-langata']
    };
  }
}
