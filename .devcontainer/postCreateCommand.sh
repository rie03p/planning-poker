#!/usr/bin/env zsh

set -exo pipefail

if ! grep -q mise ~/.zshrc; then
    # shellcheck disable=SC2016
    echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
fi

mise trust
mise install -y
eval "$(mise activate zsh)"

pnpm install
