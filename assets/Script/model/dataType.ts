import { BoxType, SoundType } from './dataInterface';

enum MoveDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

let boxType: BoxType = {
    land: 0,
    wall: 1,
    none: 2,
    box: 4,
    end: 5,
    hero: 6,
}

//音效名称
let sound: SoundType = {
    button: "Texture/sound/button",
    gamewin: "Texture/sound/gamewin",
    move: "Texture/sound/move",
    pushbox: "Texture/sound/pushbox",
    wrong: "Texture/sound/wrong",
}

export { boxType, sound, MoveDirection }