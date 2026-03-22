from __future__ import annotations

import unittest

from dreamwalk.commands import command_names, get_command


class CommandSpecTests(unittest.TestCase):
    def test_public_command_surface_matches_plan(self) -> None:
        self.assertEqual(
            command_names(),
            [
                "/hitit",
                "/doublecheck",
                "/doubt",
                "/plan",
                "/enhance",
                "/humanize",
                "/janitor",
                "/pushit",
                "/shipit",
                "/accessibility",
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

    def test_consensus_is_read_only_and_external(self) -> None:
        consensus = get_command("/consensus")
        self.assertTrue(consensus.read_only)
        self.assertTrue(consensus.uses_external_agents)


if __name__ == "__main__":
    unittest.main()
