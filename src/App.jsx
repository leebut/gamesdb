import { useEffect, useState } from "react";

import "./App.css";
import GamesList from "./GamesList";
import Header, { Logo } from "./Header";
import { SearchInput } from "./Header";
import { FavouritesButton } from "./Header";
import DetailsModal from "./DetailsModal";

const apiKey = import.meta.env.VITE_API_KEY;
const searchTerm = "search";
const resources = "game";
// const baseUrl = `https://www.giantbomb.com/api/${searchTerm}/?api_key=${apiKey}&format=json`;
// const searchResources = `https://corsproxy.io/?https://www.giantbomb.com/api/${searchTerm}/?api_key=${apiKey}&format=json&query="${query}"&resources=${resources}`;

export default function App() {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [gamesList, setGamesList] = useState([]);
  const [gameTitle, setGameTitle] = useState("Games Database");
  const [numItems, setNumItems] = useState("");
  const [page, setPage] = useState(1);
  const [isPageClicked, setIsPageClicked] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [oldQuery, setOldQuery] = useState("");
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

  // Set the page title as the game title.
  useEffect(() => {
    document.title = gameTitle;
  }, [gameTitle]);

  // Fetch the games list.
  useEffect(() => {
    if (!query) {
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

          setGamesList(data.results);
          setNumItems(data.number_of_total_results);
          oldQuery !== query ? setPage(1) : setPage((page) => Number(page));
          isPageClicked ? setPage((page) => Number(page)) : setPage(1);
          setOldQuery(query);
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
  }, [query, page, searchUrl, setGamesList, setError, isPageClicked, oldQuery]);

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
  }

  function handleShowDetails(id, title) {
    setGameGuid(id);
    setGameTitle(title);
    setShowDetails(true);
  }

  // Add and delete to and from addFavList, and slide the favourites list.
  function handleAddFav(fav) {
    const favArray = favGamesList.some((game) => game.guid === fav.guid);
    if (favArray) {
      alert("Game already in the list");
      return;
    }
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

    setGameGuid(guid);
  }

  useEffect(
    function () {
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
      <Header setHeaderHeight={setHeaderHeight}>
        <Logo />
        <FavouritesButton
          favGamesList={favGamesList}
          onHandleShowFavList={handleShowFavList}
        />
        <SearchInput onHandleQueryInput={handleQueryInput} />
      </Header>

      {gamesList.length === 0 && !isLoading && query.length === 0 && (
        <LandingPage headerHeight={headerHeight}>
          <FavGames
            headerHeight={headerHeight}
            favGamesList={favGamesList}
            onHandelDeleteFav={handelDeleteFav}
            onHandleSearchById={handleSearchById}
            setGameTitle={setGameTitle}
          />
          <LandingHeaderSection headerHeight={headerHeight} />
        </LandingPage>
      )}
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
          headerHeight={headerHeight}
        />
      )}

      {isLoading ? (
        <Loader
          searchByGuidToken={searchByGuidToken}
          headerHeight={headerHeight}
        />
      ) : (
        <GamesList
          gamesList={gamesList}
          query={query}
          onHandleShowDetails={handleShowDetails}
          onHandleAddFav={handleAddFav}
          headerHeight={headerHeight}
        >
          <FavGames
            headerHeight={headerHeight}
            favGamesList={favGamesList}
            onHandelDeleteFav={handelDeleteFav}
            onHandleSearchById={handleSearchById}
            setGameTitle={setGameTitle}
          />
        </GamesList>
      )}

      {isLoading ? (
        ""
      ) : (
        <PageCount
          ignoreMarginTop={true}
          numItems={numItems}
          page={page}
          setPage={setPage}
          query={query}
          setIsPageClicked={setIsPageClicked}
          headerHeight={headerHeight}
        />
      )}

      {/* Modal from clicking the games list cards. */}
      {gameGuid && showDetails && (
        <DetailsModal
          gamesList={gamesList}
          gameId={gameId}
          gameGuid={gameGuid}
          setGameGuid={setGameGuid}
          setGameId={setGameId}
          setGameTitle={setGameTitle}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
        />
      )}

      {/* Modal from the favourites list. */}
      {favGameObj !== null && (
        <DetailsModal
          favGameObj={favGameObj}
          setFavGameObj={setFavGameObj}
          searchByGuidToken={searchByGuidToken}
          setSearchByGuidToken={setSearchByGuidToken}
          setShowFavList={setShowFavList}
          setGameTitle={setGameTitle}
        />
      )}
    </>
  );
}

