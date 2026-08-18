import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with 25mb limit for high-res palm images
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Initialize Google GenAI client securely on server-side
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Falling back to local intelligence synthesis engine.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Palmistry & Tarot Intelligence Platform Backend",
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Primary Multimodal Synthesis Endpoint (Milestone 3 & 4 Core)
app.post("/api/gemini/synthesize", async (req, res) => {
  try {
    const {
      palmData,
      drawnCards,
      scoreData,
      userProfile,
      readingContext,
      spreadType,
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      // High-quality deterministic local synthesis fallback
      const fallbackReport = generateFallbackSynthesis(palmData, drawnCards, scoreData, userProfile, readingContext);
      return res.json({
        success: true,
        report: fallbackReport,
        mode: "local_intelligence",
      });
    }

    const promptText = `
You are the master mystical AI Oracle of the Palmistry & Tarot Intelligence Platform.
Perform an in-depth, deeply personalized, authentic synthesis reading combining biometric palm analysis metrics, drawn tarot cards, and mathematical insight guidance scoring.

USER PROFILE:
- Name: ${userProfile?.name || 'Seeker'}
- Spiritual Interests: ${userProfile?.interests?.join(', ') || 'General divination, personal growth'}
- Spiritual Goals: ${userProfile?.spiritualGoals?.join(', ') || 'Clarity, purpose, life direction'}
- Life Question / Focus Intention: "${readingContext || 'Comprehensive Destiny & Spiritual Alignment'}"

DRAWN TAROT SPREAD (${spreadType || 'Multi-Card Spread'}):
${drawnCards?.map((c: any, idx: number) => `Position ${idx + 1} [${c.positionName || 'Card'}]: ${c.name} (${c.orientation}) - Keywords: ${c.keywords?.join(', ')}. Meaning: ${c.meanings?.slice(0, 3)?.join(' ')}`).join('\n')}

BIOMETRIC PALM METRICS:
- Elemental Palm Type: ${palmData?.palmShape || 'Earth/Water Hand'}
- Heart Line: Length Ratio ${palmData?.lines?.find((l: any) => l.name === 'Heart Line')?.lengthRatio || 0.74}, Curvature ${palmData?.lines?.find((l: any) => l.name === 'Heart Line')?.curvatureIndex || 1.24}, Prominence ${palmData?.lines?.find((l: any) => l.name === 'Heart Line')?.prominenceScore || 0.42} (Emotional archetype & relationship bonding)
- Head Line: Length Ratio ${palmData?.lines?.find((l: any) => l.name === 'Head Line')?.lengthRatio || 0.68}, Curvature ${palmData?.lines?.find((l: any) => l.name === 'Head Line')?.curvatureIndex || 1.08}, Prominence ${palmData?.lines?.find((l: any) => l.name === 'Head Line')?.prominenceScore || 0.38} (Intellect, mental clarity & focus)
- Life Line: Length Ratio ${palmData?.lines?.find((l: any) => l.name === 'Life Line')?.lengthRatio || 0.82}, Curvature ${palmData?.lines?.find((l: any) => l.name === 'Life Line')?.curvatureIndex || 1.35}, Prominence ${palmData?.lines?.find((l: any) => l.name === 'Life Line')?.prominenceScore || 0.51} (Vitality, resilience & life force)
- Fate Line: Length Ratio ${palmData?.lines?.find((l: any) => l.name === 'Fate Line')?.lengthRatio || 0.45}, Prominence ${palmData?.lines?.find((l: any) => l.name === 'Fate Line')?.prominenceScore || 0.22} (Career trajectory & karmic destiny)
- Sun Line & Mounts: Venus, Moon, Jupiter, Saturn alignments

CALCULATED 5-FACTOR SPIRITUAL INSIGHT SCORE:
- Total Final Score: ${scoreData?.final_score || 87.25} / 100
- Palm Confidence (Spalm 30%): ${scoreData?.s_palm || 82.5}%
- Tarot Relevance (Starot 25%): ${scoreData?.s_tarot || 88.0}%
- Personality Alignment (Spers 20%): ${scoreData?.s_pers || 85.0}%
- Context Relevance (Sctx 15%): ${scoreData?.s_ctx || 91.0}%
- Reading Consistency (Scons 10%): ${scoreData?.s_cons || 94.0}%

TASK:
Produce a rich, profound, and highly actionable synthesis reading report structured as valid JSON adhering to the specified schema. Write with celestial eloquence, precision, compassionate wisdom, and practical empowerment.
`;

    const contents: any[] = [];
    
    // Check if a base64 palm image is provided
    if (palmData?.rawImageUrl && palmData.rawImageUrl.startsWith("data:image")) {
      const match = palmData.rawImageUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        contents.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: { parts: contents },
      config: {
        systemInstruction: "You are the supreme spiritual intelligence oracle of the Astraea Palmistry & Tarot Intelligence Platform. Deliver masterful synthesis readings with structured JSON formatting.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING, description: "A high-level overarching spiritual executive summary of the seeker's current cosmic state" },
            palmBiometricInsights: {
              type: Type.OBJECT,
              properties: {
                elementalArchetype: { type: Type.STRING },
                heartLineAnalysis: { type: Type.STRING },
                headLineAnalysis: { type: Type.STRING },
                lifeLineAnalysis: { type: Type.STRING },
                fateLineAnalysis: { type: Type.STRING },
                mountsAnalysis: { type: Type.STRING },
              },
              required: ["elementalArchetype", "heartLineAnalysis", "headLineAnalysis", "lifeLineAnalysis", "fateLineAnalysis"],
            },
            tarotCosmicInsights: {
              type: Type.OBJECT,
              properties: {
                overallTheme: { type: Type.STRING },
                cardInterpretations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      cardName: { type: Type.STRING },
                      position: { type: Type.STRING },
                      orientation: { type: Type.STRING },
                      synthesis: { type: Type.STRING },
                    },
                    required: ["cardName", "position", "synthesis"],
                  },
                },
                elementalDominance: { type: Type.STRING },
              },
              required: ["overallTheme", "cardInterpretations"],
            },
            personalityProfile: {
              type: Type.OBJECT,
              properties: {
                coreArchetype: { type: Type.STRING },
                temperament: { type: Type.STRING },
                intuitiveCapacity: { type: Type.STRING },
                decisionMakingStyle: { type: Type.STRING },
              },
              required: ["coreArchetype", "temperament", "intuitiveCapacity"],
            },
            lifeTrendTimeline: {
              type: Type.OBJECT,
              properties: {
                immediateHorizon: { type: Type.STRING, description: "Next 1-3 months" },
                emergingCycle: { type: Type.STRING, description: "Next 6-12 months" },
                longTermDestiny: { type: Type.STRING, description: "Next 2-5 years" },
                pivotalChallenge: { type: Type.STRING },
                catalystOpportunity: { type: Type.STRING },
              },
              required: ["immediateHorizon", "emergingCycle", "longTermDestiny", "pivotalChallenge", "catalystOpportunity"],
            },
            relationshipsGuidance: {
              type: Type.OBJECT,
              properties: {
                emotionalDisposition: { type: Type.STRING },
                connectionDynamics: { type: Type.STRING },
                guidanceForHarmonizing: { type: Type.STRING },
              },
              required: ["emotionalDisposition", "connectionDynamics", "guidanceForHarmonizing"],
            },
            careerFinancialTrajectory: {
              type: Type.OBJECT,
              properties: {
                vocationAlignment: { type: Type.STRING },
                wealthAttunement: { type: Type.STRING },
                strategicMove: { type: Type.STRING },
              },
              required: ["vocationAlignment", "wealthAttunement", "strategicMove"],
            },
            strengthsAndWeaknesses: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                growthAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
                blindspots: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["strengths", "growthAreas", "blindspots"],
            },
            spiritualRecommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  action: { type: Type.STRING },
                  affirmation: { type: Type.STRING },
                },
                required: ["category", "action", "affirmation"],
              },
            },
            chakraEnergyBalance: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  chakra: { type: Type.STRING },
                  status: { type: Type.STRING },
                  intensity: { type: Type.INTEGER, description: "Percentage 0-100" },
                  recommendation: { type: Type.STRING },
                },
                required: ["chakra", "status", "intensity", "recommendation"],
              },
            },
          },
          required: [
            "executiveSummary",
            "palmBiometricInsights",
            "tarotCosmicInsights",
            "personalityProfile",
            "lifeTrendTimeline",
            "relationshipsGuidance",
            "careerFinancialTrajectory",
            "strengthsAndWeaknesses",
            "spiritualRecommendations",
            "chakraEnergyBalance",
          ],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json({
      success: true,
      report: parsedJson,
      mode: "gemini_multimodal_synthesis",
    });
  } catch (error: any) {
    console.log("[Notice] Gemini API unavailable, falling back to local synthesis engine.");
    // Graceful fallback to rich local synthesis engine
    const { palmData, drawnCards, scoreData, userProfile, readingContext } = req.body;
    const fallbackReport = generateFallbackSynthesis(palmData, drawnCards, scoreData, userProfile, readingContext);

    res.json({
      success: true,
      report: fallbackReport,
      mode: "local_intelligence_fallback",
      errorDetails: error.message,
    });
  }
});

