var maxHeight = 8;
var outFile = 'image2.scad';
var fs = require('fs');

var getPixels = require('get-pixels')

//create outFile
fs.writeFile(outFile, '', function (err) {
  if (err) throw err;
  });

function printToFile(fileName, text) {
  fs.appendFile(fileName, text, function (err) {
  if (err) throw err;
  });
};

printToFile(outFile, 'a = [');
 
getPixels("skirt_blowing.jpg", function(err, pixels) {
  if(err) {
    console.log("Bad image path")
    return
  }


  for (var i=0; i<pixels.shape[0]; i++) {
  	var rowArray = [];
  	for (var j=0; j<pixels.shape[1]; j++) {
  		//get grayscale value by taking weighted R G B data from each pixel
  		var greyVal = 0.2989 * pixels.get(i,j,0) + 0.5870 * pixels.get(i,j,1) + 0.1140 * pixels.get(i,j,2);
  		var pixHeight = (255 - greyVal) / 255 * maxHeight;
  		rowArray[j] = 0.5 + Math.round(pixHeight * 10) / 10;
  		}
  	
  	//append row array to SCAD file
  	printToFile(outFile, '[' + rowArray + ']');

  	//add comma if not the last row in the array
  	if (i < (pixels.shape[0] - 1))
  		printToFile(outFile, ',\n');
  }

  //append last bracket + semicolon and newline
  printToFile(outFile, '];\n');

  //append code to create cubes of different heights based on the values in the array
  var openScadCube = "for (i = [0:" + pixels.shape[0] + "])\n{\n\tfor(j = [0:" + pixels.shape[1] + "])\n\t{\n\t\ttranslate([-i,j,0])\n\t\t\tcube([1,1,a[i][j]],center=false);\n\t}\n}";
  printToFile(outFile,openScadCube);

})

