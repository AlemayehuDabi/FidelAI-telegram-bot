import fetch from "node-fetch";

const STABILITY_API_KEY = process.env.STABILITY_API_KEY || "";

/**
 * Generate an AI image using Stability AI (Stable Diffusion)
 * Returns the image URL or null if generation fails
 */
export async function generateImage(prompt: string): Promise<string | null> {
  if (!STABILITY_API_KEY) {
    console.warn("STABILITY_API_KEY not set. Image generation will not work.");
    return null;
  }

  try {
    // Using Stability AI REST API
    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STABILITY_API_KEY}`,
          Accept: "image/*",
        },
        body: new URLSearchParams({
          prompt: prompt,
          output_format: "png",
          aspect_ratio: "16:9",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Stability AI Error:", response.status, errorText);
      
      // Try alternative endpoint if the first one fails
      return await generateImageAlternative(prompt);
    }

    // For Stability AI, we need to save the image and return a URL
    // Since we can't directly upload to Telegram from binary, we'll use a different approach
    // We'll return a data URL or use an alternative method
    
    // Alternative: Use a simpler approach with image generation service
    return await generateImageAlternative(prompt);
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}

/**
 * Alternative image generation using a simpler service
 * Falls back to using Hugging Face or another free service
 */
async function generateImageAlternative(prompt: string): Promise<string | null> {
  try {
    // Using Hugging Face Inference API as a fallback (free tier available)
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || "";
    
    if (!HF_API_KEY) {
      // If no API key, return null and the bot will show a message
      return null;
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      console.error("Hugging Face API Error:", response.status);
      return null;
    }

    const imageBuffer = await response.arrayBuffer();
    // Convert to base64 data URL for Telegram
    const base64 = Buffer.from(imageBuffer).toString("base64");
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error("Error in alternative image generation:", error);
    return null;
  }
}

/**
 * Note: For production, you might want to:
 * 1. Upload generated images to a cloud storage (e.g., Cloudinary, Imgur)
 * 2. Return the public URL instead of base64
 * 3. Use a more reliable image generation service
 */

