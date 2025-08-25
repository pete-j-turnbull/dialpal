/**
 * Minimal diff_match_patch implementation for text diffing
 * Based on the original diff_match_patch library (BSD License)
 * Simplified version focused on text comparison
 */

export const DIFF_DELETE = -1;
export const DIFF_INSERT = 1;
export const DIFF_EQUAL = 0;

export type DiffResult = [number, string];

export class DiffMatchPatch {
  public Diff_Timeout = 1.0;

  /**
   * Find the differences between two texts.
   */
  public diff_main(text1: string, text2: string): DiffResult[] {
    // Check for null inputs.
    if (text1 == null || text2 == null) {
      throw new Error("Null input. (diff_main)");
    }

    // Check for equality (speedup).
    if (text1 === text2) {
      if (text1) {
        return [[DIFF_EQUAL, text1]];
      }
      return [];
    }

    // Trim off common prefix (speedup).
    let commonlength = this.diff_commonPrefix(text1, text2);
    const commonprefix = text1.substring(0, commonlength);
    text1 = text1.substring(commonlength);
    text2 = text2.substring(commonlength);

    // Trim off common suffix (speedup).
    commonlength = this.diff_commonSuffix(text1, text2);
    const commonsuffix = text1.substring(text1.length - commonlength);
    text1 = text1.substring(0, text1.length - commonlength);
    text2 = text2.substring(0, text2.length - commonlength);

    // Compute the diff on the middle block.
    const diffs = this.diff_compute(text1, text2);

    // Restore the prefix and suffix.
    if (commonprefix) {
      diffs.unshift([DIFF_EQUAL, commonprefix]);
    }
    if (commonsuffix) {
      diffs.push([DIFF_EQUAL, commonsuffix]);
    }

    this.diff_cleanupMerge(diffs);
    return diffs;
  }

  /**
   * Find the differences between two texts. Simplifies the problem by stripping
   * any common prefix or suffix and eliminating trivial equalities.
   */
  private diff_compute(text1: string, text2: string): DiffResult[] {
    if (!text1) {
      return [[DIFF_INSERT, text2]];
    }

    if (!text2) {
      return [[DIFF_DELETE, text1]];
    }

    const longtext = text1.length > text2.length ? text1 : text2;
    const shorttext = text1.length > text2.length ? text2 : text1;
    const i = longtext.indexOf(shorttext);
    if (i !== -1) {
      const diffs: DiffResult[] = [
        [DIFF_INSERT, longtext.substring(0, i)],
        [DIFF_EQUAL, shorttext],
        [DIFF_INSERT, longtext.substring(i + shorttext.length)],
      ];
      if (text1.length > text2.length) {
        diffs[0][0] = diffs[2][0] = DIFF_DELETE;
      }
      return diffs;
    }

    if (shorttext.length === 1) {
      return [
        [DIFF_DELETE, text1],
        [DIFF_INSERT, text2],
      ];
    }

    // Perform a half-match.
    const hm = this.diff_halfMatch(text1, text2);
    if (hm) {
      const text1_a = hm[0];
      const text1_b = hm[1];
      const text2_a = hm[2];
      const text2_b = hm[3];
      const mid_common = hm[4];
      const diffs_a = this.diff_main(text1_a, text2_a);
      const diffs_b = this.diff_main(text1_b, text2_b);
      return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
    }

    return this.diff_bisect(text1, text2);
  }

