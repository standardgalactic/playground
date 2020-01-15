'use strict'; // code generated by pbf v3.2.1

// place ========================================

var place = exports.place = {};

place.read = function (pbf, end) {
    return pbf.readFields(place._readField, {version: 0, name: "", date: "", area: "", nodes: [], ways: []}, end);
};
place._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.version = pbf.readVarint();
    else if (tag === 2) obj.name = pbf.readString();
    else if (tag === 3) obj.date = pbf.readString();
    else if (tag === 4) obj.area = pbf.readString();
    else if (tag === 5) obj.nodes.push(place.node.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 6) obj.ways.push(place.way.read(pbf, pbf.readVarint() + pbf.pos));
};
place.write = function (obj, pbf) {
    if (obj.version) pbf.writeVarintField(1, obj.version);
    if (obj.name) pbf.writeStringField(2, obj.name);
    if (obj.date) pbf.writeStringField(3, obj.date);
    if (obj.area) pbf.writeStringField(4, obj.area);
    if (obj.nodes) for (var i = 0; i < obj.nodes.length; i++) pbf.writeMessage(5, place.node.write, obj.nodes[i]);
    if (obj.ways) for (i = 0; i < obj.ways.length; i++) pbf.writeMessage(6, place.way.write, obj.ways[i]);
};

// place.node ========================================

place.node = {};

place.node.read = function (pbf, end) {
    return pbf.readFields(place.node._readField, {id: 0, lat: 0, lon: 0}, end);
};
place.node._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.id = pbf.readVarint();
    else if (tag === 2) obj.lat = pbf.readFloat();
    else if (tag === 3) obj.lon = pbf.readFloat();
};
place.node.write = function (obj, pbf) {
    if (obj.id) pbf.writeVarintField(1, obj.id);
    if (obj.lat) pbf.writeFloatField(2, obj.lat);
    if (obj.lon) pbf.writeFloatField(3, obj.lon);
};

// place.way ========================================

place.way = {};

place.way.read = function (pbf, end) {
    return pbf.readFields(place.way._readField, {nodes: []}, end);
};
place.way._readField = function (tag, obj, pbf) {
    if (tag === 1) pbf.readPackedVarint(obj.nodes);
};
place.way.write = function (obj, pbf) {
    if (obj.nodes) pbf.writePackedVarint(1, obj.nodes);
};
