import React from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/theme-tomorrow';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface Props {
  editable?: boolean;
  value: string;
  onChange?: (v: string) => void;
}

const Editor = ({ editable = true, value, onChange = noop }: Props): JSX.Element => (
  <AceEditor
    className={editable ? '' : 'pointer-events-none'}
    width="100%"
    mode="html"
    theme="tomorrow"
    name="email-editor"
    fontSize={14}
    showPrintMargin={false}
    showGutter={true}
    highlightActiveLine={true}
    value={value}
    onChange={onChange}
    setOptions={{
      readOnly: !editable,
      useWorker: false,
      showLineNumbers: true,
      tabSize: 2,
      scrollPastEnd: true,
    }}
  />
);

export default Editor;
