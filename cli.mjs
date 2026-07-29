#!/usr/bin/env node

import { readFileSync } from "fs";
import { createInterface } from "readline";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECTS = JSON.parse(readFileSync(join(__dirname, "projects.json"), "utf-8"));

const ATTRS = ["language", "type", "channel", "runtime", "team", "account"];
const MAX_GUESSES = 8;

// ANSI colors
const GREEN = "\x1b[42;30m";
const YELLOW = "\x1b[43;30m";
const RED = "\x1b[41;37m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

function compare(guessVal, targetVal) {
  if (guessVal === targetVal) return "correct";
  const gLower = guessVal.toLowerCase();
  const tLower = targetVal.toLowerCase();
  if (gLower.includes(tLower) || tLower.includes(gLower)) return "partial";
  const gWords = gLower.split(/[\s\/,]+/);
  const tWords = tLower.split(/[\s\/,]+/);
  for (const w of gWords) {
    if (w.length > 2 && tWords.includes(w)) return "partial";
  }
  return "wrong";
}

function colorize(text, result) {
  const padded = text.padEnd(18);
  switch (result) {
    case "correct": return `${GREEN} ${padded} ${RESET}`;
    case "partial": return `${YELLOW} ${padded} ${RESET}`;
    case "wrong":   return `${RED} ${padded} ${RESET}`;
  }
}

function printHeader() {
  const header = ATTRS.map(a => a.toUpperCase().padEnd(18)).join("  ");
  console.log(`\n${DIM}${"PROJECT".padEnd(35)}${header}${RESET}`);
  console.log("─".repeat(35 + ATTRS.length * 20));
}

function printGuess(project, target) {
  const name = project.name.padEnd(35);
  const cells = ATTRS.map(attr => {
    const result = compare(project[attr], target[attr]);
    return colorize(project[attr], result);
  }).join("  ");
  console.log(`${BOLD}${name}${RESET}${cells}`);
}

function fuzzyMatch(input, projects, guessed) {
  return projects
    .filter(p => p.name.includes(input) && !guessed.has(p.name))
    .map(p => p.name)
    .slice(0, 5);
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise(resolve => rl.question(q, resolve));

  console.log(`\n${BOLD}🎯 GUESS THE REPO!${RESET}`);
  console.log(`${DIM}Guess the mystery project from the MESS workspace${RESET}`);
  console.log(`${DIM}${PROJECTS.length} projects · ${MAX_GUESSES} attempts · type 'quit' to exit${RESET}\n`);

  let playing = true;

  while (playing) {
    const target = PROJECTS[Math.floor(Math.random() * PROJECTS.length)];
    const guessed = new Set();
    let won = false;

    printHeader();

    for (let attempt = 1; attempt <= MAX_GUESSES; attempt++) {
      let project = null;

      while (!project) {
        const input = (await ask(`\n[${attempt}/${MAX_GUESSES}] > `)).trim().toLowerCase();

        if (input === "quit" || input === "exit") {
          console.log(`\n${DIM}Thanks for playing!${RESET}\n`);
          rl.close();
          return;
        }

        if (input === "list") {
          console.log(`\n${DIM}Available projects:${RESET}`);
          PROJECTS.filter(p => !guessed.has(p.name)).forEach(p => console.log(`  ${p.name}`));
          continue;
        }

        if (input === "hint") {
          const suggestions = PROJECTS.filter(p => !guessed.has(p.name)).map(p => p.name);
          console.log(`${DIM}Remaining: ${suggestions.join(", ")}${RESET}`);
          continue;
        }

        // Fuzzy search
        const matches = fuzzyMatch(input, PROJECTS, guessed);

        if (matches.length === 0) {
          console.log(`${DIM}No match for "${input}". Type 'list' to see available projects.${RESET}`);
          continue;
        }

        if (matches.length === 1) {
          project = PROJECTS.find(p => p.name === matches[0]);
        } else {
          // If exact match exists, use it
          const exact = PROJECTS.find(p => p.name === input);
          if (exact && !guessed.has(exact.name)) {
            project = exact;
          } else {
            console.log(`${DIM}Did you mean: ${matches.join(", ")}?${RESET}`);
            continue;
          }
        }
      }

      guessed.add(project.name);
      printGuess(project, target);

      if (project.name === target.name) {
        console.log(`\n${GREEN} 🎉 Got it in ${attempt}! ${RESET}\n`);
        won = true;
        break;
      }
    }

    if (!won) {
      console.log(`\n${RED} 💀 It was: ${target.name} ${RESET}\n`);
    }

    const again = await ask("Play again? (y/n) ");
    if (again.toLowerCase() !== "y") {
      playing = false;
    }
  }

  console.log(`\n${DIM}Thanks for playing!${RESET}\n`);
  rl.close();
}

main();
