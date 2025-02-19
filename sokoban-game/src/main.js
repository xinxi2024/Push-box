import './style.css'
import { Game } from './components/Game'
import { levels } from './levels'

// 初始化游戏实例
const game = new Game();

// 绑定UI事件
document.getElementById('undo-btn').addEventListener('click', () => game.undoMove());
document.getElementById('restart-btn').addEventListener('click', () => game.restartLevel());
document.getElementById('hint-btn').addEventListener('click', () => game.showHint());

// 主题切换
document.getElementById('theme-select').addEventListener('change', (e) => {
    const theme = e.target.value;
    document.body.className = `theme-${theme}`;
    game.theme = theme;
});

// 更新游戏状态显示
function updateGameInfo() {
    document.getElementById('current-level').textContent = game.currentLevel + 1;
    document.getElementById('step-count').textContent = game.steps;
}

// 初始化游戏
function initGame() {
    // 加载第一关
    game.loadLevel(0);
    updateGameInfo();

    // 注册游戏状态更新回调
    game.onStateChange = updateGameInfo;
}

// 启动游戏
initGame();
