player.onChat("maze", function () {
    let originZ = 0
    let originX = 0
    let stackC: number[] = []
    let stackR: number[] = []
    player.say("(1/4) Initializing Maze...")

    for (let k = 0; k <= PHYS_SIZE - 1; k++) {
        for (let l = 0; l <= PHYS_SIZE - 1; l++) {
            maze[k][l] = 1
        }
    }
    // Goal box
    for (let r = 3; r <= 5; r++) {
        for (let c = 27; c <= 29; c++) { maze[r][c] = 0; }
    }

    // 3 Holes for 3 major paths
    // West
    maze[3][26] = 0
    // South
    maze[6][29] = 0
    // North (to outer rim)
    maze[2][27] = 0
    // Start box
    maze[31][1] = 0
    maze[30][1] = 0
    player.say("(2/4) Creating Maze...")
    stackR.push(29)
    stackC.push(1)
    maze[29][1] = 0
    while (stackR.length > 0) {
        let nC: number[] = []
        let nR: number[] = []
        cr = stackR.pop()
        cc = stackC.pop()
        if (cr - 2 > 0 && maze[cr - 2][cc] == 1) {
            nR.push(cr - 2)
            nC.push(cc)
        }
        if (cr + 2 < PHYS_SIZE - 1 && maze[cr + 2][cc] == 1) {
            nR.push(cr + 2)
            nC.push(cc)
        }
        if (cc - 2 > 0 && maze[cr][cc - 2] == 1) {
            nR.push(cr)
            nC.push(cc - 2)
        }
        if (cc + 2 < PHYS_SIZE - 1 && maze[cr][cc + 2] == 1) {
            nR.push(cr)
            nC.push(cc + 2)
        }
        if (nR.length > 0) {
            stackR.push(cr)
            stackC.push(cc)
            idx = Math.floor(Math.random() * nR.length)
            nextR = nR[idx]
            nextC = nC[idx]
            maze[(cr + nextR) / 2][(cc + nextC) / 2] = 0
            maze[nextR][nextC] = 0
            stackR.push(nextR)
            stackC.push(nextC)
        }
        iterations += 1
        if (iterations % 100 == 0) {
            loops.pause(50)
        }
    }

    player.say("(3/4) Adding Patterns...")
    //1. Add diagonals
    for (let index = 0; index < 4; index++) {
        s = 25 - Math.floor(Math.random() * 4) * 2
        e = 5 + Math.floor(Math.random() * 4) * 2
        steps = 3 + Math.floor(Math.random() * 3)
        for (let index = 0; index < steps; index++) {
            if (!(isProtected(s, e)) && !(isProtected(s - 2, e + 2))) {
                maze[s - 1][e] = 0
                maze[s - 2][e] = 0
                maze[s - 2][e + 1] = 0
                maze[s - 2][e + 2] = 0
            }
            s += 0 - 2
            e += 2
        }
    }
    //2. Add straights
    for (let index = 0; index < 3; index++) {
        sr = 5 + Math.floor(Math.random() * 10) * 2
        for (let f = 5; f < 25; f++) {
            if (!isProtected(sr, f)) maze[sr][f] = 0;
        }
    }
    for (let v = 1; v < PHYS_SIZE; v += 2) {
        for (let g = 1; g < PHYS_SIZE; g += 2) {
            if (isProtected(v, g)) continue;


            let w1 = maze[v - 1][g];
            let w2 = maze[v + 1][g];
            let w3 = maze[v][g - 1];
            let w4 = maze[v][g + 1];


            if ((w1 + w2 + w3 + w4) === 3 && Math.random() < 0.35) {
                let cR: number[] = [];
                let cC: number[] = [];
                if (w1 === 1) { cR.push(v - 1); cC.push(g); }
                if (w2 === 1) { cR.push(v + 1); cC.push(g); }
                if (w3 === 1) { cR.push(v); cC.push(g - 1); }
                if (w4 === 1) { cR.push(v); cC.push(g + 1); }


                let p = Math.floor(Math.random() * cR.length);
                if (!isProtected(cR[p], cC[p])) maze[cR[p]][cC[p]] = 0;
            }
        }
    }

    player.say("(4/4) Building Maze...")
    offset = Math.floor(PHYS_SIZE / 2)
    blocks.fill(
        AIR,
        world(originX - offset, originY, originZ - offset),
        world(originX + offset, originY + 3, originZ + offset),
        FillOperation.Replace
    )

    loops.pause(500)
    blocks.fill(
        STONE,
        world(originX - offset, originY - 1, originZ - offset),
        world(originX + offset, originY - 1, originZ + offset),
        FillOperation.Replace
    )
    loops.pause(100)
    blocks.place(GREEN_WOOL, world(originX + 15, originY - 1, originZ - 15))
    blocks.fill(
        RED_WOOL,
        world(originX - 13, originY - 1, originZ + 11),
        world(originX - 11, originY - 1, originZ + 13),
        FillOperation.Replace
    )
    let wallBlocks = [STONE, STONE_BRICKS, MOSSY_STONE_BRICKS, CRACKED_STONE_BRICKS, COBBLESTONE];
    for (let m = 0; m <= PHYS_SIZE - 1; m++) {
        startJ = -1
        for (let n = 0; n <= PHYS_SIZE; n++) {
            if (n < PHYS_SIZE && maze[m][n] == 1) {
                if (startJ == -1) {
                    startJ = n
                }
            } else {
                if (startJ != -1) {
                    blocks.fill(
                        wallBlocks[Math.floor(Math.random() * wallBlocks.length)],
                        world(originX - offset + m, originY, originZ - offset + startJ),
                        world(originX - offset + m, originY, originZ - offset + (n - 1)),
                        FillOperation.Replace
                    )
                    startJ = -1
                }
            }
        }
        loops.pause(20)
    }
    agent.teleport(world(originX + 15, originY, originZ - 15), WEST)
    player.say("Maze ready!")
})
function isProtected(r: number, c: number) {
    if (r <= 0 || r >= PHYS_SIZE - 1 || c <= 0 || c >= PHYS_SIZE - 1) {
        return true
    }
    if (r <= 7 && c >= 25) {
        return true
    }
    if (r >= 29 && c <= 3) {
        return true
    }
    return false
}
let startJ = 0
let offset = 0
let sr = 0
let steps = 0
let e = 0
let s = 0
let iterations = 0
let nextC = 0
let nextR = 0
let idx = 0
let cc = 0
let cr = 0


