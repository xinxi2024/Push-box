import './style.css'
import { Game } from './components/Game.js'

// 声明 game 变量在全局作用域
let game;

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    
    // 绑定按钮事件
    document.getElementById('undo-btn')?.addEventListener('click', () => {
        game.undoMove();
    });

    document.getElementById('restart-btn')?.addEventListener('click', () => {
        game.restartLevel();
    });

    document.getElementById('rules-btn')?.addEventListener('click', () => {
        game.showRules();
    });

    document.getElementById('theme-select')?.addEventListener('change', (e) => {
        game.changeTheme(e.target.value);
    });

    // 添加触摸控制
    document.querySelectorAll('.touch-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const direction = btn.dataset.direction;
            switch(direction) {
                case 'up':
                    game.movePlayer(0, -1);
                    break;
                case 'down':
                    game.movePlayer(0, 1);
                    break;
                case 'left':
                    game.movePlayer(-1, 0);
                    break;
                case 'right':
                    game.movePlayer(1, 0);
                    break;
            }
        });
    });

    // 初始化游戏状态显示
    updateGameInfo();
    // 注册游戏状态更新回调
    game.onStateChange = updateGameInfo;
});

// 更新游戏状态显示
function updateGameInfo() {
    document.getElementById('current-level').textContent = game.currentLevel + 1;
    document.getElementById('step-count').textContent = game.steps;
}
