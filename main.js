const { Plugin, ItemView } = require('obsidian');

const VIEW_TYPE = 'svg-zoom-viewer-view';
const IMAGE_EXTENSIONS = ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif'];

function isSupportedImage(src) {
    if (!src) {
        return false;
    }
    const value = src.toLowerCase().split('?')[0].split('#')[0];
    return IMAGE_EXTENSIONS.some((ext) => value.endsWith(ext));
}

function findImageElement(event) {
    let node = event.target;
    while (node && node !== document.body) {
        if (node instanceof HTMLImageElement) {
            return node;
        }
        node = node.parentElement;
    }

    const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
    for (const candidate of path) {
        if (candidate instanceof HTMLImageElement) {
            return candidate;
        }
    }

    return null;
}

class SvgZoomViewerView extends ItemView {
    constructor(leaf) {
        super(leaf);
        this.imageSrc = '';
        this.imageTitle = 'Image Viewer';
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.panning = false;
    }

    getViewType() {
        return VIEW_TYPE;
    }

    getDisplayText() {
        return this.imageTitle || 'Image Viewer';
    }

    async onOpen() {
        this.contentEl.empty();
        this.contentEl.addClass('svg-zoom-viewer-pane');

        this.viewportEl = this.contentEl.createDiv({ cls: 'svg-zoom-viewer-viewport' });
        this.stageEl = this.viewportEl.createDiv({ cls: 'svg-zoom-viewer-stage' });

        this.boundWheel = this.onWheel.bind(this);
        this.boundPointerDown = this.onPointerDown.bind(this);
        this.boundPointerMove = this.onPointerMove.bind(this);
        this.boundPointerUp = this.onPointerUp.bind(this);
        this.boundDoubleClick = this.resetTransform.bind(this);

        this.viewportEl.addEventListener('wheel', this.boundWheel, { passive: false });
        this.viewportEl.addEventListener('pointerdown', this.boundPointerDown);
        this.viewportEl.addEventListener('pointermove', this.boundPointerMove);
        this.viewportEl.addEventListener('pointerup', this.boundPointerUp);
        this.viewportEl.addEventListener('pointerleave', this.boundPointerUp);
        this.viewportEl.addEventListener('dblclick', this.boundDoubleClick);

        const state = this.getState() || {};
        await this.setState(state, {});
    }

    async onClose() {
        if (!this.viewportEl) {
            return;
        }

        this.viewportEl.removeEventListener('wheel', this.boundWheel);
        this.viewportEl.removeEventListener('pointerdown', this.boundPointerDown);
        this.viewportEl.removeEventListener('pointermove', this.boundPointerMove);
        this.viewportEl.removeEventListener('pointerup', this.boundPointerUp);
        this.viewportEl.removeEventListener('pointerleave', this.boundPointerUp);
        this.viewportEl.removeEventListener('dblclick', this.boundDoubleClick);
    }

    async setState(state) {
        this.imageSrc = state?.src || '';
        this.imageTitle = state?.title || 'Image Viewer';
        this.resetTransform();
        this.renderMedia();
    }

    getState() {
        return {
            src: this.imageSrc,
            title: this.imageTitle,
        };
    }

    onPointerDown(event) {
        if (event.button !== 0) {
            return;
        }
        event.preventDefault();
        this.panning = true;
        this.lastX = event.clientX;
        this.lastY = event.clientY;
        this.viewportEl.setPointerCapture?.(event.pointerId);
        this.viewportEl.addClass('is-panning');
    }

    onPointerMove(event) {
        if (!this.panning) {
            return;
        }
        this.translateX += event.clientX - this.lastX;
        this.translateY += event.clientY - this.lastY;
        this.lastX = event.clientX;
        this.lastY = event.clientY;
        this.updateTransform();
    }

    onPointerUp(event) {
        if (!this.panning) {
            return;
        }
        this.panning = false;
        this.viewportEl.releasePointerCapture?.(event.pointerId);
        this.viewportEl.removeClass('is-panning');
    }

    onWheel(event) {
        event.preventDefault();
        const factor = event.deltaY < 0 ? 1.1 : 0.9;
        this.scale = Math.min(12, Math.max(0.1, this.scale * factor));
        this.updateTransform();
    }

    resetTransform() {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.updateTransform();
    }

    updateTransform() {
        if (!this.stageEl) {
            return;
        }
        this.stageEl.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
    }

    renderMedia() {
        if (!this.stageEl) {
            return;
        }

        this.stageEl.empty();
        const normalizedSrc = (this.imageSrc || '').toLowerCase().split('?')[0].split('#')[0];
        const isSvg = normalizedSrc.endsWith('.svg');

        if (isSvg) {
            const frame = document.createElement('iframe');
            frame.className = 'svg-zoom-viewer-frame';
            frame.src = this.imageSrc;
            frame.setAttribute('title', this.imageTitle);
            frame.setAttribute('sandbox', 'allow-same-origin');
            this.stageEl.appendChild(frame);
            this.mediaEl = frame;
            return;
        }

        const img = document.createElement('img');
        img.src = this.imageSrc;
        img.alt = this.imageTitle;
        img.className = 'svg-zoom-viewer-img';
        this.stageEl.appendChild(img);
        this.mediaEl = img;
    }
}

class SvgZoomViewerPlugin extends Plugin {
    async onload() {
        this.registerView(VIEW_TYPE, (leaf) => new SvgZoomViewerView(leaf));

        this.dblclickHandler = async (event) => {
            const image = findImageElement(event);
            if (!image) {
                return;
            }

            const src = image.getAttribute('src') || image.currentSrc || '';
            if (!isSupportedImage(src)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const title = image.getAttribute('alt') || image.getAttribute('src') || 'Image Viewer';
            await this.openImageView(src, title);
        };

        document.addEventListener('dblclick', this.dblclickHandler, true);
    }

    onunload() {
        document.removeEventListener('dblclick', this.dblclickHandler, true);
        this.app.workspace.detachLeavesOfType(VIEW_TYPE);
    }

    async openImageView(src, title) {
        const leaf = this.app.workspace.getLeaf(true);
        await leaf.setViewState({
            type: VIEW_TYPE,
            active: true,
            state: {
                src,
                title,
            },
        });
        this.app.workspace.revealLeaf(leaf);
    }
}

module.exports = SvgZoomViewerPlugin;
