import {Database} from "./database";
import {isOutsideEvent} from "@floating-ui/react/src/utils/tabbable";

export namespace DBTest {

    export interface MyEntity {
        name: string,
        age: number,
        address: {
            code: number,
            city: string,
            street: string
        }
    }

    // get value of (nested) field by dot notation
    // function getValue(obj: any, path: string): any {
    //     return path.split('.').reduce((acc, part) => acc && acc[part], obj)
    // }

    export function benchmark() {

        const db = new Database<MyEntity>();
        const ids: string[] = [];


        // console.time("insert");
        // for (let i = 0; i < 100000; i++) {
        //     const id = db.insert({
        //         name: "Mr. Example",
        //         age: 42,
        //         address: {
        //             code: 12345,
        //             city: "Example City",
        //             street: "Some Street",
        //         },
        //     });
        //     ids.push(id);
        // }
        // console.timeEnd("insert");

        console.log("=============")

        db.query({
            $and: [
                {name: {$eq: "Mr. Example"}},
                {
                    age: {$eq: 42},
                    name: {$eq: "lol"}
                },
            ],
        });

        console.log("=============")

        db.query({
            $and: [
                // {
                //     name: {$eq: "Mr. Example"},
                // },
                {
                    address: {
                        code: {$lt: 123},
                    },
                },
            ],
        });

        console.log("=============")


        db.query({
            $and: [
                {
                    age: {$lt: 42, $index: "ageIndex"},
                },
                {
                    $or: [
                        { name: { $eq: "John"}},
                        { name: { $eq: "Doe"}}
                    ]
                },
            ],
        });

        console.log("=============")

        db.query({})


        // console.time("getAll");
        // for (let i = 0; i < 100; i++) {
        //     db.getAll();
        // }
        // console.timeEnd("getAll");
        //
        //
        // console.time("delete");
        // for (let i = 0, n = ids.length; i < n; i++) {
        //     const id = ids[i];
        //     db.delete(id);
        // }
        // console.timeEnd("delete");


    }


}

