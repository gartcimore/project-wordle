# 🎯 Project Wordle

A "Guess the Hero" style guessing game, but with our team's repositories.

**[Play it here →](https://gartcimore.github.io/project-wordle/)**

## How to play

1. A mystery repo is picked from the project list
2. Type a project name (autocomplete helps you) and submit your guess
3. Each guess reveals attributes compared to the target:
   - 🟩 Green = exact match
   - 🟧 Orange = partial match
   - 🟥 Red = no match
4. Use the clues to narrow down and find the answer in 8 guesses or fewer

## Attributes

| Attribute | Values |
|-----------|--------|
| Language | TypeScript, Java, Multi |
| Type | Backend, Connector, Library, Frontend, Tooling |
| Channel | Push, Webmessaging (GBM), All, Notifications |
| Runtime | Lambda, ECS, N/A |
| Team | Web Messaging, GPNS, Squonk |
| Account | Core, Digital, N/A |

## CLI version

```bash
node cli.mjs
```

Same game in your terminal with colored output. Type `list` to see available projects, `hint` to see what's left.

## Adding projects

Edit `projects.json` — both the web and CLI versions read from it:

```json
{
  "name": "my-new-repo",
  "language": "TypeScript",
  "type": "Backend",
  "channel": "Push",
  "runtime": "Lambda",
  "team": "Web Messaging",
  "account": "Digital"
}
```

Push to `main` and GitHub Pages redeploys automatically.

## Local development

Serve the files locally (needed for the JSON fetch):

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
