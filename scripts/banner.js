const { spawn } = require("child_process");
const readline = require("readline");

// ANSI color code
const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  brightCyan: "\x1b[96m",
  green: "\x1b[32m",
  brightGreen: "\x1b[92m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  brightMagenta: "\x1b[95m",
  blue: "\x1b[34m",
  brightBlue: "\x1b[94m",
  white: "\x1b[37m",
  brightWhite: "\x1b[97m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
};

// ASCII art of our project
console.log(`
${colors.brightCyan}
  _______                      _   _____ _           _   
 |__   __|                    | | / ____| |         | |  
    | |_   _ _ __  _ __   ___| || |    | |__   __ _| |_ 
    | | | | | '_ \\| '_ \\ / _ \\ || |    | '_ \\ / _\` | __|
    | | |_| | | | | | | |  __/ || |____| | | | (_| | |_ 
    |_|\\__,_|_| |_|_| |_|\\___|_| \\_____|_| |_|\\__,_|\\__|
${colors.reset}                                                        
                     ${colors.yellow}Monorepo Development${colors.reset}
                                                        
${colors.blue}🧩 Common${colors.reset}    - Shared Types & Utilities
${colors.green}🌐 Frontend${colors.reset}  - React Application at ${colors.brightBlue}http://localhost:5173${colors.reset}
${colors.magenta}📂 Server${colors.reset}    - Express API at ${colors.brightBlue}http://localhost:8080${colors.reset}

${colors.white}Press ${colors.bold}Ctrl+C${colors.reset}${colors.white} to stop all services${colors.reset}
`);

console.log(
  `\n${colors.yellow}━━━━━━ DEVELOPMENT SERVICES ━━━━━━${colors.reset}\n`
);

// organizing the concurrent process with colored prefixes
const colorMap = {
  COMMON: colors.blue,
  FRONTEND: colors.green,
  SERVER: colors.magenta,
};

const cmd = spawn("concurrently", [
  "--kill-others-on-fail",
  "--prefix",
  "[{name}]",
  "--names",
  "COMMON,FRONTEND,SERVER",
  "pnpm --filter @tunnel_chat/common dev",
  "pnpm --filter @tunnel_chat/frontend dev",
  "pnpm --filter @tunnel_chat/server dev",
]);

let lastPrefix = "";
let emptyLineCount = 0;

readline.createInterface({ input: cmd.stdout }).on("line", (line) => {
  if (line.trim() === "") {
    if (emptyLineCount > 0) return;
    emptyLineCount++;
  } else {
    emptyLineCount = 0;
  }

  const prefixMatch = line.match(/^\[([A-Z]+)\]/);
  const currentPrefix = prefixMatch ? prefixMatch[1] : lastPrefix;

  // we add a separator when the prefix changes
  if (currentPrefix !== lastPrefix && lastPrefix !== "") {
    console.log(
      `\n${colors.gray}─────────────────────────────────${colors.reset}\n`
    );
  }

  // then colors the output based on the service
  if (prefixMatch && colorMap[currentPrefix]) {
    const coloredPrefix = `${colorMap[currentPrefix]}[${currentPrefix}]${colors.reset}`;
    console.log(line.replace(prefixMatch[0], coloredPrefix));
  } else {
    console.log(line);
  }

  lastPrefix = currentPrefix;

  if (line.includes("Build success")) {
    console.log(
      `${colors.green} ✓ Common types built successfully${colors.reset}`
    );
  }

  if (line.includes("VITE") && line.includes("ready")) {
    console.log(`${colors.green} ✓ Frontend ready${colors.reset}`);
  }

  if (line.includes("Server running on port")) {
    console.log(`${colors.magenta} ✓ Server ready${colors.reset}`);
  }
});

readline.createInterface({ input: cmd.stderr }).on("line", (line) => {
  console.error(`${colors.red}${line}${colors.reset}`);
});

cmd.on("close", (code) => {
  console.log(
    `\n${colors.yellow}━━━━━━ DEVELOPMENT STOPPED ━━━━━━${colors.reset}\n`
  );
  process.exit(code);
});
