from __future__ import annotations

import asyncio
import os
import shlex
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path


UNSAFE_BASH_TOKENS = (
    "sudo",
    "rm -rf",
    "mkfs",
    "dd if=",
    "> /dev/",
    "curl | sh",
    "wget | sh",
    ":(){:|:&};:",
)


@dataclass(frozen=True)
class ExecutionResult:
    success: bool
    stdout: str
    stderr: str
    exit_code: int | None = None
    error: str | None = None


def is_safe_command(command: str) -> bool:
    lowered = command.lower()
    return not any(token in lowered for token in UNSAFE_BASH_TOKENS)


class SafeExecutor:
    """Standalone execution helper derived from local shared patterns."""

    def __init__(self, timeout: int = 30, temp_dir: str | None = None) -> None:
        self.timeout = timeout
        self.temp_dir = temp_dir or tempfile.gettempdir()

    async def run_python_code(self, code: str, timeout: int | None = None) -> ExecutionResult:
        timeout = timeout or self.timeout
        handle = tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".py",
            delete=False,
            dir=self.temp_dir,
        )
        try:
            with handle:
                handle.write(code)
            process = await asyncio.create_subprocess_exec(
                sys.executable,
                handle.name,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=self.temp_dir,
                env={
                    "PATH": os.environ.get("PATH", ""),
                    "PYTHONDONTWRITEBYTECODE": "1",
                    "PYTHONHASHSEED": "0",
                },
            )
            try:
                stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=timeout)
            except asyncio.TimeoutError:
                process.kill()
                await process.wait()
                return ExecutionResult(
                    success=False,
                    stdout="",
                    stderr="",
                    error=f"Execution timed out after {timeout}s",
                )
            return ExecutionResult(
                success=process.returncode == 0,
                stdout=stdout.decode("utf-8", errors="replace").strip(),
                stderr=stderr.decode("utf-8", errors="replace").strip(),
                exit_code=process.returncode,
            )
        finally:
            Path(handle.name).unlink(missing_ok=True)

    async def run_bash_command(self, command: str, timeout: int | None = None) -> ExecutionResult:
        timeout = timeout or self.timeout
        if not is_safe_command(command):
            return ExecutionResult(
                success=False,
                stdout="",
                stderr="",
                error="Command rejected by Swarm safety rules.",
            )

        process = await asyncio.create_subprocess_exec(
            "/bin/bash",
            "-lc",
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=self.temp_dir,
        )
        try:
            stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=timeout)
        except asyncio.TimeoutError:
            process.kill()
            await process.wait()
            return ExecutionResult(
                success=False,
                stdout="",
                stderr="",
                error=f"Execution timed out after {timeout}s",
            )

        return ExecutionResult(
            success=process.returncode == 0,
            stdout=stdout.decode("utf-8", errors="replace").strip(),
            stderr=stderr.decode("utf-8", errors="replace").strip(),
            exit_code=process.returncode,
        )


def shell_preview(command: str) -> str:
    return " ".join(shlex.quote(part) for part in shlex.split(command))
