from __future__ import annotations

from .models import CommandSpec


def _command(
    name: str,
    summary: str,
    category: str,
    route: tuple[str, ...],
    *,
    handoffs: tuple[str, ...] = (),
    read_only: bool = False,
    uses_parallelism: bool = True,
    uses_external_agents: bool = False,
    first_principles: bool = False,
    notes: tuple[str, ...] = (),
) -> CommandSpec:
    return CommandSpec(
        name=name,
        summary=summary,
        category=category,
        route=route,
        handoffs=handoffs,
        read_only=read_only,
        uses_parallelism=uses_parallelism,
        uses_external_agents=uses_external_agents,
        first_principles=first_principles,
        notes=notes,
    )


COMMAND_SPECS: tuple[CommandSpec, ...] = (
    _command(
        "/hitit",
        "Main execution entrypoint for doing the work.",
        "execution",
        ("intake", "decompose", "execute", "verify", "synthesize"),
        handoffs=("/enhance", "/plan", "/doublecheck"),
        notes=("Can internally hand off to planning or research before execution.",),
    ),
    _command(
        "/doublecheck",
        "Validation, correctness, tests, config, quality, and findings-first review.",
        "validation",
        ("inspect", "validate", "test", "audit", "findings"),
        handoffs=("/doubt", "/plan", "/hitit"),
        read_only=True,
        notes=("Primary review command; output should prioritize issues over summary.",),
    ),
    _command(
        "/doubt",
        "Targeted challenge to the current approach with explicit alternatives.",
        "reconsideration",
        ("inspect", "challenge", "compare", "synthesize"),
        handoffs=("/thinkagain", "/plan", "/doublecheck"),
        read_only=True,
        notes=("Focuses on the current frame rather than rebuilding from scratch.",),
    ),
    _command(
        "/plan",
        "Architecture, sequencing, standards, modularity, and implementation strategy.",
        "planning",
        ("scope", "architecture", "sequence", "acceptance", "assumptions"),
        handoffs=("/hitit", "/doublecheck"),
        read_only=True,
    ),
    _command(
        "/enhance",
        "Pull in related repos, conventions, datasets, APIs, and prior art.",
        "research",
        ("search", "compare", "source-triage", "recommend"),
        handoffs=("/plan", "/hitit", "/doublecheck"),
        read_only=True,
        notes=("Should distinguish strong conventions from interesting-but-niche patterns.",),
    ),
    _command(
        "/humanize",
        "Improve prose, docs, UX wording, readability, and polish.",
        "polish",
        ("audit-tone", "rewrite", "simplify", "polish"),
        handoffs=("/doublecheck",),
        notes=("Bias toward clarity, natural phrasing, and lower-friction UX language.",),
    ),
    _command(
        "/janitor",
        "Cleanup, organization, dead artifact detection, and repo hygiene.",
        "maintenance",
        ("inventory", "detect-cruft", "organize", "recommend-cleanup"),
        handoffs=("/harvest", "/doublecheck"),
        notes=("Cleanup-oriented snippet capture is allowed only when tied to cleanup work.",),
    ),
    _command(
        "/pushit",
        "Repo publication, sync, packaging publish, and distribution steps.",
        "distribution",
        ("prepublish", "publish", "sync", "report"),
        handoffs=("/shipit",),
        notes=("Owns repository and package publication, not deployment.",),
    ),
    _command(
        "/shipit",
        "Release, deploy, preflight, postflight, and verification.",
        "release",
        ("preflight", "release", "deploy", "verify", "checkpoint"),
        handoffs=("/doublecheck",),
        notes=("Owns deployment and release safety checks.",),
    ),
    _command(
        "/accessibility",
        "Accessibility review and remediation planning.",
        "accessibility",
        ("audit-a11y", "classify", "remediate", "verify"),
        handoffs=("/doublecheck", "/humanize"),
        read_only=True,
    ),
    _command(
        "/harvest",
        "Capture reusable snippets, implementation patterns, and durable ideas.",
        "knowledge",
        ("extract", "normalize", "tag", "record"),
        handoffs=("/plan", "/janitor"),
        notes=("Separate from cleanup; preserves useful patterns instead of deleting them.",),
    ),
    _command(
        "/thinkagain",
        "Reconsider the whole implementation from first principles.",
        "reconsideration",
        ("discard-frame", "re-derive", "compare", "rebuild-plan"),
        handoffs=("/plan", "/hitit", "/doublecheck"),
        read_only=True,
        first_principles=True,
        notes=("Use when the current approach may be wrong at a foundational level.",),
    ),
    _command(
        "/consensus",
        "Read-only second opinions from other installed CLI agents.",
        "consensus",
        ("detect-agents", "fan-out", "compare", "synthesize"),
        handoffs=("/doubt", "/thinkagain", "/doublecheck"),
        read_only=True,
        uses_external_agents=True,
        notes=("External agents are consulted in read-only mode only.",),
    ),
)


_COMMAND_INDEX = {spec.name: spec for spec in COMMAND_SPECS}


def normalize_command_name(name: str) -> str:
    name = name.strip()
    if not name.startswith("/"):
        name = f"/{name}"
    return name.lower()


def get_command(name: str) -> CommandSpec:
    normalized = normalize_command_name(name)
    return _COMMAND_INDEX[normalized]


def command_names() -> list[str]:
    return [spec.name for spec in COMMAND_SPECS]
