import { levels } from '../levels/index.js';

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
        this.gameContainer = document.getElementById('game-board');
        this.init();
        // 自动加载第一关并重新开始
        this.loadLevel(0);
        this.restartLevel();
        this.initLevelSelect();
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
        const gameBoard = document.createElement('div');
        gameBoard.className = 'game-board';

        // 获取地图尺寸
        const mapWidth = Math.max(...this.walls.map(w => w.x)) + 1;
        const mapHeight = Math.max(...this.walls.map(w => w.y)) + 1;

        // 设置网格布局
        gameBoard.style.gridTemplateColumns = `repeat(${mapWidth}, 45px)`;
        gameBoard.style.gridTemplateRows = `repeat(${mapHeight}, 45px)`;

        // 创建所有单元格
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
                    const targetElement = document.createElement('div');
                    targetElement.className = 'target';
                    cell.appendChild(targetElement);
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

                gameBoard.appendChild(cell);
            }
        }

        this.gameContainer.appendChild(gameBoard);
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

    toggleMenu() {
        // 实现菜单切换功能
        const menu = document.getElementById('game-menu');
        if (menu) {
            menu.classList.toggle('hidden');
        }
    }

    onLevelComplete() {
        // 保存完成状态
        const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
        if (!completedLevels.includes(this.currentLevel)) {
            completedLevels.push(this.currentLevel);
            localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
        }

        // 显示完成提示
        alert(`恭喜！完成第${this.currentLevel + 1}关！\n使用了${this.steps}步`);

        // 更新选关界面
        this.initLevelSelect();
    }

    loadLevel(levelIndex) {
        const level = levels[levelIndex];
        if (!level) return;

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
                    case '#': this.walls.push({ x, y }); break;
                    case '@': this.player = { x, y }; break;
                    case '$': this.boxes.push({ x, y }); break;
                    case '.': this.targets.push({ x, y }); break;
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

    showRules() {
        const rules = levels[this.currentLevel]?.tutorial?.steps || [
            '使用方向键(↑↓←→)移动角色(@)',
            '将箱子($)推到目标点(.)上',
            '箱子只能推，不能拉',
            '按Z键可以撤销上一步',
            'R键可以重新开始本关'
        ];

        const tutorialDiv = document.createElement('div');
        tutorialDiv.className = 'tutorial-overlay';
        tutorialDiv.innerHTML = `
            <div class="tutorial-content">
                <h3>游戏规则</h3>
                <ul>
                    ${rules.map(step => `<li>${step}</li>`).join('')}
                </ul>
                <button class="tutorial-close">关闭</button>
            </div>
        `;

        document.body.appendChild(tutorialDiv);

        tutorialDiv.querySelector('.tutorial-close').addEventListener('click', () => {
            tutorialDiv.remove();
        });
    }

    initLevelSelect() {
        // 创建选关对话框
        const levelSelect = document.getElementById('level-select');
        const levelGrid = levelSelect.querySelector('.level-grid');
        const closeBtn = levelSelect.querySelector('.close-btn');

        // 清空现有的关卡按钮
        levelGrid.innerHTML = '';

        // 生成关卡按钮，所有关卡都可选择
        levels.forEach((level, index) => {
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            btn.textContent = level.id;
            
            // 检查关卡是否完成，只标记完成状态
            if (this.isLevelCompleted(index)) {
                btn.classList.add('completed');
            }

            // 所有关卡都可以点击
            btn.addEventListener('click', () => {
                this.loadLevel(index);
                levelSelect.classList.add('hidden');
                // 重新开始选择的关卡
                this.restartLevel();
            });

            levelGrid.appendChild(btn);
        });

        // 绑定关闭按钮
        closeBtn.addEventListener('click', () => {
            levelSelect.classList.add('hidden');
        });

        // 绑定选关按钮
        document.getElementById('level-select-btn').addEventListener('click', () => {
            levelSelect.classList.remove('hidden');
        });
    }

    isLevelCompleted(levelIndex) {
        const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
        return completedLevels.includes(levelIndex);
    }
}


