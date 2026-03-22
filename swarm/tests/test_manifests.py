from __future__ import annotations

import unittest

from swarm.manifests import build_codex_package_manifest, build_command_manifest, build_route_manifest


class ManifestTests(unittest.TestCase):
    def test_command_manifest_contains_all_commands(self) -> None:
        manifest = build_command_manifest()
        self.assertEqual(len(manifest["commands"]), 17)

    def test_codex_package_uses_public_names(self) -> None:
        manifest = build_codex_package_manifest()
        self.assertIn("commands", manifest)
        self.assertEqual(manifest["commands"][0]["public_name"], "/swarm")

    def test_route_manifest_captures_consensus_contract(self) -> None:
        manifest = build_route_manifest()
        consensus = manifest["routes"]["/consensus"]
        self.assertTrue(consensus["read_only"])
        self.assertTrue(consensus["uses_external_agents"])

    def test_route_manifest_captures_swarm_conductor(self) -> None:
        manifest = build_route_manifest()
        swarm = manifest["routes"]["/swarm"]
        self.assertTrue(swarm["read_only"])
        self.assertTrue(swarm["uses_parallelism"])


if __name__ == "__main__":
    unittest.main()
