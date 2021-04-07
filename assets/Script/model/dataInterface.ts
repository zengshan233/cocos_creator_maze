//方块类型
interface BoxType {
    none: number;      //无效位置
    wall: number;      //墙面
    land: number;      //地面
    box: number;       //箱子
    end: number;       //出口
    hero: number;      //人物
}

//声音类型
interface SoundType {
    button: String;      //按钮点击音效
    gamewin: String;     //过关音效
    move: String;        //人物移动音效
    pushbox: String;     //推箱子音效
    wrong: String;       //错误音效
}


//移动位置
interface MovePostion {
    row: number;      //行
    col: number;      //列
}

export { BoxType, SoundType, MovePostion }