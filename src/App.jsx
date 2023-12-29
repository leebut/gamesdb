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
  const [searchByGuidToken, setSearchByGuidToken] = useState(false);
  const [favGameObj, setFavGameObj] = useState(null);
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
    setGameGuid(id);
    setShowDetails(true);
  }

  // Add and delete to and from addFavList, and slide the favourites list.
  function handleAddFav(fav) {
    setFavGamesList((favGamesList) => [...favGamesList, fav]);
  }
  function handelDeleteFav(id) {
    setFavGamesList((favGamesList) =>
      favGamesList.filter((game) => game.guid !== id)
    );
  }
  function handleShowFavList() {
    setShowFavList((showFavList) => !showFavList);
  }

  function handleSearchById(guid) {
    setSearchByGuidToken(true);
    alert(`GUID HANDLE SEARCH: ${guid}`);
    setGameGuid(guid);
  }

  useEffect(
    function () {
      // getGuidGame();
      async function getGuidGame() {
        if (gameGuid && searchByGuidToken) {
          // URL to search by game id
          const searchIdUrl = `https://corsproxy.io/?https://www.giantbomb.com/api/game/${gameGuid}/?api_key=${apiKey}&format=json`;
          try {
            setError("");
            setIsLoading(true);
            const res = await fetch(searchIdUrl);

            if (!res.ok) throw new Error("Could not fetch the game.");
            const data = await res.json();
            if (!data) throw new Error("Nothing to show.");
            // console.log(data.results);
            setFavGameObj(data.results);
          } catch (err) {
            alert(err.message);
            setError(err.message);
          } finally {
            setIsLoading(false);
          }
        }
      }

      getGuidGame();
    },
    [gameGuid, searchByGuidToken]
  );

  return (
    <>
      <Header>
        <Logo />
        <SearchInput onHandleQueryInput={handleQueryInput} />
        <FavouritesButton
          favGamesList={favGamesList}
          onHandleShowFavList={handleShowFavList}
        />
      </Header>

      {!query && <LandingPage />}
      {error && <ErrorMessage error={error} />}

      {isLoading ? (
        ""
      ) : (
        <PageCount
          numItems={numItems}
          page={page}
          setPage={setPage}
          query={query}
          setIsPageClicked={setIsPageClicked}
        />
      )}

      {isLoading ? (
        <Loader searchByGuidToken={searchByGuidToken} />
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
        </GamesList>
      )}
      {isLoading ? (
        ""
      ) : (
        <LowerPageCount>
          <PageCount
            numItems={numItems}
            page={page}
            setPage={setPage}
            query={query}
            setIsPageClicked={setIsPageClicked}
          />
        </LowerPageCount>
      )}

      {gameGuid && showDetails && (
        <GameModal
          gamesList={gamesList}
          gameId={gameId}
          gameGuid={gameGuid}
          setGameGuid={setGameGuid}
          setGameId={setGameId}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
        />
      )}
      {favGameObj !== null && (
        <FavModal
          favGameObj={favGameObj}
          setFavGameObj={setFavGameObj}
          searchByGuidToken={searchByGuidToken}
          setSearchByGuidToken={setSearchByGuidToken}
          setShowFavList={setShowFavList}
        />
      )}
      <PageFooter />
    </>
  );
}

// Display the searchbar.
// This also contains the favourites list of games dropdown list.

function Header({ children }) {
  return (
    <header className="relative flex flex-wrap gap-9 justify-center items-center w-screen border-b-2 mb-5 border-b-gray-500 p-5">
      {children}
    </header>
  );
}

function Logo() {
  return (
    <h2 className="text-4xl text-white font-bold">Games...Games...Games</h2>
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
      className="bg-gray-600 p-2 rounded-lg border-2 border-yellow-300 hover:border-2 hover:border-white transition-all"
      onClick={onHandleShowFavList}
    >
      <span className="text-4xl">💗</span>&nbsp;
      <span className="font-bold text-white">
        <sup className="text-2xl bg-red-800 rounded-full px-2 border border-red-300">
          {favGamesList.length}
        </sup>
      </span>
    </button>
  );
}

// function FavModal({ favGameObj }) {
//   return <p className="text-white text-4xl">{favGameObj.name}</p>;
// }

