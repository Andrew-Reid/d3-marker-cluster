// https://d3js.org/d3-force/ Version 1.1.0. Copyright 2017 Mike Bostock.
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-quadtree'), require('d3-collection'), require('d3-dispatch'), require('d3-timer')) :
	typeof define === 'function' && define.amd ? define(['exports', 'd3-quadtree', 'd3-collection', 'd3-dispatch', 'd3-timer'], factory) :
	(factory((global.d3 = global.d3 || {}),global.d3,global.d3,global.d3,global.d3));
}(this, (function (exports,d3Quadtree,d3Collection,d3Dispatch,d3Timer) { 'use strict';


var constant = function(x) {
  return function() {
    return x;
  };
};

var jiggle = function() {
  return (Math.random() - 0.5) * 1e-6;
};

function x(d) {
  return d.x;
}

function y(d) {
  return d.y;
}

var collide = function(radius) {
  var nodes,
      radii,
      strength = 1,
      iterations = 1;

  if (typeof radius !== "function") radius = constant(radius == null ? 1 : +radius);

  function force() {
    var i, n = nodes.length,
        tree,
        node,
        xi,
        yi,
        ri,
        ri2;

    for (var k = 0; k < iterations; ++k) {
      tree = d3Quadtree.quadtree(nodes, x, y).visitAfter(prepare);
      for (i = 0; i < n; ++i) {
        node = nodes[i];
        ri = radii[node.index], ri2 = ri * ri;
        xi = node.x;
        yi = node.y;
        tree.visit(apply);
      }
    }

    function apply(quad, x0, y0, x1, y1) {
      var data = quad.data, rj = quad.r, r = ri + rj;
      if (data) {
        if (data.index > node.index) {
          var x = xi - data.x,
              y = yi - data.y,
              l = x * x + y * y;
          if (l < r * r) {
			if (x == NaN) x = 0;
			if (y == NaN) y = 0;
			if (x === 0) x = jiggle(), l += x * x;
            if (y === 0) y = jiggle(), l += y * y;
            l = (r - (l = Math.sqrt(l))) / l * strength;
			node.collided = true;
			data.collided = true;
			
			if(data.a && node.a) {
				if(data.a > node.a) {
					data.x = (data.x * data.a + node.x * node.a)/(data.a + node.a);
					data.y = (data.y * data.a + node.y * node.a)/(data.a + node.a);
					
					data.count += node.count;
					data.a += node.a;
					data.r = Math.sqrt(data.a/Math.PI);
					
					node.a = 0;
					node.r = 0;

				}
				
				else {
					node.x = (data.x * data.a + node.x * node.a)/(data.a + node.a);
					node.y = (data.y * data.a + node.y * node.a)/(data.a + node.a)
					
					node.a += data.a;	
					node.count += data.count;
					node.r = Math.sqrt(node.a/Math.PI);
					
					data.a = 0;
					data.r = 0;
					
				}
			}

			
          }
        }
        return;
      }
	  
      return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r;
    }
  }

  function prepare(quad) {
    if (quad.data) return quad.r = radii[quad.data.index];
    for (var i = quad.r = 0; i < 4; ++i) {
      if (quad[i] && quad[i].r > quad.r) {
        quad.r = quad[i].r;
      }
    }
  }

  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length, node;
    radii = new Array(n);
    for (i = 0; i < n; ++i) node = nodes[i], radii[node.index] = +radius(node, i, nodes);
  }

  force.initialize = function(_) {
    nodes = _;
    initialize();
  };

  force.iterations = function(_) {
    return arguments.length ? (iterations = +_, force) : iterations;
  };

  force.strength = function(_) {
    return arguments.length ? (strength = +_, force) : strength;
  };

  force.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), initialize(), force) : radius;
  };

  return force;
};


var simulation = function(nodes) {
  var simulation,
      alpha = 1,
      alphaMin = 0.001,
      alphaDecay = 0.04,
      alphaTarget = 0,
	  force = collide().radius(function(d) { return d.r; }),
      stepper = d3Timer.timer(step),
      event = d3Dispatch.dispatch("tick", "end");

	  
	  
  if (nodes == null) nodes = [];

  function step() {
    tick();
    event.call("tick", simulation);
    if (alpha < alphaMin) {
      stepper.stop();
      event.call("end", simulation);
    }
  }
  
  var i = 0;

  function tick() {
    alpha += (alphaTarget - alpha) * alphaDecay;
	force(alpha);
  }

  function initializeNodes() {
    for (var i = 0, n = nodes.length, node; i < n; ++i) {
      node = nodes[i], node.index = i;
      if(node.collided == undefined) node.collided = false;
	  if(node.count == undefined) node.count = 1;
	  if(node.a == undefined) node.a = 1;
	  if(node.r == undefined) node.r = Math.sqrt(1/Math.PI);
    }
  }

  function initializeForce(force) {
    if (force.initialize) force.initialize(nodes);
    return force;
  }

  initializeNodes();

  return simulation = {
    tick: tick,

    restart: function() {
      return stepper.restart(step), simulation;
    },

    stop: function() {
      return stepper.stop(), simulation;
    },

    nodes: function(_) {
	  return arguments.length ? (nodes = _, initializeNodes(), initializeForce(force), simulation) : nodes;
    },

    alpha: function(_) {
      return arguments.length ? (alpha = +_, simulation) : alpha;
    },

    alphaMin: function(_) {
      return arguments.length ? (alphaMin = +_, simulation) : alphaMin;
    },

    alphaDecay: function(_) {
      return arguments.length ? (alphaDecay = +_, simulation) : +alphaDecay;
    },

    alphaTarget: function(_) {
      return arguments.length ? (alphaTarget = +_, simulation) : alphaTarget;
    },

    clusterer: function(_) {
	  return arguments.length ? (nodes.length > 0 ? force = initializeForce(_) : force = _, simulation) : force;
    },
	
	find: function(x, y, radius) {
      var i = 0,
          n = nodes.length,
          dx,
          dy,
          d2,
          node,
          closest;

      if (radius == null) radius = Infinity;
      else radius *= radius;

      for (i = 0; i < n; ++i) {
        node = nodes[i];
        dx = x - node.x;
        dy = y - node.y;
        d2 = dx * dx + dy * dy;
        if (d2 < radius) closest = node, radius = d2;
      }

      return closest;
    },

    on: function(name, _) {
      return arguments.length > 1 ? (event.on(name, _), simulation) : event.on(name);
    }

	
  };
};

exports.clusterer = collide;
exports.cluster = simulation;


Object.defineProperty(exports, '__esModule', { value: true });

})));
