import { useEffect, useRef, useState } from "react";
import { Parser } from "html-to-react";
import "./App.css";

const apiKey = import.meta.env.VITE_API_KEY;
const searchTerm = "search";
const resources = "game";
// const baseUrl = `https://www.giantbomb.com/api/${searchTerm}/?api_key=${apiKey}&format=json`;
// const searchResources = `https://corsproxy.io/?https://www.giantbomb.com/api/${searchTerm}/?api_key=${apiKey}&format=json&query="${query}"&resources=${resources}`;

export default function App() {
  const [gamesList, setGamesList] = useState([]);
  const [numItems, setNumItems] = useState("");
  const [page, setPage] = useState(1);
  const [isPageClicked, setIsPageClicked] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [gameId, setGameId] = useState(null);
  const [gameGuid, setGameGuid] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFavList, setShowFavList] = useState(false);
  const [favGamesList, setFavGamesList] = useState(function () {
    const storedGames = localStorage.getItem("saved_games");
    if (!storedGames) {
      return [];
    }
    return JSON.parse(storedGames);
  });

  // URL to fetch the games list based on the query state.
  const searchUrl = `https://corsproxy.io/?https://www.giantbomb.com/api/${searchTerm}/?api_key=${apiKey}&format=json&query="${query}"&resources=${resources}&page=${page}`;

  // URL to search by game id
  const searchIdUrl = `https://corsproxy.io/?https://www.giantbomb.com/api/game/${gameGuid}/?api_key=${apiKey}&format=json`;

  // Reset Everything when no search query
  useEffect(() => {
    if (!query) {
      setGamesList([]);
      setNumItems("");
      setPage(1);
      return;
    }
  }, [query, setNumItems, setGamesList, setPage]);

  // Fetch the games list.
  useEffect(() => {
    if (!query) {
      // setError("Search for a game.");
      return;
    }

    const timerId = setTimeout(() => {
      async function fetchGames() {
        try {
          setError("");
          setIsLoading(true);
          // const res = await fetch(searchResources);
          const res = await fetch(searchUrl);

          if (!res.ok) throw new Error("Could not fetch the games list.");
          const data = await res.json();
          if (!data) throw new Error("Nothing to show.");
          // console.log(data.results);
          setGamesList(data.results);
          setNumItems(data.number_of_total_results);
          isPageClicked ? setPage((page) => page) : setPage("1");
        } catch (err) {
          alert(err.message);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      fetchGames();
    }, 1000);
    return () => clearTimeout(timerId);
  }, [query, page, searchUrl, setGamesList, setError, isPageClicked]);

  // Save game to local storage.
  useEffect(
    function () {
      localStorage.setItem("saved_games", JSON.stringify(favGamesList));
    },
    [favGamesList]
  );

  // Listen for the favList button clicks and slide in/out the favourites list.
  useEffect(() => {
    showFavList
      ? document.querySelector("#favourite-games").classList.add("slide-in")
      : document.querySelector("#favourite-games").classList.remove("slide-in");
  }, [showFavList]);

  function handleQueryInput(val) {
    setQuery(val);
    // console.log(`VAL: ${val}`);
    // () => {
    //   console.log(`QUERY: ${query}`);
    // };
  }

  function handleShowDetails(id) {
    setGameId(id);
    setShowDetails(true);
  }

  // Add and delete to and from addFavList, and slide the favourites list.
  function handleAddFav(fav) {
    setFavGamesList((favGamesList) => [...favGamesList, fav]);
  }
  function handelDeleteFav(id) {
    setFavGamesList((favGamesList) =>
      favGamesList.filter((game) => game.id !== id)
    );
  }
  function handleShowFavList() {
    setShowFavList((showFavList) => !showFavList);
  }

  function handleSearchById(id) {
    setGameGuid(id);

    const timerId = setTimeout(() => {
      async function fetchGames() {
        try {
          setError("");
          setIsLoading(true);
          // const res = await fetch(searchResources);
          const res = await fetch(searchIdUrl);

          if (!res.ok) throw new Error("Could not fetch the game.");
          const data = await res.json();
          if (!data) throw new Error("Nothing to show.");
          // console.log(data.results);
        } catch (err) {
          alert(err.message);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      fetchGames();
    }, 1000);
    return () => clearTimeout(timerId);
  }

  return (
    <>
      <Header>
        <SearchInput onHandleQueryInput={handleQueryInput} />
        <FavouritesButton
          favGamesList={favGamesList}
          onHandleShowFavList={handleShowFavList}
        />
      </Header>

      {!query && <LandingPage />}
      {error && <ErrorMessage error={error} />}

      {isLoading ? (
        <Loader />
      ) : (
        <GamesList
          gamesList={gamesList}
          query={query}
          onHandleShowDetails={handleShowDetails}
          onHandleAddFav={handleAddFav}
        >
          <FavGames
            favGamesList={favGamesList}
            onHandelDeleteFav={handelDeleteFav}
            onHandleSearchById={handleSearchById}
          />
          <PageCount
            numItems={numItems}
            page={page}
            setPage={setPage}
            query={query}
            setIsPageClicked={setIsPageClicked}
          />
        </GamesList>
      )}
      <LowerPageCount>
        <PageCount
          numItems={numItems}
          page={page}
          setPage={setPage}
          query={query}
          setIsPageClicked={setIsPageClicked}
        />
      </LowerPageCount>

      {gameId && (
        <GameModal
          gamesList={gamesList}
          gameId={gameId}
          setGameId={setGameId}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
        />
      )}
    </>
  );
}

// Display the searchbar.
// This also contains the favourites list of games dropdown list.

function Header({ children }) {
  return (
    <header className="relative flex justify-around items-center w-screen border-b-2 mb-5 border-b-gray-500 p-5">
      {children}
    </header>
  );
}

function SearchInput({ onHandleQueryInput }) {
  const searchInput = useRef(null);

  // Auto focus the search input
  useEffect(function () {
    searchInput.current.focus();
  }, []);

  return (
    <input
      className="text-2xl bg-gray-500 text-gray-300 p-3 h-max outline-none border-2 border-cyan-300 rounded-full placeholder:text-white focus:bg-sky-600 focus:text-white transition-all"
      type="text"
      name="query"
      id="query"
      placeholder="Search query..."
      ref={searchInput}
      onChange={(e) => {
        onHandleQueryInput(e.target.value);
      }}
    />
  );
}

function FavouritesButton({ favGamesList, onHandleShowFavList }) {
  return (
    <button
      className="bg-gray-600 p-2 rounded-lg border-2 border-transparent hover:border-2 hover:border-white transition-all"
      onClick={onHandleShowFavList}
    >
      <span className="text-3xl">😍</span>{" "}
      <span className="font-bold text-white">
        <sup className="text-lg bg-red-800 rounded-full">
          &nbsp;{favGamesList.length}&nbsp;
        </sup>
        Favourites
      </span>
    </button>
  );
}

function FavGames({ favGamesList, onHandelDeleteFav, onHandleSearchById }) {
  // console.log(favGamesList);
  return (
    <ul
      id="favourite-games"
      className="fixed top-30 left-0 text-2xl text-gray-300 z-50 w-max pr-1 bg-gray-900 slide-out"
    >
      {favGamesList?.map((game) => (
        <li
          key={game.id}
          className="grid grid-cols-[7fr_1fr] w-[26rem] bg-gray-800 pr-3 border-r-4 border-white/30 hover:bg-gray-700 transition-all"
        >
          <button
            className="grid grid-cols-[1fr_6fr] gap-x-2 w-full items-center"
            onClick={() => onHandleSearchById(game.guid)}
          >
            <img className="w-12 h-12" src={game.icon} alt={game.name} />
            <p className="justify-self-start">{game.name}</p>
          </button>
          <button onClick={() => onHandelDeleteFav(game.id)}>🗑️</button>
        </li>
      ))}
    </ul>
  );
}

// Landing page component for when the query input is empty.
function LandingPage() {
  return (
    <>
      <section className="grid grid-cols-12 border border-white">
        <article className="col-start-4 col-span-6 bg-yellow-600 h-10"></article>
      </section>
      <h2 className="text-4xl font-bold text-white">Landing Page</h2>;
    </>
  );
}

// Show the list of games from the API response. I decided not to create
// another component for the list items to reduce the amount of
// propdrilling and number of components.

function GamesList({
  gamesList,
  query,
  onHandleShowDetails,
  onHandleAddFav,
  children,
}) {
  function handleAddNewFav(id, name, icon) {
    const newFav = {
      id,
      name,
      icon,
    };
    onHandleAddFav(newFav);
  }

  return (
    <section className="relative flex flex-col items-center">
      {children}

      {gamesList.length === 0 && query && (
        <h2 className="text-white text-2xl">No games found matching {query}</h2>
      )}
      {!query ? (
        <h2 className="text-white text-2xl">Enter a game name to search.</h2>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:gap-4 mt-5 w-11/12 sm:w-11/12 sm:grid-cols-[repeat(auto-fit,minmax(46rem,46rem))] justify-center">
          {/* md:grid-cols-[repeat(auto-fill,minmax(50rem,1fr))] */}
          {gamesList?.map((games) => (
            <>
              <li
                key={games.id}
                className="grid relative items-center grid-cols-[6rem_1fr] sm:grid-cols-[9rem_35rem] grid-rows-[repeat(4,minmax(3rem,max-content))] gap-x-2 sm:gap-2 w-full bg-slate-700 p-2 h-max border-emerald-600 border-[1px]"
              >
                {games.image && (
                  <img
                    className="row-span-2 w-full place-self-start sm:items-center"
                    src={games.image.icon_url}
                    alt="image for game."
                  />
                )}
                <div>
                  <p className="text-3xl sm:text-4xl text-white">
                    <span className="block py-2 pl-2 font-bold bg-gray-900/50 rounded-md border border-gray-500">
                      {games.name ? games.name : "No Title"}
                    </span>

                    <span className="text-xl font-bold">
                      {" "}
                      Release{`(`}d{`)`}:{" "}
                    </span>
                    <span className="text-xl">
                      {games.original_release_date
                        ? games.original_release_date
                        : " No date."}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-xl text-white font-bold">
                    Platforms:
                  </span>
                  {games.platforms && (
                    <ul className="flex flex-wrap w-full text-xl text-white">
                      {games.platforms.map((platform) => (
                        <li
                          className="p-2 m-1 border border-cyan-600 rounded-md bg-purple-900/20"
                          key={platform.id}
                        >
                          {platform.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {games.deck ? (
                  <p className="col-span-2 text-xl text-sky-200 p-2 m-1 border border-cyan-600 rounded-md bg-gray-700">
                    <span className="font-bold">Synopsis:</span>{" "}
                    {games.deck.length > 150
                      ? games.deck.slice(0, 150) + "..."
                      : games.deck}
                  </p>
                ) : (
                  <p className="col-span-2 text-xl text-sky-200 p-2 m-1 border border-cyan-600 rounded-md bg-gray-700">
                    No synopsis available.
                  </p>
                )}

                <a
                  className="col-span-2 text-lg sm:text-2xl text-gray-300 font-bold"
                  href={games.site_detail_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  See game details on Giant Bomb.
                </a>

                {/* Open and close modal button */}
                {games.description && (
                  <button
                    className="absolute flex justify-center items-center text-white font-bold  bg-pink-600/80 h-10 px-2 right-1 top-1 rounded-lg cursor-pointer border-l-[1px] border-t-[1px] border-pink-400 hover:bg-pink-600 shadow-md shadow-black transition-all"
                    onClick={() => {
                      onHandleShowDetails(games.id);
                    }}
                  >
                    <p>📔 Notes</p>
                  </button>
                )}

                {/* Save to favourites button */}
                <button
                  className="absolute right-1 bottom-1 rounded-lg bg-green-700 text-white font-bold p-1 hover:bg-green-500 px-2 border-green-400 border-t-[1px] border-l-[1px] transition-all"
                  onClick={() => {
                    handleAddNewFav(games.id, games.name, games.image.icon_url);
                  }}
                >
                  💖 Favourite
                </button>
              </li>
            </>
          ))}
        </ul>
      )}
    </section>
  );
}

function PageCount({ numItems, page, setPage, query, setIsPageClicked }) {
  const totalGames = numItems;
  const numPages = Math.ceil(numItems / 10);

  return (
    <>
      {!numItems ? (
        ""
      ) : (
        <>
          {numItems === 1 ? (
            <p className="text-2xl text-gray-300 font-bold">
              {totalGames} game found containing the word(s) {query}.
            </p>
          ) : (
            <p className="text-2xl text-gray-300 font-bold">
              {totalGames} games found containing the word(s) {query}.
            </p>
          )}

          <ul className="flex flex-wrap">
            {Array.from({ length: numPages }, (_, i) => i + 1).map(
              (eachPage, i) => (
                // <p key={page.i}>page: {page}</p>
                <li key={i}>
                  <button
                    className={
                      eachPage == page
                        ? "text-2xl text-gray-300 bg-cyan-700 outline-none border-[1px] border-cyan-400 m-1 p-1 px-2"
                        : "text-2xl text-gray-300 outline-none border-[1px] border-cyan-400 m-1 p-1 px-2"
                    }
                    value={eachPage}
                    onClick={(e) => {
                      setPage(e.target.value);
                      setIsPageClicked(true);
                    }}
                  >
                    {eachPage}
                  </button>
                </li>
              )
            )}
          </ul>
        </>
      )}
    </>
  );
}

function LowerPageCount({ children }) {
  return (
    <section className="flex flex-col mt-3 items-center">{children}</section>
  );
}

function Loader() {
  return <h2 className="text-4xl text-white">Loading the games list....</h2>;
}

function ErrorMessage({ error }) {
  return (
    <>
      <h2 className="text-4xl bg-red-300 font-bold">{error}</h2>
    </>
  );
}

// The games modal
// The response from the API includes a description of many of the games in
// HTML format. I found html-to-react on NPM to parse it. I need to learn it
// beyond the basic call so that I can present the data better.

function GameModal({
  gamesList,
  gameId,
  setGameId,
  showDetails,
  setShowDetails,
}) {
  // Prepare for amending the URLs in the HTML API response.

  function addURL(str) {
    const url = "https://www.giantbomb.com";
    // const regex = /"([^/]*)/g;
    const regex = /href="\//g;
    str = str.replace(regex, `<a target="_blank" href="${url}/`);
    return str;
  }

  return (
    <>
      <dialog
        className="flex flex-col justify-start items-center w-screen h-screen bg-gray-800/95 fixed overflow-y-scroll top-0 left-0"
        open={showDetails}
        onClose={() => setShowDetails(false)}
      >
        <section className="grid grid-cols-1 mt-4 h-screen sm:w-[70rem] relative">
          {gamesList?.map(
            (games) =>
              games.id === gameId && (
                <>
                  {/* BG IMAGE */}
                  {/* <img
                    key={games.id}
                    src={games.image.original_url}
                    alt="games.name"
                    className="absolute opacity opacity-20"
                    style={{ backgroundSize: "cover", position: "absolute" }}
                  /> */}
                  {games.image.original_url && (
                    <img
                      className="w-1/4"
                      src={games.image.original_url}
                      alt={games.name}
                    />
                  )}
                  {games.description ? (
                    <article
                      className="flex flex-col bg-gray-700/40 p-4 text-2xl text-slate-300 overflow-y-scroll overflow-x-auto"
                      style={{ width: "100%" }}
                    >
                      {/* {console.log(games.description)} */}
                      <h2 className="text-3xl font-bold bg-green-700 text-amber-100 mt-3 border-t-2 border-t-green-500">
                        {games.name}
                      </h2>
                      <h2 className="text-3xl font-bold text-amber-100 mt-3">
                        Quick Introduction
                      </h2>
                      {games.deck && (
                        <p className="text-2xl text-white p-2 bg-slate-800/40 border-b-[1px] border-blue-400">
                          {games.deck}
                        </p>
                      )}
                      {/* {Parser().parse(games.description)} */}
                      {Parser().parse(addURL(games.description))}
                    </article>
                  ) : (
                    <p className="text-slate-300 text-2xl font-bold">
                      No description available.
                    </p>
                  )}
                  <button
                    className="bg-red-800 my-3 text-white h-fit text-2xl font-bold p-3 outline-none "
                    onClick={() => {
                      setShowDetails(false);
                      setGameId(null);
                    }}
                  >
                    CLOSE DETAILS
                  </button>
                </>
              )
          )}
        </section>
      </dialog>
    </>
  );
}
