import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  className?: string;
  content: string;
}

const RenderMarkdown = ({ className = 'prose', content }: Props): JSX.Element => (
  <ReactMarkdown
    className={className}
    /* eslint-disable-next-line react/no-children-prop */
    children={content}
    remarkPlugins={[remarkGfm]}
    linkTarget={(href) => (href.startsWith('#') ? undefined : '_blank')}
    components={{
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      input: ({ node, ...props }) => (
        <input className="-ml-1 mr-1 h-4 w-4 text-indigo-600 border-gray-300 rounded" {...props} />
      ),
    }}
  />
);

export default RenderMarkdown;
