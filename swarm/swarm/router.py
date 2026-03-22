from __future__ import annotations

from dataclasses import dataclass

from .commands import COMMAND_SPECS, get_command, normalize_command_name
from .models import CommandSpec


@dataclass(frozen=True)
class RouteResolution:
    command: CommandSpec
    normalized_name: str
    next_steps: tuple[str, ...]


class SwarmRouter:
    def __init__(self) -> None:
        self._commands = {spec.name: spec for spec in COMMAND_SPECS}

    def resolve(self, name: str) -> RouteResolution:
        normalized = normalize_command_name(name)
        command = get_command(normalized)
        return RouteResolution(
            command=command,
            normalized_name=normalized,
            next_steps=command.handoffs,
        )

    def route_graph(self) -> dict[str, dict[str, object]]:
        return {
            command.name: {
                "category": command.category,
                "route": list(command.route),
                "handoffs": list(command.handoffs),
                "read_only": command.read_only,
                "uses_parallelism": command.uses_parallelism,
                "uses_external_agents": command.uses_external_agents,
                "first_principles": command.first_principles,
            }
            for command in self._commands.values()
        }
