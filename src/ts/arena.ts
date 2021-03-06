
export abstract class AutomataArena {
    get width() {
        return this.m_width;
    }
    get height() {
        return this.m_height;
    }
    get depth() {
        return this.m_depth;
    }
    abstract get maxAge(): number;

    private m_ages: number[];
    private m_nextAges: number[];

    protected constructor(private m_width,
                          private m_height,
                          private m_depth
    ) {
        this.m_ages = new Array<number>(this.width * this.height * this.depth).fill(0);
        this.m_nextAges = new Array<number>(this.width * this.height * this.depth).fill(0);
    }

    /**
     * Maps x,y,z location to a cell age.
     */
    getCellAge(x: number, y: number, z: number): number {
        const idx = this.toIndex(x, y, z);
        if (idx < 0 || idx >= this.m_ages.length)
            return 0;
        return this.m_ages[idx];
    }

    setCellAge(x, y, z, age) {
        const idx = this.toIndex(x, y, z);
        if (idx < 0 || idx >= this.m_ages.length)
            return;
        this.m_ages[idx] = age;
    }

    protected toIndex(x: number, y: number, z: number): number {
        return z * this.width * this.height + y * this.width + x;
    }

    /**
     * Perform an evolution step.
     */
    evolve() {
        this.evolveLogic(this.m_nextAges);

        const tempAges = this.m_nextAges;
        this.m_nextAges = this.m_ages;
        this.m_ages = tempAges;
    }

    protected abstract evolveLogic(resultsArray: number[]): void;
}

export class GameOfLifeArena extends AutomataArena {
    constructor() {
        super(100, 100, 1);
    }

    get maxAge(): number {
        return 1;
    }
    private readonly m_survivalRange = [2, 3];
    private readonly m_birthRange = [3];

    private isCellAlive(x, y, z) {
        if ( x < 0 || y < 0 || z < 0)
            return 0;

        if ( x >= this.width || y >= this.height || z >= this.depth )
            return 0;

        return this.getCellAge(x, y, z) > 0 ? 1 : 0;
    }

    protected evolveLogic(resultsArray: number[]): void {
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                // Count friends
                const livingCells =
                    this.isCellAlive(x - 1, y - 1, 0) +
                    this.isCellAlive(x - 1, y + 0, 0) +
                    this.isCellAlive(x - 1, y + 1, 0) +
                    this.isCellAlive(x + 0, y - 1, 0) +
                    this.isCellAlive(x + 0, y + 1, 0) +
                    this.isCellAlive(x + 1, y - 1, 0) +
                    this.isCellAlive(x + 1, y + 0, 0) +
                    this.isCellAlive(x + 1, y + 1, 0);

                const age = this.getCellAge(x, y, 0);

                let newAge = age - 1;
                if (age > 0) {
                    if (this.m_survivalRange.indexOf(livingCells) >= 0)
                        newAge = age + 1;
                } else {
                    if (this.m_birthRange.indexOf(livingCells) >= 0)
                        newAge = 1;
                }

                if (newAge < 0)
                    newAge = 0;
                if (newAge > this.maxAge)
                    newAge = this.maxAge;

                resultsArray[this.toIndex(x, y, 0)] = newAge;
            }
        }
    }
}

export class Arena3D extends AutomataArena {
    constructor() {
        super(50, 50, 50);
    }

    get maxAge(): number {
        return 60;
    }
    private readonly m_survivalRange = [2, 3];
    private readonly m_birthRange = [3];

    private isCellAlive(x, y, z) {
        if ( x < 0 || y < 0 || z < 0)
            return 0;

        if ( x >= this.width || y >= this.height || z >= this.depth )
            return 0;

        return this.getCellAge(x, y, z) > 0 ? 1 : 0;
    }

    protected evolveLogic(resultsArray: number[]): void {
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                for (let z = 0; z < this.depth; ++z) {

                    // Count friends
                    let livingCells = 0;
                    for (let slice = -1; slice <= 1; ++slice) {
                        const sliceCells =
                            this.isCellAlive(x - 1, y - 1, z + slice) +
                            this.isCellAlive(x - 1, y + 0, z + slice) +
                            this.isCellAlive(x - 1, y + 1, z + slice) +
                            this.isCellAlive(x + 0, y - 1, z + slice) +
                            this.isCellAlive(x + 0, y + 1, z + slice) +
                            this.isCellAlive(x + 1, y - 1, z + slice) +
                            this.isCellAlive(x + 1, y + 0, z + slice) +
                            this.isCellAlive(x + 1, y + 1, z + slice);

                        livingCells += sliceCells;

                        if (slice !== 0) {
                            livingCells += this.isCellAlive(x, y, z + slice);
                        }
                    }

                    const age = this.getCellAge(x, y, z);

                    let newAge = age - 1;
                    if (age > 0) {
                        if (this.m_survivalRange.indexOf(livingCells) >= 0)
                            newAge = age + 1;
                    } else {
                        if (this.m_birthRange.indexOf(livingCells) >= 0)
                            newAge = 1;
                    }

                    if (newAge < 0)
                        newAge = 0;
                    if (newAge > this.maxAge)
                        newAge = this.maxAge;

                    resultsArray[this.toIndex(x, y, z)] = newAge;
                }
            }
        }
    }
}
