import * as React from 'react';
import { Bem } from 'shared/util/styles';
import './EdHtml.scss';

const bem = new Bem('ed-html');

interface EdHtmlProps {
	innerHTML: string;
	textWrap?: boolean;
}

export default function EdHtml(props: EdHtmlProps) {
	let innerHTML = props.innerHTML
		.replace(/<ul>/g, '<div><ul>')
		.replace(/<\/ul>/g, '</ul></div>')
		.replace(/<ol>/g, '<div><ol>')
		.replace(/<\/ol>/g, '</ol></div>');
	if (props.textWrap) innerHTML = innerHTML.replace(/\n/g, '<br>');
	return <div className={bem.b()} dangerouslySetInnerHTML={{ __html: innerHTML }} />;
}
