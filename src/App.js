import React from 'react';
import './App.css';
import { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';

//.links.video_link call to query
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
    //1. take each launch; get the utc date (to 10 digits,
    //which includes month and day)
    //and assign it to a variable called date
    //2. combine all the launches into a an object called list
    //where the key is date and the value is 
    //the launch object itself 
    const date = launch.launch_date_utc.slice(0, 10);
    list[date] = list[date] || [];
    list[date].push(launch);

    //1. create empty object that will hold sorted list object
    const sortedList = {}
    
    //2. ceate array of list's keys (the dates), then
    Object.keys(list)
    //3. then sort it
    .sort()
    //4. then create a new object by iterating through each
    // array item, finding the corresponding launch objects in 
    //the list object, and assigning this all to the 
    // sortedList object
    .forEach(key => {
      sortedList[key] = list[key]
    })
    //5. return the sortedList object 
    return sortedList;
  }, {});

  //changed key in line 86 to launch.id since there
  //is no flight_number key in the API and the id will
  //be unique each time
  return (
    <ul data-testid="launches" className="timeline timeline-variant">
      {Object.keys(launchesByDate).map(launchDate => (
        <span key={launchDate}>
          <li className="timeline-month">{launchDate}</li>
          {launchesByDate[launchDate].map(launch => (
            <Launch key={launch.id} launch={launch} />
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
  
  //set incoming YouTube URL to more workable variable
  const youTubeUrl = launch.links.video_link

  //edit YouTubeURL to embed rather than watch 
  //function returns array
  const videoIdGrabber = (url) => {
    // eslint-disable-next-line
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    //make sure no 'null' url's enter functions
    if (url !== null) {
    const match = url.match(regExp);
      if (match && match[2].length === 11) {
          return match[2];
      } else {
          return 'error';
      }
    } else {
      return 'error'
    }
  }
    //save match[2], the video id itself, as a variable 
    const videoId = videoIdGrabber(youTubeUrl)

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
