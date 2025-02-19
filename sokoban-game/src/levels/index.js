// 关卡数据
export const levels = [
    {
        id: 1,
        name: '简单入门',
        map: [
            '#####',
            '#@$.#',
            '#####'
        ],
        difficulty: 1
    },
    {
        id: 2,
        name: '基础训练',
        map: [
            '######',
            '#@ $.#',
            '#  $.#',
            '######'
        ],
        difficulty: 2
    },
    {
        id: 3,
        name: '进阶挑战',
        map: [
            '########',
            '#  @   #',
            '# $$  .#',
            '#  $  .#',
            '#    . #',
            '########'
        ],
        difficulty: 3,
        specialItems: [
            {
                type: 'key',
                x: 3,
                y: 2
            },
            {
                type: 'lockedBox',
                x: 4,
                y: 2
            }
        ]
    }
];

// 图例说明：
// # - 墙壁
// @ - 玩家
// $ - 箱子
// . - 目标点
// * - 箱子在目标点上
// + - 玩家在目标点上

// 难度系数说明：
// 1 - 简单（适合新手）
// 2 - 中等（需要一定思考）
// 3 - 困难（需要较多步骤和策略）
// 4 - 专家（复杂布局，特殊机制）
// 5 - 大师（终极挑战）

// 特殊道具类型：
// key - 钥匙
// lockedBox - 上锁的箱子
// portal - 传送门
// ice - 冰面
