---
title: Economy Simulation


---

# Economy Simulation

Takes an abstracted the state of the world and performs a single economy simulation step, i.e. consumes, produces and moves resources. 



## Objects

### Node

A node is an object that "owns", stores and manages, resources, e.g. a settlement, market or country.

Nodes itself do not produce or consume resources, but contain entities that do.

Nodes form a tree modeling the economical hierarchy in the world. E.g. *world*-node contains *markets*-nodes contains *country*-nodes ... contains *settlements*-nodes.

A node also contains all resources of all child nodes. Example: Node "C1" has 2 Food, "C2" 1 Food and 1 Wood, and the parent of these two nodes "P" has 3 Food and 1 Wood.

Nodes can be filled with initial resources from before the economy update step, e.g. resources produces in the last turn or long term stored resources.



###  Entity

An entity is an object that consumes or produces resources, e.g. a building, a unit.

An entity is always owned by exactly one node.

**Input**

The resources required by the node

**Output**

The resources produced by the node after all input resources are available and have been consumed.

**Consumption Type**

Determines how resources are consumed to meet the input requirement

- *COMPLETE* - the entity must consume all input resources in the same node. This node does not need to be the direct parent/owner node, but can be higher up in the tree. Either all required resources are consumed or none.
- *DISTRIBUTED* - the entity can consume resources from multiple different nodes (e.g. some from its direct parent/owner, and some later from its parent parent). Resources will be consumed even if the required amount is not reached.

**Priority**

Entities with higher priority consume resources first.

**Is Active**

Only active entities consume and produce resources.

**State**

- *CONSUME* - entity is ready to / wants to consume resources
- *PRODUCE* - entity is ready to / wants to produce resources
- *DONE* - entity is done consuming and producing and does not require further processing



## Simulation Steps

### Summary

- nodes get filled with initial resources (e.g. resources produced last turn)
- nodes pull available resources from children
  - this way, nodes can share resources with other nodes over an incrementally larger "distance"
- all entities consume required resources
  - try consuming from direct owner node first, then from parent of owner, then from its parent, ...
  - this way entities can access shared resources from other nodes if resources from direct owner are not sufficient
- all entities that consumed required resources produce output resources
- entities that are still in state "consume" missed some required resources

### Detailed

**Step 1: Consumption**

- iterate node tree depth-first, for each node:
  - revert stored resources of node to initial resources
  - pull up resources - i.e. get all resources from children and also add to own store
  - get all entities of this subtree with this node as root, for each entity in state "consume"
    - consume required/remaining resources from current node
    - set state of entity to "produce"

**Step 2: Production**

iterate node tree depth-first, for each node:

- get all entities of this subtree with this node as root, for each entity in state "produce"
  - add resources to produce to current node
  - set state of entity to "done"

**Step 3: Missing Resources**

iterate over all entities in state "consume" and report missing resources



## Report

The report list everything that "happened" in a simulation step.

- Entry for *Consumption* - resources were consumed/removed by a given entity from a given node (node does not need to be the direct parent/owner).
- Entry for *Production* - resources were produces/added from a given entity in a given node (node does not need to be the direct parent/owner).
- Entry for *Missing* - resources are missing for an entity, i.e. the difference between required input resources and actually consumed resources.



