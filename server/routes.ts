import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { z } from "zod";
import dotenv from "dotenv";
import axios from "axios";


dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const translateRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  sourceLang: z.string(),
  targetLang: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, sourceLang, targetLang } = translateRequestSchema.parse(req.body);

      const languageNames: Record<string, string> = {
        en: "English",
        vi: "Vietnamese",
        zh: "Simplified Chinese",
        "zh-TW": "Traditional Chinese",
        es: "Spanish",
        fr: "French",
        de: "German",
        ja: "Japanese",
        ko: "Korean",
        pt: "Portuguese",
        ru: "Russian",
        ar: "Arabic",
        hi: "Hindi",
        it: "Italian",
        nl: "Dutch",
        pl: "Polish",
        tr: "Turkish",
        th: "Thai",
        sv: "Swedish",
        id: "Indonesian",
        ms: "Malay",
        fil: "Filipino",
        da: "Danish",
        fi: "Finnish",
        no: "Norwegian",
        cs: "Czech",
        el: "Greek",
        he: "Hebrew",
        ro: "Romanian",
        hu: "Hungarian",
        uk: "Ukrainian",
        bg: "Bulgarian",
        hr: "Croatian",
        sk: "Slovak",
        sr: "Serbian",
        ca: "Catalan",
        bn: "Bengali",
        ur: "Urdu",
        fa: "Persian",
        sw: "Swahili",
        ta: "Tamil",
        te: "Telugu",
        mr: "Marathi",
        pa: "Punjabi",
        gu: "Gujarati",
        kn: "Kannada",
        ml: "Malayalam",
        si: "Sinhala",
        km: "Khmer",
        lo: "Lao",
        my: "Burmese",
        ne: "Nepali",
      };

      const sourceLanguage = languageNames[sourceLang] || sourceLang;
      const targetLanguage = languageNames[targetLang] || targetLang;

      const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Only provide the translation, without any additional explanation or context:\n\n${text}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate text accurately from ${sourceLanguage} to ${targetLanguage}. Provide only the translation without any additional text.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
      });

      const translatedText = response.choices[0].message.content?.trim() || "";

      res.json({ translatedText });
    } catch (error) {
      console.error("Translation error:", error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data" });
      } else {
        res.status(500).json({ error: "Translation failed" });
      }
    }
  });

  app.post("/api/hf-translate", async (req, res) => {
    try {
      const { text } = translateRequestSchema.pick({ text: true }).parse(req.body);

      // ✅ Gọi API Hugging Face Space
      const hfResponse = await axios.post(
        "https://nvh1101-translation-web.hf.space/translate",
        { text },
        { headers: { "Content-Type": "application/json" } }
      );

      const translation = hfResponse.data.translation || "";

      res.json({ translation });
    } catch (error) {
      console.error("Hugging Face translation error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data" });
      } else {
        res.status(500).json({ error: "Hugging Face translation failed" });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
