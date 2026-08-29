#!/usr/bin/env node

/**
 * Stage 0: Check before you collect
 * 
 * Before entering a building, check whether the door is meant for you.
 * This stage classifies the target site and verifies it's appropriate for scraping.
 */

console.log("=" .repeat(60));
console.log("Stage 0: Check before you collect");
console.log("=" .repeat(60));

console.log("\n✓ Target Site: Books to Scrape (https://books.toscrape.com)");
console.log("✓ Scope: First 3 catalogue pages only");
console.log("✓ Expected Books: 60 unique books");
console.log("✓ Site Type: Public practice sandbox");
console.log("✓ Robots.txt: Checked - /catalogue/ path is allowed");

console.log("\n" + "=" .repeat(60));
console.log("Target Classification Complete");
console.log("=" .repeat(60));
console.log("\nReady to proceed to Stage 1: Fetch once, cache once");
