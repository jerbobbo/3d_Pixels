
var arguments = process.argv;

/* check to make sure the script was launched with 2 arguments and 
return an error if it was not */
if (arguments.length < 4) {
  console.log("Not enough arguments. Correct format should be node 3d_Pixels_3 imageURL outputFile.jscad");
  process.exit(1);
}

//input image file URL should be first argument
var inFile = arguments[2];

//output filename should be second argument
var outFile = arguments[3];

//create output string with first line of jscad file, declaring main() function and array
var jscadCode = 'function main() {\n\tvar a = [';

//this will use the getPixels module
var getPixels = require('get-pixels')

getPixels(inFile, function(err, pixels) {
  if(err) {
    console.log("Bad image path")
    return
  }

  //maximum thickness in millimeters for thickest (darkest) sections of image
  var maxHeight = 8;

  //loop through array to get pixel data and convert to number between 0 and maxHeight
  for (var i=0; i<pixels.shape[0]; i++) {
  	var rowArray = [];
  	for (var j=0; j<pixels.shape[1]; j++) {

  		//get grayscale value by taking weighted R G B data from each pixel
  		var greyVal = 0.2989 * pixels.get(i,j,0) + 0.5870 * pixels.get(i,j,1) + 0.1140 * pixels.get(i,j,2);
  		
      /* take inverse of percentage (255 = white, whereas we want 255 = black) 
      and multiply times maxHeight */
      var pixHeight = (255 - greyVal) / 255 * maxHeight;

      //add 0.5 mm to pixHeight so that the minimum wall thickness is 0.5, and not 0
  		rowArray[j] = 0.5 + Math.round(pixHeight * 10) / 10;
  		}
  	
  	//append row array to jscad code
  	jscadCode += '[' + rowArray + ']');

  	//add comma if not the last row in the array
  	if (i < (pixels.shape[0] - 1))
  		jscadCode += (outFile, ',\n');
  }

  //append last bracket + semicolon and newline
  jscadCode += '];\n');

  //append code to create cubes of different heights based on the values in the array
  jscadCode += "\n\tvar b = [];\n\n\tfor (var i = 0; i < " + pixels.shape[0] + "; i++) {\n\t\tfor (var j = 0; j < " + pixels.shape[1] + "; j++) {\n\t\t\tb.push(cube({size: [1,1,a[i][j]], center:false}).translate([-i,j,0]));\n\t\t}\n\t}\n\n\treturn b;\n}";

  var fs = require('fs');

  //create outFile and write jscadCode to file
  fs.writeFile(outFile, jscadCode, function (err) {
    if (err) throw err;
  });

})

