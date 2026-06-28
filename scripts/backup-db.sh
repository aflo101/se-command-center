#!/usr/bin/env bash
# Snapshot the SQLite pipeline.db to a backup directory (consistent even while
# the server holds it open). Keeps the 10 most recent backups.
#
# Destination is configurable:
#   SE_BACKUP_DIR  backup folder   (default: ~/se-command-backups)
#   SE_DB_PATH     source database (default: <repo>/data/pipeline.db)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${SE_DB_PATH:-$REPO_ROOT/data/pipeline.db}"
BK="${SE_BACKUP_DIR:-$HOME/se-command-backups}"
STAMP="$(date +%Y-%m-%d_%H%M%S)"
DEST="$BK/pipeline-$STAMP.db"

mkdir -p "$BK"
sqlite3 "$SRC" ".backup '$DEST'"
rm -f "$DEST-wal" "$DEST-shm"   # drop sidecars; snapshot is self-contained

# Prune: keep newest 10
ls -1t "$BK"/pipeline-*.db 2>/dev/null | tail -n +11 | while read -r old; do rm -f "$old"; done

echo "Backed up to: $DEST"
