"""Serve the pinned portfolio FastAPI app from an existing Gradio SDK Space.

Hugging Face documents custom Python servers on port 7860 for Gradio Spaces as
an unofficial workflow. This launcher is for the existing ZeroGPU Space when
CPU Basic Docker hosting is unavailable on the account plan.
"""

import hashlib
import os
import re
import subprocess
import sys
from pathlib import Path

import uvicorn

SOURCE_REPOSITORY = "https://github.com/mahadbaig2/mahad-ai-portfolio.git"
EXPECTED_ROUTER_SHA256 = "8fd329f6615e6eea28ec9f08bb6823a5286d0fc1a8370f6b273b6e0506ef3235"


def prepare_source() -> Path:
    commit = os.environ.get("SOURCE_COMMIT", "")
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise RuntimeError("SOURCE_COMMIT must be a reviewed 40-character Git commit ID")

    source_dir = Path("/tmp/mahad-ai-portfolio-source")
    source_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(["git", "init", str(source_dir)], check=True)
    current_remote = subprocess.run(
        ["git", "-C", str(source_dir), "remote", "get-url", "origin"],
        capture_output=True,
        text=True,
        check=False,
    )
    if current_remote.returncode == 0:
        subprocess.run(["git", "-C", str(source_dir), "remote", "set-url", "origin", SOURCE_REPOSITORY], check=True)
    else:
        subprocess.run(["git", "-C", str(source_dir), "remote", "add", "origin", SOURCE_REPOSITORY], check=True)
    subprocess.run(["git", "-C", str(source_dir), "fetch", "--depth", "1", "origin", commit], check=True)
    subprocess.run(["git", "-C", str(source_dir), "checkout", "--detach", "FETCH_HEAD"], check=True)
    actual_commit = subprocess.check_output(["git", "-C", str(source_dir), "rev-parse", "HEAD"], text=True).strip()
    if actual_commit != commit:
        raise RuntimeError("Checked-out source does not match SOURCE_COMMIT")

    model = source_dir / "pipelines/training/releases/champion_v1.0.0/model.onnx"
    if hashlib.sha256(model.read_bytes()).hexdigest() != EXPECTED_ROUTER_SHA256:
        raise RuntimeError("Champion ONNX artifact checksum mismatch")
    return source_dir


if __name__ == "__main__":
    root = prepare_source()
    os.chdir(root)
    sys.path.insert(0, str(root))
    os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")
    uvicorn.run("apps.api.main:app", host="0.0.0.0", port=int(os.environ.get("PORT", "7860")))