  /**
   * Find the 'middle snake' of a diff.
   */
  private diff_bisect(text1: string, text2: string): DiffResult[] {
    const text1_length = text1.length;
    const text2_length = text2.length;
    const max_d = Math.ceil((text1_length + text2_length) / 2);
    const v_offset = max_d;
    const v_length = 2 * max_d;
    const v1 = new Array(v_length);
    const v2 = new Array(v_length);
    for (let x = 0; x < v_length; x++) {
      v1[x] = -1;
      v2[x] = -1;
    }
    v1[v_offset + 1] = 0;
    v2[v_offset + 1] = 0;
    const delta = text1_length - text2_length;
    const front = delta % 2 !== 0;
    const k1start = 0;
    const k1end = 0;
    const k2start = 0;
    const k2end = 0;
    for (let d = 0; d < max_d; d++) {
      if (new Date().getTime() > this.Diff_Timeout * 1000) {
        break;
      }

      for (let k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
        const k1_offset = v_offset + k1;
        let x1;
        if (k1 === -d || (k1 !== d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
          x1 = v1[k1_offset + 1];
        } else {
          x1 = v1[k1_offset - 1] + 1;
        }
        let y1 = x1 - k1;
        while (
          x1 < text1_length &&
          y1 < text2_length &&
          text1.charAt(x1) === text2.charAt(y1)
        ) {
          x1++;
          y1++;
        }
        v1[k1_offset] = x1;
        if (x1 > text1_length) {
          // Ran off the right of the graph.
        } else if (y1 > text2_length) {
          // Ran off the bottom of the graph.
        } else if (front) {
          const k2_offset = v_offset + delta - k1;
          if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] !== -1) {
            const x2 = text1_length - v2[k2_offset];
            if (x1 >= x2) {
              return this.diff_bisectSplit(text1, text2, x1, y1);
            }
          }
        }
      }

      for (let k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
        const k2_offset = v_offset + k2;
        let x2;
        if (k2 === -d || (k2 !== d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
          x2 = v2[k2_offset + 1];
        } else {
          x2 = v2[k2_offset - 1] + 1;
        }
        let y2 = x2 - k2;
        while (
          x2 < text1_length &&
          y2 < text2_length &&
          text1.charAt(text1_length - x2 - 1) ===
            text2.charAt(text2_length - y2 - 1)
        ) {
          x2++;
          y2++;
        }
        v2[k2_offset] = x2;
        if (x2 > text1_length) {
          // Ran off the left of the graph.
        } else if (y2 > text2_length) {
          // Ran off the top of the graph.
        } else if (!front) {
          const k1_offset = v_offset + delta - k2;
          if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] !== -1) {
            const x1 = v1[k1_offset];
            const y1 = v_offset + x1 - k1_offset;
            x2 = text1_length - x2;
            if (x1 >= x2) {
              return this.diff_bisectSplit(text1, text2, x1, y1);
            }
          }
        }
      }
    }
    // Diff took too long and hit the deadline or
    // number of diffs equals number of characters, no commonality at all.
    return [
      [DIFF_DELETE, text1],
      [DIFF_INSERT, text2],
    ];
  }

  private diff_bisectSplit(
    text1: string,
    text2: string,
    x: number,
    y: number
  ): DiffResult[] {
    const text1a = text1.substring(0, x);
    const text2a = text2.substring(0, y);
    const text1b = text1.substring(x);
    const text2b = text2.substring(y);

    const diffs = this.diff_main(text1a, text2a);
    const diffsb = this.diff_main(text1b, text2b);

    return diffs.concat(diffsb);
  }

  private diff_halfMatch(text1: string, text2: string): string[] | null {
    if (this.Diff_Timeout <= 0) {
      return null;
    }
    const longtext = text1.length > text2.length ? text1 : text2;
    const shorttext = text1.length > text2.length ? text2 : text1;
    if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
      return null;
    }

    const hm1 = this.diff_halfMatchI(
      longtext,
      shorttext,
      Math.ceil(longtext.length / 4)
    );
    const hm2 = this.diff_halfMatchI(
      longtext,
      shorttext,
      Math.ceil(longtext.length / 2)
    );
    let hm;
    if (!hm1 && !hm2) {
      return null;
    } else if (!hm2) {
      hm = hm1;
    } else if (!hm1) {
      hm = hm2;
    } else {
      hm = hm1[4].length > hm2![4].length ? hm1 : hm2;
    }

    if (text1.length > text2.length) {
      return hm;
    } else {
      return [hm![2], hm![3], hm![0], hm![1], hm![4]];
    }
  }

  private diff_halfMatchI(
    longtext: string,
    shorttext: string,
    i: number
  ): string[] | null {
    const seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
    let best_common = "";
    let best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
    let j = -1;
    while ((j = shorttext.indexOf(seed, j + 1)) !== -1) {
      const prefixLength = this.diff_commonPrefix(
        longtext.substring(i),
        shorttext.substring(j)
      );
      const suffixLength = this.diff_commonSuffix(
        longtext.substring(0, i),
        shorttext.substring(0, j)
      );
      if (best_common.length < suffixLength + prefixLength) {
        best_common =
          shorttext.substring(j - suffixLength, j) +
          shorttext.substring(j, j + prefixLength);
        best_longtext_a = longtext.substring(0, i - suffixLength);
        best_longtext_b = longtext.substring(i + prefixLength);
        best_shorttext_a = shorttext.substring(0, j - suffixLength);
        best_shorttext_b = shorttext.substring(j + prefixLength);
      }
    }
    if (best_common.length * 2 >= longtext.length) {
      return [
        best_longtext_a!,
        best_longtext_b!,
        best_shorttext_a!,
        best_shorttext_b!,
        best_common,
      ];
    } else {
      return null;
    }
  }

  private diff_commonPrefix(text1: string, text2: string): number {
    if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) {
      return 0;
    }
    let pointermin = 0;
    let pointermax = Math.min(text1.length, text2.length);
    let pointermid = pointermax;
    let pointerstart = 0;
    while (pointermin < pointermid) {
      if (
        text1.substring(pointerstart, pointermid) ===
        text2.substring(pointerstart, pointermid)
      ) {
        pointermin = pointermid;
        pointerstart = pointermin;
      } else {
        pointermax = pointermid;
      }
      pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
    }
    return pointermid;
  }

  private diff_commonSuffix(text1: string, text2: string): number {
    if (
      !text1 ||
      !text2 ||
      text1.charAt(text1.length - 1) !== text2.charAt(text2.length - 1)
    ) {
      return 0;
    }
    let pointermin = 0;
    let pointermax = Math.min(text1.length, text2.length);
    let pointermid = pointermax;
    let pointerend = 0;
    while (pointermin < pointermid) {
      if (
        text1.substring(
          text1.length - pointermid,
          text1.length - pointerend
        ) ===
        text2.substring(text2.length - pointermid, text2.length - pointerend)
      ) {
        pointermin = pointermid;
        pointerend = pointermin;
      } else {
        pointermax = pointermid;
      }
      pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
    }
    return pointermid;
  }

  private diff_cleanupMerge(diffs: DiffResult[]): void {
    diffs.push([DIFF_EQUAL, ""]);
    let pointer = 0;
    let count_delete = 0;
    let count_insert = 0;
    let text_delete = "";
    let text_insert = "";
    while (pointer < diffs.length) {
      switch (diffs[pointer][0]) {
        case DIFF_INSERT:
          count_insert++;
          text_insert += diffs[pointer][1];
          break;
        case DIFF_DELETE:
          count_delete++;
          text_delete += diffs[pointer][1];
          break;
        case DIFF_EQUAL:
          if (count_delete + count_insert > 1) {
            if (count_delete !== 0 && count_insert !== 0) {
              const commonlength = this.diff_commonPrefix(
                text_insert,
                text_delete
              );
              if (commonlength !== 0) {
                if (
                  pointer - count_delete - count_insert > 0 &&
                  diffs[pointer - count_delete - count_insert - 1][0] ===
                    DIFF_EQUAL
                ) {
                  diffs[pointer - count_delete - count_insert - 1][1] +=
                    text_insert.substring(0, commonlength);
                } else {
                  diffs.splice(0, 0, [
                    DIFF_EQUAL,
                    text_insert.substring(0, commonlength),
                  ]);
                  pointer++;
                }
                text_insert = text_insert.substring(commonlength);
                text_delete = text_delete.substring(commonlength);
              }
              const commonlength2 = this.diff_commonSuffix(
                text_insert,
                text_delete
              );
              if (commonlength2 !== 0) {
                diffs[pointer][1] =
                  text_insert.substring(text_insert.length - commonlength2) +
                  diffs[pointer][1];
                text_insert = text_insert.substring(
                  0,
                  text_insert.length - commonlength2
                );
                text_delete = text_delete.substring(
                  0,
                  text_delete.length - commonlength2
                );
              }
            }
            pointer -= count_delete + count_insert;
            diffs.splice(pointer, count_delete + count_insert);
            if (text_delete.length) {
              diffs.splice(pointer, 0, [DIFF_DELETE, text_delete]);
              pointer++;
            }
            if (text_insert.length) {
              diffs.splice(pointer, 0, [DIFF_INSERT, text_insert]);
              pointer++;
            }
            pointer++;
          } else if (pointer !== 0 && diffs[pointer - 1][0] === DIFF_EQUAL) {
            diffs[pointer - 1][1] += diffs[pointer][1];
            diffs.splice(pointer, 1);
          } else {
            pointer++;
          }
          count_insert = 0;
          count_delete = 0;
          text_delete = "";
          text_insert = "";
          break;
      }
    }
    if (diffs[diffs.length - 1][1] === "") {
      diffs.pop();
    }

    let changes = false;
    pointer = 1;
    while (pointer < diffs.length - 1) {
      if (
        diffs[pointer - 1][0] === DIFF_EQUAL &&
        diffs[pointer + 1][0] === DIFF_EQUAL
      ) {
        if (
          diffs[pointer][1].substring(
            diffs[pointer][1].length - diffs[pointer - 1][1].length
          ) === diffs[pointer - 1][1]
        ) {
          diffs[pointer][1] =
            diffs[pointer - 1][1] +
            diffs[pointer][1].substring(
              0,
              diffs[pointer][1].length - diffs[pointer - 1][1].length
            );
          diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
          diffs.splice(pointer - 1, 1);
          changes = true;
        } else if (
          diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) ===
          diffs[pointer + 1][1]
        ) {
          diffs[pointer - 1][1] += diffs[pointer + 1][1];
          diffs[pointer][1] =
            diffs[pointer][1].substring(diffs[pointer + 1][1].length) +
            diffs[pointer + 1][1];
          diffs.splice(pointer + 1, 1);
          changes = true;
        }
      }
      pointer++;
    }
    if (changes) {
      this.diff_cleanupMerge(diffs);
    }
  }
}
