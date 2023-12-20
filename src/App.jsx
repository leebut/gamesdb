import { useEffect, useState } from "react";
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
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [gameId, setGameId] = useState(null);
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

  // Fetch the games list.
  useEffect(() => {
    if (!query) {
      setError("Nothing has been entered to search for.");
      return;
    }
    setError("");
    const timerId = setTimeout(() => {
      async function fetchGames() {
        try {
          // const res = await fetch(searchResources);
          const res = await fetch(searchUrl);

          if (!res.ok) throw new Error("Could not fetch the games list.");
          const data = await res.json();
          if (!data) throw new Error("Nothing to show.");
          // console.log(data.results);
          setGamesList(data.results);
          setNumItems(data.number_of_total_results);
        } catch (err) {
          alert(err.message);
        }
      }
      fetchGames();
    }, 1000);
    return () => clearTimeout(timerId);
  }, [query, page, searchUrl]);

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
  return (
    <>
      <Header>
        <SearchInput onHandleQueryInput={handleQueryInput} />
        <FavouritesButton
          favGamesList={favGamesList}
          onHandleShowFavList={handleShowFavList}
        />
      </Header>

      {error && <ErrorMessage error={error} />}

      <GamesList
        gamesList={gamesList}
        query={query}
        onHandleShowDetails={handleShowDetails}
        onHandleAddFav={handleAddFav}
        setPage={setPage}
      >
        <FavGames
          favGamesList={favGamesList}
          onHandelDeleteFav={handelDeleteFav}
        />
        <PageCount
          numItems={numItems}
          page={page}
          setPage={setPage}
          query={query}
        />
      </GamesList>

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
  return (
    <input
      className="text-2xl bg-gray-500 text-gray-300 p-3 h-max outline-none border-2 border-cyan-300 rounded-full placeholder:text-white"
      type="text"
      name="query"
      id="query"
      placeholder="Search query..."
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

function FavGames({ favGamesList, onHandelDeleteFav }) {
  // console.log(favGamesList);
  return (
    <ul
      id="favourite-games"
      className="fixed top-30 left-0 text-2xl text-gray-300 z-50 w-max pr-1 bg-gray-900 slide-out"
    >
      {favGamesList?.map((game) => (
        <li
          key={game.id}
          className="grid grid-cols-[3rem_20rem_3rem] gap-1 gap-x-2 items-center bg-gray-800 pr-3 border-r-2 border-white/30 hover:bg-gray-700 transition-all"
        >
          <img className="w-12 h-12" src={game.icon} alt={game.name} />
          &nbsp;{game.name} &nbsp;{" "}
          <button onClick={() => onHandelDeleteFav(game.id)}>🗑️</button>
        </li>
      ))}
    </ul>
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
  setPage,
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
    <section className="relative">
      {children}
      {gamesList.length === 0 && (
        <h2 className="text-white text-2xl">
          No games found matching &apos;{query}&apos; .
        </h2>
      )}
      {!query ? (
        <h2 className="text-white text-2xl">Enter a game name to search.</h2>
      ) : (
        <ul className="grid grid-cols-1 gap-3 w-screen md:m-10 md:grid-cols-[repeat(auto-fill,minmax(50rem,1fr))] justify-items-center">
          {gamesList?.map((games) => (
            <>
              <li
                key={`savage${games.id}`}
                className="grid relative items-center grid-cols-[6rem_30rem] md:grid-cols-[9rem_40rem] grid-rows-auto gap-x-2 md:gap-3 bg-slate-800 p-2 h-max border-emerald-600 border-[1px]"
              >
                {games.image && (
                  <img
                    className="row-span-3 w-full place-self-start md:items-center"
                    src={games.image.icon_url}
                    alt="image for game."
                  />
                )}

                <p className="text-3xl md:text-4xl font-bold text-orange-300">
                  {games.name ? games.name : "No Title"}
                  <br />
                  <span className="text-xl text-yellow-300">
                    {" "}
                    Release{`(`}d{`)`}:{" "}
                    {games.original_release_date
                      ? games.original_release_date
                      : " No date."}
                  </span>
                </p>
                {games.deck ? (
                  <p className="text-xl text-sky-200">
                    <span className="font-bold">Description:</span>{" "}
                    {games.deck.length > 150
                      ? games.deck.slice(0, 150) + "..."
                      : games.deck}
                  </p>
                ) : (
                  <p className="text-xl text-sky-200">
                    No Description available.
                  </p>
                )}

                <a
                  className=" text-lg md:text-2xl text-gray-300 font-bold"
                  href={games.site_detail_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  See game details on Giant Bomb.
                </a>

                {/* Open and close modal button */}
                <button
                  className="absolute flex justify-center items-center text-white font-bold  bg-pink-800/50 w-20 h-10 right-0 top-0 cursor-pointer hover:bg-pink-600 transition-all"
                  onClick={() => {
                    onHandleShowDetails(games.id);
                  }}
                >
                  <p>📓 Details</p>
                </button>

                {/* Save to favourites button */}
                <button
                  className="absolute right-0 bottom-0 bg-green-700 text-white font-bold p-1 hover:bg-green-900 transition-all"
                  onClick={() => {
                    handleAddNewFav(games.id, games.name, games.image.icon_url);
                  }}
                >
                  ⭐ Favourite
                </button>
              </li>
            </>
          ))}
        </ul>
      )}
    </section>
  );
}

function PageCount({ numItems, page, setPage, query }) {
  const totalGames = numItems;
  const numPages = Math.round(numItems / 10);

  return (
    <>
      {numItems && (
        <p className="text-2xl text-gray-300 font-bold">
          {totalGames} games found containing the word(s) {query}.
        </p>
      )}
      <ul className="flex flex-wrap">
        {Array.from({ length: numPages }, (_, i) => i + 1).map((eachPage) => (
          // <p key={page.i}>page: {page}</p>
          <li key={eachPage.i}>
            <button
              className={
                eachPage == page
                  ? "text-2xl text-gray-300 bg-cyan-700 outline-none border-[1px] border-cyan-400 m-1 p-1 px-2"
                  : "text-2xl text-gray-300 outline-none border-[1px] border-cyan-400 m-1 p-1 px-2"
              }
              value={eachPage}
              onClick={(e) => setPage(e.target.value)}
            >
              {eachPage}
            </button>
          </li>
        ))}
      </ul>
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
    const url = "https//www.giantbomb.com";
    const regex = /<a href="([^/]*)/g;
    let match;
    while ((match = regex.exec(str)) !== null) {
      if (match[1].startsWith(!url)) {
        str = str.replace(match[1], url + match[1]);
        console.log(match[1]);
      }
    }

    return str;
  }

  return (
    <>
      <dialog
        className="flex flex-col justify-start items-center w-screen h-screen bg-gray-800/95 fixed overflow-y-scroll top-0 left-0"
        open={showDetails}
        onClose={() => setShowDetails(false)}
      >
        <section className="grid grid-cols-1 mt-4 h-screen md:w-[70rem] relative">
          {gamesList?.map(
            (games) =>
              games.id === gameId && (
                <>
                  <img
                    className="w-80"
                    src={games.image.medium_url}
                    alt={games.name}
                  />

                  {games.description ? (
                    <article className="flex flex-col bg-gray-700/40 p-4 text-xl text-slate-300 overflow-y-scroll overflow-x-auto">
                      <h2 className="text-3xl font-bold bg-green-700 text-amber-100 mt-3 border-t-2 border-t-green-200">
                        {games.name}
                      </h2>
                      <h2 className="text-3xl font-bold text-amber-100 mt-3">
                        Quick Introduction
                      </h2>
                      <p className="text-2xl text-white p-2 bg-slate-800/40 border-b-[1px] border-blue-400">
                        {games.deck}
                      </p>
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
