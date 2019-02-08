import React from 'react'

const Comment = (props) => {
  return (
    <li className="timeline-item timeline-item-detailed right">
      <div className="timeline-content timeline-type file">
          <span className="timeline-autor">
            {props.comments.items.author}
          </span>{' '}
      </div>
      <div className="timeline-summary">
        <p>{props.comments.items.body}</p>
      </div>
    </li>
  );
}

export default Comment