run: install
	@echo "Temporary Disable Webkit DMABUF_RENDERER"
	WEBKIT_DISABLE_DMABUF_RENDERER=1 pnpm tauri dev

build: install
	pnpm tauri build

build-run: build
	WEBKIT_DISABLE_DMABUF_RENDERER=1 ./src-tauri/target/release/mqttify

install:
	pnpm install

test:
	pnpm exec playwright install
	pnpm test

clean:
	-rm -Rf ./src-tauri/target
	-rm -Rf ./src-tauri/test-results
	pnpm store prune

update:
	pnpm update
	cd src-tauri; cargo update