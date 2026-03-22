from __future__ import annotations

import unittest

from swarm.commands import command_names, get_command


class CommandSpecTests(unittest.TestCase):
    def test_public_command_surface_matches_plan(self) -> None:
        self.assertEqual(
            command_names(),
            [
                "/swarm",
                "/hitit",
                "/doublecheck",
                "/doubt",
                "/plan",
                "/enhance",
                "/humanize",
                "/docs",
                "/janitor",
                "/pushit",
                "/shipit",
                "/accessibility",
                "/extract",
                "/portfolio",
                "/harvest",
                "/thinkagain",
                "/consensus",
            ],
        )

    def test_doubt_is_targeted_not_first_principles(self) -> None:
        doubt = get_command("/doubt")
        self.assertFalse(doubt.first_principles)
        self.assertIn("/thinkagain", doubt.handoffs)

    def test_thinkagain_is_first_principles(self) -> None:
        thinkagain = get_command("/thinkagain")
        self.assertTrue(thinkagain.first_principles)
        self.assertTrue(thinkagain.read_only)

    def test_swarm_is_master_conductor(self) -> None:
        swarm = get_command("/swarm")
        self.assertEqual(swarm.category, "conductor")
        self.assertIn("/hitit", swarm.handoffs)
        self.assertIn("/consensus", swarm.handoffs)

    def test_consensus_is_read_only_and_external(self) -> None:
        consensus = get_command("/consensus")
        self.assertTrue(consensus.read_only)
        self.assertTrue(consensus.uses_external_agents)

    def test_extract_and_portfolio_are_read_only_analysis_commands(self) -> None:
        extract = get_command("/extract")
        portfolio = get_command("/portfolio")
        self.assertTrue(extract.read_only)
        self.assertTrue(portfolio.read_only)
        self.assertIn("/portfolio", extract.handoffs)
        self.assertIn("/pushit", portfolio.handoffs)


if __name__ == "__main__":
    unittest.main()
