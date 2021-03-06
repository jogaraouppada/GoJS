"use strict";
/*
*  Copyright (C) 1998-2017 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from "../release/go";
import { DebugInspector } from "./DebugInspector";

var myDiagram: go.Diagram;

export function init() {
	if (typeof (<any>window)["goSamples"] === 'function') (<any>window)["goSamples"]();  // init for these samples -- you don't need to call this

	const $ = go.GraphObject.make;  // for conciseness in defining templates

  myDiagram =
		$(go.Diagram, "myDiagramDiv",  // create a Diagram for the DIV HTML element
			{
        initialContentAlignment: go.Spot.Center,
			  "animationManager.isEnabled": false,
				// allow double-click in background to create a new node
				"clickCreatingTool.archetypeNodeData": { text: "Node", color: "white" },
				// allow Ctrl-G to call groupSelection()
				"commandHandler.archetypeGroupData": { text: "Group", isGroup: true, color: "blue" },
				// enable undo & redo
				"undoManager.isEnabled": true
			});


	// These nodes have text surrounded by a rounded rectangle
	// whose fill color is bound to the node data.
	// The user can drag a node by dragging its TextBlock label.
	// Dragging from the Shape will start drawing a new link.
	myDiagram.nodeTemplate =
		$(go.Node, "Auto",
			{ locationSpot: go.Spot.Center },
			$(go.Shape, "RoundedRectangle",
				{
					name: 'theShapeName',
					fill: "white", // the default fill, if there is no data-binding
					portId: "", cursor: "pointer",  // the Shape is the port, not the whole Node
					// allow all kinds of links from and to this port
					fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
					toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true
				},
				new go.Binding("fill", "color")),
			$(go.TextBlock,
				{
					font: "bold 14px sans-serif",
					stroke: '#333',
					margin: 6,  // make some extra space for the shape around the text
					isMultiline: false,  // don't allow newlines in text
					editable: true  // allow in-place editing by user
				},
				new go.Binding("text", "text").makeTwoWay())
		);
	// Define the appearance and behavior for Links:
	function linkInfo(d: any): string {  // Tooltip info for a link data object
		return "Link:\nfrom " + d.from + " to " + d.to;
	}
	// The link shape and arrowhead have their stroke brush data bound to the "color" property
	myDiagram.linkTemplate =
		$(go.Link,
			{ relinkableFrom: true, relinkableTo: true },  // allow the user to relink existing links
			$(go.Shape,
				{ strokeWidth: 2 },
				new go.Binding("stroke", "color")),
			$(go.Shape,
				{ toArrow: "Standard", stroke: null },
				new go.Binding("fill", "color"))
		);
	// Define the appearance and behavior for Groups:
	function groupInfo(adornment: go.Adornment) {  // takes the tooltip, not a group node data object
		var g = adornment.adornedPart as go.Group;  // get the Group that the tooltip adorns
		var mems = g.memberParts.count;
		var links = 0;
		g.memberParts.each(function (part) {
			if (part instanceof go.Link) links++;
		});
		return "Group " + g.data.key + ": " + g.data.text + "\n" + mems + " members including " + links + " links";
	}
	// Groups consist of a title in the color given by the group node data
	// above a translucent gray rectangle surrounding the member parts
	myDiagram.groupTemplate =
		$(go.Group, "Vertical",
			{
				selectionObjectName: "PANEL",  // selection handle goes around shape, not label
				ungroupable: true
			},  // enable Ctrl-Shift-G to ungroup a selected Group
			$(go.TextBlock,
				{
					font: "bold 19px sans-serif",
					isMultiline: false,  // don't allow newlines in text
					editable: true  // allow in-place editing by user
				},
				new go.Binding("text", "text").makeTwoWay(),
				new go.Binding("stroke", "color")),
			$(go.Panel, "Auto",
				{ name: "PANEL" },
				$(go.Shape, "Rectangle",  // the rectangular shape around the members
					{ fill: "rgba(128,128,128,0.2)", stroke: "gray", strokeWidth: 3 }),
				$(go.Placeholder, { padding: 10 })  // represents where the members are
			)
		);

	// Create the Diagram's Model:
	var nodeDataArray = [
		{ key: 1, text: "Alpha", color: "lightblue" },
		{ key: 2, text: "Beta", color: "orange" },
		{ key: 3, text: "Gamma", color: "lightgreen", group: 5 },
		{ key: 4, text: "Delta", color: "pink", group: 5 },
		{ key: 5, text: "Epsilon", color: "green", isGroup: true }
	];
	var linkDataArray = [
		{ from: 1, to: 2, color: "blue" },
		{ from: 2, to: 2 },
		{ from: 3, to: 4, color: "green" },
		{ from: 3, to: 1, color: "purple" }
	];
	myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
}


export function makeInspector() {
	var inspector = new DebugInspector('myInspector', myDiagram,
		{
			acceptButton: true,
			resetButton: true,
			/*
			// example predicate, only show data objects:
			inspectPredicate: function(value) {
				return !(value instanceof go.GraphObject)
			}
			*/
		});


	(window as any).inspector = inspector;
	myDiagram.select(myDiagram.nodes.first());
}


// window.onload = function () {
// 	init();
// 	makeInspector();
// 	//myDiagram.maybeUpdate(); // force measure before selecting object for inspector

// 	myDiagram.select(myDiagram.nodes.first());
// }
