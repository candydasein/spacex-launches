import React from 'react';
import './App.css';
import { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';

const launchesQuery = `{
  launches {
    id
    launch_success
    mission_name
    launch_date_utc
    launch_site {
      site_name
    }
    rocket {
      rocket_name
    }
    links {
      video_link
    }
    details
  }
}`;

const client = new GraphQLClient('https://api.spacex.land/graphql/');

function useGraphQL(query) {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    client.request(query).then(
      data => {
        setState({ data, loading: false });
      },
      err => {
        console.error(err);
      }
    );
  }, [query]);

  return state;
}

function Header() {
  return (
    <div className="page-head">
      <h2 className="page-head-title text-center">Space X Launches</h2>
    </div>
  );
}

function Loading() {
  return (
    <div className="progress">
      <div
        className="progress-bar bg-primary progress-bar-striped progress-bar-animated"
        role="progressbar"
        style={{ width: '100%' }}
        aria-valuenow="100"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        Loading
      </div>
    </div>
  );
}

function Launches({ launches }) {
  const launchesByDate = launches.reduce((list, launch) => {
    const date = launch.launch_date_utc.slice(0, 4);
    list[date] = list[date] || [];
    list[date].push(launch);
    
    return list;
  }, {});

  return (
    <ul data-testid="launches" className="timeline timeline-variant">
      {Object.keys(launchesByDate).map(launchDate => (
        <span key={launchDate}>
          <li className="timeline-month">{launchDate}</li>
          {launchesByDate[launchDate].map(launch => (
            <Launch key={launch.flight_number} launch={launch} />
          ))}
        </span>
      ))}
    </ul>
  );
}



function Launch({ launch }) {
  const launchIcon = launch.launch_success ? (
    <i className="icon mdi mdi-rocket" />
  ) : (
    <i className="icon mdi mdi-bomb" />
  );

  const url = launch.links.video_link
  const videoIdGrabber = (url) => {
    // eslint-disable-next-line
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    if (url !== null) {
    const match = url.match(regExp);
    console.log('match is', match)
      if (match && match[2].length === 11) {
          return match[2];
      } else {
          return 'error';
      }
    } else {
      return 'error'
    }
    }
    
    const videoId = videoIdGrabber(url)
    //const videoId = videoIdGrabber(launch.links.video_link)
  
    console.log(videoId)

  return (
    <li className="timeline-item timeline-item-detailed right">
      <div className="timeline-content timeline-type file">
        <div className="timeline-icon">{launchIcon}</div>

        <div className="timeline-header">
          <span className="timeline-autor">
            #{launch.id}: {launch.mission_name}
          </span>{' '}
          <p className="timeline-activity">
            {launch.rocket.rocket_name} &mdash; {launch.launch_site.site_name}
          </p>
          <span className="timeline-time">{launch.launch_date_utc.slice(0, 10)}</span>
        </div>
        <div className="timeline-summary">
          <p>{launch.details}</p>
        </div>
        <div className="timeline-video">
          <iframe 
          title={launch.mission_name} 
          src={"https://www.youtube.com/embed/" + videoId}>
          {console.log("https://www.youtube.com/embed/" + videoId)}
          </iframe> 
        </div>
      </div>
    </li>
  );
}

export default function App() {
  const { data, loading } = useGraphQL(launchesQuery);

  return (
    <div>
      <Header />
      {loading ? <Loading /> : <Launches launches={data.launches} />}
    </div>
  );
}
