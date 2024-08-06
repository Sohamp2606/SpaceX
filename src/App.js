import { useState, useEffect } from "react";

// -->>  this is my app component
function App() {
  const [launches, setLaunches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(function () {
    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError("");

        const res = await fetch(`https://api.spacexdata.com/v3/launches/past`);
        const res2 = await fetch(
          `https://api.spacexdata.com/v3/launches/upcoming`
        );

        if (!res.ok && !res2.ok)
          throw new Error("Something went wrong with fetching Launch list");

        const data = await res.json();
        const data2 = await res2.json();

        if (data.Response === "False" && data2.Response === "False")
          throw new Error("Launch not found");

        const combineData = [...data, ...data2];

        console.log(data2);
        setLaunches(combineData);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") {
          console.log(err.message);
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovies();
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  // Filter launches based on search query
  const filteredLaunches = launches.filter(
    (launch) =>
      launch.mission_name.toLowerCase().includes(searchQuery) ||
      launch.rocket.rocket_name.toLowerCase().includes(searchQuery)
  );

  const selectedLaunch = launches.find(
    (launch) => launch.flight_number === selectedId
  );

  return (
    <>
      <NavBar>
        <Search onChange={handleSearchChange} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}

          {!isLoading &&
            !error &&
            (searchQuery !== "" ? (
              <LaunchList
                launches={filteredLaunches}
                onSelect={setSelectedId}
              />
            ) : (
              <LaunchList launches={launches} onSelect={setSelectedId} />
            ))}

          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>{selectedId && <LaunchDetails launch={selectedLaunch} />}</Box>
      </Main>

      <Footer />

      
    </>
  );
}

// -->>  nav bar component
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🚀</span>
      <h1>SpaceX</h1>
    </div>
  );
}

// search component
function Search({ onChange }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search..."
      onChange={onChange}
    />
  );
}

// -->>   main component

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  return <div className="box">{children}</div>;
}

function LaunchList({ launches, onSelect }) {
  launches = [...launches].reverse();
  return (
    <ul className="list">
      {launches?.map((launch) => (
        <Launch
          key={launch.flight_number}
          missionName={launch.mission_name}
          launchDate={launch.launch_date_local}
          launchSite={launch.launch_site.site_name_long}
          upcoming={launch.upcoming}
          onClick={() => onSelect(launch.flight_number)}
        />
      ))}
    </ul>
  );
}

function Launch({ missionName, launchDate, launchSite, upcoming, onClick }) {
  const dateOnly = new Date(launchDate).toISOString().split("T")[0];

  return (
    <li onClick={onClick}>
      <h3>{missionName}</h3>
      <div>
        <p>
          <span>🗓</span>
          {upcoming ? <span>Upcoming..</span> : <span>{dateOnly}</span>}
          <span>📌</span>
          <span>{launchSite}</span>
        </p>
      </div>
    </li>
  );
}

function LaunchDetails({ launch }) {
  const dateOnly = new Date(launch.launch_date_local)
    .toISOString()
    .split("T")[0];
  const success = launch.launch_success ? "Yes" : "No";
  console.log(launch);
  return (
    <div className="details">
      <div className="details-overview">
        <h2>{launch.mission_name}</h2>
        <p>
          &bull; {dateOnly} &bull; {launch.launch_site.site_name_long}
        </p>
        <p>Rocket : {launch.rocket.rocket_name}</p>
        <p>
          Payload : {launch.rocket.second_stage.payloads[0].payload_mass_kg} kg{" "}
        </p>
        <p>Launch Success: {success}</p>
        <p>
          Video Link:{" "}
          <a
            href={launch.links.video_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch Video
          </a>
        </p>
        <p>
          Wikipedia Link:{" "}
          <a
            href={launch.links.wikipedia}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read More
          </a>
        </p>

        <p>Details: {launch.details || "No details available."}</p>
      </div>
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔️</span> {message}
    </p>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

// -->>
function Footer() {
  return (
    <nav className="footer">
      <Logo />
    </nav>
  );
}

export default App;
