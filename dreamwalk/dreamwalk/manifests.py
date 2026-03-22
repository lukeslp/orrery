from __future__ import annotations

from datetime import datetime, timezone

from . import __version__
from .commands import COMMAND_SPECS
from .consensus import probe_agents
from .inventory import inventory_local_sources


def _built_at() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_command_manifest() -> dict[str, object]:
    return {
        "name": "dreamwalk",
        "version": __version__,
        "built_at": _built_at(),
        "commands": [command.to_dict() for command in COMMAND_SPECS],
    }


def build_route_manifest() -> dict[str, object]:
    return {
        "name": "dreamwalk-routes",
        "version": __version__,
        "built_at": _built_at(),
        "routes": {
            command.name: {
                "route": list(command.route),
                "handoffs": list(command.handoffs),
                "read_only": command.read_only,
                "uses_parallelism": command.uses_parallelism,
                "uses_external_agents": command.uses_external_agents,
            }
            for command in COMMAND_SPECS
        },
    }


def build_codex_package_manifest() -> dict[str, object]:
    return {
        "name": "dreamwalk-codex",
        "version": __version__,
        "built_at": _built_at(),
        "commands": [
            {
                "id": command.name.removeprefix("/"),
                "public_name": command.name,
                "summary": command.summary,
                "category": command.category,
            }
            for command in COMMAND_SPECS
        ],
    }


def build_consensus_manifest() -> dict[str, object]:
    return {
        "name": "dreamwalk-consensus",
        "version": __version__,
        "built_at": _built_at(),
        "agents": [probe.to_dict() for probe in probe_agents()],
    }


def build_local_sources_manifest() -> dict[str, object]:
    return {
        "name": "dreamwalk-local-sources",
        "version": __version__,
        "built_at": _built_at(),
        "sources": inventory_local_sources(),
    }
