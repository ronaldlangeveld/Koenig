const BLANK_DOC = {
    root: {
        children: [],
        direction: null, 
        format: '',
        indent: 0,
        type: 'root',
        version: 1
    }
};

const TAG_TO_LEXICAL_NODE = {
    p: {
        type: 'paragraph'
    }, 
    h2: {
        type: 'heading',
        tag: 'h2'
    }, 
    h3: {
        type: 'heading',
        tag: 'h3'
    },
    blockquote: {
        type: 'quote'
    },
    a: {
        type: 'link',
        rel: null,
        target: null,
        title: null,
        url: null
    }
};

const ATOM_TO_LEXICAL_NODE = {
    'soft-return': {
        type: 'linebreak',
        version: 1
    }
};

const MARKUP_TO_FORMAT = {
    strong: 1,
    b: 1,
    em: 1 << 1,
    i: 1 << 1,
    s: 1 << 2,
    code: 1 << 4,
    sub: 1 << 5,
    sup: 1 << 6
};

export function mobiledocToLexical(serializedMobiledoc) {
    if (serializedMobiledoc === null || serializedMobiledoc === undefined || serializedMobiledoc === '') {
        return JSON.stringify(BLANK_DOC);
    }

    const mobiledoc = JSON.parse(serializedMobiledoc);

    if (!mobiledoc.sections) {
        return JSON.stringify(BLANK_DOC);
    }

    const lexical = buildEmptyDoc();

    mobiledoc.sections.forEach(child => addRootChild(child, mobiledoc, lexical));

    return JSON.stringify(lexical);
}

function buildEmptyDoc() {
    return {
        root: {
            children: [],
            direction: null, 
            format: '',
            indent: 0,
            type: 'root',
            version: 1
        }
    };
}

function addRootChild(child, mobiledoc, lexical) {
    const sectionTypeIdentifier = child[0];
    if (sectionTypeIdentifier === 1) {
        // Markup (text) section
        const lexicalChild = convertMarkupSectionToLexical(child, mobiledoc);
        lexical.root.children.push(lexicalChild);

        // Set direction to ltr if there is any text
        // Otherwise direction should be null
        // Not sure if this is necessary:
        // if we don't plan to support RTL, we could just set 'ltr' in all cases and ignore null
        if (lexical.root.children[0].children.length > 0) {
            lexical.root.direction = 'ltr';
        }
    } else if (sectionTypeIdentifier === 2) {
        // Image section
    } else if (sectionTypeIdentifier === 3) {
        // List section
    } else if (sectionTypeIdentifier === 10) {
        // Card section
    }
}

function convertMarkupSectionToLexical(section, mobiledoc) {
    const tagName = section[1]; // e.g. 'p'
    const markers = section[2]; // e.g. [[0, [0], 0, "Hello world"]]
    const markups = mobiledoc.markups;
    const atoms = mobiledoc.atoms;

    // Create an empty Lexical node from the tag name
    // We will add nodes to the children array later
    const lexicalNode = createEmptyLexicalNode(tagName);

    // Initiate some variables before looping over all the markers
    let openMarkups = []; // tracks which markup tags are open for the current marker
    let linkNode = undefined; // tracks current link node or undefined if no a tag is open
    let href = undefined; // tracks the href for the current link node or undefined if no a tag is open
    
    // loop over markers and convert each one to lexical
    for (let i = 0; i < markers.length; i++) {
        // grab the attributes from the current marker
        const [
            textTypeIdentifier,
            openMarkupsIndexes,
            numberOfClosedMarkups,
            value
        ] = markers[i];

        // Markers are either text (markup) or atoms
        const markerType = textTypeIdentifier === 0 ? 'markup' : 'atom';

        // If the current marker is an atom, convert the atom to Lexical and add to the node
        if (markerType === 'atom') {
            const atom = atoms[value];
            const atomName = atom[0];
            const childNode = ATOM_TO_LEXICAL_NODE[atomName];
            embedChildNode(lexicalNode, childNode);
            continue;
        }

        // calculate which markups are open for the current marker
        openMarkupsIndexes.forEach((markupIndex) => {
            const markup = markups[markupIndex];
            // Extract the href from the markup if it's a link
            if (markup[0] === 'a') {
                href = markup[1][1];
            }
            // Add the markup to the list of open markups
            openMarkups.push(markup);
        });

        if (value) {
            // Convert the open markups to a bitmask compatible with Lexical
            const format = convertMarkupTagsToLexicalFormatBitmask(openMarkups);

            // If there is an open link tag, add the text to the link node
            // Otherwise add the text to the parent node
            if (href) { // link is open
                // Create an empty link node if it doesn't exist already
                linkNode = linkNode !== undefined ? linkNode : createEmptyLexicalNode('a', {url: href});

                // Create a text node and add it to the link node
                const textNode = createTextNode(value, format);
                embedChildNode(linkNode, textNode);
            } else {
                const textNode = createTextNode(value, format);
                embedChildNode(lexicalNode, textNode);
            }
        }

        // Close any markups that are closed after the current marker
        // Remove any closed markups from openMarkups list
        for (let j = 0; j < numberOfClosedMarkups; j++) {
            // Remove the most recently opened markup from the list of open markups
            const markup = openMarkups.pop();

            // If we're closing a link tag, add the linkNode to the node
            // Reset href and linkNode for the next markup
            if (markup[0] === 'a') {
                embedChildNode(lexicalNode, linkNode);
                href = undefined;
                linkNode = undefined;
            }
        }
    }
    return lexicalNode;
}

// Creates a text node from the given text and format
function createTextNode(text, format) {
    return {
        detail: 0,
        format: format,
        mode: 'normal',
        style: '',
        text: text,
        type: 'text',
        version: 1
    };
}

// Creates an empty Lexical node from the given tag name and additional attributes
function createEmptyLexicalNode(tagName, attributes = {}) {
    const nodeParams = TAG_TO_LEXICAL_NODE[tagName];
    const node = {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        ...nodeParams,
        ...attributes,
        version: 1
    };
    return node;
}

// Adds a child node to a parent node
function embedChildNode(parentNode, childNode) {
    // Add textNode to node's children
    parentNode.children.push(childNode);

    // If there is any text (e.g. not a blank text node), set the direction to ltr
    if ('text' in childNode && childNode.text) {
        parentNode.direction = 'ltr';
    }
}

// Lexical stores formats as a bitmask
// Mobiledoc stores formats as a list of open markup tags
// This function converts a list of open tags to a bitmask compatible with lexical
function convertMarkupTagsToLexicalFormatBitmask(tags) {
    let format = 0;
    tags.forEach((tag) => {
        if (tag in MARKUP_TO_FORMAT) {
            format = format | MARKUP_TO_FORMAT[tag];
        }
    });
    return format;
}