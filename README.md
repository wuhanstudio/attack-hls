Attack HLS
====

> 不少应用利用 HLS 在 Xilinx Zynq 系列芯片上部署深度学习模型，我想借这次夏令营试试 HLS 生成的 IP 核是否安全，同学们项目的 IP 核会不会受到攻击 ;)

## Introduction

现在深度学习因为高精度被得到广泛应用，但是很多时候模型被当做黑匣子，只要准确度高，模型根据什么做出预测并没有得到太大关注。

但是近几年研究发现深度学习模型非常容易受到攻击，从人眼来看图像没有发生任何变化，但是深度学习模型会做出错误的判断。

![](https://xilinx-1252843818.cos.ap-nanjing.myqcloud.com/panda.png)

那么 HLS 从C实现的卷积生成IP的核，是不是同样容易受到攻击呢？

## Implementation

考虑到大家时间不是很多，我打算一个比较小的 Lenet-5 进行测试，最终希望能证明 HLS 是会被攻击，或者不会受到攻击。

每个部分的算法基本都找到了开源实现，这个项目主要是希望验证 HLS 是否能生成可以信任的 IP 核。

- Black-Box Attack:

    https://github.com/Trusted-AI/adversarial-robustness-toolbox

- Lenet (Python):

    https://github.com/wuhanstudio/attack-hls

- Lenet (HLS):

    https://github.com/changwoolee/lenet5_hls
https://github.com/Xilinx/finn-hlslib