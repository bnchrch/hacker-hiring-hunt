import React from 'react';
// import logo from './logo.svg';
import './App.css';
import getOr from 'lodash/fp/getOr';
import get from 'lodash/fp/get';
import uniq from 'lodash/fp/uniq';
import memoize from 'lodash/fp/memoize';

import Select from 'react-select';

import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';
import lifecycle from 'recompose/lifecycle';
import branch from 'recompose/branch';
import renderComponent from 'recompose/renderComponent';


import moment from 'moment';
import tinycolor from 'tinycolor2';

import Icon from 'react-icons-kit';
import { timesCircle } from 'react-icons-kit/fa/timesCircle';
import { refresh } from 'react-icons-kit/fa/refresh';

import Spinner from 'react-spinkit';

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

// THREADS

const threadsUrl = "https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring"
const commentUrl = (id) => `https://hn.algolia.com/api/v1/items/${id}`

const LoadingSpinner = () => (<Spinner name="double-bounce" color="#ff6600" noFadeIn />);

const isLoading = ({ loading }) => loading;

const withFetchOnMount = (urlPropName, responseParser) => (lifecycle({
  state: { loading: true },
  componentWillMount() {
    fetch(this.props[urlPropName])
    .then(response => response.json())
    .then((response) => {
      this.setState({loading: false, ...responseParser(response)})
    })
  },

}))

const parseThreadResponse = (threadResponse) => {
  const threads = getOr([], 'hits', threadResponse)
  const threadOptions = threads.map(({title, objectID}) => ({label: title, value: objectID}))
  return {threadOptions}
};

const withLoading = branch(isLoading, renderComponent(LoadingSpinner));

const withHiringThreads = compose(
  withProps({threadsUrl}),
  withFetchOnMount('threadsUrl', parseThreadResponse),
  withState('selectedThread', 'setSelectedThread', {}),
  withLoading,
);

// Keyword list

const Keyword = ({text, removeKeyword, index}) => {
  const applyBackground = {
    backgroundColor: getColorFromIndex(index),
  };

  return (
    <div className="badge keyword" style={applyBackground}>
      <span className="keywordText" style={applyBackground}>
        {text}
      </span>
      <Icon
        className="remove glyphicon-white"
        icon={timesCircle}
        onClick={() => removeKeyword(text)}
      />
    </div>
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
        className="form-control"
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
}

const CommentListPure = ({comments, fetchComments, keywords, containsKeywords, addKeyword, removeKeyword}) => {
  const allComments = getOr([], 'children', comments)
  const renderedComments = allComments
    .filter(x => x.text)
    .filter(containsKeywords)
    .map(comment => (
      <Comment  key={comment.id} keywords={keywords} {...comment}/>
    ));
  console.dir({allComments, comments, renderedComments})
  return allComments.length > 0 && (
    <div>
      <KeywordFilter
        keywords={keywords}
        addKeyword={addKeyword}
        removeKeyword={removeKeyword}
      />
      <div className="badge commentCount refreshButton">
        <Icon
          icon={refresh}
          onClick={fetchComments}
        />
      </div>
      <div className="badge commentCount">
        {renderedComments.length}
      </div>
      {renderedComments}
    </div>
  );
};

const withCommentData = compose(
  withProps(({threadId}) => ({commentUrl: commentUrl(threadId)})),
  withFetchOnMount('commentUrl', (comments) => ({comments})),
  withLoading,
);

const CommentList = compose(
  withCommentData,
  withKeywords,
)(CommentListPure);

// MAIN

const HackerSearchPure = ({threadOptions, selectedThread, setSelectedThread}) => {
  const threadId = get('value', selectedThread);
  console.log("HS", threadId)
  return (
    <div className="App">
      <h1>Hacker Hiring Hunt</h1>

      <Select
        value={selectedThread}
        onChange={(thread) => setSelectedThread(thread)}
        options={threadOptions}
        placeholder="select"
      />

      {threadId && <CommentList threadId={threadId}/>}
    </div>
  );
};

const HackerSearch = withHiringThreads(HackerSearchPure)

export default HackerSearch;
