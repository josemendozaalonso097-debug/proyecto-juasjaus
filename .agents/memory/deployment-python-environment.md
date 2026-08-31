---
name: Deployment Python environment
description: Replit publishing can inherit a global pip configuration that forces user installs and conflicts with virtual environments.
---

Use a project-local Python virtual environment for production publishing and make its pip install ignore the global pip configuration while retaining Replit's package index.

**Why:** The workspace's global pip configuration can force `user = yes`; combined with Replit's Nix-managed Python or uv auto-detection, publishing fails with permission errors under `/nix/store` or refuses installs inside a virtual environment.

**How to apply:** For Python-backed publications, create the virtual environment in the project during the build, install requirements with `PIP_CONFIG_FILE=/dev/null`, and run production with that environment's Python.