from __future__ import annotations

import unittest

from swarm.inventory import inventory_local_sources


class InventoryTests(unittest.TestCase):
    def test_inventory_contains_expected_roots(self) -> None:
        inventory = inventory_local_sources(limit_per_root=1)
        self.assertIn("shared", inventory)
        self.assertIn("snippets", inventory)
        self.assertIn("packages", inventory)

    def test_inventory_shape_is_stable(self) -> None:
        inventory = inventory_local_sources(limit_per_root=1)
        shared = inventory["shared"]
        self.assertIn("root", shared)
        self.assertIn("exists", shared)
        self.assertIn("sample_files", shared)


if __name__ == "__main__":
    unittest.main()
