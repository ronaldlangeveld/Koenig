import {createCommand} from 'lexical';
import {KoenigDecoratorNode} from '../../KoenigDecoratorNode';
import {VideoParser} from './VideoParser';
import {renderVideoNodeToDOM} from './VideoRenderer';

export const INSERT_VIDEO_COMMAND = createCommand();
const NODE_TYPE = 'video';

export class VideoNode extends KoenigDecoratorNode {
    // payload properties
    __src;
    __caption;
    __fileName;
    __mimeType;
    __width;
    __height;
    __duration;
    __thumbnailSrc;
    __customThumbnailSrc;
    __thumbnailWidth;
    __thumbnailHeight;
    __cardWidth;
    __loop;

    static getType() {
        return NODE_TYPE;
    }

    static clone(node) {
        return new this(
            node.getDataset(),
            node.__key
        );
    }

    // used by `@tryghost/url-utils` to transform URLs contained in the serialized JSON
    static get urlTransformMap() {
        return {
            src: 'url',
            thumbnailSrc: 'url',
            customThumbnailSrc: 'url',
            caption: 'html'
        };
    }

    getDataset() {
        const self = this.getLatest();
        return {
            src: self.__src,
            caption: self.__caption,
            fileName: self.__fileName,
            mimeType: self.__mimeType,
            width: self.__width,
            height: self.__height,
            duration: self.__duration,
            thumbnailSrc: self.__thumbnailSrc,
            customThumbnailSrc: self.__customThumbnailSrc,
            thumbnailWidth: self.__thumbnailWidth,
            thumbnailHeight: self.__thumbnailHeight,
            cardWidth: self.__cardWidth,
            loop: self.__loop
        };
    }

    constructor({src, caption, fileName, mimeType, width, height, duration, thumbnailSrc, customThumbnailSrc, thumbnailWidth, thumbnailHeight, cardWidth, loop} = {}, key) {
        super(key);
        this.__src = src || '';
        this.__caption = caption || '';
        this.__fileName = fileName || '';
        this.__mimeType = mimeType || '';
        this.__width = width || null;
        this.__height = height || null;
        this.__duration = duration || 0;
        this.__thumbnailSrc = thumbnailSrc || '';
        this.__customThumbnailSrc = customThumbnailSrc || '';
        this.__thumbnailWidth = thumbnailWidth || null;
        this.__thumbnailHeight = thumbnailHeight || null;
        this.__cardWidth = cardWidth || 'regular';
        this.__loop = !!loop;
    }

    static importJSON(serializedNode) {
        const {src, caption, fileName, mimeType, width, height, duration, thumbnailSrc, customThumbnailSrc, thumbnailWidth, thumbnailHeight, cardWidth, loop} = serializedNode;
        const node = new this({
            src,
            caption,
            fileName,
            mimeType,
            width,
            height,
            duration,
            thumbnailSrc,
            customThumbnailSrc,
            thumbnailWidth,
            thumbnailHeight,
            cardWidth,
            loop
        });
        return node;
    }

    exportJSON() {
        // checks if src is a data string
        const src = this.getSrc();
        const isBlob = src.startsWith('data:');
        const dataset = {
            type: NODE_TYPE,
            version: 1,
            src: isBlob ? '<base64String>' : this.getSrc(),
            caption: this.getCaption(),
            fileName: this.getFileName(),
            mimeType: this.getMimeType(),
            width: this.getVideoWidth(),
            height: this.getVideoHeight(),
            duration: this.getDuration(),
            thumbnailSrc: this.getThumbnailSrc(),
            customThumbnailSrc: this.getCustomThumbnailSrc(),
            thumbnailWidth: this.getThumbnailWidth(),
            thumbnailHeight: this.getThumbnailHeight(),
            cardWidth: this.getCardWidth(),
            loop: this.getLoop()
        };
        return dataset;
    }

