import { expect, assert } from 'chai';
import TestAsyncPlayer from './TestAsyncPlayer';
import { TestPlayerState } from './TestPlayer';

describe('Player testing', () => {
	const VIDEO_DURATION = 2 * 60 * 60;
	const INTERVAL = 0.25;
	let player: TestAsyncPlayer;

	// Runs before every test in this file
	beforeEach(function() {
		player = new TestAsyncPlayer(1, VIDEO_DURATION, INTERVAL);
	});

	// Runs after every test in this file
	afterEach(function() {
		player = undefined;
	});

	describe('Player initialization', () => {
		it('Default state should be VOID', () => {
			expect(player.currentState).to.equal(TestPlayerState.VOID);
		});

		it('Default current time should be 0', () => {
			expect(player.currentTime).to.equal(0);
		});

		it('Default playback rate interval should be 0', () => {
			expect(player.playbackRateHandlerInterval).to.equal(0.25);
		});

		it('Default video metadata should be undefined', () => {
			assert.isUndefined(player.metadata);
		});
	});

	describe('Player workflow', () => {
		it('Player state has PLAYING state when current tim changed', done => {
			const finalState = TestPlayerState.PLAYING;
			const expectedTime = 2 * INTERVAL;
			player.currentTimeChange.push(time => {
				if (time >= expectedTime) {
					expect(player.currentState).to.be.equal(finalState);
					done();
				}
			});
			player.source = 'video.mp4';
			player.play();
		});

		it('Player time should be greater or equal than set before play', done => {
			const expectedTime = 10 * INTERVAL;
			player.currentTimeChange.push(time => {
				expect(time).to.equal(expectedTime);
				done();
			});
			player.source = 'video.mp4';
			player.currentTime = expectedTime;
			player.play();
		});

		it('Player has ERROR state when play without source', done => {
			player.currentStateChange.push(state => {
				expect(state).to.equal(TestPlayerState.ERROR);
				done();
			});

			player.play();
		});

		it('Player has ERROR state when seek before metadata is loaded', done => {
			const expectedTime = 10 * INTERVAL;
			player.currentStateChange.push(state => {
				expect(state).to.equal(TestPlayerState.ERROR);
				done();
			});

			player.seek(expectedTime);
		});
	});
});
