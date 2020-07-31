#include <cassert>
#include <iostream>
#include <stdio.h>
#include <hls_opencv.h>

#include "lenet.h"

#define INPUT_IMG "E:/test.bmp"

#define W 28
#define H 28
#define CH 1

#define PACKETS (W*CH*H/4)
unsigned char input_buffer[W*H];
wide_stream input_data[PACKETS];
wide_stream output_data[1];
unsigned int output_buffer = 0;

void reset_data(void) {
	output_data[0].data = 0;
	output_data[0].last = 0;
	output_data[0].user = 0;
}

int main() {

	cv::Mat imgSrc;
	imgSrc = cv::imread(INPUT_IMG,CV_8UC1);
	printf("r %d, c %d, d %d\n",imgSrc.rows,imgSrc.cols,imgSrc.dims);

	uint8_t *myData = imgSrc.data;
	int width = imgSrc.cols;
	int height = imgSrc.rows;
	int _stride = imgSrc.step;//in case cols != strides
	for(int i = 0; i < height; i++)
	{
	    for(int j = 0; j < width; j++)
	    {
	        input_buffer[i * _stride + j] = myData[ i * _stride + j];
	        printf("%3d ", myData[ i * _stride + j]);
	    }
	    printf("\n");
	}

	for (int i = 0; i < PACKETS; ++i) {
		input_data[i].data.range(7,0) = input_buffer[4*i];
		input_data[i].data.range(15,8) = input_buffer[4*i + 1];
		input_data[i].data.range(23,16) = input_buffer[4*i + 2];
		input_data[i].data.range(31,24) = input_buffer[4*i + 3];
	}

	input_data[0].user = 1;
	input_data[PACKETS-1].last = 1;

	reset_data();

 	lenet(input_data, output_data, imgSrc.rows, imgSrc.cols);
	printf("Evaluate results\n");

	output_buffer = output_data[0].data;

	if(output_buffer==5){
		printf("Lenet Calculation Correct\n");
	}else{
		printf("Lenet Calculation Wrong\n");
	}
	// Equal if no elements disagree
	assert(output_buffer==5);
}
