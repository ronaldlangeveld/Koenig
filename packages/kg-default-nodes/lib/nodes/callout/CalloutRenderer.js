import {addCreateDocumentOption} from '../../utils/add-create-document-option';

export function renderCalloutNodeToDOM(node, options = {}) {
    addCreateDocumentOption(options);

    /* c8 ignore stop */

    const document = options.createDocument();

    const element = document.createElement('div');
    element.classList.add('kg-card', 'kg-callout-card', `kg-callout-card-${node.getBackgroundColor()}`);
    if (node.getCalloutEmoji()) {
        const emojiElement = document.createElement('div');
        emojiElement.classList.add('kg-callout-emoji');
        emojiElement.textContent = node.getCalloutEmoji();
        element.appendChild(emojiElement);
    }
    const textElement = document.createElement('div');
    textElement.classList.add('kg-callout-text');
    textElement.innerHTML = node.getCalloutText();
    element.appendChild(textElement);
    return element;
}
