/**
 * Gemini API Key — Detailed Connectivity Test
 * Shows full error details to diagnose issues
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBww-Uf9df7izkl06HGIWekCSzUmLRqiSA";
const MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];

async function testModel(genAI, modelId) {
  try {
    const model = genAI.getGenerativeModel({ model: modelId });
    const result = await model.generateContent("Reply with exactly: CONNECTED");
    const text = result.response.text();
    return { model: modelId, status: "✅ CONNECTED", response: text.trim().substring(0, 80) };
  } catch (err) {
    // Extract the HTTP status code and detailed message
    const msg = err.message || String(err);
    let status = "❌ FAILED";
    let detail = msg;

    if (msg.includes("API_KEY_INVALID") || msg.includes("401")) {
      detail = "API Key is invalid or revoked";
    } else if (msg.includes("404") || msg.includes("not found")) {
      detail = "Model not available for this key";
    } else if (msg.includes("403")) {
      detail = "API Key lacks permission (enable Generative Language API in Google Cloud Console)";
    } else if (msg.includes("ENOTFOUND") || msg.includes("ETIMEDOUT") || msg.includes("fetch")) {
      detail = "Network error — cannot reach Google API servers";
    }

    return { model: modelId, status, detail };
  }
}

async function main() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🧪 GEMINI API KEY FULL DIAGNOSTIC TEST");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log(`  Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}`);
  console.log("");

  // Step 1: Basic network test
  console.log("📡 Step 1: Network connectivity check...");
  try {
    const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + API_KEY);
    const data = await resp.json();
    if (resp.ok && data.models) {
      console.log(`   ✅ Network OK — Found ${data.models.length} available models`);
      const flashModels = data.models
        .filter(m => m.name.includes("flash") || m.name.includes("gemini"))
        .map(m => m.name)
        .slice(0, 8);
      console.log(`   📋 Available models: ${flashModels.join(", ")}\n`);
    } else {
      console.log(`   ❌ API responded with error: ${JSON.stringify(data.error?.message || data).substring(0, 150)}\n`);
    }
  } catch (netErr) {
    console.log(`   ❌ Cannot reach Google API: ${netErr.message}\n`);
  }

  // Step 2: Test each model
  console.log("🔬 Step 2: Testing model connectivity...\n");
  const genAI = new GoogleGenerativeAI(API_KEY);

  for (const modelId of MODELS) {
    const result = await testModel(genAI, modelId);
    console.log(`   📌 ${result.model}`);
    console.log(`      ${result.status}${result.response ? ` — "${result.response}"` : ""}`);
    if (result.detail) console.log(`      → ${result.detail}`);
    console.log("");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main();
