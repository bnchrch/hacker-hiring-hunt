import React from 'react';
import Keyword from './keyword.jsx'
import { FormControl } from 'react-bootstrap';

export default class KeywordFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        searchWords: []  
    };
  };

  onKeyPress (e) {
    if (e.key === 'Enter') {
      let newSearchWords = this.state.searchWords.concat(e.target.value);
      this.setState({ searchWords: newSearchWords});
      this.props.keywordsChanged(newSearchWords);
      e.target.value = '';
    }
  }

  onKeyWordRemoval(keyword) {
    let newSearchWords = this.state.searchWords.filter(kw => kw != keyword );
    this.setState({ searchWords: newSearchWords});
    this.props.keywordsChanged(newSearchWords);
  }

  render () {
    let keywordNodes = this.state.searchWords.map((keyword, i) => {
      return (
        <Keyword text={keyword} key={keyword} index={i} onKeyWordRemoval={this.onKeyWordRemoval.bind(this)} />
      );
    })

    return (
      <div>
        <FormControl
          type="text"
          placeholder="Enter a Keyword to search for and press Enter (e.g. Python, Remote, Seattle...)"
          value={this.state.searchText}
          onKeyPress={this.onKeyPress.bind(this)}
        />
      <div className="keywords">{keywordNodes}</div></div>
    );
  }
}
