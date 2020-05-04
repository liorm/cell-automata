

export class PerfCounter {
    m_lastPrintTime = 0;
    m_count = 0;

    constructor(
        private m_title: string,
        private m_windowDuration = 1000) {
    }

    doCount() {
        ++this.m_count;

        const now = performance.now();
        const duration = now - this.m_lastPrintTime;
        if (duration >= this.m_windowDuration) {
            console.log("%s: %f", this.m_title, this.m_count * 1000 / duration);
            this.m_lastPrintTime = now;
            this.m_count = 0;
        }
    }
}

export class PerfWindow {
    private m_items: { duration: number, time: number }[] = [];
    private m_lastPrintTime = 0;

    constructor(
        private m_title: string,
        private m_avgWindow = 1000
    ) {

    }

    add(duration: number) {
        this.m_items.push({
            duration: duration,
            time: performance.now()
        });
        
        this.print(false);
    }

    print(forcePrint = true) {
        const now = performance.now();

        if (now - this.m_lastPrintTime < 1000 && !forcePrint) {
            return;
        }
        this.m_lastPrintTime = now;

        while (this.m_items.length > 0 && now - this.m_items[0].time > this.m_avgWindow)
            this.m_items.shift();

        let avg = 0;
        if ( this.m_items.length > 0) {
            const sum = this.m_items.reduce((a, b) => a + b.duration, 0);
            avg = sum / this.m_items.length;
        }

        console.log("%s: %f", this.m_title, avg);
    }
}
