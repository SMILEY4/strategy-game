export function useFullscreen(elementId: string) {

    function enterFullscreen() {
        const element = document.getElementById(elementId)
        const fullScreenElement = document.fullscreenElement
        if(!fullScreenElement || fullScreenElement.id !== elementId) {
            if(element) {
                element.requestFullscreen()
            }
        }
    }

    function exitFullscreen() {
        document.exitFullscreen()
    }

    return [enterFullscreen, exitFullscreen];
}
