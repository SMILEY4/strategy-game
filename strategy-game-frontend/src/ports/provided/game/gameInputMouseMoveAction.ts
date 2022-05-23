export interface GameInputMouseMoveAction {
    perform: (dx: number, dy: number, x: number, y: number, leftBtnDown: boolean) => void
}