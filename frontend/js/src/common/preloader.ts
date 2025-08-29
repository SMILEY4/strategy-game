export namespace Preloader {

    export function loadImages(images: string[]): Promise<void> {
        return Promise.all(images.map(loadImage)).then(undefined);
    }

    function loadImage(url: string): Promise<void> {
        return fetch(url)
            .then(response => response.blob())
            .then(data => {
                const img = new Image();
                img.src = URL.createObjectURL(data);
            })
            .catch(undefined);
    }

}