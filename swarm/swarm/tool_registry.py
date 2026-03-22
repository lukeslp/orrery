from __future__ import annotations

from collections.abc import Callable
from typing import Any

from .models import ToolDefinition, ToolParameter


class ToolRegistry:
    """Standalone tool registry adapted for Swarm."""

    def __init__(self) -> None:
        self._definitions: dict[str, ToolDefinition] = {}
        self._functions: dict[str, Callable[..., Any]] = {}

    def register(
        self,
        *,
        name: str,
        description: str,
        category: str = "general",
        tags: tuple[str, ...] = (),
        parameters: tuple[ToolParameter, ...] = (),
    ) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
        def decorator(function: Callable[..., Any]) -> Callable[..., Any]:
            self._definitions[name] = ToolDefinition(
                name=name,
                description=description,
                category=category,
                tags=tags,
                parameters=parameters,
            )
            self._functions[name] = function
            return function

        return decorator

    def list_tools(self) -> list[dict[str, Any]]:
        return [definition.to_dict() for definition in self._definitions.values()]

    def execute(self, name: str, **kwargs: Any) -> Any:
        function = self._functions[name]
        return function(**kwargs)

    def has_tool(self, name: str) -> bool:
        return name in self._functions
