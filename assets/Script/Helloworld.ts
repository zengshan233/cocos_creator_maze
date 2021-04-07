import { boxType, sound, MoveDirection } from './model/dataType';
import { MovePostion } from './model/dataInterface';
const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Node)
    gameLayer: cc.Node;

    @property(cc.Node)
    gameControlLayer: cc.Node;

    @property(cc.SpriteAtlas)
    itemImgAtlas: cc.SpriteAtlas;

    @property
    allWidth: number = 300;

    @property
    allHeight: number = 1280;

    @property
    allRow: number = 8;

    @property
    allCol: number = 8;

    @property
    allLevelCount: number = 0;

    @property
    allLevelConfig: Object = {};

    @property
    boxW: number;

    @property
    boxH: number;

    @property
    heroRow: number;

    @property
    heroCol: number;

    @property
    landArrays: Array<Array<cc.Node>>;  //地图容器

    @property
    palace: Array<Array<number>>;  //初始化地图数据

    @property
    moveStart: MovePostion;

    @property
    moveEnd: MovePostion;

    @property
    bestMap: Array<MovePostion>;



    start() {
        this.initData();
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.keyboardCallBack, this);
    }

    initData() {
        //初始化数据

        this.allLevelCount = 0;
        this.allLevelConfig = {};
        cc.loader.loadRes('levelConfig.json', function (err, object) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('object', object);
            this.allLevelConfig = object.json.level;
            this.allLevelCount = object.json.levelCount;
            this.createLevelLayer(1);
        }.bind(this));
    }

    createLevelLayer(level: number) {
        let levelContent = this.allLevelConfig[level].content;
        this.allRow = this.allLevelConfig[level].allRow;
        this.allCol = this.allLevelConfig[level].allCol;
        this.heroRow = this.allLevelConfig[level].heroRow;
        this.heroCol = this.allLevelConfig[level].heroCol;

        // 计算方块大小
        this.boxW = this.allWidth / this.allCol;
        this.boxH = this.boxW;
        console.log('boxW', this.boxW)
        // 计算起始坐标
        let sPosX: number = -(this.allWidth / 2) + (this.boxW / 2);
        let sPosY: number = (this.allWidth / 2) - (this.boxW / 2);

        // 计算坐标的偏移量，运算规则（宽铺满，设置高的坐标）
        let offset: number = 0;
        if (this.allRow > this.allCol) {
            offset = ((this.allRow - this.allCol) * this.boxH) / 2;
        }
        else {
            offset = ((this.allRow - this.allCol) * this.boxH) / 2;
        }
        this.landArrays = [];
        this.palace = [];
        for (let i = 0; i < this.allRow; i++) {
            this.landArrays[i] = [];
            this.palace[i] = [];
        }
        for (let i = 0; i < this.allRow; i++) {    //每行
            for (let j = 0; j < this.allCol; j++) {     //每列
                let x = sPosX + (this.boxW * j);
                let y = sPosY - (this.boxH * i) + offset;
                let node: cc.Node = this.createBoxItem(i, j, levelContent[i * this.allCol + j], cc.v3(x, y));
                this.landArrays[i][j] = node;
                node.width = this.boxW;
                node.height = this.boxH;
            }
        }
        // 显示人物
        this.setLandFrame(this.heroRow, this.heroCol, boxType.hero);
    }

    // 创建元素
    createBoxItem(row: number, col: number, type: number, pos: cc.Vec3): cc.Node {
        let node = new cc.Node();
        let sprite = node.addComponent(cc.Sprite);
        let button = node.addComponent(cc.Button);
        sprite.spriteFrame = this.itemImgAtlas.getSpriteFrame("p" + type);
        node.parent = this.gameControlLayer;
        node.position = pos;
        if (type == boxType.wall) {  //墙面，//墙面，命名为wall_row_col
            node.name = "wall_" + row + "_" + col;
            node.attr({ "_type_": type });
        }
        else if (type == boxType.none) {  //空白区域,//墙面，命名为none_row_col
            node.name = "none_" + row + "_" + col;
            node.attr({ "_type_": type });
        }
        else {  //游戏界面，命名为land_row_col
            node.name = "land_" + row + "_" + col;
            node.attr({ "_type_": type });
            node.attr({ "_row_": row });
            node.attr({ "_col_": col });
            button.interactable = true;
            button.target = node;
        }
        this.palace[row][col] = type;

        return node;
    }

    keyboardCallBack(event) {
        console.log('event.keyCode', event.keyCode)
        //终点位置
        switch (event.keyCode) {
            case 37:
                this.moveEnd = { row: this.heroRow, col: this.heroCol - 1 };
                break;
            case 38:
                this.moveEnd = { row: this.heroRow - 1, col: this.heroCol };
                break;
            case 39:
                this.moveEnd = { row: this.heroRow, col: this.heroCol + 1 };
                break;
            case 40:
                this.moveEnd = { row: this.heroRow + 1, col: this.heroCol };
                break;
        }


        //起点位置
        this.moveStart = { row: this.heroRow, col: this.heroCol };
        console.log('moveEnd', this.moveEnd);
        //判断终点类型
        let endType = this.palace[this.moveEnd.row][this.moveEnd.col];
        console.log("endType", endType);
        console.log("palace", this.palace);
        if (endType == boxType.end) {
            console.log("you win~~~~!!!!!!");
        } else
            if (endType == boxType.land) {  //是空地或目标点，直接计算运动轨迹
                this.getPath(this.moveStart, 0, []);
                this.runHero();
            }
    }

    //人物运动
    runHero() {
        let array = [];
        array.push(cc.callFunc(function () {
            this.setLandFrame(this.moveEnd.row, this.moveEnd.col, boxType.hero);
            this.curStepNum += 1;
            this.setLandFrame(this.moveStart.row, this.moveStart.col, boxType.land);
            this.playSound(sound.move);
            //刷新步数
            this.setCurNum();
        }, this));
        array.push(cc.callFunc(function () {
            //刷新人物所在位置
            this.heroRow = this.moveEnd.row;
            this.heroCol = this.moveEnd.col;
            //设置地图是否可点击
        }, this));

        if (array.length >= 2) {  //避免出错
            this.gameLayer.runAction(cc.sequence(array));
        }

    }

    //curPos记录当前坐标，step记录步数
    getPath(curPos: MovePostion, step: number, result: any) {
        //判断是否到达终点
        // if ((curPos.row == this.moveEnd.row) && (curPos.col == this.moveEnd.col)) {
        //     if (step < this.minPath) {
        //         this.bestMap = [];
        //         for (let i = 0; i < result.length; i++) {
        //             this.bestMap.push(result[i]);
        //         }
        //         this.minPath = step; //如果当前抵达步数比最小值小，则修改最小值
        //         result = [];
        //     }
        // }

        //递归
        for (let i = (curPos.row - 1); i <= (curPos.row + 1); i++) {
            for (let j = (curPos.col - 1); j <= (curPos.col + 1); j++) {
                //越界跳过
                if ((i < 0) || (i >= this.allRow) || (j < 0) || (j >= this.allCol)) {
                    continue;
                }
                if ((i != curPos.row) && (j != curPos.col)) {//忽略斜角
                    continue;
                }
                else if (this.palace[i][j] && ((this.palace[i][j] == boxType.land) || (this.palace[i][j] == boxType.none))) {
                    let tmp = this.palace[i][j];
                    this.palace[i][j] = boxType.wall;  //标记为不可走

                    //保存路线
                    let r: MovePostion = { row: i, col: j };
                    result.push(r);
                    this.getPath(r, step + 1, result);
                    this.palace[i][j] = tmp;  //尝试结束，取消标记
                    result.pop();
                }
            }
        }
    }

    //设置地板图片
    setLandFrame(row: number, col: number, type: number) {
        let land: cc.Node = this.landArrays[row][col];
        if (land) {
            land.getComponent(cc.Sprite).spriteFrame = this.itemImgAtlas.getSpriteFrame("p" + type);
            land.width = this.boxW;
            land.height = this.boxH;
        }
    }

    //显示当前步数
    setCurNum() {
        // this.curNum.getComponent(cc.Label).string = this.curStepNum;
    }

    //播放音效
    playSound(name: string) {
        cc.loader.loadRes(name, cc.AudioClip, function (err, clip) {
            var audioID = cc.audioEngine.playEffect(clip, false);
        });
    }

}
