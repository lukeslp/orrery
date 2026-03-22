from __future__ import annotations

import os
from pathlib import Path


DEFAULT_SOURCE_ROOTS = {
    "shared": Path(os.environ.get("DREAMWALK_SHARED_ROOT", "/home/coolhand/shared")),
    "snippets": Path(os.environ.get("DREAMWALK_SNIPPETS_ROOT", "/home/coolhand/SNIPPETS")),
    "packages": Path(os.environ.get("DREAMWALK_PACKAGES_ROOT", "/home/coolhand/packages")),
}

INTERESTING_NAMES = {
    "README.md",
    "pyproject.toml",
    "package.json",
}
INTERESTING_SUFFIXES = {".py", ".ts", ".js", ".md"}
IGNORED_PARTS = {
    "__pycache__",
    "node_modules",
    ".git",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    ".backups",
    "dist",
    "build",
}


def _sample_files(root: Path, limit: int) -> list[str]:
    if not root.exists():
        return []

    samples: list[str] = []
    for path in sorted(root.rglob("*")):
        if len(samples) >= limit:
            break
        if not path.is_file():
            continue
        if any(part.startswith(".") or part in IGNORED_PARTS for part in path.relative_to(root).parts):
            continue
        if path.name in INTERESTING_NAMES or path.suffix in INTERESTING_SUFFIXES:
            samples.append(str(path.relative_to(root)))
    return samples


def inventory_local_sources(limit_per_root: int = 24) -> dict[str, dict[str, object]]:
    inventory: dict[str, dict[str, object]] = {}
    for key, root in DEFAULT_SOURCE_ROOTS.items():
        exists = root.exists()
        inventory[key] = {
            "root": str(root),
            "exists": exists,
            "sample_files": _sample_files(root, limit_per_root) if exists else [],
        }
    return inventory
