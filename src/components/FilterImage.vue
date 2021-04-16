<template>
    <div class="filter" :style="{ width: baseSize * 2 }">
        <div style="padding: 10px">
            <input type="file" @change="changeFile" title="Picture">

            <label for="accuracy">
                Accuracy
                <input type="text" @input="changeAccuracy" name="accuracy" id="accuracy" :disabled="!file" :value="accuracy">
            </label>

            <input type="range" max="100" min="1" value="1" @input="inputRange" :disabled="!file">
        </div>
        <div>
            <button @click="changeTypeParams(0)" :class="{ active: typeParams === 0 }">M1</button>
            <button @click="changeTypeParams(1)" :class="{ active: typeParams === 1 }">M2</button>
        </div>
        <div>
            <canvas ref="canvasOriginal" :width="baseSize" :height="baseSize"></canvas>
            <canvas ref="canvasFilter" :width="baseSize" :height="baseSize"></canvas>
        </div>
    </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import {GPU} from 'gpu.js';
import kernelF from './../kernelF';

const mat1 = [
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 0, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0]
]; // 33 zeros // 48 ones

const mat2 = [
    [0, 0, 1, 1, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 1, 1, 1, 0],
    [1, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1],
    [0, 1, 1, 1, 0, 1, 1, 1, 0],
    [0, 0, 1, 1, 0, 1, 1, 0, 0]
]; // 29 zeros //


export default {
    name: 'FilterImage',
    data() {
        return {
            file: null,
            accuracy: 0.2,
            typeParams: 0,
            params: [
                {
                    mat: mat1,
                    ones: 48,
                    zeros: 33
                },
                {
                    mat: mat2,
                    ones: 52,
                    zeros: 29
                },
            ]
        }
    },
    computed: {
        baseSize: function () {
            return 1000;
        }
    },
    methods: {
        inputRange: function (e) {
            this.accuracy = Number.parseFloat(e.target.value) / 100;
            this.printCanvasImage();
        },
        changeFile: function (e) {
            this.file = e.target.files[0];
            this.printCanvasImage();
        },
        // eslint-disable-next-line no-unused-vars
        printCanvasImage: function () {
            const file = this.file;
            const ctx = this.$refs.canvasOriginal.getContext("2d");
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, this.baseSize, this.baseSize)
                this.runFilter(img)
            }
            img.src = URL.createObjectURL(file);

        },
        runFilter: function (img) {
            const gpu = new GPU();
            const kernel = gpu.createKernel(kernelF)
                .setConstants({
                    width: img.width,
                    height: img.height,
                    N: this.params[this.typeParams].mat.length,
                    zeros: this.params[this.typeParams].zeros,
                    ones: this.params[this.typeParams].ones,
                    accuracy: this.accuracy
                })
                .setGraphical(true)
                .setOutput([img.width, img.height]);

            kernel(this.params[this.typeParams].mat, img);

            this.$refs.canvasFilter.getContext("2d").drawImage(kernel.canvas, 0, 0, this.baseSize, this.baseSize)
        },
        changeAccuracy: function (e) {
            this.accuracy = Number.parseFloat(e.target.value);
            this.printCanvasImage();
        },
        changeTypeParams: function (val) {
            this.typeParams = val;
            this.printCanvasImage();
        },
    }
}
</script>

<style scoped>
.filter {
    display: flex;
    flex-direction: column;
}

button.active {
    background: green;
}
</style>
