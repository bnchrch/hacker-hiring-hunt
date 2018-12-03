import tinycolor from 'tinycolor2';
import memoize from 'lodash/fp/memoize';

// UTIL

const baseHighlightColor = '#EEA776';
const colorWheelIncrement = 57;

/**
 * Given a base color rotate it along the color wheel by
 * degreeIncrement * i and return the new color
 *
 * @param {string} baseColor        base color of the color wheel
 * @param {number} degreeIncrement  degrees to rotate by at each itteration
 * @param {number} i                rotation itteration
 */
function extractColorFromWheel(baseColor, degreeIncrement, i) {
  const degreesToSpin = degreeIncrement * i;
  return tinycolor(baseColor).spin(degreesToSpin).toString();
}

/**
 * Applies a span tag around any instances of a given word to use in html highlighting
 *
 * @param {string} line  string to highlight a word in
 * @param {string} word  the word to highlight
 * @param {string} color the color to use for highlighting
 * @returns
 */
function highlightWordsInHtml(line, word, color) {
  const regex = new RegExp(`(${word})`, 'gi');
  const spanTag = `<span class="highlighted" style="background-color: ${color}">$1</span>`;
  return line.replace(regex, spanTag);
}

/**
 * Memoizes extractColorFromWheel so values at the index given are cached
 *
 * @param {number} index number to use for color wheel rotation
 */
const getColorFromIndex = memoize((index) => {
  return extractColorFromWheel(baseHighlightColor, colorWheelIncrement, index);
});

/**
 * Checks if the event key is 'Enter'
 * @param {Object} event - React-wrapped browser event
 * @param {String} event.key - Key pressed during event
 * @returns {Boolean} Returns true if the event key is 'Enter'
 */
const isEnterKey = ({key}) => key === 'Enter';

/**
 * Calls a given function if a Enter keypress is received.
 * @param {Function} eventHandleFn - Function to call on enter keypress.
 * @returns {Function} The function to be used by event handlers
 */
const ifEnterKey = (eventHandleFn) => (e, p) => isEnterKey(e) && eventHandleFn(e, p);

export {
  ifEnterKey,
  getColorFromIndex,
  highlightWordsInHtml,
};
