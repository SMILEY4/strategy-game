# In-Memory Client Side Database

## Goals

- client side
- handle "large" amount of structured data
- reactive (subscriptions, React-hooks)
- optimized for queries with different access patterns
- provides other features supporting game optimizations (e.g. revision ids)
- **Database** for storing multiple entities and **Singleton Database** for storing a single object



## Concepts

### Database

The database is the main entrypoint and wrapper object orchestrating all operations and other systems

### Storage

The storage is responsible for storing the entities. It consists of one primary storage unit and any amount of supporting units.
The primary is a key-value store mapping ids to entities in a 1:1 relation and is the single source of truth. All successful operations on the primary are mirrored to the supporting units.
The supporting units can be used to optimize for specific access patterns or different keys. 

Current supporting units are:

- `ArraySupportingStorage` - stores all entities in a flat array. Best used when iterating over all entities.
- `MapMultikeySupportingStorage` - stores entities in a map with specified key(s) in an n:m relation, i.e. multiple keys can map to one entity and multiple entities can map to one key.
- `MapSupportingStorage` - stores entities in a map with a specified key in an 1:m relation, i.e. a key can map to multiple entities, but one entity maps to exactly one key
- `MapUniqueMultikeySupportingStorage` - stores entities in a map with specified keys in an n:1 relation, i.e. an entity can map to multiple key, but one key maps to exactly one entity.
- `MapUniqueSupportingStorage` - stores entities in a map with a specified key in an 1:1 relation, i.e. a key is associated with exactly one entity

### Subscribers

Subscriptions can be created on database, specific entities or queries. When anything relating these entities changes, a notification is sent.

### Batch

Batches bundle together multiple database operations. Notifications are collected, merged and send together at the end.

Batches are not transactions and are not atomic and do not fail together!

### Revision Ids

Revision ids are ids that change when the content of the database changes. Partial revision ids can be created that change only when a subset changes.



## Standard Database

### Creating

Define a new entity model

```ts
interface Person {
    name: string,
    age: number,
    address: {
        country: string,
        city: string,
        street: string,
    }
}
```

Create the definition for primary and supporting storages

```ts
type PersonStorageMapping = {
    primary: MapPrimaryDatabaseStorageUnit<Person, string>,
    byAge: MapSupportingStorage<Person, number>,
    flat: ArraySupportingStorage<Person>
}
```

Create the database

```ts
const personDatabase = DatabaseBuilder
    .create<Person, string, PersonStorageMapping>()
    .withIdProvider(person => person.name)
    .withStorage({
        primary: new MapPrimaryDatabaseStorageUnit(person => person.name),
        byAge: new MapSupportingStorage<Person, number>(person => person.age),
        flat: new ArraySupportingStorage<Person>()
    })
    .build();
```

### CRUD operations

```ts
db.insert(    {
    name: "Mr Example",
    age: 42,
    address: {
        country: "DE",
        city: "Exampletown",
        street: "Examplestreet. ",
    },
})
```

```ts
db.delete("Mr. Example")
```

```ts
db.update("Mr. Example", prev => ({
    age: prev.age + 1
}))
```

```ts
const result = db.queryById("Mr. Example")
```

Define and run queries

```ts
type PersonQuery<ARGS> = Query<PersonStorageMapping, Person, string, ARGS>

const QUERY_PERSON_BY_ID: PersonQuery<string> = {
    run(storage: PersonStorageMapping, args: string): Person | null {
        return storage.primary.get(args);
    },
};

const QUERY_PERSON_BY_AGE: PersonQuery<number> = {
    run(storage: PersonStorageMapping, args: number): Person[] {
        return storage.byAge.getByKey(args);
    },
};
```

```ts
const resultById = db.querySingle(QUERY_PERSON_BY_ID, "Mr. Example")
const resultByAge = db.queryMany(QUERY_PERSON_BY_AGE, 42)
```

### Using revision ids

```ts
const currentRevId = db.getRevId()
```

```ts
registerPartialRevId("age-42", person => person.age === 42)
const currentRevId = db.getPartialRevId("age-42") // only changes when any entity with "age = 42" changes
```

###  Handling Subscriptions

```ts
const subscription = db.subscribe(entities, operation => console.log(entities, operation))
db.unsubscribe(subscription)
```

Subscriptions can also be added for specific entities by id or using queries. Notifications will only be received for the relevant entities.

### Batch Operations

```ts
db.batch(() => {
    //... modify db
})
```



## Singleton Database

### Creating

Define a new entity model

```ts
interface Person {
    name: string,
    age: number,
    address: {
        country: string,
        city: string,
        street: string,
    }
}
```

Create the database

```ts
const personDatabase = DatabaseBuilder
    .createSingleton<Person>()
    .withInitialValue({
        name: "Mr Example",
        age: 42,
        address: {
            country: "DE",
            city: "Exampletown",
            street: "Examplestreet. ",
        },
    })
    .build();
```

### CRUD operations

```ts
db.set(    {
    name: "Mr Example",
    age: 42,
    address: {
        country: "DE",
        city: "Exampletown",
        street: "Examplestreet. ",
    },
})
```

```ts
db.update("Mr. Example", prev => ({
    age: prev.age + 1
}))
```

```ts
const result = db.get()
```

### Using revision ids

```ts
const currentRevId = db.getRevId()
```

```ts
registerPartialRevId("age", person => person.age)
const currentRevId = db.getPartialRevId("age") // only changes when "age" changes
```

###  Handling Subscriptions

```ts
const subscription = db.subscribe(entity => console.log(entity))
db.unsubscribe(subscription)
```

```ts
const subscription = db.subscribePartial(
    entity => entity.age,
    age => console.log(age)
)
db.unsubscribe(subscription)
```


### Batch Operations

```ts
db.batch(() => {
    //... modify db
})
```

