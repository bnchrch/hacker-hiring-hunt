import React from 'react';

import Icon from 'react-icons-kit';
import {timesCircle} from 'react-icons-kit/fa/timesCircle';
import isEmpty from 'lodash/fp/isEmpty';

import {ifEnterKey, getColorFromIndex} from '../util';

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
};

const KeywordFilter = ({keywords, addKeyword, removeKeyword}) => {
  const keywordNodes = keywords.map((keyword, i) => (
    <Keyword
      text={keyword}
      key={keyword}
      index={i}
      removeKeyword={removeKeyword}
    />
  ));

  return (
    <React.Fragment>
      <input
        type="text"
        placeholder="Enter a Keyword to search for and press Enter (e.g. Python, Remote, Seattle...)"
        onKeyPress={ifEnterKey(addKeyword)}
        className="form-control spacing"
      />
      {!isEmpty(keywordNodes) && (
        <div className="keywords spacing">{keywordNodes}</div>
      )}
    </React.Fragment>
  );
};

export default KeywordFilter;
