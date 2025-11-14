const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
const GEMINI_BASE_V1 = 'https://generativelanguage.googleapis.com/v1beta';

if (!GEMINI_API_KEY) {
  console.warn('Gemini API key is not configured. Set GEMINI_API_KEY in .env to enable AI features.');
}

async function callGemini(promptText, maxOutputTokens = 150, temperature = 0.7) {
  if (!GEMINI_API_KEY) {
    throw { name: 'BadRequest', message: 'Gemini API key not configured' };
  }

  // Fallback models if primary is overloaded (use v1beta compatible names)
  const modelFallbacks = [
    GEMINI_MODEL,
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro'
  ];

  let lastError = null;

  for (const currentModel of modelFallbacks) {
    // All gemini models use the new format
    const isNewModel = true;
    
    let body, endpoint;
    
    // Format for all Gemini models (v1beta endpoint)
    body = {
      contents: [{
        parts: [{
          text: promptText
        }]
      }],
      generationConfig: {
        maxOutputTokens,
        temperature
      }
    };
    endpoint = `${GEMINI_BASE_V1}/models/${currentModel}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

    try {
      console.debug('[Gemini] Trying model=', currentModel);
      const resp = await axios.post(endpoint, body, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const data = resp.data || {};
      
      // Parse Gemini response
      if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          console.debug('[Gemini] Success with model=', currentModel);
          return candidate.content.parts[0].text || JSON.stringify(candidate);
        }
        // Sometimes content.role exists but parts is empty - extract text from anywhere
        if (candidate.content && candidate.content.role === 'model') {
          // Try to find text in output/text field
          if (candidate.output) return candidate.output;
          if (candidate.text) return candidate.text;
        }
        // Last resort: stringify candidate
        const text = JSON.stringify(candidate);
        if (text.length > 10) {
          console.debug('[Gemini] Success with model=', currentModel, '(fallback parse)');
          return text;
        }
      }
      
      console.warn('[Gemini] Unexpected response structure from', currentModel);
      return JSON.stringify(data);
    } catch (error) {
      const status = error?.response?.status;
      const errorData = error?.response?.data;
      lastError = error;
      
      console.warn(`[Gemini] Model ${currentModel} failed (${status}):`, errorData?.error?.message || error.message);
      
      // If 503 (overloaded), 429 (rate limit), or 404 (not found), try next model
      if (status === 503 || status === 429 || status === 404) {
        console.debug('[Gemini] Trying fallback model...');
        continue;
      }
      
      // For other errors (auth, not found, etc), throw immediately
      if (status === 400 || status === 401 || status === 403 || status === 404) {
        const apiMessage = errorData?.error?.message || errorData?.error || error.message || 'Gemini request failed';
        throw { name: 'BadRequest', message: String(apiMessage) };
      }
    }
  }

  // All models failed
  const errorData = lastError?.response?.data;
  const apiMessage = errorData?.error?.message || errorData?.error || lastError?.message || 'All Gemini models unavailable';
  console.error('[Gemini] All models failed, last error:', apiMessage);
  throw { name: 'BadRequest', message: String(apiMessage) };
}

class OpenAIService {
  // Generate playlist description based on songs (Gemini)
  static async generatePlaylistDescription(playlistTitle, songs) {
    try {
      const songList = songs.map(s => `${s.title} by ${s.artist}`).join(', ');
      const prompt = `Create a creative and engaging description (max 100 words) for a music playlist titled "${playlistTitle}" that contains these songs: ${songList}. Make it sound professional and appealing.`;

      const result = await callGemini(prompt, 200, 0.7);
      return typeof result === 'string' ? result : JSON.stringify(result);
    } catch (error) {
      // Fallback description if Gemini fails
      console.warn('[AI] Gemini generateDescription failed, using fallback:', error.message);
      const songCount = songs.length;
      const artists = [...new Set(songs.map(s => s.artist))].slice(0, 3).join(', ');
      return `A curated playlist titled "${playlistTitle}" featuring ${songCount} track${songCount > 1 ? 's' : ''} from ${artists}${songs.length > 3 ? ' and more' : ''}. A perfect mix for any mood.`;
    }
  }

  // Analyze playlist mood (Gemini)
  static async analyzeMood(songs) {
    try {
      // Fallback heuristic when Gemini key is not configured
      if (!GEMINI_API_KEY) {
        // simple keyword mapping
        const moodKeywords = {
          Happy: ['happy', 'joy', 'bahagia', 'gembira', 'cheerful', 'smile'],
          Romantic: ['love', 'romantic', 'cinta', 'sayang'],
          Sad: ['sad', 'galau', 'sedih', 'melanch', 'lonely'],
          Energetic: ['party', 'energetic', 'dance', 'upbeat', 'rock', 'energi'],
          Chill: ['chill', 'calm', 'relax', 'mellow', 'smooth']
        };

        const text = songs.map(s => `${s.title} ${s.artist}`).join(' ').toLowerCase();
        const scores = Object.keys(moodKeywords).reduce((acc, mood) => {
          acc[mood] = moodKeywords[mood].reduce((count, kw) => count + (text.includes(kw) ? 1 : 0), 0);
          return acc;
        }, {});

        // pick highest score
        const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
        if (best && best[1] > 0) return best[0];
        return 'Neutral';
      }

      const songList = songs.map(s => `${s.title} by ${s.artist}`).join(', ');
      const prompt = `Analyze the overall mood of this playlist: ${songList}. Respond with ONLY ONE word that best describes the mood (e.g., Energetic, Chill, Melancholic, Happy, Romantic, Party, Focus, Sad, Uplifting, Intense). Respond with one word only.`;

      const result = await callGemini(prompt, 10, 0.3);
      // extract first word
      if (typeof result === 'string') {
        const word = result.trim().split(/\s|\n|\t|\.|,|;/)[0];
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return String(result);
    } catch (error) {
      // If Gemini fails, use fallback heuristic
      console.warn('[AI] Gemini analyzeMood failed, using fallback heuristic:', error.message);
      
      const moodKeywords = {
        Happy: ['happy', 'joy', 'bahagia', 'gembira', 'cheerful', 'smile'],
        Romantic: ['love', 'romantic', 'cinta', 'sayang'],
        Sad: ['sad', 'galau', 'sedih', 'melanch', 'lonely'],
        Energetic: ['party', 'energetic', 'dance', 'upbeat', 'rock', 'energi'],
        Chill: ['chill', 'calm', 'relax', 'mellow', 'smooth']
      };

      const text = songs.map(s => `${s.title} ${s.artist}`).join(' ').toLowerCase();
      const scores = Object.keys(moodKeywords).reduce((acc, mood) => {
        acc[mood] = moodKeywords[mood].reduce((count, kw) => count + (text.includes(kw) ? 1 : 0), 0);
        return acc;
      }, {});

      // pick highest score
      const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
      if (best && best[1] > 0) return best[0];
      return 'Neutral';
    }
  }

  // Get song recommendations based on mood
  static async getRecommendations(mood, count = 5) {
    const prompt = `Suggest ${count} popular songs that match the "${mood}" mood. Format: "Song Title by Artist". List them numbered.`;
    const result = await callGemini(prompt, 300, 0.8);
    return typeof result === 'string' ? result : JSON.stringify(result);
  }
}

module.exports = OpenAIService;