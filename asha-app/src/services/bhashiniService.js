import axios from "axios";
import { BHASHINI_USER_ID, BHASHINI_API_KEY, BHASHINI_PIPELINE_ID } from "../config";

// Bhashini (bhashini.gov.in) is India's National Language Translation
// Mission API — it provides free ASR, NMT (translation), and TTS for
// Indian languages, which is exactly what's needed here: reading
// referral reasons, high-risk follow-up notes, and other freeform text
// aloud in whichever language the ASHA worker has selected in the app,
// regardless of what language it was originally typed in.
//
// IMPORTANT: this integration is written against Bhashini's publicly
// documented pipeline API shape, but has NOT been tested against the
// live API in this environment — the sandbox this was built in has no
// network access to bhashini.gov.in, and no real credentials were
// available to test with. Get real credentials before relying on this
// for a demo. See asha-app/README.md for setup steps.

const CONFIG_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline";

function credentialsConfigured() {
  return Boolean(BHASHINI_USER_ID && BHASHINI_API_KEY);
}

/**
 * Fetches the compute pipeline for a translation+TTS (or TTS-only) task,
 * for a given source/target language pair. Bhashini returns which
 * models to use and where to send the actual inference request.
 */
async function getPipeline({ sourceLanguage, targetLanguage, needsTranslation }) {
  const pipelineTasks = needsTranslation
    ? [
        { taskType: "translation", config: { language: { sourceLanguage, targetLanguage } } },
        { taskType: "tts", config: { language: { sourceLanguage: targetLanguage } } },
      ]
    : [{ taskType: "tts", config: { language: { sourceLanguage } } }];

  const res = await axios.post(
    CONFIG_URL,
    {
      pipelineTasks,
      pipelineRequestConfig: { pipelineId: BHASHINI_PIPELINE_ID },
    },
    {
      headers: {
        userID: BHASHINI_USER_ID,
        ulcaApiKey: BHASHINI_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );
  return res.data;
}

function extractServiceId(pipelineResponse, taskType) {
  const task = pipelineResponse.pipelineResponseConfig?.find((t) => t.taskType === taskType);
  return task?.config?.[0]?.serviceId;
}

/**
 * Speak `text` aloud in `targetLanguage`. If `sourceLanguage` differs
 * from `targetLanguage`, the text is translated first, then spoken in
 * the target language — e.g. a doctor's English condition note gets
 * translated to Hindi/Marathi and read aloud for a worker who reads
 * that language more comfortably than English.
 *
 * Returns a base64-encoded WAV audio string, or throws if Bhashini
 * credentials aren't configured or the request fails.
 */
export async function synthesizeSpeech(text, targetLanguage, sourceLanguage = targetLanguage) {
  if (!credentialsConfigured()) {
    throw new Error(
      "Bhashini API credentials aren't configured. Add BHASHINI_USER_ID and BHASHINI_API_KEY to src/config.js — see asha-app/README.md."
    );
  }
  if (!text || !text.trim()) {
    throw new Error("Nothing to read aloud.");
  }

  const needsTranslation = sourceLanguage !== targetLanguage;
  const pipeline = await getPipeline({ sourceLanguage, targetLanguage, needsTranslation });

  const callbackUrl = pipeline.pipelineInferenceAPIEndPoint.callbackUrl;
  const inferenceApiKey = pipeline.pipelineInferenceAPIEndPoint.inferenceApiKey;

  const ttsServiceId = extractServiceId(pipeline, "tts");
  const translationServiceId = needsTranslation ? extractServiceId(pipeline, "translation") : null;

  const pipelineTasks = needsTranslation
    ? [
        {
          taskType: "translation",
          config: { language: { sourceLanguage, targetLanguage }, serviceId: translationServiceId },
        },
        {
          taskType: "tts",
          config: { language: { sourceLanguage: targetLanguage }, serviceId: ttsServiceId, gender: "female", samplingRate: 8000 },
        },
      ]
    : [
        {
          taskType: "tts",
          config: { language: { sourceLanguage }, serviceId: ttsServiceId, gender: "female", samplingRate: 8000 },
        },
      ];

  const res = await axios.post(
    callbackUrl,
    {
      pipelineTasks,
      inputData: { input: [{ source: text }] },
    },
    {
      headers: {
        Authorization: inferenceApiKey.value ? `${inferenceApiKey.name} ${inferenceApiKey.value}` : inferenceApiKey,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );

  const pipelineResponse = res.data.pipelineResponse;
  const ttsOutput = pipelineResponse.find((p) => p.taskType === "tts");
  const audioContent = ttsOutput?.audio?.[0]?.audioContent;

  if (!audioContent) {
    throw new Error("Bhashini returned no audio content.");
  }
  return audioContent; // base64 WAV
}

export function isBhashiniConfigured() {
  return credentialsConfigured();
}
