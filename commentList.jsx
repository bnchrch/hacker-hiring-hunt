import Comment from './comment.jsx'
import React from 'react';
import { Badge } from 'react-bootstrap';
import moment from "moment";


export default class CommentList extends React.Component {
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