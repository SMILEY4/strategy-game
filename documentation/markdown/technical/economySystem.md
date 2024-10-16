# Economy System



## Configuration

- tree of **nodes**
  - Something that "owns" resources, e.g. a city, province, market-area, country, ...
- **storages** attached to nodes
  - keep track of resources available in a node
- **entities** owned by nodes
  - Something that takes part in the economy by consuming and/or producing resources. Located in a specific node (e.g. city, province or country).



## Economy Update

- **input**: root economy node
- **result**: updated/modified economy nodes, node storages and entities



### 1. Consumption-Step

##### 1.1 Nodes

- *input: root node*

- **iterate tree** of nodes depth-first (i.e. start at bottom, root last):
  - **reset storage** of current node to initial state (i.e. contains only resources available at start of update)
  - **merge/add resources** from child-storages into/to storage of current node, so that all storages know of resources contained in children
  - **collect** all **entities** of current node and of all nodes in subtree
  - **update entities** that are **active** and **ready to consume**, **sorted by priority** (entities that match condition are updated multiple times, until they no longer match)



##### 1.2 Entities

- *input: entity to update, current node  (note: current node is not always owner of entity)*

- if consumption type is **distributed**:
  - **check** if all required resources are **available** at current node
    - *yes*:
      - -> handle same as "local"-type
    - *no*:
      - **for each required** resource, calculate the **amount** that is **possible** to consume:
        - **remove** amount from storage of current node
        - (mark amount as removed from another storage at the storage of the entity owner)
        - **provide** amount to entity (i.e. "consumed")
        - **if** entity is **satisfied**, **mark** as "no longer ready to consume & ready to produce" 

- if consumption type is **local**:
  - **check** if all required resources are **available** at current node:
    - *yes*:
      - **remove** resources from storage of current node
      - (mark resources as removed from another storage at the storage of the entity owner)
      - **provide** resources to entity (i.e. "consumed")
      - **if** entity is **satisfied, mark** as "no longer ready to consume & ready to produce" 
    - *no*:
      - skip (will probably be updated with another node higher up in the tree with more resources available)





### 2. Production-Step

##### 2.1 Nodes

- *input: root node (after consumption step)*
- **iterate tree** of nodes depth-first (i.e. start at bottom, root last):
  - **collect** all **entities** of current node and of all nodes in subtree
  - **update entities** that are **active** and **ready to produce**, **sorted by priority** (entities that match condition are updated multiple times, until they no longer match)



##### 2.2 Entities

*input: entity to update*

- **add output resources** of entities to storage of node owning the entity
- **mark** entity as "**done** producing"