function FavGames({ favGamesList, onHandelDeleteFav, onHandleSearchById }) {
  // console.log(favGamesList);
  return (
    <ul
      id="favourite-games"
      className="fixed top-30 left-0 text-2xl text-gray-300 z-50 w-max max-h-[80vh] selection:pr-1 bg-gray-900 slide-out overflow-y-scroll"
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
          <button onClick={() => onHandelDeleteFav(game.guid)}>🗑️</button>
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
  function handleAddNewFav(guid, name, icon) {
    const newFav = {
      guid,
      name,
      icon,
    };
    onHandleAddFav(newFav);
  }

  function convertDate(str) {
    const apiDate = str;
    const date = new Date(apiDate);
    const parts = { day: "numeric", month: "long", year: "numeric" };
    const convDate = date.toLocaleDateString("en-GB", parts);
    return convDate;
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
                    className="row-span-2 w-full place-self-start sm:items-center -translate-x-4 -translate-y-4 border border-lime-300 rounded-md shadow-lg shadow-black/50"
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
                        ? convertDate(games.original_release_date)
                        : " No date."}
                    </span>
                  </p>
                </div>
                <div>
                  {/* <span className="text-xl text-white font-bold">
                    Platforms:
                  </span> */}
                  {games.platforms && (
                    <ul className="flex flex-wrap w-full text-xl text-white">
                      <span className="text-xl text-white font-bold">
                        Platforms:
                      </span>
                      {games.platforms.map((platform) => (
                        <li
                          className="px-2 py-1 m-1 border border-cyan-600 rounded-md bg-purple-900/20"
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
                    className="absolute flex justify-center items-center text-xl text-white font-bold  bg-green-700/80 h-10 px-2 right-1 bottom-2 rounded-lg cursor-pointer border-l-[1px] border-t-[1px] border-green-400 hover:bg-green-600 shadow-md shadow-black transition-all"
                    onClick={() => {
                      onHandleShowDetails(games.guid);
                    }}
                  >
                    <p>📔 Details</p>
                  </button>
                )}

                {/* Save to favourites button */}
                <button
                  className="absolute left-[3.5rem] top-16 sm:left-[6.5rem] sm:top-[7.5rem] rounded-full bg-yellow-200/80 text-3xl  text-white font-bold p-1 hover:scale-125 hover:bg-yellow-300 px-2 border-white border-t-[2px] border-l-[2px] transition-all"
                  onClick={() => {
                    handleAddNewFav(
                      games.guid,
                      games.name,
                      games.image.icon_url
                    );
                  }}
                >
                  💗
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
            <p className="ml-3 text-2xl text-gray-300 font-bold">
              {totalGames} game found containing the word(s) {query}.
            </p>
          ) : (
            <p className="ml-3 text-2xl text-gray-300 font-bold">
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

function Loader({ searchByGuidToken }) {
  return (
    <>
      <div className="flex justify-center w-screen">
        {!searchByGuidToken ? (
          <h2 className="text-4xl text-white">Loading the games list....</h2>
        ) : (
          <h2 className="text-4xl text-white">Loading game details....</h2>
        )}
      </div>
      ;
    </>
  );
}

function ErrorMessage({ error }) {
  return (
    <>
      <h2 className="text-4xl bg-red-300 font-bold">{error}</h2>
    </>
  );
}

function FavModal({
  favGameObj,
  searchByGuidToken,
  setSearchByGuidToken,
  setFavGameObj,
  setShowFavList,
}) {
  function addURL(str) {
    const url = "https://www.giantbomb.com";

    const regex = /<a href="\//g;
    const regex2 = /<a href="..\/..\//g;
    const regex3 = /<a href="\/\//g;

    str = str.replace(regex3, `<a target="_blank" href="https://`);
    str = str.replace(regex, `<a target="_blank" href="${url}/`);
    str = str.replace(regex2, `<a target="_blank" href="${url}/`);
    return str;
  }
  const games = favGameObj;
  return (
    <>
      <dialog
        className="flex flex-col backdrop-blur-sm justify-center items-center w-screen h-screen bg-gray-800/40 fixed overflow-y-scroll top-0 left-0"
        open={searchByGuidToken}
        onClose={() => setSearchByGuidToken(false)}
      >
        <section className="grid grid-cols-1 grid-rows-[25rem] p-4 bg-gray-900/70 mt-4 max-h-screen sm:w-[70rem] relative rounded-lg">
          <>
            {games.image.original_url && (
              <>
                <div
                  style={{
                    background: `url(${games.image.original_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "top",
                  }}
                >
                  {/* <img
                className="h-full row-start-1 row-span-1 mb-3"
                src={games.image.original_url}
                alt={games.name}
              /> */}
                </div>
                {/* <img
                  className="w-1/4"
                  src={games.image.original_url}
                  alt={games.name}
                /> */}
              </>
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
                <article className="sm:grid sm:grid-cols-2 sm:gap-3">
                  {/* {Parser().parse(games.description)} */}
                  {Parser().parse(addURL(games.description))}
                </article>
              </article>
            ) : (
              <p className="text-slate-300 text-2xl font-bold">
                No description available.
              </p>
            )}
            <button
              className="bg-red-800 my-3 text-white h-fit text-2xl font-bold p-3 outline-none border-4 border-white rounded-2xl"
              onClick={() => {
                setFavGameObj(null);
                setSearchByGuidToken(false);
                setShowFavList(false);
              }}
            >
              CLOSE DETAILS
            </button>
          </>
        </section>
        {/* {" "}
        <p className="text-4xl text-white">{favGameObj.name}</p>;
        <p className="text-2xl text-white">{favGameObj.deck}</p>;
        <button
          className="bg-red-800 my-3 text-white h-fit text-2xl font-bold p-3 outline-none "
          onClick={() => {
            setSearchByGuidToken(false);
            setFavGameObj(null);
            setShowFavList(false);
          }}
        >
          CLOSE DETAILS
        </button> */}
      </dialog>
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
  gameGuid,
  setGameGuid,
  setGameId,
  showDetails,
  setShowDetails,
}) {
  // Prepare for amending the URLs in the HTML API response.

  function addURL(str) {
    const url = "https://www.giantbomb.com";
    // const regex = /"([^/]*)/g;
    // const agg = /href="(\)|()..\/..\/)|(\/\/)/g;
    const regex = /<a href="\//g;
    const regex2 = /<a href="..\/..\//g;
    const regex3 = /<a href="\/\//g;

    str = str.replace(regex3, `<a target="_blank" href="https://`);
    str = str.replace(regex, `<a target="_blank" href="${url}/`);
    str = str.replace(regex2, `<a target="_blank" href="${url}/`);

    return str;
  }

  return (
    <>
      <dialog
        className="flex flex-col backdrop-blur-sm justify-center items-center w-screen h-screen bg-gray-800/40 fixed overflow-y-scroll top-0 left-0"
        open={showDetails}
        onClose={() => setShowDetails(false)}
      >
        <section className="grid grid-cols-1 grid-rows-[25rem] p-4 bg-gray-900/70 mt-4 max-h-screen sm:w-[70rem] relative">
          {gamesList?.map(
            (games) =>
              games.guid === gameGuid && (
                <>
                  {/* {console.log(games.description)} */}
                  {/* BG IMAGE */}
                  {/* <img
                    key={games.id}
                    src={games.image.original_url}
                    alt="games.name"
                    className="absolute opacity opacity-20"
                    style={{ backgroundSize: "cover", position: "absolute" }}
                  /> */}
                  {games.image.original_url && (
                    <div
                      style={{
                        background: `url(${games.image.original_url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "top",
                      }}
                    >
                      {/* <img
                        className="h-full row-start-1 row-span-1 mb-3"
                        src={games.image.original_url}
                        alt={games.name}
                      /> */}
                    </div>
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
                      <article className="sm:grid sm:grid-cols-2 sm:gap-3">
                        {/* {Parser().parse(games.description)} */}
                        {Parser().parse(addURL(games.description))}
                      </article>
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
                      setGameGuid(null);
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

function PageFooter() {
  return (
    <section className="flex flex-col items-start mx-auto my-4 justify-center text-2xl text-white p-2 border border-green-400 rounded-md sm:w-3/6">
      <p>This website is one of my learning projects for learning React.</p>
      <p>
        Data is provided by the{" "}
        <a
          className="font-bold"
          target="_blank"
          rel="noreferrer"
          href="https://giantbomb.com/api"
        >
          Giant Bomb API.
        </a>
      </p>
      <p>
        The information shown for each game page is supplied as a big HTML
        object. I have styled is the best I can with my current knowledge.
      </p>
    </section>
  );
}
