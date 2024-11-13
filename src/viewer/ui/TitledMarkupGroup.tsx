import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

interface TitledMarkupGroupProps {
	title: string;
	children?: React.ReactElement<any>;
	indent?: string;
}

/**
 * `renderToString` doesn't render void tags self closing as they are never expected to contain children
 */
const VOID_TAGS = [
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'keygen',
	'link',
	'menuitem',
	'meta',
	'param',
	'source',
	'track',
	'wbr'
];
const VOID_TAG_LOOKUP = {};
VOID_TAGS.forEach(t => (VOID_TAG_LOOKUP[t] = true));

/**
 * Titled Markup Group
 *
 * Presents a titled group containing a printed/readable version of the JSX markup code as
 * well as the rendered interactive JSX markup elements.
 *
 * Useful for demonstrating how to use other components.
 */
export default class TitledMarkupGroup extends React.Component<TitledMarkupGroupProps, any> {
	static defaultProps = {
		indent: '  '
	};

	constructor(props) {
		super(props);
	}

	private convertJsxToString(children) {
		const nodes = renderToStaticMarkup(children)
			.substring(1)
			.split('><');
		const numNodes = nodes.length;
		const indentStr = this.props.indent;
		let jsx = '';
		let indent = 0;
		for (let i = 0; i < numNodes; i++) {
			const node = nodes[i];
			const closingTag = node.startsWith('/');
			const tagName = node.split(/[^A-Za-z]/)[closingTag ? 1 : 0];
			if (closingTag) {
				indent--;
				jsx = jsx.substring(0, jsx.length - indentStr.length);
			} else if (!node.endsWith('/') && !VOID_TAG_LOOKUP[tagName] && !~node.indexOf('</')) {
				indent++;
			}
			jsx += `<${node}${i < numNodes - 1 ? '>' : ''}\n${indentStr.repeat(indent)}`;
		}
		return jsx;
	}

	render() {
		const { title, children } = this.props;
		const jsx = this.convertJsxToString(children as React.ReactElement<any>);
		return (
			<fieldset className="fs">
				<legend>{title}</legend>
				<pre>{jsx}</pre>
				{children}
			</fieldset>
		);
	}
}
