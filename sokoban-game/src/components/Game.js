// 游戏主组件
export class Game {
    constructor() {
        this.player = { x: 0, y: 0 };
        this.boxes = [];
        this.targets = [];
        this.walls = [];
        this.currentLevel = 0;
        this.moves = [];
        this.steps = 0;
        this.theme = 'classic';
        this.gameContainer = document.getElementById('game-container');
        this.init();
    }

    init() {
        // 初始化游戏
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.render();
    }

    render() {
        if (!this.gameContainer) return;

        // 清空游戏容器
        this.gameContainer.innerHTML = '';

        // 创建游戏地图
        const gameMap = document.createElement('div');
        gameMap.className = `game-map theme-${this.theme}`;

        // 获取地图尺寸
        const mapWidth = Math.max(...this.walls.map(w => w.x)) + 1;
        const mapHeight = Math.max(...this.walls.map(w => w.y)) + 1;

        // 创建地图网格
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';

                // 添加墙壁
                if (this.walls.some(wall => wall.x === x && wall.y === y)) {
                    cell.classList.add('wall');
                }

                // 添加目标点
                if (this.targets.some(target => target.x === x && target.y === y)) {
                    cell.classList.add('target');
                }

                // 添加箱子
                const box = this.boxes.find(box => box.x === x && box.y === y);
                if (box) {
                    const boxElement = document.createElement('div');
                    boxElement.className = 'box';
                    if (this.targets.some(target => target.x === x && target.y === y)) {
                        boxElement.classList.add('on-target');
                    }
                    cell.appendChild(boxElement);
                }

                // 添加玩家
                if (this.player.x === x && this.player.y === y) {
                    const playerElement = document.createElement('div');
                    playerElement.className = 'player';
                    cell.appendChild(playerElement);
                }

                // 添加特殊道具
                const specialItem = this.specialItems?.find(item => item.x === x && item.y === y);
                if (specialItem) {
                    const itemElement = document.createElement('div');
                    itemElement.className = `special-item ${specialItem.type}`;
                    cell.appendChild(itemElement);
                }

                gameMap.appendChild(cell);
            }
        }

        this.gameContainer.appendChild(gameMap);
    }

    handleKeyPress(event) {
        const key = event.key;
        let dx = 0;
        let dy = 0;

        switch(key) {
            case 'ArrowUp':
                dy = -1;
                break;
            case 'ArrowDown':
                dy = 1;
                break;
            case 'ArrowLeft':
                dx = -1;
                break;
            case 'ArrowRight':
                dx = 1;
                break;
            case 'z':
            case 'Z':
                this.undoMove();
                return;
            case 'r':
            case 'R':
                this.restartLevel();
                return;
            case 'h':
            case 'H':
                this.showHint();
                return;
            case 'Escape':
                this.toggleMenu();
                return;
            default:
                return;
        }

        this.movePlayer(dx, dy);
    }

    movePlayer(dx, dy) {
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;

        // 检查是否可以移动
        if (this.canMove(newX, newY)) {
            // 保存移动前的状态
            this.saveMoveState();

            // 更新玩家位置
            this.player.x = newX;
            this.player.y = newY;
            this.steps++;

            // 检查是否完成关卡
            if (this.checkLevelComplete()) {
                this.onLevelComplete();
            }

            // 更新游戏显示
            this.render();

            // 触发状态更新回调
            if (this.onStateChange) {
                this.onStateChange();
            }
        }
    }

    canMove(x, y) {
        // 检查是否撞墙
        if (this.isWall(x, y)) return false;

        // 检查是否有箱子
        const box = this.getBoxAt(x, y);
        if (box) {
            const newBoxX = x + (x - this.player.x);
            const newBoxY = y + (y - this.player.y);

            // 检查箱子是否可以被推动
            if (this.isWall(newBoxX, newBoxY) || this.getBoxAt(newBoxX, newBoxY)) {
                return false;
            }

            // 移动箱子
            box.x = newBoxX;
            box.y = newBoxY;
        }

        return true;
    }

    isWall(x, y) {
        return this.walls.some(wall => wall.x === x && wall.y === y);
    }

    getBoxAt(x, y) {
        return this.boxes.find(box => box.x === x && box.y === y);
    }

    checkLevelComplete() {
        return this.targets.every(target => 
            this.boxes.some(box => box.x === target.x && box.y === target.y)
        );
    }

    saveMoveState() {
        this.moves.push({
            player: { ...this.player },
            boxes: this.boxes.map(box => ({ ...box })),
            steps: this.steps
        });
    }

    undoMove() {
        if (this.moves.length === 0) return;

        const lastMove = this.moves.pop();
        this.player = lastMove.player;
        this.boxes = lastMove.boxes;
        this.steps = lastMove.steps;

        // 更新游戏显示
        this.render();
        if (this.onStateChange) {
            this.onStateChange();
        }
    }

    restartLevel() {
        // 重置当前关卡
        this.loadLevel(this.currentLevel);
        this.render();
    }

    showHint() {
        // 实现提示功能
        console.log('提示功能待实现');
        // TODO: 后续可以添加自动寻路算法来实现提示功能
    }

    toggleMenu() {
        // 实现菜单切换功能
        const menu = document.getElementById('game-menu');
        if (menu) {
            menu.classList.toggle('hidden');
        }
    }

    onLevelComplete() {
        // 显示完成提示
        alert(`恭喜！完成第${this.currentLevel + 1}关！\n使用了${this.steps}步`);

        // 保存进度
        localStorage.setItem('currentLevel', this.currentLevel);
        localStorage.setItem('bestSteps', Math.min(
            parseInt(localStorage.getItem('bestSteps') || Infinity),
            this.steps
        ));

        // 加载下一关
        if (this.currentLevel < levels.length - 1) {
            this.loadLevel(this.currentLevel + 1);
        } else {
            alert('恭喜！你已经完成了所有关卡！');
        }
    }

    loadLevel(levelIndex) {
        // 从关卡数据中获取当前关卡
        const level = levels[levelIndex];
        if (!level) return;

        // 重置游戏状态
        this.currentLevel = levelIndex;
        this.moves = [];
        this.steps = 0;
        this.boxes = [];
        this.targets = [];
        this.walls = [];

        // 解析地图数据
        const map = level.map;
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                const cell = map[y][x];
                switch (cell) {
                    case '#':
                        this.walls.push({ x, y });
                        break;
                    case '@':
                        this.player = { x, y };
                        break;
                    case '$':
                        this.boxes.push({ x, y });
                        break;
                    case '.':
                        this.targets.push({ x, y });
                        break;
                    case '*':
                        this.boxes.push({ x, y });
                        this.targets.push({ x, y });
                        break;
                    case '+':
                        this.player = { x, y };
                        this.targets.push({ x, y });
                        break;
                }
            }
        }

        // 处理特殊道具
        if (level.specialItems) {
            this.specialItems = level.specialItems.map(item => ({ ...item }));
        } else {
            this.specialItems = [];
        }

        // 触发状态更新
        if (this.onStateChange) {
            this.onStateChange();
        }
    }
}


