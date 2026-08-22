# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1: the WebAssembly puzzles and the generated documentation.
#
# web/build.ts is a nix-shell script (see its shebang) that pulls emscripten,
# cmake, halibut, pandoc and perl from the nixpkgs channel baked into this
# image, so the whole C/wasm toolchain comes from Nix rather than from apt.
# ---------------------------------------------------------------------------
FROM nixos/nix:2.35.2 AS wasm

# The emscripten cache lives in the read-only Nix store, so give it a writable
# one; otherwise the first link step fails trying to build libc.
ENV EM_CACHE=/tmp/emscripten-cache

WORKDIR /puzzles

# Materialise that toolchain in its own layer before the source is copied in:
# it is a 1.4 GiB download, and it should not be refetched every time a file in
# the tree changes. This list mirrors the `#! nix-shell` line in web/build.ts;
# if the two drift apart the build still works, it just pays the download
# again, so keep them in sync.
RUN nix-shell -p bun pandoc perl emscripten cmake halibut --run true

COPY . .

# Produces web/static/js (wasm + js), web/static/doc (halibut/pandoc output)
# and the per-puzzle fragments under html/. The cache mount keeps emscripten's
# sysroot between builds; without it every build spends ~10s rebuilding it
# during cmake's first compiler check.
RUN --mount=type=cache,target=/tmp/emscripten-cache,sharing=locked \
    cd web && ./build.ts

# ---------------------------------------------------------------------------
# Stage 2: the SvelteKit app.
# ---------------------------------------------------------------------------
FROM oven/bun:1 AS build

WORKDIR /web

# Dependencies first so edits to the app don't invalidate the install layer.
COPY web/package.json web/bun.lock web/.npmrc ./
RUN bun install --frozen-lockfile

COPY web/ ./
# Overwrite the checked-in assets with the ones just built from source.
COPY --from=wasm /puzzles/web/static ./static
# routes/+page.svelte imports the puzzle list from the cmake build directory.
COPY --from=wasm /puzzles/web/wasm/gamedesc.txt ./wasm/gamedesc.txt

RUN bun run build

# Roll server.ts and everything it imports -- the adapter-node handler, the
# crossws hooks, the $lib/* modules -- into one file, so the runtime image
# needs no node_modules and no tsconfig.json to resolve the $lib alias. It has
# to land inside build/, because the bundled adapter code derives its asset
# directory from import.meta.url and expects client/ next to it.
RUN bun build server.ts --target=bun --outfile build/server.js

# ---------------------------------------------------------------------------
# Stage 3: runtime.
#
# The server loads read files by paths relative to the working directory
# (`static/doc/` and `../html/`), so the runtime image keeps the same repo
# layout: the app lives at /puzzles/web with html/ beside it.
# ---------------------------------------------------------------------------
FROM oven/bun:1-slim AS runtime

ENV NODE_ENV=production
WORKDIR /puzzles/web

COPY --from=build /web/build ./build
# adapter-node already bundled static/ into build/client; this is only for the
# reads in routes/+page.server.ts and routes/js/[name].html/+page.server.ts.
COPY --from=build /web/static/doc ./static/doc
COPY --from=wasm /puzzles/html /puzzles/html

USER bun
ENV PORT=3000
EXPOSE 3000
CMD ["bun", "build/server.js"]
