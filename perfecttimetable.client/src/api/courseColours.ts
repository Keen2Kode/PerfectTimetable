import Color from 'color';
import type { CourseView } from "./courseView";

export class CourseColours {

    private colours: string[];
    private i: number = 0;
    private map: Map<number, string> = new Map<number, string>();
    constructor(courseViews: CourseView[]) {
        this.colours = [
            '#FBCFE8', // pastel pink
            '#C7D2FE', // pastel indigo
            '#BFDBFE', // pastel blue
            '#FDE68A', // pastel yellow
            '#BBF7D0', // pastel green
            '#F5D0C5', // pastel coral
            '#E9D5FF', // pastel purple
            '#F8E9A1', // pastel gold
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

    peekNextColour(): string {
        return this.colours[this.i];
    }

    asMap(): ReadonlyMap<number, string> {
        return this.map;
    }

    getColourWithAlpha(courseId: number, alpha: number): string {
        return Color(this.getColour(courseId)).alpha(alpha).rgb().string();
    }

    private assignColour(courseId: number): string {
        const colour:string = this.colours[this.i];
        this.i = (this.i + 1) % this.colours.length;
        this.map.set(courseId, colour);
        return colour;
    }
}
