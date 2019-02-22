/*
 * BOTTOM-LEFT ORIGIN ORIENTATION USED
 * Conversions are made (in-library) before drawing
 * If drawing manual objects outside of library,
 * use "coordConversion(theCanvas, theCoordinateToConvert)"
 */

//a canvas to draw on, so I have a coordinate system to reference
function SVGCanvas(height, width){
  this.height = height,
  this.width = width
}

//implement getters and setters
function Coordinate(x_coordinate, y_coordinate){
 this.x = x_coordinate,
 this.y = y_coordinate
 //get x(){return this.x;},
 //set x(new_x_coordinate){this.x = new_x_coordinate;},
 //get y(){return this.y;},
 //set y(new_y_coordinate){this.y = new_y_coordinate;}
 this.copyCoordinate = function(){
  return new Coordinate(this.x, this.y);
 }
}

function ColorRamp(){



}

function PySquare(svgCanvas, upperLeftCoordinate, size, degreeRotation, colorInHex){

 //svg.js stuff
 this.canvas = svgCanvas,
 this.size = size,
 this.rotation = degreeRotation,
 this.color = colorInHex,

 //upperLeftCoordinate is not calculated, because I rotate the square **around this corner**
 this.upperLeftCoordinate = upperLeftCoordinate,
 this.centerCoordinate = calcCenterCoordinate(this.upperLeftCoordinate, this.size, this.rotation),
 this.upperRightCoordinate = calcCornerCoordinate(this.centerCoordinate, this.size, Math.PI/4, this.rotation),
 this.bottomLeftCoordinate = calcCornerCoordinate(this.centerCoordinate, this.size, 5*Math.PI/4, this.rotation),
 this.bottomRightCoordinate = calcCornerCoordinate(this.centerCoordinate, this.size, 7*Math.PI/4, this.rotation),

 //the getter and setter notation so I can get UL coordinates out
 //although.... why do this? why not take care of everything in the back end?
 //cuz then I have to make a function to draw anything....

 this.leftBranchRealignAfterRotation = function(){
    //Remember, rotation is around (original) upperleft corner, not center. (Hence the 135deg rotation and angle adjustment
    var holder = [this.upperLeftCoordinate.copyCoordinate(), this.bottomLeftCoordinate.copyCoordinate(), this.bottomRightCoordinate.copyCoordinate(), this.upperRightCoordinate.copyCoordinate()]
  this.upperLeftCoordinate = holder[3]
  this.bottomLeftCoordinate = holder[0]
  this.bottomRightCoordinate = holder[1]
  this.upperRightCoordinate =  holder[2]
  //after rotating, get rid of "extra" degrees.
  this.rotation = this.rotation - 90
  return this //do I really need this?
 }

 this.rightBranchRealignAfterRotation = function(){
    //Remember, rotation is around (original) upper right corner, not center. (Hence the 135deg rotation and angle adjustment
    var holder = [this.upperLeftCoordinate.copyCoordinate(), this.bottomLeftCoordinate.copyCoordinate(), this.bottomRightCoordinate.copyCoordinate(), this.upperRightCoordinate.copyCoordinate()]
  this.upperLeftCoordinate = holder[2]
  this.bottomLeftCoordinate = holder[0]
  this.bottomRightCoordinate = holder[3]
  this.upperRightCoordinate =  holder[1]
  //after rotating, get rid of "extra" degrees.
  this.rotation = this.rotation - 180 
  return this //do I really need this?
 }

 // Draw the square (finally!)
 // I convert coordinates from BL to UL
 // 'rotation' parameter is reversed w/ negative
 this.draw = function(){
  var convertedUpperLeftCoordinate = coordConversion(this.canvas, this.upperLeftCoordinate)
  draw.rect(this.size, this.size).move(convertedUpperLeftCoordinate.x, convertedUpperLeftCoordinate.y).fill(this.color).rotate(-this.rotation, convertedUpperLeftCoordinate.x, convertedUpperLeftCoordinate.y)
  }

 this.drawInverted = function(){
  draw.rect(this.size, this.size).move(this.upperLeftCoordinate.x, this.upperLeftCoordinate.y).fill(this.color).rotate(-this.rotation, this.upperLeftCoordinate.x, this.upperLeftCoordinate.y)
 }
  
}

