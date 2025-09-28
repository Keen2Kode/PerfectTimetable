// this will auto-generate the Model's classes schema
// no need to manually create a new type for each class
import { defineConfig } from 'orval';


export default defineConfig({
    timetable: {
        input: {
            target: '../PerfectTimetable.Server/openapi.json',
        },
        output: {
            target: 'src/api/timetableClient.ts',

            schemas: 'src/api/models',
            override: {
                enumGenerationType: 'enum',   // replaces the old enumType flag
            },
            
            client: 'fetch',
        },
    },
});
