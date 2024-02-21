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
	pnpm test