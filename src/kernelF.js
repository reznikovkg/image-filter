export default function kernelF(mat, image) {
  const width = this.constants.width;
  const height = this.constants.height;
  const accuracy = this.constants.accuracy;
  const N = this.constants.N;

  // eslint-disable-next-line no-unused-vars
  const zeros = this.constants.zeros;
  // eslint-disable-next-line no-unused-vars
  const ones = this.constants.ones;

  const shortN = Math.round((N - 1) / 2);
  const activePixels = ones;

  const pixelNow = image[this.thread.y][this.thread.x];

  let pixel = [0.0, 0.0, 0.0];
  let sum = [0.0, 0.0, 0.0];

  // eslint-disable-next-line no-unused-vars
  const razerSize = 20;
  // eslint-disable-next-line no-unused-vars
  let razerX = [
    [ 0, 0, 0, 0],
    [ 0, 0, 0, 0],
    [ 0, 0, 0, 0],
    [ 0, 0, 0, 0],
  ];
  let razerY = [
    [ 0, 0, 0, 0],
    [ 0, 0, 0, 0],
    [ 0, 0, 0, 0],
    [ 0, 0, 0, 0],
  ];
  let razerZ = [
    [ 0, 0, 0, 0],
    [ 0, 0, 0, 0],
    [ 0, 0, 0, 0],
    [ 0, 0, 0, 0],
  ];


  for (let j = -shortN; j <= shortN; j++) {


    const matY = shortN + j;
    const pY = this.thread.y + j;
    if (pY < 0 || pY >= height) continue;

    for (let i = -shortN; i <= shortN; i++) {

      if (j === 0 && i === 0) continue;

      const matX = shortN + i;
      const pX = this.thread.x + i;
      if (pX < 0 || pX >= width) continue;

      const p = image[pY][pX];
      const m = mat[matY][matX];


      for (let k = 0; k < 3; k++) {
        let r = Math.round(p[k] * 20);
        r = (r < 0) ? 0 : r;
        r = r > (razerSize - 1) ? (razerSize - 1) : r;

        if (k === 0) {
          razerX[Math.floor(r/4-1)][r%4-1] += 1;
        }
        if (k === 1) {
          razerY[Math.floor(r/4-1)][r%4-1] += 1;
        }
        if (k === 2) {
          razerZ[Math.floor(r/4-1)][r%4-1] += 1;
        }
        sum[k] += m * p[k];
      }
    }
  }

  const avg = [0.0, 0.0, 0.0];

  for (let i = 0; i < 3; i++) {
    let max = 0;
    // eslint-disable-next-line no-unused-vars
    let maxIndex = 0;
    for (let j = 0; j < razerSize; j++) {

      let val = 0;

      if (i === 0) {
        val = razerX[Math.floor(j/4-1)][j%4-1];
      }
      if (i === 1) {
        val = razerY[Math.floor(j/4-1)][j%4-1];
      }
      if (i === 2) {
        val = razerZ[Math.floor(j/4-1)][j%4-1];
      }

      if (val > max) { max = val; maxIndex = j }

    }

    avg[i] = sum[i] / activePixels;
    pixel[i] = Math.abs(pixelNow[i] - avg[i]) > accuracy ?
      /*avg[i]*/ maxIndex / razerSize :
      pixelNow[i];
  }

  this.color(pixel[0], pixel[1], pixel[2])
}
