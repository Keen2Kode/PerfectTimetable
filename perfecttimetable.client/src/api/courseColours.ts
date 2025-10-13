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

    asMap(): ReadonlyMap<number, string> {
        return this.map;
    }

    getColourWithAlpha(courseId: number, alpha: number): string {
        const clamped = Math.max(0, Math.min(1, alpha));
        const hex = this.getColour(courseId);
        const { r, g, b } = CourseColours.hexToRgb(hex);
        return `rgba(${r}, ${g}, ${b}, ${clamped})`;
    }

    private assignColour(courseId: number): string {
        const colour:string = this.colours[this.i];
        this.i = (this.i + 1) % this.colours.length;
        this.map.set(courseId, colour);
        return colour;
    }

    private static hexToRgb(hex: string): { r: number; g: number; b: number } {
        const value = hex.startsWith('#') ? hex.slice(1) : hex;
        const normalized = value.length === 3 ? value.split('').map((ch) => ch + ch).join('') : value;
        const num = parseInt(normalized, 16);
        const r = (num >> 16) & 0xff;
        const g = (num >> 8) & 0xff;
        const b = num & 0xff;
        return { r, g, b };
    }
}
