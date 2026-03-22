from __future__ import annotations

import os
import shutil
from collections.abc import Iterable

from .models import AgentProbe


DEFAULT_AGENT_CANDIDATES: tuple[tuple[str, str, str], ...] = (
    ("codex", "Codex CLI", "codex"),
    ("claude", "Claude Code", "claude"),
    ("gemini", "Gemini CLI", "gemini"),
    ("aider", "Aider", "aider"),
    ("cursor-agent", "Cursor Agent", "cursor-agent"),
    ("cursor", "Cursor CLI", "cursor"),
    ("openclaw", "OpenClaw", "openclaw"),
)


def _extra_candidates_from_env() -> list[tuple[str, str, str]]:
    raw = os.environ.get("DREAMWALK_CONSENSUS_AGENTS", "").strip()
    if not raw:
        return []

    extras: list[tuple[str, str, str]] = []
    for item in raw.split(","):
        executable = item.strip()
        if not executable:
            continue
        extras.append((executable, executable, executable))
    return extras


def probe_agents(
    candidates: Iterable[tuple[str, str, str]] | None = None,
) -> list[AgentProbe]:
    pool = list(DEFAULT_AGENT_CANDIDATES)
    pool.extend(_extra_candidates_from_env())
    if candidates is not None:
        pool = list(candidates)

    probes: list[AgentProbe] = []
    seen: set[str] = set()
    for key, label, executable in pool:
        if key in seen:
            continue
        seen.add(key)
        found = shutil.which(executable)
        notes = ("Detected on PATH.",) if found else ("Not found on PATH.",)
        probes.append(
            AgentProbe(
                key=key,
                label=label,
                executable=executable,
                available=bool(found),
                read_only=True,
                notes=notes,
            )
        )
    return probes


def available_agent_keys() -> list[str]:
    return [probe.key for probe in probe_agents() if probe.available]
