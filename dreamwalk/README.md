# Dreamwalk

Dreamwalk is a standalone, Codex-first command system for multi-agent software work.

This package is intentionally independent from the existing `geepers*` repos. It is
built as a fresh root that can later support multiple agent platforms from one
canonical source.

## Public Commands

| Command | Purpose |
| --- | --- |
| `/hitit` | Main execution entrypoint for doing the work |
| `/doublecheck` | Validation, quality review, correctness, tests, config, paths |
| `/doubt` | Targeted challenge to the current approach |
| `/plan` | Architecture, sequencing, standards, foundations |
| `/enhance` | Pull in related repos, conventions, datasets, APIs, and prior art |
| `/humanize` | Improve prose, UX copy, docs, and readability |
| `/janitor` | Cleanup, cruft reduction, organization, repo hygiene |
| `/pushit` | Repo publish and distribution sync tasks |
| `/shipit` | Release, deploy, preflight, postflight, verification |
| `/accessibility` | Accessibility review and remediation planning |
| `/harvest` | Capture reusable snippets, patterns, and ideas |
| `/thinkagain` | Reconsider the whole implementation from first principles |
| `/consensus` | Read-only external second opinions from other local CLI agents |

## What Is Included

- Canonical command registry and route graph
- Read-only consensus agent detection for external CLIs
- Standalone tool registry
- Safe execution primitives adapted from local infrastructure patterns
- Manifest generation for Codex-oriented packaging metadata
- Unit tests for command coverage and behavior contracts

## CLI

```bash
python -m dreamwalk.cli commands
python -m dreamwalk.cli show /enhance
python -m dreamwalk.cli consensus --json
python scripts/build_manifests.py
```

## Design Constraints

- No runtime dependency on sibling `geepers*` repos
- Small public command surface
- Parallel-first internal execution model
- `consensus` is always read-only
- Codex first, platform-neutral structure
