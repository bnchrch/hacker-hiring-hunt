import _ from 'lodash';
import tinycolor from 'tinycolor2';

const baseHighlightColor = "#EEA776";
const colorWheelIncrement = 57;

function extractColorFromWheel(baseColor, degreeIncrement, i) {
  let degreesToSpin = degreeIncrement * i;
  return tinycolor(baseColor).spin(degreesToSpin).toString();
}

function highlightWordsInHtml(line, word, color) {
  let regex = new RegExp( `(${word})`, 'gi' );
  let spanTag = `<span class="highlighted" style="background-color: ${color}">$1</span>`;
  return line.replace(regex, spanTag);
}

var getColorFromIndex = _.memoize(index => extractColorFromWheel(baseHighlightColor, colorWheelIncrement, index));

export { getColorFromIndex, highlightWordsInHtml }