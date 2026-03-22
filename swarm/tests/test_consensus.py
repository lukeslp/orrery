from __future__ import annotations

import unittest

from swarm.consensus import probe_agents


class ConsensusTests(unittest.TestCase):
    def test_probe_returns_known_candidates(self) -> None:
        probes = probe_agents()
        keys = {probe.key for probe in probes}
        self.assertIn("codex", keys)
        self.assertIn("claude", keys)
        self.assertIn("aider", keys)

    def test_probe_is_read_only(self) -> None:
        probes = probe_agents()
        self.assertTrue(all(probe.read_only for probe in probes))


if __name__ == "__main__":
    unittest.main()
