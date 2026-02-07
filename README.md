<div style="display: flex; flex-direction: column;">
<img src="frontend/public/favicon.svg" height="64"/>
<h1 align="center">coursepilot</h1>
</div>

> accelerate your note taking

<img alt="Static Badge" src="https://img.shields.io/badge/made%20with%20%3C3%20at-lmu-red?style=flat&labelColor=%230076A5&color=%23AB0C2F">

![coursepilot-poster](https://github.com/user-attachments/assets/6da9154d-0513-4a9c-a689-5f1c27800dfb)

by [Davis Banks](https://github.com/d5vis), [Lucian Prinz](https://github.com/loosh), and [David Yang](https://github.com/david518yang)

## Versions

Production: [coursepilot](https://coursepilot-c1t0bwttk-davids-projects-e8ff60e4.vercel.app/)

## Development

### File Structure

```
.
├── backend                 # rag engine
├── docs                    # documentation and deliverables
├── frontend                # web source code
└── README.md               # this file
```

### Getting Started

#### Requirements

- [Node.js](https://nodejs.org/en)
- [pnpm](https://pnpm.io/installation)

after cloning the repo, navigate into `/frontend` and run

```zsh
pnpm i && pnpm dev
```

to install coursepilot's dependencies and run the development server, hosted locally at `http://localhost:3000/`
