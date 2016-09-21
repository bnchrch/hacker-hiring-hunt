import React from 'react';
import ReactDOM from 'react-dom';
import { Badge, Button, Col, Fade, FormControl, FormGroup, Glyphicon, Grid, Label, Row } from 'react-bootstrap';
import Spinner from 'react-spinkit';
import $ from 'jquery';
import _ from 'lodash';
import tinycolor from 'tinycolor2';
import moment from "moment";

const baseHighlightColor = "#EEA776";
const colorWheelIncrement = 57;

function extractColorFromWheel(baseColor, degreeIncrement, i) {
  let degreesToSpin = degreeIncrement * i;
  return tinycolor(baseColor).spin(degreesToSpin).toString();
}

function highlightWordsInHtml(line, word, color) {
  let regex = new RegExp( `(${word})`, 'gi' );
  let spanTag = `<span class="highlighted" style="background-color: ${color}">$1</span>`;
  return line.replace(regex, spanTag);
}

var getColorFromIndex = _.memoize(index => extractColorFromWheel(baseHighlightColor, colorWheelIncrement, index));

class WhosHiringSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        threads: []
    };
  };

  componentDidMount() {
    this.serverRequest = $.get("http://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring", (result) => {
      this.setState({ threads: result.hits})
    })
  };

  render () {
    return (
      <Fade in={this.state.threads.length> 0}>
      <FormGroup className="whosHiringSelect" controlId="formControlsSelect">
      <FormControl componentClass="select" placeholder="select" ref="userInput" defaultValue="" onChange={this.props.handleSelect}>
        <option value="" disabled>Select a thread</option>
        {
          this.state.threads.map((thread => {
            return <option key={thread.objectID} value={thread.objectID}>{thread.title.replace("Ask HN: ", "")}</option>;
          }))
        }
      </FormControl>
      </FormGroup>
      </Fade>
    );
  }
}

class Keyword extends React.Component {
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

class KeywordFilter extends React.Component {
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

class CommentList extends React.Component {
  _filterComments(comment) {
    return this.props.searchWords.reduce((prev, searchWord) => {
          return prev && comment.text.toLowerCase().indexOf(searchWord.toLowerCase()) >= 0;
        }, true)
  }

  render () {
    console.dir(this.props.comments);
    let commentNodes = this.props.comments
      .filter(this._filterComments, this)
      .map(comment => {
        return (
          <Comment key={comment.id} author={comment.author} createdAt={moment(comment.created_at).format("h:mm:ss a on MMMM Do YYYY")}  searchWords={this.props.searchWords}>
            {comment.text}
          </Comment>
        );
    })

    return (
      <div className="comments">
        <Badge className="commentCount">{commentNodes.length}</Badge>
        <div className="commentList">
          {commentNodes}
        </div>
      </div>
    );
  }
}


class Comment extends React.Component {
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

class HackerSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        comments: [],
        searchWords: [],
        id: "" 
    };
  };

  render() {
    if (this.state.id != "") {
      this.serverRequest = $.get(`http://hn.algolia.com/api/v1/items/${this.state.id}`, (result) => {
        let comments = result.children.filter(x => x.text);
        this.setState({comments: comments})
      });
    }

     return (
        <Grid className="hackerSearch">
          <Col md={8} mdOffset={2}>
            <h1>Hacker Hiring Hunt</h1>
            <WhosHiringSelect handleSelect={this.threadSelected.bind(this)}/>
            <Fade in={this.state.comments.length > 0}>
              <div>
                <KeywordFilter keywordsChanged={this.keywordsChanged.bind(this)}/>
                <CommentList comments={this.state.comments} searchWords={this.state.searchWords}/>
              </div>
            </Fade>
            <Col md={8} mdOffset={2}>
              <Spinner hidden={this.state.id === "" && this.state.comments.length === 0} spinnerName='double-bounce' />
            </Col>
          </Col>
        </Grid>
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
