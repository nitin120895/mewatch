export class EventsQueue {
	private events: any[];
	private counter = 0;
	private processQueue: () => void;

	constructor(processQueue) {
		this.events = [];
		this.processQueue = processQueue;
	}

	enqueue(event) {
		const item = { ...event, index: this.counter++ };
		this.events.push(item);

		/* 
      Aim: Process queue one item at a time
      If item added is not the only item in queue, wait for it's turn on dequeue
		*/

		if (this.events.length === 1) {
			this.processQueue();
		}
	}

	dequeue() {
		if (this.isEmpty()) return;

		const dequeuedItem = this.events.shift();

		// Process next item in queue
		if (!this.isEmpty()) {
			this.processQueue();
		}

		return dequeuedItem;
	}

	peek() {
		if (this.isEmpty()) return;
		return this.events[0];
	}

	isEmpty() {
		return this.events.length === 0;
	}
}
