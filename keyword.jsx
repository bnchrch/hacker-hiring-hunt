import React from 'react';
import { Glyphicon, Label } from 'react-bootstrap';
import { getColorFromIndex } from './util.js';

export default class Keyword extends React.Component {
  render () {
    let applyBackground = {
      backgroundColor: getColorFromIndex(this.props.index)
    };
    return (
      <Label className="keyword" style={applyBackground}>
        <span className="keywordText">
          {this.props.text}
        </span>
        <a><Glyphicon className="remove glyphicon-white" glyph="remove-sign" onClick={() => this.props.onKeyWordRemoval(this.props.text)}/></a>
      </Label>
    );
  }
}