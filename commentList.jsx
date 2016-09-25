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
          {
            this.props.comments.length > 0 && commentNodes.length === 0
            ? <div className="comment notFound"><h2>:(</h2><h3>Sorry! We couldn't find the kind of post your looking for</h3></div>
            : commentNodes
          }
        </div>
      </div>
    );
  }
}