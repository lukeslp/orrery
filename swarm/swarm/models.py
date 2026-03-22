from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass(frozen=True)
class CommandSpec:
    name: str
    summary: str
    category: str
    route: tuple[str, ...]
    handoffs: tuple[str, ...] = ()
    read_only: bool = False
    uses_parallelism: bool = True
    uses_external_agents: bool = False
    first_principles: bool = False
    notes: tuple[str, ...] = ()

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class AgentProbe:
    key: str
    label: str
    executable: str
    available: bool
    read_only: bool = True
    notes: tuple[str, ...] = field(default_factory=tuple)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class ToolParameter:
    name: str
    type: str
    description: str
    required: bool = True
    default: Any = None

    def to_json_schema(self) -> dict[str, Any]:
        schema = {"type": self.type, "description": self.description}
        if self.default is not None:
            schema["default"] = self.default
        return schema


@dataclass(frozen=True)
class ToolDefinition:
    name: str
    description: str
    category: str = "general"
    tags: tuple[str, ...] = ()
    parameters: tuple[ToolParameter, ...] = ()

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "tags": list(self.tags),
            "parameters": {
                param.name: {
                    **param.to_json_schema(),
                    "required": param.required,
                }
                for param in self.parameters
            },
        }
