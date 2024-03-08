import { useEffect, useState } from "react";
import Loader from "./Component/Loader/Loader";
import RatingStars from "./RatingStars";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const key = "51853165";

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handleSelectedId(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteMovie(id) {
    setWatched(watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      const controller = new AbortController();

      async function getMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${key}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) throw new Error("Something went Wrong");
          const data = await res.json();

          if (data.Response === "False") throw new Error("Movie Not Found");
          setMovies(data.Search);
          setError("");
        } catch (error) {
          if (error.name !== "AbortError") {
            setError(error.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setError("");
        setMovies([]);
        return;
      }
      getMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <MovieNum movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies}></MovieList>} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList
              movies={movies}
              handleSelectedId={handleSelectedId}
            ></MovieList>
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              handleSelectedId={handleSelectedId}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchedList
                watched={watched}
                handleDeleteMovie={handleDeleteMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function MovieDetails({ selectedId, handleSelectedId, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [tempRating, setTempRating] = useState(0);

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const userRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      Title: movie.Title,
      Year: movie.Year,
      Poster: movie.Poster,
      imdbRating: Number(movie.imdbRating),
      runtime: Number(movie.Runtime.split(" ").at(0)),
      userRating: rating,
    };
    onAddWatched(newWatchedMovie);
  }

  function addMovieAndClose() {
    handleAdd();
    handleSelectedId(null);
  }

  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") handleSelectedId(null);
      }
      document.addEventListener("keydown", callback);

      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [handleSelectedId]
  );

  useEffect(
    function () {
      async function getDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${key}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      // if (!movie.title) return;
      document.title = `Movie | ${movie.Title}`;

      // clean up function to remove the side effect once the component unmount
      return function () {
        document.title = "usePopcorn";
      };
    },
    [movie.Title]
  );
  return (
    <>
      <div className="details">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <header>
              <button
                onClick={() => handleSelectedId(null)}
                className="btn-back"
              >
                ⬅
              </button>
              <img src={movie.Poster} alt="" />
              <div className="details-overview">
                <h2>{movie.Title}</h2>
                <p>
                  <span>{movie.DVD}</span>
                  <span>{movie.Runtime}</span>
                </p>
                <p>
                  <span>{movie.Genre}</span>
                </p>
                <p>
                  <span>⭐️</span>
                  <span>{movie.imdbRating} rating</span>
                </p>
              </div>
            </header>
            <section>
              <div className="rating">
                {isWatched ? (
                  `You have Rated this movie  ${userRating}⭐`
                ) : (
                  <RatingStars
                    maxRating={10}
                    rating={rating}
                    setRating={setRating}
                    setTempRating={setTempRating}
                    tempRating={tempRating}
                  />
                )}
              </div>

              {rating > 0 && (
                <button className="btn-add" onClick={addMovieAndClose}>
                  + Add To List
                </button>
              )}
              <p>{movie.Plot}</p>
              <p>Staring {movie.Actors}</p>
              <p>Directed by {movie.Director}</p>
            </section>
          </>
        )}
      </div>
    </>
  );
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function MovieNum({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, handleSelectedId }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelectedId={handleSelectedId}
        />
      ))}
    </ul>
  );
}

function WatchedList({ watched, handleDeleteMovie }) {
  return (
    <ul className="list ">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          watched={watched}
          key={movie.imdbID}
          handleDeleteMovie={handleDeleteMovie}
        />
      ))}
    </ul>
  );
}
function Movie({ movie, handleSelectedId }) {
  return (
    <li key={movie.imdbID} onClick={() => handleSelectedId(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
function WatchedMovie({ movie, handleDeleteMovie }) {
  return (
    <li key={movie.imdbID}>
      <div>
        <img src={movie.Poster} alt={`${movie.Title} poster`} />
        <h3>{movie.Title}</h3>
        <div>
          <p>
            <span>⭐️</span>
            <span>{movie.imdbRating}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{movie.userRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{movie.runtime} min</span>
          </p>
        </div>
      </div>
      <button
        className="btn-delete"
        onClick={() => handleDeleteMovie(movie.imdbID)}
      >
        &times;
      </button>
    </li>
  );
}

function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}