//Preallocate memory
let maze: number[][] = []
let MAZE_SIZE = 16
let PHYS_SIZE = MAZE_SIZE * 2 + 1 // 33
let originY = -60


for (let index = 0; index < PHYS_SIZE; index++) {
    let row: number[] = []
    for (let index = 0; index < PHYS_SIZE; index++) { row.push(1) }
    maze.push(row)
}


//Agent's memory
let agentMap1D: number[] = [];
for (let i = 0; i < 1089; i++) {
    agentMap1D.push(2); // 2 = Unknown
}


// Flood Map for BFS (1D flat structure for performance)
let floodMap1D: number[] = [];
for (let i = 0; i < 256; i++) {
    floodMap1D.push(255); // 255 = Max distance
}


//Pre-allocate BFS Queue for 16x16 grid (Max capacity 260)
let qR: number[] = [];
let qC: number[] = [];
for (let i = 0; i < 260; i++) { qR.push(0); qC.push(0); }


// Global Direction Vectors (0: West, 1: North, 2: East, 3: South)
let dr = [-1, 0, 1, 0];
let dc = [0, -1, 0, 1];

let isRunActive = false;

player.onChat("explore", function () {
    player.say("Initializing Map...");

    // 1. Reset Maps
    for (let i = 0; i < PHYS_SIZE; i++) {
        for (let j = 0; j < PHYS_SIZE; j++) {
            let idx = i * 33 + j;
            if (i === 0 || i === PHYS_SIZE - 1 || j === 0 || j === PHYS_SIZE - 1) {
                agentMap1D[idx] = 1; // Borders
            } else {
                agentMap1D[idx] = 2; // Unknown
            }
        }
    }

    let r = 31;
    let c = 1;
    let dir = 0;
    let steps = 0;

    let runState = 1; // 1: Explore Center, 2: Explore Start, 3: Speed Run
    let prevTargetState = 0; // Trigger floodfill on state change

    isRunActive = true;

    player.say("(1/2) Exploring Maze...");

    while (isRunActive) {
        let atGoal = ((r === 3 || r === 5) && (c === 27 || c === 29));
        let atStart = (r === 31 && c === 1);

        if (runState === 1 && atGoal) {
            runState = 2;
            player.say("(1/2) Exploring Complete! Returning to start...");
        } else if (runState === 2 && atStart) {
            runState = 3;
            player.say("(2/2) Final Run to goal...");
        } else if (runState === 3 && atGoal) {
            isRunActive = false;
            player.say("Finished! Steps taken: " + steps);
            break;
        }

        let fDir = dir;
        let rDir = (dir + 1) % 4;
        let lDir = (dir + 3) % 4;

        let wallsChanged = false;

        if (runState !== 3) {
            let oldF = agentMap1D[(r + dr[fDir]) * 33 + (c + dc[fDir])];
            let oldR = agentMap1D[(r + dr[rDir]) * 33 + (c + dc[rDir])];
            let oldL = agentMap1D[(r + dr[lDir]) * 33 + (c + dc[lDir])];

            let hasWallF = agent.detect(AgentDetection.Block, SixDirection.Forward);
            agentMap1D[(r + dr[fDir]) * 33 + (c + dc[fDir])] = hasWallF ? 1 : 0;

            let hasWallR = agent.detect(AgentDetection.Block, SixDirection.Right);
            agentMap1D[(r + dr[rDir]) * 33 + (c + dc[rDir])] = hasWallR ? 1 : 0;

            let hasWallL = agent.detect(AgentDetection.Block, SixDirection.Left);
            agentMap1D[(r + dr[lDir]) * 33 + (c + dc[lDir])] = hasWallL ? 1 : 0;

            wallsChanged = (agentMap1D[(r + dr[fDir]) * 33 + (c + dc[fDir])] !== oldF) ||
                (agentMap1D[(r + dr[rDir]) * 33 + (c + dc[rDir])] !== oldR) ||
                (agentMap1D[(r + dr[lDir]) * 33 + (c + dc[lDir])] !== oldL);
        }

        let needsFloodFill = false;
        if (runState !== prevTargetState) {
            needsFloodFill = true;
            prevTargetState = runState;
        }

        if (wallsChanged || needsFloodFill) {
            for (let i = 0; i < 256; i++) { floodMap1D[i] = 255; }
            let head = 0;
            let tail = 0;

            if (runState === 1 || runState === 3) {
                // Goal is Opposite Corner 3x3 Box
                floodMap1D[1 * 16 + 13] = 0; qR[tail] = 1; qC[tail] = 13; tail++;
                floodMap1D[1 * 16 + 14] = 0; qR[tail] = 1; qC[tail] = 14; tail++;
                floodMap1D[2 * 16 + 13] = 0; qR[tail] = 2; qC[tail] = 13; tail++;
                floodMap1D[2 * 16 + 14] = 0; qR[tail] = 2; qC[tail] = 14; tail++;
            } else if (runState === 2) {
                // Goal is Start (Logical 15, 0 from Physical 31, 1)
                floodMap1D[15 * 16 + 0] = 0; qR[tail] = 15; qC[tail] = 0; tail++;
            }

            while (head < tail) {
                let clr = qR[head];
                let clc = qC[head];
                head++;

                let pr = clr * 2 + 1;
                let pc = clc * 2 + 1;

                for (let i = 0; i < 4; i++) {
                    let nlr = clr + dr[i];
                    let nlc = clc + dc[i];

                    if (nlr >= 0 && nlr < 16 && nlc >= 0 && nlc < 16) {
                        let wallR = pr + dr[i];
                        let wallC = pc + dc[i];

                        // Phase 1 & 2: Optimistic (treat Unknowns as Air). Phase 3: Pessimistic (ONLY Known Air)
                        let isOpen = (runState === 3) ? (agentMap1D[wallR * 33 + wallC] === 0) : (agentMap1D[wallR * 33 + wallC] !== 1);

                        if (isOpen) {
                            let currIdx = clr * 16 + clc;
                            let nextIdx = nlr * 16 + nlc;
                            let newDist = floodMap1D[currIdx] + 1;

                            if (floodMap1D[nextIdx] > newDist) {
                                floodMap1D[nextIdx] = newDist;
                                qR[tail] = nlr;
                                qC[tail] = nlc;
                                tail++;
                            }
                        }
                    }
                }
            }
        }

        let bestVal = 9999;
        let bestDir = dir;
        let lr = Math.floor((r - 1) / 2);
        let lc = Math.floor((c - 1) / 2);

        let checkDirs = [dir, (dir + 1) % 4, (dir + 3) % 4, (dir + 2) % 4];

        for (let i = 0; i < 4; i++) {
            let testDir = checkDirs[i];
            let wallR = r + dr[testDir];
            let wallC = c + dc[testDir];
            let nlr = lr + dr[testDir];
            let nlc = lc + dc[testDir];

            if (nlr >= 0 && nlr < 16 && nlc >= 0 && nlc < 16) {
                // Phase 1, 2: optimistic, phase 3: pessimistic
                let isOpen = (runState === 3) ? (agentMap1D[wallR * 33 + wallC] === 0) : (agentMap1D[wallR * 33 + wallC] !== 1);

                if (isOpen) {
                    let nextIdx = nlr * 16 + nlc;
                    if (floodMap1D[nextIdx] < bestVal) {
                        bestVal = floodMap1D[nextIdx];
                        bestDir = testDir;
                    }
                }
            }
        }

        let turnDiff = (bestDir - dir + 4) % 4;
        if (turnDiff === 1) { agent.turn(TurnDirection.Right); }
        else if (turnDiff === 2) { agent.turn(TurnDirection.Right); agent.turn(TurnDirection.Right); }
        else if (turnDiff === 3) { agent.turn(TurnDirection.Left); }

        dir = bestDir;
        agent.move(SixDirection.Forward, 2);

        r = r + dr[dir] * 2;
        c = c + dc[dir] * 2;
        steps++;

        loops.pause(50); // Faster during final run
    }
});
