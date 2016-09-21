import React from 'react';
import { highlightWordsInHtml, getColorFromIndex } from './util.js';

export default class Comment extends React.Component {
  highlightSearchWords(commentHtml) {
    this.props.searchWords.forEach((searchWord, i) => {
      commentHtml = highlightWordsInHtml(commentHtml, searchWord, getColorFromIndex(i));
    });
    return commentHtml;
  }

  rawHtml () {
    return { __html: this.highlightSearchWords(this.props.children) };
  };

  render () {
    return (
      <div className="comment">
        <h4 className="commentAuthor">
          {this.props.author} <span className="createdAt">{this.props.createdAt}</span>
        </h4>
        <span dangerouslySetInnerHTML={this.rawHtml()} />
      </div>
    );
  }
}