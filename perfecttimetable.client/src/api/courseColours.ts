export class CourseColours {

    private colours: string[];
    private i: number = 0;
    constructor() {
        this.colours = [

            '#D38FFF',
            '#C267FF',
            '#B649FA',
            '#A832EA',
        ];

    }

    getColour(): string {
        const colour:string = this.colours[this.i];
        this.i = (this.i + 1) % this.colours.length;
        return colour;
    }
}