import { expect } from 'chai';
import { Bem } from '../styles';

// Tests
describe('styles', () => {
	// Bem class name generating utility class
	describe('Bem', () => {
		const blockName = 'b';
		const bem = new Bem(blockName);

		it('should generate only the block name', () => {
			expect(bem.b()).to.equal('b');
		});
		it('should generate the block name + block name with a single modifier', () => {
			expect(bem.b('m')).to.equal('b b--m');
		});
		it('should generate the block name + block name with each modifier', () => {
			expect(bem.b('m1', 'm2', 'm3')).to.equal('b b--m1 b--m2 b--m3');
		});
		it('should generate the block name + block name combined with non empty/undefined modifiers', () => {
			expect(bem.b(['m1', 'm2', 'm3', '', undefined])).to.equal('b b--m1 b--m2 b--m3');
		});
		it('should generate the block name + block name combined with each enabled modifier', () => {
			expect(bem.b({ m1: false, m2: true, m3: undefined })).to.equal('b b--m2');
		});
		it('should generate the block name + block name combined with all varied types of modifier', () => {
			expect(bem.b('m1', 'm2', ['m3', 'm4'], { m5: true, m6: false })).to.equal('b b--m1 b--m2 b--m3 b--m4 b--m5');
		});

		it('should generate only the block element name', () => {
			expect(bem.e('e')).to.equal('b__e');
		});
		it('should generate the block element name + block element name with a single modifier', () => {
			expect(bem.e('e', 'm')).to.equal('b__e b__e--m');
		});
		it('should generate the block element name + block element name with each modifier', () => {
			expect(bem.e('e', 'm1', 'm2', 'm3')).to.equal('b__e b__e--m1 b__e--m2 b__e--m3');
		});
		it('should generate the block element name + block element name combined with non empty/undefined modifiers', () => {
			expect(bem.e('e', ['m1', 'm2', 'm3', '', undefined])).to.equal('b__e b__e--m1 b__e--m2 b__e--m3');
		});
		it('should generate the block element name + block element name combined with each enabled modifier', () => {
			expect(bem.e('e', { m1: false, m2: true, m3: undefined })).to.equal('b__e b__e--m2');
		});
		it('should generate the block element name + block element name combined with all varied types of modifier', () => {
			expect(bem.e('e', 'm1', 'm2', ['m3', 'm4'], { m5: true, m6: false })).to.equal(
				'b__e b__e--m1 b__e--m2 b__e--m3 b__e--m4 b__e--m5'
			);
		});

		const modifierName = 'm';
		it('should generate the block name + block name with a single modifier', () => {
			expect(bem.b(modifierName)).to.equal('b b--m');
		});
		it('should generate the block name + block name with a single modifier', () => {
			expect(bem.b({ [modifierName]: true })).to.equal('b b--m');
		});
		it('should generate the block element name + block element name with a single modifier', () => {
			expect(bem.e('e', modifierName)).to.equal('b__e b__e--m');
		});
		it('should generate the block element name + block element name with a single modifier', () => {
			expect(bem.e('e', { [modifierName]: true })).to.equal('b__e b__e--m');
		});
	});
});
