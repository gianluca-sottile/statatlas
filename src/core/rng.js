/* StatAtlas · core/rng.js
 * Generatore Mersenne-Twister compatibile con R (RNGkind predefinito:
 * "Mersenne-Twister", normal.kind "Inversion"). Con lo stesso seed
 * produce gli stessi valori di runif(), rnorm(), rcauchy() in R.
 * Riferimento: sorgenti R, src/main/RNG.c e src/nmath/snorm.c, rcauchy.c.
 */
var SA = window.SA || (window.SA = {});

SA.RRNG = (function () {
  var N = 624, M = 397, UPPER = 0x80000000, LOWER = 0x7fffffff, MATRIX_A = 0x9908b0df;
  var I2_32M1 = 2.328306437080797e-10; // 1 / (2^32 - 1)

  function RRNG(seed) { this.setSeed(seed == null ? 1 : seed); }

  // set.seed(seed): scrambling iniziale LCG 69069 come in RNG_Init()
  RRNG.prototype.setSeed = function (seed) {
    var s = seed >>> 0, j;
    for (j = 0; j < 50; j++) s = (Math.imul(69069, s) + 1) >>> 0;
    var d = new Uint32Array(N + 1);
    for (j = 0; j <= N; j++) { s = (Math.imul(69069, s) + 1) >>> 0; d[j] = s; }
    this.mt = d.subarray(1);
    this.mti = N; // FixupSeeds(initial = TRUE)
    this.seed = seed;
  };

  RRNG.prototype.genrand = function () {
    var mt = this.mt, y, kk;
    if (this.mti >= N) {
      for (kk = 0; kk < N - M; kk++) {
        y = (mt[kk] & UPPER) | (mt[kk + 1] & LOWER);
        mt[kk] = mt[kk + M] ^ (y >>> 1) ^ ((y & 1) ? MATRIX_A : 0);
      }
      for (; kk < N - 1; kk++) {
        y = (mt[kk] & UPPER) | (mt[kk + 1] & LOWER);
        mt[kk] = mt[kk + (M - N)] ^ (y >>> 1) ^ ((y & 1) ? MATRIX_A : 0);
      }
      y = (mt[N - 1] & UPPER) | (mt[0] & LOWER);
      mt[N - 1] = mt[M - 1] ^ (y >>> 1) ^ ((y & 1) ? MATRIX_A : 0);
      this.mti = 0;
    }
    y = mt[this.mti++];
    y ^= (y >>> 11);
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= (y >>> 18);
    return (y >>> 0) * 2.3283064365386963e-10;
  };

  // unif_rand() con fixup: valori in (0, 1)
  RRNG.prototype.unif = function () {
    var x = this.genrand();
    if (x <= 0) return 0.5 * I2_32M1;
    if (1 - x <= 0) return 1 - 0.5 * I2_32M1;
    return x;
  };

  // norm_rand(), metodo INVERSION con BIG = 2^27
  RRNG.prototype.norm = function () {
    var BIG = 134217728, u = this.unif();
    u = Math.floor(BIG * u) + this.unif();
    return SA.qnorm(u / BIG);
  };

  RRNG.prototype.runif = function (n, a, b) {
    a = a == null ? 0 : a; b = b == null ? 1 : b;
    var out = new Float64Array(n);
    for (var i = 0; i < n; i++) out[i] = a + (b - a) * this.unif();
    return out;
  };
  RRNG.prototype.rnorm = function (n, mu, sd) {
    mu = mu || 0; sd = sd == null ? 1 : sd;
    var out = new Float64Array(n);
    for (var i = 0; i < n; i++) out[i] = mu + sd * this.norm();
    return out;
  };
  // rcauchy(): location + scale * tan(pi * unif_rand())
  RRNG.prototype.rcauchy = function (n, loc, s) {
    loc = loc || 0; s = s == null ? 1 : s;
    var out = new Float64Array(n);
    for (var i = 0; i < n; i++) out[i] = loc + s * Math.tan(Math.PI * this.unif());
    return out;
  };
  // Laplace per inversione (stessa formula dello script R generato)
  RRNG.prototype.rlaplace = function (n, loc, b) {
    loc = loc || 0; b = b == null ? 1 : b;
    var out = new Float64Array(n);
    for (var i = 0; i < n; i++) {
      var u = this.unif() - 0.5;
      out[i] = loc - b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
    }
    return out;
  };
  return RRNG;
})();

/* qnorm: algoritmo AS 241 (Wichura, 1988), come in R nmath/qnorm.c */
SA.qnorm = function (p, mu, sigma) {
  mu = mu || 0; sigma = sigma == null ? 1 : sigma;
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  var q = p - 0.5, r, val;
  if (Math.abs(q) <= 0.425) {
    r = 0.180625 - q * q;
    val = q * (((((((r * 2509.0809287301226727 + 33430.575583588128105) * r + 67265.770927008700853) * r +
      45921.953931549871457) * r + 13731.693765509461125) * r + 1971.5909503065514427) * r +
      133.14166789178437745) * r + 3.387132872796366608) /
      (((((((r * 5226.495278852545925 + 28729.085735721942674) * r + 39307.89580009271061) * r +
      21213.794301586595867) * r + 5394.1960214247511077) * r + 687.1870074920579083) * r +
      42.313330701600911252) * r + 1);
  } else {
    r = q < 0 ? p : 1 - p;
    r = Math.sqrt(-Math.log(r));
    if (r <= 5) {
      r -= 1.6;
      val = (((((((r * 7.7454501427834140764e-4 + 0.0227238449892691845833) * r + 0.24178072517745061177) * r +
        1.27045825245236838258) * r + 3.64784832476320460504) * r + 5.7694972214606914055) * r +
        4.6303378461565452959) * r + 1.42343711074968357734) /
        (((((((r * 1.05075007164441684324e-9 + 5.475938084995344946e-4) * r + 0.0151986665636164571966) * r +
        0.14810397642748007459) * r + 0.68976733498510000455) * r + 1.6763848301838038494) * r +
        2.05319162663775882187) * r + 1);
    } else {
      r -= 5;
      val = (((((((r * 2.01033439929228813265e-7 + 2.71155556874348757815e-5) * r + 0.0012426609473880784386) * r +
        0.026532189526576123093) * r + 0.29656057182850489123) * r + 1.7848265399172913358) * r +
        5.4637849111641143699) * r + 6.6579046435011037772) /
        (((((((r * 2.04426310338993978564e-15 + 1.4215117583164458887e-7) * r + 1.8463183175100546818e-5) * r +
        7.868691311456132591e-4) * r + 0.0148753612908506148525) * r + 0.13692988092273580531) * r +
        0.59983220655588793769) * r + 1);
    }
    if (q < 0) val = -val;
  }
  return mu + sigma * val;
};
