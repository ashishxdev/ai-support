import { processMessage } from "../services/chat.service.js";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTest(question: string) {
  console.log(`\n----------------------------------------`);
  console.log(`[USER]: ${question}`);
  try {
    const result = await processMessage(question);
    console.log(`[AI]:   ${result.reply}`);
  } catch (error) {
    console.error(`[Error]:`, error);
  }
  await delay(2500); // 2.5 second delay to prevent rate limiting
}

async function main() {
  console.log("Starting Guardrails Verification Test...");

  // Test 1: Allowed query (Spur specific)
  await runTest("Do you integrate with Shopify?");
  await delay(5000);
  
  // Test 2: Conversational query
  await runTest("Hi there!");
  await delay(5000);
  
  // Test 3: Irrelevant / blocked query
  await runTest("Write a python function to add two numbers.");
  
  console.log(`\n----------------------------------------`);
  console.log("Guardrails Verification Test Finished.");
}

main()
  .catch(console.error);
