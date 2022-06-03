/* eslint-disable no-bitwise */

module.exports = (text, pattern, options) => {
  const { location, distance, threshold } = { location: 0, distance: 100, threshold: 0.4, ...options };

  if (pattern === text) return true; // Exact match
  if (pattern.length > 32) return false; // This algorithm cannot be used

  // Set starting location at beginning text and initialise the alphabet.
  const s = (() => {
    const q = {};
    let i;

    for (i = 0; i < pattern.length; i += 1) {
      q[pattern.charAt(i)] = 0;
    }

    for (i = 0; i < pattern.length; i += 1) {
      q[pattern.charAt(i)] |= 1 << (pattern.length - i - 1);
    }

    return q;
  })();

  // Compute and return the score for a match with e errors and x location.
  // Accesses loc and pattern through being a closure.
  function matchBitmapScore(e, x) {
    const accuracy = e / pattern.length;
    const proximity = Math.abs(location - x);

    if (!distance) {
      // Dodge divide by zero error.
      return proximity ? 1.0 : accuracy;
    }
    return accuracy + proximity / distance;
  }

  let scoreThreshold = threshold; // Highest score beyond which we give up.
  let bestLoc = text.indexOf(pattern, location); // Is there a nearby exact match? (speedup)

  if (bestLoc !== -1) {
    scoreThreshold = Math.min(matchBitmapScore(0, bestLoc), scoreThreshold);
    // What about in the other direction? (speedup)
    bestLoc = text.lastIndexOf(pattern, location + pattern.length);

    if (bestLoc !== -1) {
      scoreThreshold = Math.min(matchBitmapScore(0, bestLoc), scoreThreshold);
    }
  }

  // Initialise the bit arrays.
  const matchmask = 1 << (pattern.length - 1);
  bestLoc = -1;

  let binMin;
  let binMid;
  let binMax = pattern.length + text.length;
  let lastRd;

  for (let d = 0; d < pattern.length; d += 1) {
    // Scan for the best match; each iteration allows for one more error.
    // Run a binary search to determine how far from 'loc' we can stray at this
    // error level.
    binMin = 0;
    binMid = binMax;
    while (binMin < binMid) {
      if (matchBitmapScore(d, location + binMid) <= scoreThreshold) {
        binMin = binMid;
      } else {
        binMax = binMid;
      }
      binMid = Math.floor((binMax - binMin) / 2 + binMin);
    }
    // Use the result from this iteration as the maximum for the next.
    binMax = binMid;
    let start = Math.max(1, location - binMid + 1);
    const finish = Math.min(location + binMid, text.length) + pattern.length;

    const rd = Array(finish + 2);
    rd[finish + 1] = (1 << d) - 1;
    for (let j = finish; j >= start; j -= 1) {
      // The alphabet (s) is a sparse hash, so the following line generates
      // warnings.
      const charMatch = s[text.charAt(j - 1)];
      if (d === 0) {
        // First pass: exact match.
        rd[j] = ((rd[j + 1] << 1) | 1) & charMatch;
      } else {
        // Subsequent passes: fuzzy match.
        rd[j] = (((rd[j + 1] << 1) | 1) & charMatch) | (((lastRd[j + 1] | lastRd[j]) << 1) | 1) | lastRd[j + 1];
      }
      if (rd[j] & matchmask) {
        const score = matchBitmapScore(d, j - 1);
        // This match will almost certainly be better than any existing match.
        // But check anyway.
        if (score <= scoreThreshold) {
          // Told you so.
          scoreThreshold = score;
          bestLoc = j - 1;
          if (bestLoc > location) {
            // When passing loc, don't exceed our current distance from loc.
            start = Math.max(1, 2 * location - bestLoc);
          } else {
            // Already passed loc, downhill from here on in.
            break;
          }
        }
      }
    }
    // No hope for a (better) match at greater error levels.
    if (matchBitmapScore(d + 1, location) > scoreThreshold) {
      break;
    }
    lastRd = rd;
  }

  return !(bestLoc < 0);
};
