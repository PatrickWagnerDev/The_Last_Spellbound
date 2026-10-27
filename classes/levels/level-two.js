const LEVEL_TWO = {
    levelNumber: 2,
    mapRows: [
        [XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX],
        [XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, 61, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX],
        [XX, 62, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, 61, XX, XX, XX, XX, XX, XX, XX, XX, 70, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, 60, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, 62, XX, XX, XX, XX, XX, XX],
        [XX, 35, XX, 35, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, 32, 33, 33, 34, XX, XX, 35, XX, XX, 35, XX, XX, 32, 33, 33, 33, 34, XX, 32, 34, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, 32, 33, 34, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, 71, XX, XX, XX],
        [XX, XX, XX, XX, XX, 35, XX, XX, 35, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, 71, XX, XX, XX, XX, XX, XX, XX, XX, XX, 35, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, 70, XX, XX, XX, 35, XX, XX, XX, XX, XX, XX, XX, 32, 34, XX, XX, 32, 34, XX, XX, XX, XX, 32, 33, 34, XX, XX],
        [XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, 35, XX, XX, XX, XX, XX, XX, 32, 33, 33, 33, 33, 34, XX, 32, 33, 34, XX, XX, XX, XX, XX, XX, XX, XX, XX, 71, XX, XX, XX, XX, XX, XX, XX, XX, 32, 33, 33, 33, 33, 34, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX],
        [XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, 71, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, 32, 33, 34, XX, XX, 32, 34, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX],
        [XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, 32, 33, 33, 34, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, 35, XX, XX, XX, XX, XX, XX, XX, XX, XX, 35, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX],
        [XX, 69, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, 70, XX, XX, XX, XX, XX, XX, XX, 70, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, 70, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, 71, XX, XX, XX, XX, XX, XX, 70, XX, XX, 61, XX, 70, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, 63, XX, XX, XX],
        [12, 12, 12, 12, 13, XX, XX, 11, 12, 12, 12, 12, 12, 12, 13, XX, XX, 11, 12, 12, 12, 12, 13, XX, XX, 11, 12, 12, 12, 12, 12, 12, 12, 13, XX, XX, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13, XX, XX, 11, 12, 12, 12, 12, 12, 12, 12, 12, 13, XX, 14, XX, XX, 14, XX, XX, 14, XX, XX, 11, 12, 12, 12, 12, 12]
    ],
    backgroundLayers: [
        { path: './assets/image/07-forest-backgrounds/PNG/Forest2/Small/bg.png', factor: 0 },
        { path: './assets/image/07-forest-backgrounds/PNG/Forest2/Small/trees_rocks3.png', factor: 0 },
        { path: './assets/image/07-forest-backgrounds/PNG/Forest2/Small/rocks_trees.png', factor: 0.25 },
        { path: './assets/image/07-forest-backgrounds/PNG/Forest2/Small/trees1.png', factor: 0.5 },
        { path: './assets/image/07-forest-backgrounds/PNG/Forest2/Small/rocks_trees_small.png', factor: 0.75 }
    ],
    music: 'levelTwoMusic',
    getNextLevel: () => LEVEL_TWO_BOSS
};