var drawPyTree = function(numIter, maxIter, prevSquare, colorRamp){
  if (numIter == 0){} //no more branches, end on square
  else {

    var step_down_size = 1 //usually 1
    var curIter = numIter
    
    //get branch colors
    //pass this in as a function, along with a color ramp
   var paletteSize = Math.floor(colorRamp.length / maxIter)
   var colorIndex = function(){
	//the 'maxIter/curIter' math is exponential, not scalar
	//If I want scalar, I have to figure out a different way to do it
	var dividend = Math.floor(maxIter*3/curIter)
        if ( dividend > colorRamp.length - 2 ){
	    dividend = colorRamp.length - 2
	} 
	console.log(dividend)
	return dividend;

    }
    var leftBranchColor = colorRamp[colorIndex()]

    //draw leftBranch base
    var leftBranch = new PySquare(myCanvas, prevSquare.upperLeftCoordinate, scaleDown(prevSquare.size, step_down_size), prevSquare.rotation + 135, leftBranchColor )
    leftBranch.draw()
    leftBranch.leftBranchRealignAfterRotation()
    drawPyTree(curIter - 1, maxIter, leftBranch, colorRamp);

    var rightBranchColor = colorRamp[colorIndex() + 1]
    //draw rightBranch base
    //right branch corners are different are different
    curIter = numIter
    var rightBranch = new PySquare(myCanvas, prevSquare.upperRightCoordinate, scaleDown(prevSquare.size, step_down_size), prevSquare.rotation + 135, rightBranchColor)
    rightBranch.draw()
    rightBranch.rightBranchRealignAfterRotation() //includes angle adjustment
    drawPyTree(curIter - 1, maxIter, rightBranch, colorRamp);
  }
};




/*  UTILITY FUNCTIONS  */


function calcCenterCoordinate(upperLeftCoordinate, size, offsetRotation){
  //calculated as a "level" square plus 'offsetRotation'
  var base = new Coordinate(upperLeftCoordinate.x, upperLeftCoordinate.y)
  var rotator = new Coordinate(upperLeftCoordinate.x + (Math.sqrt((Math.pow(size,2))/2)), upperLeftCoordinate.y)
  var offset = degToRad(offsetRotation)
  var centerX = base.x + (rotator.x - base.x) * Math.cos(-(Math.PI/4) + offset) - (rotator.y - base.y) * Math.sin(-(Math.PI/4) + offset)
  var centerY = base.y + (rotator.x - base.x) * Math.sin(-(Math.PI/4) + offset) + (rotator.y - base.y) * Math.cos(-(Math.PI/4) + offset)
  return new Coordinate(centerX, centerY)
}

function calcCornerCoordinate(centerCoordinate, size, whichCorner, offsetRotation){
 // whichCorner values should be:
 // upper right corner:  PI/4
 // upper left corner: 3PI/4
 // bottom left corner: 5PI/4
 // bottom right corner: 7PI/4
 
 //calculated as a "level" square plus 'offsetRotation'
 var base = new Coordinate(centerCoordinate.x, centerCoordinate.y)
 var rotator = new Coordinate(centerCoordinate.x + ((size * Math.sqrt(2))/2), centerCoordinate.y)
 var cornerX = base.x + (rotator.x - base.x) * Math.cos(whichCorner + degToRad(offsetRotation)) - (rotator.y - base.y) * Math.sin(whichCorner + degToRad(offsetRotation))
 var cornerY = base.y + (rotator.x - base.x) * Math.sin(whichCorner + degToRad(offsetRotation)) + (rotator.y - base.y) * Math.cos(whichCorner + degToRad(offsetRotation))
  return new Coordinate(cornerX, cornerY)
}

//convert Coordinate from BL coord system to UL coord system
function coordConversion(svgCanvas, blCoordinate){
  //console.log("Type of passed-in value is SVGCanvas: " + (svgCanvas instanceof SVGCanvas))
  //console.log("Type of passed-in value is Coordinate: " + (blCoordinate instanceof Coordinate))
  var ulCoordinateX = blCoordinate.x;
  var ulCoordinateY = svgCanvas.height - blCoordinate.y;
  return new Coordinate(ulCoordinateX, ulCoordinateY);
}

function URtoBLconversion(svgcanvas, urCoordinate){
  var blCoordinateX = urCoordinate.x
  var blCoordinateY = svgcanvas.height - urCoordinate.y
  return new Coordinate(blCoordinateX, blCoordinateY)
}



//convert degrees to radians
function degToRad(degrees){
  return degrees * (Math.PI/180)
}

//convert radians to degrees
function radToDeg(radians){
  return radians * (180/Math.PI)
}

//scales down regular pythagoras tree squares based on iteration number
function scaleDown(size, steps){
  var newSize = size;
  for (var i = 1; i <= steps; i++){
    newSize = newSize * (1/2) * Math.sqrt(2)
  }
  return newSize;
}
