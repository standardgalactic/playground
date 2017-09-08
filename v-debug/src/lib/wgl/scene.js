const makePanzoom = require('panzoom');
const Element = require('./Element');
const eventify = require('ngraph.events');
const createTree = require('d3-quadtree').quadtree;

// const makeLineProgram = require('./lines.js');

module.exports = makeScene;

let pixelRatio = window.devicePixelRatio;

function makeScene(canvas) {
  let width;
  let height;
  let screen = { width: 0, height: 0 };

  var sceneRoot = new Element();

  let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  let interactiveTree = createTree();

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
  gl.clearColor(0, 0, 0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT)

  updateCanvasSize();
  
  var lastTreeUpdate = new Date();

  var panzoom = makePanzoom(canvas, {
    controller: wglPanZoom(canvas, sceneRoot)
  });

  var api = {
    appendChild,
    getSceneCoordinate,
    getTransform,
    removeChild,
    setViewBox,
    setClearColor,
    dispose,
  };

  var frameToken = requestAnimationFrame(frame);
  var prevHighlighted;
  listenToEvents();

  return eventify(api);

  function getTransform() {
    return sceneRoot.transform;
  }

  function setClearColor(r, g, b, a) {
    gl.clearColor(r, g, b, a)
  }

  function listenToEvents() {
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onMouseClick);
    window.addEventListener('resize', onResize, true);
  }

  function dispose() {
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('click', onMouseClick);
    window.removeEventListener('resize', onResize, true);

    panzoom.dispose();
    sceneRoot.dispose();
    // api.off(); Do I need this?
    if (frameToken) {
      cancelAnimationFrame(frameToken);
      frameToken = null;
    }
  }

  function onResize() {
    updateCanvasSize();
  }

  function updateCanvasSize() {
    width = canvas.width = canvas.offsetWidth * pixelRatio
    height = canvas.height = canvas.offsetHeight * pixelRatio
    gl.viewport(0, 0, width, height);

    screen.width = width;
    screen.height = height;
    sceneRoot.worldTransformNeedsUpdate = true;
  }

  function onMouseClick(e) {
    let p = getSceneCoordinate(e.clientX, e.clientY);
    api.fire('click', {
      event: e,
      sceneX: p.x,
      sceneY: p.y,
    });
    let res = findUnderCursor(p.x, p.y);
    if (res) {
      api.fire('point-click', res, {
        x: e.clientX,
        y: e.clientY
      });
    }
  }

  function onMouseMove(e) {
    let p = getSceneCoordinate(e.clientX, e.clientY);
    api.fire('mousemove', {
      event: e,
      sceneX: p.x,
      sceneY: p.y,
    });
    let res = findUnderCursor(p.x, p.y);
    if (!res) {
      if (prevHighlighted) {
        api.fire('point-leave', prevHighlighted);
        prevHighlighted = null;
      }
  
      return;
    }

    if (res === prevHighlighted) return;

    prevHighlighted = res;
    api.fire('point-enter', prevHighlighted, {
      x: e.clientX,
      y: e.clientY
    });
  }

  function getSceneCoordinate(clientX, clientY) {
    let t = sceneRoot.transform;
    let canvasX = clientX * pixelRatio;
    let canvasY = clientY * pixelRatio;
    let x = (canvasX - t.dx)/t.scale;
    let y = (canvasY - t.dy)/t.scale;

    return {x, y};
  }

  function findUnderCursor(x, y) {
    // TODO: I don't like this. Almost seem like interactivity
    // does not belong here
    return interactiveTree.find(x, y, 10);
  }

  function setViewBox(rect) {
    panzoom.showRectangle(rect)
  }

  function frame() {
    gl.clear(gl.COLOR_BUFFER_BIT)
    let wasDirty = sceneRoot.updateWorldTransform();
    if (wasDirty) {
      updateInteractiveTree();
    }

    sceneRoot.draw(gl, screen);
    frameToken = requestAnimationFrame(frame);
  }

  function updateInteractiveTree() {
    let now = new Date();
    if (now - lastTreeUpdate < 500) return; 

    interactiveTree = createTree().x(p => p.x).y(p => p.y);
    sceneRoot.addInteractiveElements(interactiveTree, -sceneRoot.transform.dx, -sceneRoot.transform.dy);

    lastTreeUpdate = new Date();
  }

  function appendChild(child, sendToBack) {
    sceneRoot.appendChild(child, sendToBack);
  }

  function removeChild(child) {
    sceneRoot.removeChild(child)
  }
}

function wglPanZoom(canvas, sceneRoot) {
  return {
      applyTransform(newT) {
        var transform = sceneRoot.transform;
        transform.dx = newT.x * pixelRatio;
        transform.dy = newT.y * pixelRatio; 
        transform.scale = newT.scale;
        sceneRoot.worldTransformNeedsUpdate = true;
      },

      getOwner() {
        return canvas
      }
    }
}
