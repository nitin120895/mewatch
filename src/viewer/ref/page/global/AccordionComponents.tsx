import * as React from 'react';
import { Bem } from 'shared/util/styles';
import Accordion from 'ref/responsive/component/Accordion';
import AccordionItem from 'ref/responsive/component/AccordionItem';

import './AccordionComponents.scss';

const AccordionTypes = {
	ImplicitChild: 1,
	ImplicitChildren: 2,
	SingleChild: 3,
	MultipleChildren: 4,
	TransitionChild: 5
};

interface AccordionComponentsProps {}

interface State {
	activeKeys: Map<any, any>;
	multiActiveKeys: Set<any>;
}

const bem = new Bem('accordion-components');

class AccordionComponents extends React.Component<AccordionComponentsProps, any> {
	state: State = {
		activeKeys: new Map([
			[AccordionTypes.ImplicitChild, '1'],
			[AccordionTypes.ImplicitChildren, '1'],
			[AccordionTypes.SingleChild, '1'],
			[AccordionTypes.MultipleChildren, '1'],
			[AccordionTypes.TransitionChild, '1']
		]),
		multiActiveKeys: new Set(['1', '2', '3'])
	};

	private toggleActiveAccordion = (accordionId: any, activeKey: string) => {
		const currentActive = this.state.activeKeys.get(accordionId);
		if (currentActive === activeKey) {
			this.state.activeKeys.set(accordionId, undefined);
		} else {
			this.state.activeKeys.set(accordionId, activeKey);
		}

		this.setState({ activeKeys: this.state.activeKeys });
	};

	private toggleMultiActive = (key: any) => {
		if (this.state.multiActiveKeys.has(key)) {
			this.state.multiActiveKeys.delete(key);
		} else {
			this.state.multiActiveKeys.add(key);
		}

		this.setState({ multiActiveKeys: this.state.multiActiveKeys });
	};

