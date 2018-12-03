import React from 'react';

import moment from 'moment';

import {
  getColorFromIndex,
  highlightWordsInHtml,
} from '../util';

// COMMENTS

const highlightKeywords = (commentHtml, keywords) => {
  let updatedCommentHtml = commentHtml;
  keywords.forEach((searchWord, i) => {
    updatedCommentHtml = highlightWordsInHtml(updatedCommentHtml, searchWord, getColorFromIndex(i));
  });
  return updatedCommentHtml;
};

const CommentBody = ({text, keywords}) => {
  return (
    <span dangerouslySetInnerHTML={{ __html: highlightKeywords(text, keywords)}} />
  );
}

const Comment = ({author, created_at, text, keywords}) => {
  const formattedCreatedAt = moment(created_at).format('h:mm:ss a on MMMM Do YYYY')
  return (
    <div className="comment">
      <h4 className="commentAuthor">
        {author} <span className="createdAt">{formattedCreatedAt}</span>
      </h4>
      <CommentBody text={text} keywords={keywords}/>
    </div>
  )
};

export default Comment;
