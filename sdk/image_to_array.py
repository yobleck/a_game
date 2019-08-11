#converts map image to array and saves to file for loading into a_game
from PIL import Image;
import numpy;

#set z value for array like    z=0 for over world   or z=1 for dungeon etc.
#z= ;

#opens image and gets some info about it
source = Image.open("overworld_test.png");
pix = source.load();
size = source.size;
#print (size);
#print (pix[0,0]);

#creates array from image rgb values
imgarray = numpy.array(source);
#print (array[0][0][2]);

outarray = numpy.zeros(shape=(size[0],size[0]),dtype=numpy.int);
#print (outarray);

#converts rgb values into 2d array that encode map info
for x in range(size[0]):
	for y in range(size[0]):
		#checks if green 0,100,0
		if imgarray[x][y][0]==0 and imgarray[x][y][1]==100 and imgarray[x][y][2]==0:
			outarray[x][y]=0;
			
		#checks if black 0,0,0
		elif imgarray[x][y][0]==0 and imgarray[x][y][1]==0 and imgarray[x][y][2]==0:
			outarray[x][y]=1;
			
		#checks if brown 139,69,19
		elif imgarray[x][y][0]==139 and imgarray[x][y][1]==69 and imgarray[x][y][2]==19:
			outarray[x][y]=2;
			
		#checks if blue 0,0,205
		elif imgarray[x][y][0]==0 and imgarray[x][y][1]==0 and imgarray[x][y][2]==205:
			outarray[x][y]=3;
			
		#checks if purple 147,112,219
		elif imgarray[x][y][0]==147 and imgarray[x][y][1]==112 and imgarray[x][y][2]==219:
			outarray[x][y]=4;
			
		#checks if gray 100,100,100
		elif imgarray[x][y][0]==100 and imgarray[x][y][1]==100 and imgarray[x][y][2]==100:
			outarray[x][y]=5;
			
		else:
			outarray[x][y]=9;
			print ("the pixel at coordinates", x , ",", y, "does not correspond to an accepted value." );
			
#print(outarray);


numpy.savetxt("map.wtf",outarray, fmt="%.4g");  #savetxt adds a newline char at the need of the file which must be removed
