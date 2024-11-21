# In-Memory Game-Object Database



## Creating a Database

Define the model to store:

```typescript
interface MyEntity {
	id: string,
	someValue: number
}
```

Define a store. Either a primary storage directly:

```typescript
class MyStorage extends MapPrimaryStorage<MyEntity, string> {
    constructor() {
        super(e => e.id);
    }
}
```

... or in combination with supporting stores:

```typescript
interface MyStorageConfig extends DatabaseStorageConfig<MyEntity, string> {
    primary: MapPrimaryStorage<MyEntity, string>,
    supporting: {
        array: ArraySupportingStorage<MyEntity>,
        map: MapSupportingStorage<MyEntity, number>,
    }
}

class MyStorage extends DatabaseStorage<MyStorageConfig, MyEntity, string> {

    constructor() {
        super({
            primary: new MapPrimaryStorage<MyEntity, string>(e => e.id),
            supporting: {
                array: new ArraySupportingStorage<MyEntity>(),
                map: new MapSupportingStorage<MyEntity, number>(e => e.value),
            },
        });
    }
    
    public getAll(): MyEntity[] {
        return this.config.supporting.array.getAll()
    }
    
    public getByValue(value: number): MyEntity[] {
        return this.config.supporting.map.getByKey(value)
    }
    
}
```

Define a database:

```typescript
class MyDatabase extends AbstractDatabase<MyStorage, MyEntity, string> {
    constructor() {
        super(new MyStorage(), e => e.id);
    }
}
```

