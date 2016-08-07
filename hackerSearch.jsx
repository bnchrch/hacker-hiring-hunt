import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import _ from 'lodash';


class PostIdForm extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          threads: [],
          optionsState: ""
      };
  };

  componentDidMount() {
    this.serverRequest = $.get("http://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring", (result) => {
      this.setState({ threads: result.hits})
    })
  };

  render () {
    return (
      <form className="postIdForm">
        <select ref="userInput" defaultValue="" onChange={this.props.handleSelect}>
          <option value="" disabled>Select a thread</option>
          {
            this.state.threads.map((thread => {
              return <option key={thread.objectID} value={thread.objectID}>{thread.title}</option>;
            }))
          }
        </select>
      </form>
    );
  }
}

class KeywordFilter extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          searchText: ''  
      };
      this.handleSearchTextChange =_.debounce(this._handleSearchTextChange.bind(this), 100);
  };

  onChange (e) {
    e.persist();
    this.setState({searchText: e.target.value});
    this.handleSearchTextChange(e);
  }

  _handleSearchTextChange (e) {
    this.props.keywordsChanged(e.target.value.split(","));
  }

  render () {
    return (
      <form className="keywordFilter">
        <input
          type="text"
          placeholder="Keywords to search for"
          value={this.state.searchText}
          onChange={this.onChange.bind(this)}
        />
      </form>
    );
  }
}

class CommentList extends React.Component {
  _filterComments(comment) {
    return this.props.searchWords.reduce((prev, searchWord) => {
          return prev && comment.text.toLowerCase().indexOf(searchWord.toLowerCase()) >= 0;
        }, true)
  }

  render () {
    let commentNodes = this.props.comments
      .filter(this._filterComments, this)
      .map(comment => {
        return (
          <Comment author={comment.author} key={comment.id}>
            {comment.text}
          </Comment>
        );
    })
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
}


class Comment extends React.Component {
  rawHtml () {
    return { __html: this.props.children };
  };

  render () {
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={this.rawHtml()} />
      </div>
    );
  }
}

class HackerSearch extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          comments: [
            {author: "Loading", text: "please wait", id: 0}
          ],
          searchWords: [],
          id: ""  
      };
  };

  render() {
    this.serverRequest = $.get(`http://hn.algolia.com/api/v1/items/${this.state.id}`, (result) => {
        let comments = result.children
          .filter(x => x.text);
        this.setState({comments: comments})
      });
     return (
        <div className="hackerSearch">
          <h1>Hacker Search</h1>
          <PostIdForm handleSelect={this.threadSelected.bind(this)}/>
          <KeywordFilter keywordsChanged={this.keywordsChanged.bind(this)}/>
          <CommentList comments={this.state.comments} searchWords={this.state.searchWords}/>
        </div>
    );
  }

  keywordsChanged(keywords) {
    this.setState({searchWords: keywords})
  }

  threadSelected(e) {
    let id = e.target.value;
    this.setState({id: id})
  }
}

ReactDOM.render(
  <HackerSearch />,
  document.getElementById('content')
);
