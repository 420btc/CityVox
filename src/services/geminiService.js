import { GoogleGenAI, Modality, Type } from "@google/genai";

// --- PROMPT DEFINITIONS ---
const PROMPT_PREFIX_IMAGE = "Concisely name the key entity in this image (e.g. person, object, building). ";
const PROMPT_POSTFIX = "in isometric perspective, 8-bit sprite on a transparent background. No drop shadow. PNG format with transparency";
const PROMPT_MAIN = (subject) => `Create 3d pixel art of ${subject} `;
const IMAGE_PROMPT = PROMPT_PREFIX_IMAGE + PROMPT_MAIN("the isolated key entity") + PROMPT_POSTFIX;
const TEXT_PROMPT_TEMPLATE = (input) => PROMPT_MAIN(input) + PROMPT_POSTFIX;
const REMIX_PROMPT_TEMPLATE = (input) => `${input}. Keep it as 3d pixel art in isometric perspective, 8-bit sprite on transparent background. No drop shadow. PNG format with transparency.`;
const REMIX_SUGGESTION_PROMPT = `Here is some 3d pixel art. Come up with 5 brief prompts for ways to remix the key entity/object. e.g. "Make it [x]" or "Add a [x]" or some other alteration of the key entity/object. Do NOT suggest ways to alter the environment or background, that must stay transparent. Only give alterations of the key entity/object itself. Prompts should be under 8 words.`;

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result;
            // The result includes the "data:image/jpeg;base64," prefix, which we need to remove.
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

export const generateImageWithPrompt = async (imageFile, prompt) => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("VITE_GEMINI_API_KEY environment variable not set. Please ensure it's configured.");
    }
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

    const base64ImageData = await fileToBase64(imageFile);
    const mimeType = imageFile.type;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64ImageData,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    let imageUrl = null;
    let text = null;
    
    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                const base64ImageBytes = part.inlineData.data;
                imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            } else if (part.text) {
                text = part.text;
            }
        }
    }

    if (!imageUrl) {
        throw new Error(text || "No image was generated in the API response.");
    }

    return { imageUrl, text };
};

export const generateImageFromText = async (prompt) => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("VITE_GEMINI_API_KEY environment variable not set. Please ensure it's configured.");
    }
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    let imageUrl = null;
    let text = null;
    
    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                const base64ImageBytes = part.inlineData.data;
                imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            } else if (part.text) {
                text = part.text;
            }
        }
    }

    if (!imageUrl) {
        throw new Error(text || "No image was generated in the API response.");
    }

    return { imageUrl, text };
};

export const getRemixSuggestions = async (imageFile, prompt) => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("VITE_GEMINI_API_KEY environment variable not set. Please ensure it's configured.");
    }
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    const base64ImageData = await fileToBase64(imageFile);

    const textPart = { text: prompt };
    const imagePart = {
        inlineData: {
            mimeType: imageFile.type,
            data: base64ImageData,
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, imagePart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        prompts: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "A short remix prompt idea."
                            }
                        }
                    },
                    required: ["prompts"]
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        if (result.prompts && Array.isArray(result.prompts) && result.prompts.length > 0) {
            return result.prompts.slice(0, 5); // Ensure we only return 5
        }
        return [];
    } catch (error) {
        console.error("Error getting remix suggestions:", error);
        return []; // Return empty array on failure
    }
};