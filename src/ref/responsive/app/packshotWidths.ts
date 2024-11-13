/**
 * Packshot dimensions differ per image type (aspect ratio).
 *
 * The majority of our content lists leverage the responsive grid system.
 * Their image dimensions are calculated from the columns array fed into
 * `PackshotList` to allow for responsive reflow relative to the viewport.
 *
 * The rest of our content lists break away from the grid system and are
 * responsible for their own layout.
 *
 * To improve loading times for users, and to reduce hosting costs for our
 * customers, we ideally want to standardise these 'outside the grid' lists
 * to as few sizes as possible to improve their cacheability.
 */

export const POSTER_WIDTH = 104;
export const TILE_WIDTH = 216;
export const BLOCK_WIDTH = 216;
export const HERO3x1_WIDTH = 425;
