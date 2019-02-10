import React from 'react';

import moment from 'moment';

import {getColorFromIndex, highlightWordsInHtml} from '../util';

/**
 * Inserts HTML to highlight keywords in a given comment
 * @param {String} commentHtml - Raw HTML string of the comment body
 * @param {[String]} keywords - List of keyword to highlight
 * @returns {*} React Component
 */
const highlightKeywords = (commentHtml, keywords) => {
  let updatedCommentHtml = commentHtml;
  keywords.forEach((searchWord, i) => {
    updatedCommentHtml = highlightWordsInHtml(
      updatedCommentHtml,
      searchWord,
      getColorFromIndex(i)
    );
  });
  return updatedCommentHtml;
};

/**
 * Render the comment body with the appropriate keywrods highlighted
 * @param {String} text - Raw HTML string of the comment body
 * @param {[String]} keywords - List of keyword to highlight
 * @returns {*} React Component
 */
const CommentBody = ({text, keywords}) => (
  <span
    dangerouslySetInnerHTML={{__html: highlightKeywords(text, keywords)}}
  />
);

/**
 * The comment compontent for a HN thread comment
 * @returns {*} React Component
 */
const Comment = ({author, created_at, text, keywords}) => {
  const formattedCreatedAt = moment(created_at).format(
    'h:mm:ss a on MMMM Do YYYY'
  );
  return (
    <div className="comment spacing">
      <h4 className="commentAuthor">
        {author} <span className="createdAt">{formattedCreatedAt}</span>
      </h4>
      <CommentBody text={text} keywords={keywords} />
    </div>
  );
};

export default Comment;
