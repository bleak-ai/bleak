#!/usr/bin/env node

/**
 * Example: Using BleakCoreSession in a Node.js CLI application
 * 
 * This demonstrates how to use BleakAI for backend/CLI use cases
 * without any UI dependencies like React or component resolvers.
 * 
 * Run with: node examples/node-cli-example.js
 */

// Import only the core session - no UI dependencies
const { BleakCoreSession } = require('../packages/bleakai/dist/index.umd.js');

async function main() {
  console.log('🤖 BleakAI Node.js CLI Example');
  console.log('================================\n');

  // Initialize core session (no UI components needed)
  const bleak = new BleakCoreSession({
    baseUrl: process.env.BLEAK_API_URL || "https://api.bleak.ai",
    apiKey: process.env.BLEAK_API_KEY || "demo-key", // In real usage, use environment variable
    timeout: 30000
  });

  try {
    console.log('💭 Quick ask example...');

    // Example 1: Quick answer (no questions)
    const quickAnswer = await bleak.quickBleakAsk(
      "What is the capital of France?"
    );
    console.log('📝 Answer:', quickAnswer);
    console.log('');

    console.log('🔄 Interactive conversation example...');

    // Example 2: Interactive conversation
    const result = await bleak.startBleakConversation(
      "Help me plan a trip to Japan"
    );

    if (result.questions && result.questions.length > 0) {
      console.log('❓ AI needs more information:');
      result.questions.forEach((q, i) => {
        console.log(`  ${i + 1}. ${q.question}`);
        if (q.options) {
          console.log(`     Options: ${q.options.join(', ')}`);
        }
      });

      // In a real CLI, you'd collect user input here
      // For demo purposes, we'll provide some sample answers
      const answers = {
        "What's your budget for the trip?": "Under $3000",
        "How many days will you be traveling?": "7 days",
        "What type of activities interest you most?": "Cultural sites, Food"
      };

      console.log('\n📋 Providing answers:', answers);

      // Get final recommendation
      const finalAnswer = await bleak.finishBleakConversation(answers);
      console.log('\n🎯 Final recommendation:');
      console.log(finalAnswer);

    } else if (result.answer) {
      console.log('📝 Direct answer:', result.answer);
    }

    // Example 3: Session state inspection
    console.log('\n📊 Session state:');
    const state = bleak.getBleakState();
    console.log(`  - Thread ID: ${state.threadId}`);
    console.log(`  - Complete: ${state.isComplete}`);
    console.log(`  - Has result: ${!!state.result}`);

  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.name === 'AuthenticationError') {
      console.log('💡 Tip: Make sure to set BLEAK_API_KEY environment variable');
    } else if (error.name === 'RateLimitError') {
      console.log('💡 Tip: Rate limited. Try again later.');
    }
  }

  console.log('\n✅ CLI example complete!');
}

// Handle CLI execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main }; 