// Quick Oracle / Single Question Endpoint
app.post("/api/gemini/oracle-question", async (req, res) => {
  try {
    const { question, card, palmLineSummary } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        answer: `The cosmic alignment surrounding "${question}" reflects the presence of ${card?.name || 'The Star'}. Your palm lines indicate steady analytical patience and bold emotional resonance. Trust the timing of your unfolding journey.`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Seeker asks: "${question}". Drawn card: ${card?.name} (${card?.orientation}). Palm summary: ${palmLineSummary || 'Balanced Earth/Water palm'}. Provide a concise 2-3 paragraph mystic oracle answer with actionable wisdom.`,
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.log("[Notice] Gemini API unavailable for Oracle, returning local reading.");
    const { question, card } = req.body;
    res.json({ 
      answer: `The cosmic alignment surrounding "${question}" reflects the presence of ${card?.name || 'The Star'}. Your path indicates steady analytical patience and bold emotional resonance. Trust the timing of your unfolding journey. The celestial energies are currently realigning; maintain your focus and proceed with inner clarity.`
    });
  }
});

// Helper for deterministic high-depth fallback synthesis
function generateFallbackSynthesis(palmData: any, drawnCards: any[], scoreData: any, userProfile: any, readingContext: string) {
  const userName = userProfile?.name || "Seeker";
  const primaryCard = drawnCards?.[0] || { name: "The Magician", orientation: "Upright" };
  const score = scoreData?.final_score || 87.5;

  return {
    executiveSummary: `A sacred convergence of biometric palmistry and cosmic tarot signatures reveals a powerful transitional cycle for ${userName}. With an overall Spiritual Guidance Score of ${score}/100, your current phase is marked by heightened intuitive discernment, unlocking previously veiled paths in both vocational achievement and spiritual individuation.`,
    palmBiometricInsights: {
      elementalArchetype: palmData?.palmShape ? `${palmData.palmShape} Hand Structure` : "Water-Earth Hybrid Hand with deep intuitive furrowing",
      heartLineAnalysis: "A long, gracefully curved Heart Line terminating near the Mount of Jupiter reflects high empathy, idealistic devotion in intimate partnerships, and a tendency to prioritize emotional authenticity over transient convenience.",
      headLineAnalysis: "A pronounced, well-defined Head Line sloping gently into the Mount of the Moon signifies an exquisite balance between analytical pragmatism and expansive creative imagination.",
      lifeLineAnalysis: "A wide, sweeping arc around the Mount of Venus demonstrates robust physical vitality, profound inner endurance, and an innate capacity to regenerate energy following periods of exertion.",
      fateLineAnalysis: "A distinct Fate Line ascending toward Saturn shows strong vocational self-direction, marked by notable breakthrough moments around self-initiated creative and professional ventures.",
      mountsAnalysis: "Prominent Mount of Jupiter denotes natural leadership; elevated Mount of Venus radiates warmth and magnetic charisma.",
    },
    tarotCosmicInsights: {
      overallTheme: `Cosmic energies are anchored by ${primaryCard.name} (${primaryCard.orientation}), initiating a profound threshold of creative transmutation and intentional manifestation.`,
      cardInterpretations: drawnCards?.map((c, i) => ({
        cardName: c.name || `Arcana ${i + 1}`,
        position: c.positionName || `Position ${i + 1}`,
        orientation: c.orientation || "Upright",
        synthesis: `${c.name} in the ${c.orientation} position emphasizes ${c.keywords?.slice(0, 3).join(', ') || 'illumination and destiny'}. It calls upon you to align conscious decision-making with deeper subconscious convictions.`,
      })) || [],
      elementalDominance: "Fire and Water synthesis — Passion fueled by intuitive clarity.",
    },
    personalityProfile: {
      coreArchetype: "The Intuitive Alchemist / Visionary Architect",
      temperament: "Harmonious balance of emotional depth, philosophical curiosity, and pragmatic determination.",
      intuitiveCapacity: "Exceptional third-eye clarity; visceral somatic instincts that accurately signal genuine opportunities.",
      decisionMakingStyle: "Holistic integration — values empirical evidence supported by instinctive alignment.",
    },
    lifeTrendTimeline: {
      immediateHorizon: "The next 1-3 months present essential clarity in daily habits and key interpersonal boundaries. Past uncertainties begin dissolving into structured purpose.",
      emergingCycle: "In 6-12 months, an expansive professional or creative milestone occurs, fueled by the proactive manifestation themes in your palm's Fate line.",
      longTermDestiny: "Over the next 2-5 years, a state of spiritual and worldly mastery materializes, establishing a lasting legacy of guidance and creative contribution.",
      pivotalChallenge: "Guarding against mental overextension and resisting the urge to micromanage unfolding timelines.",
      catalystOpportunity: "Leaning courageously into collaborative endeavors that resonate with your authentic values.",
    },
    relationshipsGuidance: {
      emotionalDisposition: "Loyal, deeply feeling, and perceptive to the unspoken emotional currents of close companions.",
      connectionDynamics: "Thrives in alliances where intellectual stimulation and mutual spiritual reverence are fostered without possessiveness.",
      guidanceForHarmonizing: "Practice transparent articulation of internal needs rather than expecting partners to instinctively anticipate them.",
    },
    careerFinancialTrajectory: {
      vocationAlignment: "Fields combining innovation, intuitive analysis, mentorship, strategic vision, or creative craftsmanship.",
      wealthAttunement: "Prosperity flows abundantly when your work directly empowers or enriches the consciousness of others.",
      strategicMove: "Diversify creative outlets and invest in foundational skills that build sustainable long-term sovereignty.",
    },
    strengthsAndWeaknesses: {
      strengths: [
        "Profound empathetic perception and emotional intelligence",
        "High resilience and swift psychological recovery",
        "Creative problem solving bridging intuition and logic",
        "Natural charismatic authority and inspiring presence",
      ],
      growthAreas: [
        "Tending to absorb ambient collective stress",
        "Perfectionistic hesitation prior to launching bold projects",
        "Occasional reluctance to delegate crucial responsibilities",
      ],
      blindspots: [
        "Underestimating the cumulative impact of fatigue on decision making",
        "Assuming others share your identical depth of commitment without explicit agreements",
      ],
    },
    spiritualRecommendations: [
      {
        category: "Daily Ritual",
        action: "Morning solar contemplation or 10-minute breathwork focusing on the solar plexus and third eye.",
        affirmation: "I am firmly anchored in my sacred truth, and the universe conspires in my favor.",
      },
      {
        category: "Energy Clearing",
        action: "Evening grounding with selenite, black tourmaline, or warm salt baths to release external energetic residue.",
        affirmation: "I release all energies that are not mine to carry with peace and gratitude.",
      },
      {
        category: "Creative Expression",
        action: "Maintain a dedicated dream and synchronicities journal to capture subconscious breakthroughs.",
        affirmation: "My creative voice is a conduit of divine harmony and boundless inspiration.",
      },
    ],
    chakraEnergyBalance: [
      { chakra: "Crown (Sahasrara)", status: "Highly Active", intensity: 92, recommendation: "Maintain regular silent meditation to receive cosmic downloads." },
      { chakra: "Third Eye (Ajna)", status: "Awakened", intensity: 96, recommendation: "Trust intuitive flashes without requiring instant logical proof." },
      { chakra: "Throat (Vishuddha)", status: "Balanced", intensity: 84, recommendation: "Speak your authentic boundaries with serene confidence." },
      { chakra: "Heart (Anahata)", status: "Radiant", intensity: 90, recommendation: "Practice unconditional self-compassion alongside compassion for others." },
      { chakra: "Solar Plexus (Manipura)", status: "Active", intensity: 86, recommendation: "Channel personal willpower into consistent, structured daily steps." },
      { chakra: "Sacral (Svadhisthana)", status: "Harmonious", intensity: 80, recommendation: "Nurture playful creative expression and sensory joy." },
      { chakra: "Root (Muladhara)", status: "Anchored", intensity: 88, recommendation: "Spend grounding time in nature and walking barefoot on earth." },
    ],
  };
}

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Palmistry & Tarot Platform server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
