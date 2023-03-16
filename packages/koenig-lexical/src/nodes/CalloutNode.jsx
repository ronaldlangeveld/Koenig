import CardContext from '../context/CardContext';
import KoenigCardWrapper from '../components/KoenigCardWrapper';
import React from 'react';
import {$getNodeByKey} from 'lexical';
import {ActionToolbar} from '../components/ui/ActionToolbar.jsx';
import {CalloutNode as BaseCalloutNode, INSERT_CALLOUT_COMMAND} from '@tryghost/kg-default-nodes';
import {CalloutCard} from '../components/ui/cards/CalloutCard';
import {ReactComponent as CalloutCardIcon} from '../assets/icons/kg-card-type-callout.svg';
import {ToolbarMenu, ToolbarMenuItem, ToolbarMenuSeparator} from '../components/ui/ToolbarMenu.jsx';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

// re-export here so we don't need to import from multiple places throughout the app
export {INSERT_CALLOUT_COMMAND} from '@tryghost/kg-default-nodes';

function CalloutNodeComponent({nodeKey, text, hasEmoji, backgroundColor, emojiValue}) {
    const [editor] = useLexicalComposerContext();

    const {isSelected, isEditing, setEditing} = React.useContext(CardContext);

    const setText = (newText) => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            node.setText(newText);
        });
    };

    const toggleEmoji = () => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            node.setHasEmoji(!hasEmoji);
        });
    };

    const handleToolbarEdit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setEditing(true);
    };

    const handleColorChange = (color) => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            node.setBackgroundColor(color);
        });
    };

    const handleEmojiChange = (emoji) => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            node.setEmojiValue(emoji);
        });
    };

    return (
        <>
            <CalloutCard
                changeEmoji={handleEmojiChange}
                color={backgroundColor}
                editor={editor}
                emoji={hasEmoji}
                emojiValue={emojiValue}
                handleColorChange={handleColorChange}
                isEditing={isEditing}
                isSelected={isSelected}
                nodeKey={nodeKey}
                setEditing={setEditing}
                text={text}
                toggleEmoji={toggleEmoji}
                updateText={setText}
            />
            <ActionToolbar
                data-kg-card-toolbar="callout"
                isVisible={isSelected && !isEditing}
            >
                <ToolbarMenu>
                    <ToolbarMenuItem dataTestId="edit-callout-card" icon="edit" isActive={false} label="Edit" onClick={handleToolbarEdit} />
                    <ToolbarMenuSeparator />
                    <ToolbarMenuItem icon="snippet" isActive={false} label="Snippet" />
                </ToolbarMenu>
            </ActionToolbar>
        </>
    );
}

export class CalloutNode extends BaseCalloutNode {
    static kgMenu = [{
        label: 'Callout',
        desc: 'Info boxes that stand out',
        Icon: CalloutCardIcon,
        insertCommand: INSERT_CALLOUT_COMMAND,
        matches: ['callout']
    }];

    getIcon() {
        return CalloutCardIcon;
    }

    constructor(dataset = {}, key) {
        super(dataset, key);
    }

    createDOM() {
        return document.createElement('div');
    }

    getDataset() {
        return super.getDataset();
    }

    updateDOM() {
        return false;
    }

    decorate() {
        return (
            <KoenigCardWrapper nodeKey={this.getKey()}>
                <CalloutNodeComponent
                    backgroundColor={this.__backgroundColor}
                    emojiValue={this.__emojiValue}
                    hasEmoji={this.__hasEmoji}
                    nodeKey={this.getKey()}
                    text={this.__text}
                />
            </KoenigCardWrapper>
        );
    }
}

export const $createCalloutNode = (dataset) => {
    return new CalloutNode(dataset);
};

export function $isCalloutNode(node) {
    return node instanceof CalloutNode;
}
