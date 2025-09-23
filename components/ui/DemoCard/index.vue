// 正常对盒子进行渐变
<template>
    <div class="border-box glass-effect"></div>
</template>

<style scoped>
.border-box {
    width: 200px;
    height: 100px;
    border-radius: 5px;
    padding: 1px;
    margin: 20px auto;
    /* 渐变 */
    background: linear-gradient(to right, #00135a, #01a1ff);
    /* 线性渐变：从开始到结束都为白色，这里使用两个，不同的是第一个带content-box */
    /* 原因就是为了能多出一个空间 */
    -webkit-mask: linear-gradient(#fff 0 100%) content-box,
        linear-gradient(#fff 0 100%);
     /* 使用-webkit-mask-composite: xor; 只显示不重合的地方*/
    -webkit-mask-composite: xor;
}
</style>
