import React from 'react';

import getOr from 'lodash/fp/getOr';
import uniq from 'lodash/fp/uniq';

import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';

import Icon from 'react-icons-kit';
import { refresh } from 'react-icons-kit/fa/refresh';

import withFetch from '../hoc/withFetch';
import KeywordFilter from './KeywordFilter';
import Comment from './Comment';

const commentUrl = (id) => `https://hn.algolia.com/api/v1/items/${id}`

const withKeywords = compose(
  withState('keywords', 'setKeywords', []),
  withHandlers({
    removeKeyword: ({keywords, setKeywords}) => (keyword_to_remove) => {
      const newKeywords = keywords.filter(keyword => keyword !== keyword_to_remove);
      setKeywords(newKeywords);
    },

    addKeyword: ({keywords, setKeywords}) => (event) => {
      const newKeywords = uniq(keywords.concat(event.target.value));
      setKeywords(newKeywords);
      event.target.value = '';
    },

    containsKeywords: ({keywords}) => ({text}) => {
      return keywords.reduce((prev, keyword) => {
        return prev && text.toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
      }, true);
    }
  })
)

const CommentListPure = ({comments, refreshData, keywords, containsKeywords, addKeyword, removeKeyword}) => {
  const allComments = getOr([], 'children', comments)
  const renderedComments = allComments
    .filter(x => x.text)
    .filter(containsKeywords)
    .map(comment => (
      <Comment key={comment.id} keywords={keywords} {...comment}/>
    ));

  return allComments.length > 0 && (
    <div className="commentList">
      <KeywordFilter
        keywords={keywords}
        addKeyword={addKeyword}
        removeKeyword={removeKeyword}
      />
      <div className="commentActionTray">
        <div className="badge commentCount refreshButton spacing">
          <Icon
            icon={refresh}
            onClick={refreshData}
          />
        </div>
        <div className="badge commentCount spacing">
          {renderedComments.length}
        </div>
      </div>
      {renderedComments}
    </div>
  );
};

const withCommentData = compose(
  withProps(({threadId}) => ({commentUrl: commentUrl(threadId)})),
  withFetch('commentUrl', (comments) => ({comments})),
);

const CommentList = compose(
  withKeywords,
  withCommentData,
)(CommentListPure);

export default CommentList;