	render() {
		return (
			<div className={bem.b()}>
				<h2>Accordion Components</h2>
				<p>Various different types accordions in different usages. Click on them to open/close</p>
				<p>
					An implicitly wrapped child is one not manually wrapped in an <code>{'<AccordionItem />'}</code>. Accordion
					will automatically wrap each child in this case.
				</p>
				<p>
					An explicitly wrapped child is one that has been manually wrapped in a <code>{`<AccordionItem />`}</code>. The
					accordion element will not wrap this but will pass through properties such as custom transitions
				</p>
				<div className={bem.e('accordion-example')}>
					<h4 className="title">Implicitly wrapped accordion child</h4>
					<pre>
						<span>{`<Accordion activeKey="1">`}</span>
						<br />
						<span>{`\t<div key="1"/>`}</span>
						<br />
						<span>{`</Accordion>`}</span>
					</pre>
					<div className={bem.e('buttons')}>
						<button className="btn" onClick={() => this.toggleActiveAccordion(AccordionTypes.ImplicitChild, '1')}>
							Toggle
						</button>
					</div>
					<Accordion className={bem.e('accordion')} activeKey={this.state.activeKeys.get(AccordionTypes.ImplicitChild)}>
						<div className={bem.e('accordion-item-example')} key="1">
							Here is some content
						</div>
					</Accordion>
				</div>
				<div className={bem.e('accordion-example')}>
					<h4 className="title">Implicitly wrapped accordion children</h4>
					<pre>
						<span>{`<Accordion activeKey="1">`}</span>
						<br />
						<span>{`\t<div key="1"/>`}</span>
						<br />
						<span>{`\t<div key="2"/>`}</span>
						<br />
						<span>{`\t<div key="3"/>`}</span>
						<br />
						<span>{`</Accordion>`}</span>
					</pre>
					<div className={bem.e('buttons')}>
						<button className="btn" onClick={() => this.toggleActiveAccordion(AccordionTypes.ImplicitChildren, '1')}>
							Toggle Accordion 1
						</button>
						<button className="btn" onClick={() => this.toggleActiveAccordion(AccordionTypes.ImplicitChildren, '2')}>
							Toggle Accordion 2
						</button>
						<button className="btn" onClick={() => this.toggleActiveAccordion(AccordionTypes.ImplicitChildren, '3')}>
							Toggle Accordion 3
						</button>
					</div>
					<Accordion
						className={bem.e('accordion')}
						activeKey={this.state.activeKeys.get(AccordionTypes.ImplicitChildren)}
						oneAtATime
					>
						<div className={bem.e('accordion-item-example')} key="1">
							Here is some content #1
						</div>
						<div className={bem.e('accordion-item-example')} key="2">
							Here is some content #2
						</div>
						<div className={bem.e('accordion-item-example')} key="3">
							Here is some content #3
						</div>
					</Accordion>
				</div>
				<div className={bem.e('accordion-example')}>
					<h4 className="title">Explicitly wrapped Single Child Accordion</h4>
					<pre>
						<span>{`<Accordion activeKey="1">`}</span>
						<br />
						<span>{`\t<AccordionItem key="1"/>`}</span>
						<br />
						<span>{`\t\t<div />`}</span>
						<br />
						<span>{`\t<AccordionItem />`}</span>
						<br />
						<span>{`</Accordion>`}</span>
					</pre>
					<div className={bem.e('buttons')}>
						<button className="btn" onClick={() => this.toggleActiveAccordion(AccordionTypes.SingleChild, '1')}>
							Toggle
						</button>
					</div>
					<Accordion className={bem.e('accordion')}>
						<AccordionItem
							className={bem.e('accordion-item-example')}
							key="1"
							open={this.state.activeKeys.get(AccordionTypes.SingleChild) === '1'}
						>
							<div>Here is some content</div>
						</AccordionItem>
					</Accordion>
				</div>
				<div className={bem.e('accordion-example')}>
					<h4 className="title">Explicitly wrapped Multi-child accordion items</h4>
					<pre>
						<span>{`<Accordion activeKey="1">`}</span>
						<br />
						<span>{`\t<AccordionItem key="1"/>`}</span>
						<br />
						<span>{`\t\t<div />`}</span>
						<br />
						<span>{`\t<AccordionItem />`}</span>
						<br />
						<span>{`\t<AccordionItem key="2"/>`}</span>
						<br />
						<span>{`\t\t<div />`}</span>
						<br />
						<span>{`\t<AccordionItem />`}</span>
						<br />
						<span>{`\t<AccordionItem key="3"/>`}</span>
						<br />
						<span>{`\t\t<div />`}</span>
						<br />
						<span>{`\t<AccordionItem />`}</span>
						<br />
						<span>{`</Accordion>`}</span>
					</pre>
					<div className={bem.e('buttons')}>
						<button className="btn" onClick={() => this.toggleActiveAccordion(AccordionTypes.MultipleChildren, '1')}>
							Toggle Accordion 1
						</button>
						<button className="btn" onClick={() => this.toggleActiveAccordion(AccordionTypes.MultipleChildren, '2')}>
							Toggle Accordion 2
						</button>
						<button className="btn" onClick={() => this.toggleActiveAccordion(AccordionTypes.MultipleChildren, '3')}>
							Toggle Accordion 3
						</button>
					</div>
					<Accordion
						className={bem.e('accordion')}
						activeKey={this.state.activeKeys.get(AccordionTypes.MultipleChildren)}
						oneAtATime
					>
						<AccordionItem className={bem.e('accordion-item-example')} key="1">
							<div>Here is some content #1</div>
						</AccordionItem>
						<AccordionItem className={bem.e('accordion-item-example')} key="2">
							<div>Here is some content #2</div>
						</AccordionItem>
						<AccordionItem className={bem.e('accordion-item-example')} key="3">
							<div>Here is some content #3</div>
						</AccordionItem>
					</Accordion>
				</div>
				<div className={bem.e('accordion-example')}>
					<h4 className="title">Explicitly wrapped Multi-child multi-open-close accordion items</h4>
					<p>This handles each accordion items open/close props separately and not through the accordion</p>
					<pre>
						<span>{`<Accordion>`}</span>
						<br />
						<span>{`\t<AccordionItem key="1" open={isOpenDictionary.has("1")}/>`}</span>
						<br />
						<span>{`\t\t<div />`}</span>
						<br />
						<span>{`\t<AccordionItem />`}</span>
						<br />
						<span>{`\t<AccordionItem key="2" open={isOpenDictionary.has("2")}/>`}</span>
						<br />
						<span>{`\t\t<div />`}</span>
						<br />
						<span>{`\t<AccordionItem />`}</span>
						<br />
						<span>{`\t<AccordionItem key="3" open={isOpenDictionary.has("3")}/>`}</span>
						<br />
						<span>{`\t\t<div />`}</span>
						<br />
						<span>{`\t<AccordionItem />`}</span>
						<br />
						<span>{`</Accordion>`}</span>
					</pre>
					<div className={bem.e('buttons')}>
						<button className="btn" onClick={() => this.toggleMultiActive('1')}>
							Toggle Accordion 1
						</button>
						<button className="btn" onClick={() => this.toggleMultiActive('2')}>
							Toggle Accordion 2
						</button>
						<button className="btn" onClick={() => this.toggleMultiActive('3')}>
							Toggle Accordion 3
						</button>
					</div>
					<Accordion className={bem.e('accordion')}>
						<AccordionItem
							className={bem.e('accordion-item-example')}
							key="1"
							open={this.state.multiActiveKeys.has('1')}
						>
							<div>Here is some content #1</div>
						</AccordionItem>
						<AccordionItem
							className={bem.e('accordion-item-example')}
							key="2"
							open={this.state.multiActiveKeys.has('2')}
						>
							<div>Here is some content #2</div>
						</AccordionItem>
						<AccordionItem
							className={bem.e('accordion-item-example')}
							key="3"
							open={this.state.multiActiveKeys.has('3')}
						>
							<div>Here is some content #3</div>
						</AccordionItem>
					</Accordion>
				</div>
				<div className={bem.e('accordion-example')}>
					<h4 className="title">Custom Transition Accordion</h4>
					<pre>
						<span>{`<Accordion activeKey="1" onOpenTransitionClass="my-open-transition" onCloseTransitionClass="my-close-transition">`}</span>
						<br />
						<span>{`\t<div key="1"/>`}</span>
						<br />
						<span>{`</Accordion>`}</span>
					</pre>
					<div className={bem.e('buttons')}>
						<button className="btn" onClick={() => this.toggleActiveAccordion(AccordionTypes.TransitionChild, '1')}>
							Toggle
						</button>
					</div>
					<Accordion
						className={bem.e('accordion')}
						onCloseTransitionClass={bem.e('custom-close')}
						onOpenTransitionClass={bem.e('custom-open')}
						activeKey={this.state.activeKeys.get(AccordionTypes.TransitionChild)}
					>
						<div className={bem.e('accordion-item-example')} key="1">
							Here is some content
						</div>
					</Accordion>
				</div>
				<div className={bem.e('big-block')} />
			</div>
		);
	}
}

export default AccordionComponents;
