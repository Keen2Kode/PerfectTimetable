import type { CourseView } from "./courseView";

export class CourseColours {

    private colours: string[];
    private i: number = 0;
    private map: Map<number, string> = new Map<number, string>();
    constructor(courseViews: CourseView[]) {
        this.colours = [

            '#D38FFF',
            '#C267FF',
            '#B649FA',
            '#A832EA',
        ];
        for (const courseView of courseViews) {
            this.setColour(courseView.id);
        }

    }

    private setColour(courseId: number): void {
        const colour:string = this.colours[this.i];
        this.i = (this.i + 1) % this.colours.length;
        this.map.set(courseId, colour);
    }
}