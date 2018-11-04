import React, {useState, useEffect} from 'react';
// import logo from './logo.svg';
// import './App.css';
import getOr from 'lodash/fp/getOr';
import get from 'lodash/fp/get';
import uniq from 'lodash/fp/uniq';
import Select from 'react-select';

import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';
import lifecycle from 'recompose/lifecycle';

import moment from 'moment';

// THREADS

const threadsUrl = "https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring"
const commentUrl = (id) => `https://hn.algolia.com/api/v1/items/${id}`

const fetchUrl = (url, callback) => fetch(url)
  .then(response => response.json())
  .then(callback);

const withHiringThreads = compose(
  withState('threadResponse', 'setThreadResponse', []),
  withState('selectedThread', 'setSelectedThread', {}),
  withProps(({threadResponse}) => ({
    threadOptions: getOr([], 'hits', threadResponse)
      .map(({title, objectID}) => ({label: title, value: objectID})),
  })),
  lifecycle({
    componentWillMount() {
      fetchUrl(threadsUrl, this.props.setThreadResponse)
    },
  })
)

// Keyword list

const Keyword = ({text, removeKeyword}) => {
  return (
    <span className="keywordText">
      {text}
      <button onClick={() => removeKeyword(text)}>🙅‍</button>
    </span>
  );
}

const KeywordFilter = ({keywords, addKeyword, removeKeyword}) => {
  const keywordNodes = keywords.map((keyword, i) => {
    return (
      <Keyword text={keyword} key={keyword} index={i} removeKeyword={removeKeyword}/>
    );
  });
  return (
    <div>
      <input
        type="text"
        placeholder="Enter a Keyword to search for and press Enter (e.g. Python, Remote, Seattle...)"
        onKeyPress={ifEnterKey(addKeyword)}
      />
      <div className="keywords">
        {keywordNodes}
      </div>
    </div>
    );
}

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

// COMMENTS

const Comment = ({author, created_at, text}) => {
  const formattedCreatedAt = moment(created_at).format('h:mm:ss a on MMMM Do YYYY')
  return (
    <div className="comment">
      <h4 className="commentAuthor">
        {author} <span className="createdAt">{formattedCreatedAt}</span>
      </h4>
      <span dangerouslySetInnerHTML={{ __html: text}} />
    </div>
  )
}

const CommentListPure = ({comments, keywords, containsKeywords, addKeyword, removeKeyword}) => {
  console.log(comments)
  const renderedComments = getOr([], 'children', comments)
    .filter(x => x.text)
    .filter(containsKeywords)
    .map(comment => (
      <Comment  key={comment.id} {...comment}/>
    ));
  return (
    <div>
    <KeywordFilter
      keywords={keywords}
      addKeyword={addKeyword}
      removeKeyword={removeKeyword}
    />
    {renderedComments}
    </div>
  );
};

const withCommentData = compose(
  withState('comments', 'setComments', []),
  lifecycle({
    componentWillMount() {
      const {setComments, threadId} = this.props;
      fetchUrl(commentUrl(threadId), setComments)
    },
  })
)

const CommentList = compose(
  withCommentData,
  withKeywords,
)(CommentListPure);

// UTIL
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

// MAIN

const HackerSearchPure = ({threadOptions, selectedThread, setSelectedThread}) => {
  const threadId = get('value', selectedThread);
  return (
    <div className="App">
      <Select
        value={selectedThread}
        onChange={(thread) => setSelectedThread(thread)}
        options={threadOptions}
      />
      {threadId &&
        <CommentList
          threadId={threadId}
        />}
    </div>
  );
};

// HOC's


const HackerSearch = withHiringThreads(HackerSearchPure)

export default HackerSearch;
