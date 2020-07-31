/*
The canny_edge IP is based on the work of Aadeetya Shreedhar and Alexander Wang
https://github.com/ka367/Lane-Detecting-Using-Hough-Transform/blob/master/test.cpp
*/
#include "hls_video.h"
#include <ap_fixed.h>
#include "iostream"
#include "ap_int.h"
#include <string.h>


struct wide_stream {
	float data;
	ap_uint<1> user;
	ap_uint<1> last;
};


void lenet(wide_stream* in_stream, wide_stream* out_stream);