    static importDOM() {
        const parser = new VideoParser(this);
        return parser.DOMConversionMap;
    }

    exportDOM(options = {}) {
        const element = renderVideoNodeToDOM(this, options);
        return {element};
    }

    /* c8 ignore start */
    createDOM() {
        const element = document.createElement('div');
        return element;
    }

    updateDOM() {
        return false;
    }

    isInline() {
        return false;
    }
    /* c8 ignore stop */

    getSrc() {
        const self = this.getLatest();
        return self.__src;
    }

    setSrc(src) {
        const writable = this.getWritable();
        return writable.__src = src;
    }

    getCaption() {
        const self = this.getLatest();
        return self.__caption;
    }

    setCaption(caption) {
        const writable = this.getWritable();
        return writable.__caption = caption;
    }

    getFileName() {
        const self = this.getLatest();
        return self.__fileName;
    }

    setFileName(fileName) {
        const writable = this.getWritable();
        return writable.__fileName = fileName;
    }

    getMimeType() {
        const self = this.getLatest();
        return self.__mimeType;
    }

    setMimeType(mimeType) {
        const writable = this.getWritable();
        return writable.__mimeType = mimeType;
    }

    getVideoWidth() {
        const self = this.getLatest();
        return self.__width;
    }

    setVideoWidth(width) {
        const writable = this.getWritable();
        return writable.__width = width;
    }

    getVideoHeight() {
        const self = this.getLatest();
        return self.__height;
    }

    setVideoHeight(height) {
        const writable = this.getWritable();
        return writable.__height = height;
    }

    getDuration() {
        const self = this.getLatest();
        return self.__duration;
    }

    getFormattedDuration() {
        const minutes = Math.floor(this.getDuration() / 60);
        const seconds = Math.floor(this.getDuration() - (minutes * 60));
        const paddedSeconds = String(seconds).padStart(2, '0');
        const formattedDuration = `${minutes}:${paddedSeconds}`;
        return formattedDuration;
    }

    setDuration(duration) {
        const writable = this.getWritable();
        return writable.__duration = duration;
    }

    getThumbnailSrc() {
        const self = this.getLatest();
        return self.__thumbnailSrc;
    }

    setThumbnailSrc(thumbnailSrc) {
        const writable = this.getWritable();
        return writable.__thumbnailSrc = thumbnailSrc;
    }

    getCustomThumbnailSrc() {
        const self = this.getLatest();
        return self.__customThumbnailSrc;
    }

    setCustomThumbnailSrc(customThumbnailSrc) {
        const writable = this.getWritable();
        return writable.__customThumbnailSrc = customThumbnailSrc;
    }

    getThumbnailWidth() {
        const self = this.getLatest();
        return self.__thumbnailWidth;
    }

    setThumbnailWidth(thumbnailWidth) {
        const writable = this.getWritable();
        return writable.__thumbnailWidth = thumbnailWidth;
    }

    getThumbnailHeight() {
        const self = this.getLatest();
        return self.__thumbnailHeight;
    }

    setThumbnailHeight(thumbnailHeight) {
        const writable = this.getWritable();
        return writable.__thumbnailHeight = thumbnailHeight;
    }

    setCardWidth(cardWidth) {
        const writable = this.getWritable();
        return writable.__cardWidth = cardWidth;
    }

    getCardWidth() {
        const self = this.getLatest();
        return self.__cardWidth;
    }

    getLoop() {
        const self = this.getLatest();
        return self.__loop;
    }

    setLoop(loop) {
        const writable = this.getWritable();
        return writable.__loop = loop;
    }

    // should be overridden
    /* c8 ignore next 3 */
    decorate() {
        return '';
    }

    hasEditMode() {
        return true;
    }

    isEmpty() {
        return !this.__src;
    }
}

export const $createVideoNode = (dataset) => {
    return new VideoNode(dataset);
};

export function $isVideoNode(node) {
    return node instanceof VideoNode;
}
