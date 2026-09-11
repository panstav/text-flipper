#!/usr/bin/env bash
set -e

# Resolve symlinks to find actual script directory
REAL_SCRIPT="$(readlink -f "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(cd "$(dirname "$REAL_SCRIPT")" && pwd)"

# Ensure PATH includes standard directories and user bin
export PATH="$HOME/.local/bin:$HOME/.nvm/versions/node/v24.13.1/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

# Ensure runtime and ydotool socket environment
[ -z "$XDG_RUNTIME_DIR" ] && export XDG_RUNTIME_DIR="/run/user/$(id -u)"
export YDOTOOL_SOCKET="${YDOTOOL_SOCKET:-$XDG_RUNTIME_DIR/.ydotool_socket}"
[ -z "$XDG_SESSION_TYPE" ] && [ -n "$WAYLAND_DISPLAY" ] && export XDG_SESSION_TYPE="wayland"

# Locate Node.js binary
if command -v node >/dev/null 2>&1; then
    NODE_BIN="$(command -v node)"
elif [ -x "$HOME/.nvm/versions/node/v24.13.1/bin/node" ]; then
    NODE_BIN="$HOME/.nvm/versions/node/v24.13.1/bin/node"
elif [ -d "$HOME/.nvm" ]; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    NODE_BIN="$(command -v node)"
fi

if [ -z "$NODE_BIN" ]; then
    notify-send -u critical "Text Flipper Error" "Node.js executable not found"
    exit 1
fi

cd "$SCRIPT_DIR"
exec "$NODE_BIN" "$SCRIPT_DIR/flip.js"
