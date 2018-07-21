# d3-cluster

This is intended to become a fully fledged marker/icon/circle clusterer for D3. In its current state it's a proof of concept,
but I hope to quickly fill in additional functionality now that the primary goal of clustering is taken care of.

<a href="https://bl.ocks.org/Andrew-Reid/df90c3219abeed2572b77f09fe4e131f" ><img src="https://github.com/Andrew-Reid/d3-cluster/blob/master/example.png"/></a>

As d3-cluster is essentially a stripped down and modified d3-force, it shares the same dependencies.

## d3.cluster()

Creates a new cluster layout.

### cluster.nodes()

Adds nodes to the cluster. 

As with d3-force, nodes are positoined with `node.x`, `node.y`. These values must be provided as initial 
locations for the nodes. Currently the coordinates must be located at `node.x`, `node.y`, however I intend to add an accessor method 
for different properties or functions. 

Nodes can include a `node.a` property which indicates node area/weight. Alternatively you can specify a `node.r` which specifies a node radius.
When nodes merge, the area/weight of the node is used to proportinatly center the node. Radius is calculated as a convience for marker generation.
When two nodes merge the one with the greater area/weight gains the area/weight of the smaller node. The small node's area/weight and radius is converted to zero.
Nodes that have merged have their `node.collided` property set to `true`.

Nodes can also have a count property, this could be set to 1, as with areas/weights, larger nodes absorb the count of smaller nodes when clustering. This can allows the
clustered node to indicate how many nodes are contained in the cluster.

### cluster.alpha(), cluster.alphaDecay(), cluster.stop(), cluster.restart(), cluster.find(), cluster.on(), cluster.alphaTarget(), cluster.alphaMin()

These act the same as with d3-force. Alpha decay is set to 0.04 by default as compared with d3-force.

### cluster.clusterer(clusterer)

Takes a `d3.clusterer()` which is a modified d3-force collide force. When providing a clusterer, no name is provided as with d3-force forces. The default value is `d3.clusterer().radius(function(d) { return d.r; })`.

Only one clustering force can be applied unlike the multiple forces that can be applied to a d3-force layout.

## d3.clusterer()

The clusterer handles the mechanics of the clustering and is a modified d3-force collide force. 

d3.clusterer() has the same methods as a d3-force collide force, but has been altered internally. 
No `vx` or `vy` properties will be considered in positioning.
