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
            this.assignColour(courseView.id);
        }

    }

    getColour(courseId: number): string {
        const existing = this.map.get(courseId);
        if (existing) {
            return existing;
        }

        return this.assignColour(courseId);
    }

    asMap(): ReadonlyMap<number, string> {
        return this.map;
    }

    private assignColour(courseId: number): string {
        const colour:string = this.colours[this.i];
        this.i = (this.i + 1) % this.colours.length;
        this.map.set(courseId, colour);
        return colour;
    }
}