function FavGames({
  favGamesList,
  onHandelDeleteFav,
  onHandleSearchById,
  setGameTitle,
  headerHeight,
}) {
  return (
    <ul
      id="favourite-games"
      className="fixed left-0 text-2xl text-gray-300 z-50 w-max max-h-[80vh] selection:pr-1 bg-gray-900 slide-out overflow-y-scroll"
      style={{ top: headerHeight + 20 + "px" }}
    >
      {favGamesList?.map((game) => (
        <li
          key={game.guid}
          className="grid grid-cols-[7fr_1fr] w-[26rem] bg-gray-800 pr-3 border-r-4 border-white/30 hover:bg-gray-700 transition-all"
        >
          <button
            className="grid grid-cols-[1fr_6fr] gap-x-2 w-full items-center"
            onClick={() => {
              setGameTitle(game.name);
              onHandleSearchById(game.guid);
            }}
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
function LandingPage({ children, headerHeight }) {
  return (
    <section
      className="relative flex h-screen flex-col items-center justify-center"
      style={{
        background: `url(landing_bg.jpg)`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "bottom center",
        paddingTop: `${headerHeight}px`,
      }}
    >
      {children}

      <div className="absolute bottom-0 bg-gray-800/70 w-screen py-5">
        <PageFooter />
      </div>
    </section>
  );
}

function LandingHeaderSection({ headerHeight }) {
  return (
    <div
      className="sm:self-end sm:mr-16 text-white bg-slate-800/50 px-10 py-5 border border-gray-500 rounded-3xl"
      style={{ transform: `translateY(-${headerHeight}px)` }}
    >
      <h2 className="text-7xl sm:text-8xl leading-tight sm:leading-snug font-bold">
        Platform, FPS,
        <br />
        MOBA...?
      </h2>
    </div>
  );
}

function PageCount({
  numItems,
  page,
  setPage,
  query,
  setIsPageClicked,
  headerHeight,
  ignoreMarginTop,
}) {
  const totalGames = numItems;
  const numPages = Math.ceil(numItems / 10);

  return (
    <>
      {!numItems ? (
        ""
      ) : (
        <div
          className="w-11/12 sm:w-4/6 flex flex-col items-center mx-auto"
          style={{
            marginTop: ignoreMarginTop ? 20 + "px" : headerHeight + 20 + "px",
          }}
        >
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
                <li key={i}>
                  <button
                    className={
                      eachPage == page
                        ? "text-2xl text-gray-300 bg-cyan-700 outline-none border-[1px] border-cyan-400 m-1 p-1 px-2"
                        : "text-2xl text-gray-300 outline-none border-[1px] border-cyan-400 m-1 p-1 px-2"
                    }
                    value={eachPage}
                    onClick={(e) => {
                      setPage(Number(e.target.value));
                      setIsPageClicked(true);
                    }}
                  >
                    {eachPage}
                  </button>
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </>
  );
}

function Loader({ searchByGuidToken, headerHeight }) {
  return (
    <>
      <div
        className="flex justify-center w-screen"
        style={{ marginTop: headerHeight + 20 + "px" }}
      >
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

function PageFooter() {
  return (
    <section className="flex w-11/12 sm:w-5/12 flex-col items-start mx-auto my-4 justify-center text-2xl text-white p-2 border border-green-400 rounded-md">
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
    </section>
  );
}
