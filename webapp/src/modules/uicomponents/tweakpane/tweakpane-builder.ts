import {FolderApi, Pane} from "tweakpane";
import {assertExhaustive} from "@modules/utilities/assert-exhaustive.ts";
import type {ContainerApi} from "@tweakpane/core";
import type {Bindable} from "@tweakpane/core/src/common/binding/target.ts";
import type {PickerLayout} from "@tweakpane/core/src/common/params.ts";

export function twPane(
    container: HTMLElement,
    title: string,
    build: (pane: TwPaneBuilder) => void,
): Pane {
    const builder = new TwPaneBuilder(container);
    builder.setTitle(title);
    build(builder);
    return builder._build();
}


class TwPaneBuilder {

    private readonly container: HTMLElement;
    private title: string = "Pane";
    private children: (TwFolderBuilder)[] = [];
    private onChangeAction: () => void = () => undefined

    constructor(container: HTMLElement) {
        this.container = container;
    }

    public setTitle(title: string) {
        this.title = title;
    }

    public onChange(action: () => void) {
        this.onChangeAction = action;
    }

    public folder(title: string, build: (folder: TwFolderBuilder) => void) {
        const builder = new TwFolderBuilder();
        builder.setTitle(title);
        build(builder);
        this.children.push(builder);
    }

    public _build(): Pane {

        const pane = new Pane({
            container: this.container,
            document: this.container.ownerDocument,
            title: this.title,
        });

        pane.element.style.width = "100%";
        const paneStyles = this.container.ownerDocument.defaultView?.getComputedStyle(pane.element);
        const backgroundColor = paneStyles && paneStyles.backgroundColor !== "rgba(0, 0, 0, 0)"
            ? paneStyles.backgroundColor
            : paneStyles?.getPropertyValue("--cnt-bg").trim();
        if (backgroundColor) {
            this.container.ownerDocument.body.style.backgroundColor = backgroundColor;
            this.container.style.backgroundColor = backgroundColor;
        }

        for (const child of this.children) {
            if (child instanceof TwFolderBuilder) {
                child._build(pane);
            }
        }

        pane.on("change", this.onChangeAction);

        return pane;
    }

}

class TwFolderBuilder {

    private title: string = "Folder";
    private children: (TwFolderBuilder | TwButtonBuilder | TwNumberBuilder | TwColorBuilder)[] = [];


    public setTitle(title: string) {
        this.title = title;
    }

    public folder(title: string, build: (folder: TwFolderBuilder) => void) {
        const builder = new TwFolderBuilder();
        builder.setTitle(title);
        build(builder);
        this.children.push(builder);
    }

    public button(title: string, build: (button: TwButtonBuilder) => void) {
        const builder = new TwButtonBuilder();
        builder.setTitle(title);
        build(builder);
        this.children.push(builder);
    }

    public number(label: string, build: (number: TwNumberBuilder) => void) {
        const builder = new TwNumberBuilder();
        builder.setLabel(label);
        build(builder);
        this.children.push(builder);
    }

    public color(label: string, build: (number: TwColorBuilder) => void) {
        const builder = new TwColorBuilder();
        builder.setLabel(label);
        build(builder);
        this.children.push(builder);
    }

    public _build(parent: ContainerApi) {
        const folder = parent.addFolder({title: this.title});
        for (const child of this.children) {
            if (child instanceof TwNumberBuilder) {
                child._build(folder);
                continue;
            }
            if (child instanceof TwFolderBuilder) {
                child._build(folder);
                continue;
            }
            if (child instanceof TwButtonBuilder) {
                child._build(folder);
                continue;
            }
            if (child instanceof TwColorBuilder) {
                child._build(folder);
                continue;
            }
            assertExhaustive(child);
        }
    }

}

class TwButtonBuilder {

    private title: string = "Click Me!";
    private label: string | undefined = undefined;
    private onClickAction: () => void = () => undefined

    public setTitle(title: string) {
        this.title = title
    }

    public setLabel(label: string | undefined) {
        this.label = label
    }

    public onClick(action: () => void) {
        this.onClickAction = action
    }

    public _build(parent: FolderApi) {
        const button = parent.addButton({
            title: this.title,
            label: this.label,
        })
        button.on("click", this.onClickAction);
    }

}

class TwNumberBuilder {

    private boundObj: { obj: Bindable, key: string | number | symbol } | undefined = undefined;
    private label: string = "Number";
    private min: number | undefined = undefined;
    private max: number | undefined = undefined;
    private step: number | undefined = undefined;

    public bind<O extends Bindable, Key extends keyof O>(object: O, key: Key) {
        this.boundObj = {obj: object, key: key};
    }

    public setLabel(label: string) {
        this.label = label;
    }

    public setRange(min: number | undefined, max: number | undefined) {
        this.min = min;
        this.max = max;
    }

    public setStep(step: number | undefined) {
        this.step = step;
    }

    public _build(parent: FolderApi) {
        if (!this.boundObj) {
            throw new Error("No object bound for " + this.label + "!");
        }
        parent.addBinding(
            this.boundObj.obj,
            this.boundObj.key as any,
            {
                label: this.label,
                min: this.min,
                max: this.max,
                step: this.step,
            },
        );
    }

}

class TwColorBuilder {

    private boundObj: { obj: Bindable, key: string | number | symbol } | undefined = undefined;
    private label: string = "Color";
    private picker: PickerLayout = "popup";
    private alpha: boolean = false

    public bind<O extends Bindable, Key extends keyof O>(object: O, key: Key) {
        this.boundObj = {obj: object, key: key};
    }

    public setLabel(label: string) {
        this.label = label;
    }

    public setPicker(picker: PickerLayout) {
        this.picker = picker;
    }

    public withAlpha(alpha: boolean) {
        // note: initial value of bound property must have some alpha set
        this.alpha = alpha;
    }

    public _build(parent: FolderApi) {
        if (!this.boundObj) {
            throw new Error("No object bound for " + this.label + "!");
        }
        parent.addBinding(
            this.boundObj.obj,
            this.boundObj.key as any,
            {
                label: this.label,
                picker: this.picker,
                view: "color",
                color: {
                    alpha: this.alpha
                }
            },
        );
    }
}