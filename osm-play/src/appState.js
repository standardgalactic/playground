// const ratio = 540/230 - mug
const appState = {
  currentState: 'intro',
  selected: null,
  blank: false,
  error: null,
  currentScript: 'roads',
  possibleScripts: {
    selected: 'roads',
    options: [{
      value: 'roads',
      text: 'Roads'
    }, {
      value: 'buildings',
      text: 'Buildings'
    }, {
      value: 'railway',
      text: 'Railway'
    }]
  },
  downloadOsmProgress: null,
  building: false,
  buildingMessage: '',
  zazzleLink: null,
  showCancelDownload: false,
  getGraphBBox,
  getGraph,
  setGraph,
  startOver,
  generatingPreview: false,
  backgroundColor: {
    r: 255, g: 255, b: 255, a: 1
  },
  lineColor: {
    r: 22, g: 22, b: 22, a: 1
  },
};

var graph;
var graphBounds;

function getGraphBBox() {
  return graphBounds;
}

function getGraph() {
  return graph;
}

function setGraph(newGraph, bounds) {
  graph = newGraph;
  graphBounds = bounds;
}

function startOver() {
  appState.zazzleLink = null;
  appState.generatingPreview = false;
  appState.currentState = 'intro';
  appState.blank = false,
  appState.downloadOsmProgress = null;
}

export default appState;