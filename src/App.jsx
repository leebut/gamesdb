import { useEffect, useRef, useState } from "react";
import { Parser } from "html-to-react";
import "./App.css";

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
    // console.log(`VAL: ${val}`);
    // () => {
    //   console.log(`QUERY: ${query}`);
    // };
  }

  function handleShowDetails(id, title) {
    setGameGuid(id);
    setGameTitle(title);
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
    // alert(`GUID HANDLE SEARCH: ${guid}`);
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
      <Header setHeaderHeight={setHeaderHeight}>
        <Logo />
        <SearchInput onHandleQueryInput={handleQueryInput} />
        <FavouritesButton
          favGamesList={favGamesList}
          onHandleShowFavList={handleShowFavList}
        />
      </Header>

      {gamesList.length === 0 && !isLoading && query.length === 0 && (
        <LandingPage headerHeight={headerHeight}>
          <FavGames
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
          numItems={numItems}
          page={page}
          setPage={setPage}
          query={query}
          setIsPageClicked={setIsPageClicked}
          headerHeight={headerHeight}
        />
      )}

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

// Display the searchbar.
// This also contains the favourites list of games dropdown list.

function Header({ children, setHeaderHeight }) {
  const headerRef = useRef(null);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (headerRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        setHeaderHeight(headerHeight);
      }
    }, 100);
    return () => clearTimeout(timerId);
  }, [setHeaderHeight]);

  return (
    <header
      id="page-header"
      className="fixed top-0 z-50 bg-gray-700/70 flex flex-wrap gap-9 justify-center items-center w-screen border-b-2 border-b-gray-500 p-5"
      ref={headerRef}
    >
      {children}
    </header>
  );
}

function Logo() {
  return (
    <div className="sm:mr-[10rem] max-w-[30rem]">
      <figure>
        <img src="logo.png" alt="Logo" />
      </figure>
    </div>
    // <h2 className="text-4xl text-white font-bold">Games...Games...Games</h2>
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
      className="text-2xl sm:mr-[20rem] bg-gray-500 text-gray-300 p-3 outline-none border-2 border-cyan-300 rounded-full placeholder:text-white focus:bg-sky-600 focus:text-white transition-all"
      type="text"
      name="query"
      id="query"
      placeholder="👀🔎 Search games..."
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

function FavGames({
  favGamesList,
  onHandelDeleteFav,
  onHandleSearchById,
  setGameTitle,
}) {
  // console.log(favGamesList);
  return (
    <ul
      id="favourite-games"
      className="fixed top-32 left-0 text-2xl text-gray-300 z-50 w-max max-h-[80vh] selection:pr-1 bg-gray-900 slide-out overflow-y-scroll"
    >
      {favGamesList?.map((game) => (
        <li
          key={game.id}
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
    <>
      <section
        className="relative flex h-screen flex-col items-center justify-center"
        style={{
          background: `url(landing_bg.jpg)`,
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "bottom center",
          paddingTop: `${headerHeight}px`,
          // height: `calc(100vh - ${headerHeight}px)`,
        }}
      >
        {children}
        {/* <h2
          className="text-7xl sm:text-8xl leading-tight sm:leading-snug font-bold sm:self-end sm:mr-16 text-white bg-slate-800/50 px-10 py-5 border border-gray-500 rounded-3xl"
          style={{ transform: `translateY(-${headerHeight}px)` }}
        >
          Platform, FPS,
          <br />
          MOBA...?
        </h2> */}

        <div className="absolute bottom-0 bg-gray-800/70 w-screen py-5">
          <PageFooter />
        </div>
      </section>
    </>
  );
}

function LandingHeaderSection({ headerHeight, onHandleQueryInput }) {
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

// Show the list of games from the API response. I decided not to create
// another component for the list items to reduce the amount of
// propdrilling and number of components.

function GamesList({
  gamesList,
  query,
  onHandleShowDetails,
  onHandleAddFav,
  children,
  headerHeight,
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
    <section className="relative flex flex-col items-center mt-8">
      {children}

      {gamesList.length === 0 && query && (
        <h2
          className="text-white text-2xl"
          style={{ marginTop: headerHeight + 20 + "px" }}
        >
          No games found matching {query}
        </h2>
      )}
      {!query ? (
        // <h2 className="text-white text-2xl">Enter a game name to search.</h2>
        ""
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
                  <p className="text-3xl sm:text-4xl text-gray-300">
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
                      onHandleShowDetails(games.guid, games.name);
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

function PageCount({
  numItems,
  page,
  setPage,
  query,
  setIsPageClicked,
  headerHeight,
}) {
  const totalGames = numItems;
  const numPages = Math.ceil(numItems / 10);

  return (
    <>
      {!numItems ? (
        ""
      ) : (
        <div
          className="w-4/6 flex flex-col items-center mx-auto"
          style={{ marginTop: headerHeight + 20 + "px" }}
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

// function FavModal({
//   favGameObj,
//   searchByGuidToken,
//   setSearchByGuidToken,
//   setFavGameObj,
//   setShowFavList,
//   setGameTitle,
// }) {
//   function addURL(str) {
//     const url = "https://www.giantbomb.com";

//     const regex = /href="\//g;
//     const regex2 = /href="..\/..\//g;
//     const regex3 = /href="\/\//g;

//     str = str.replace(regex3, `target="_blank" href="https://`);
//     str = str.replace(regex, `target="_blank" href="${url}/`);
//     str = str.replace(regex2, `target="_blank" href="${url}/`);
//     return str;
//   }
//   const games = favGameObj;
//   return (
//     <>
//       <dialog
//         className="flex flex-col z-[100] backdrop-blur-sm justify-center items-center w-screen h-screen bg-gray-800/40 fixed overflow-y-scroll top-0 left-0"
//         open={searchByGuidToken}
//         onClose={() => setSearchByGuidToken(false)}
//       >
//         <section className="grid grid-cols-1 grid-rows-[25rem] p-4 bg-gray-900/70 mt-4 max-h-screen sm:w-[70rem] relative rounded-lg">
//           <>
//             {games.image.original_url && (
//               <>
//                 <div
//                   style={{
//                     background: `url(${games.image.original_url})`,
//                     backgroundSize: "cover",
//                     backgroundPosition: "top",
//                   }}
//                 >

//                 </div>

//               </>
//             )}
//             {games.description ? (
//               <article
//                 className="flex flex-col bg-gray-700/40 p-4 text-2xl text-slate-300 overflow-y-scroll overflow-x-auto"
//                 style={{ width: "100%" }}
//               >

//                 <h2 className="text-3xl font-bold bg-green-700 text-amber-100 mt-3 border-t-2 border-t-green-500">
//                   {games.name}
//                 </h2>
//                 <h2 className="text-3xl font-bold text-amber-100 mt-3">
//                   Quick Introduction
//                 </h2>
//                 {games.deck && (
//                   <p className="text-2xl text-white p-2 bg-slate-800/40 border-b-[1px] border-blue-400">
//                     {games.deck}
//                   </p>
//                 )}
//                 <article className="sm:grid sm:grid-cols-2 sm:gap-3">
//                   {/* {Parser().parse(games.description)} */}
//                   {Parser().parse(addURL(games.description))}
//                 </article>
//               </article>
//             ) : (
//               <p className="text-slate-300 text-2xl font-bold">
//                 No description available.
//               </p>
//             )}
//             <button
//               className="bg-red-800 my-3 text-white h-fit text-2xl font-bold p-3 outline-none border-4 border-white rounded-2xl"
//               onClick={() => {
//                 setGameTitle("Games Database");
//                 setFavGameObj(null);
//                 setSearchByGuidToken(false);
//                 setShowFavList(false);
//               }}
//             >
//               CLOSE DETAILS
//             </button>
//           </>
//         </section>

//       </dialog>
//     </>
//   );
// }

// The games modal
// The response from the API includes a description of many of the games in
// HTML format. I found html-to-react on NPM to parse it. I need to learn it
// beyond the basic call so that I can present the data better.

// function GameModal({
//   gamesList,
//   gameId,
//   setGameTitle,
//   gameGuid,
//   setGameGuid,
//   setGameId,
//   showDetails,
//   setShowDetails,
// }) {
//   // Prepare for amending the URLs in the HTML API response.

//   function addURL(str) {
//     const url = "https://www.giantbomb.com";
//     // const regex = /"([^/]*)/g;
//     // const agg = /href="(\)|()..\/..\/)|(\/\/)/g;
//     const regex = /href="\//g;
//     const regex2 = /href="..\/..\//g;
//     const regex3 = /href="\/\//g;

//     str = str.replace(regex3, `target="_blank" href="https://`);
//     str = str.replace(regex, `target="_blank" href="${url}/`);
//     str = str.replace(regex2, `target="_blank" href="${url}/`);
//     return str;
//   }

//   return (
//     <>
//       <dialog
//         className="flex flex-col z-[100] backdrop-blur-sm justify-center items-center w-screen h-screen bg-gray-800/40 fixed overflow-y-scroll top-0 left-0"
//         open={showDetails}
//       >
//         <section className="grid grid-cols-1 grid-rows-[25rem] p-4 bg-gray-900/70 mt-4 max-h-screen sm:w-[70rem] relative">
//           {gamesList?.map(
//             (games) =>
//               games.guid === gameGuid && (
//                 <>
//                   {games.image.original_url && (
//                     <div
//                       style={{
//                         background: `url(${games.image.original_url})`,
//                         backgroundSize: "cover",
//                         backgroundPosition: "top",
//                       }}
//                     ></div>
//                   )}
//                   {games.description ? (
//                     <article
//                       className="flex flex-col bg-gray-700/40 p-4 text-2xl text-slate-300 overflow-y-scroll overflow-x-auto"
//                       style={{ width: "100%" }}
//                     >
//                       {/* {console.log(games.description)} */}
//                       <h2 className="text-3xl font-bold bg-green-700 text-amber-100 mt-3 border-t-2 border-t-green-500">
//                         {games.name}
//                       </h2>
//                       <h2 className="text-3xl font-bold text-amber-100 mt-3">
//                         Quick Introduction
//                       </h2>
//                       {games.deck && (
//                         <p className="text-2xl text-white p-2 bg-slate-800/40 border-b-[1px] border-blue-400">
//                           {games.deck}
//                         </p>
//                       )}
//                       <article className="sm:grid sm:grid-cols-2 sm:gap-3">
//                         {/* {Parser().parse(games.description)} */}
//                         {Parser().parse(addURL(games.description))}
//                       </article>
//                     </article>
//                   ) : (
//                     <p className="text-slate-300 text-2xl font-bold">
//                       No description available.
//                     </p>
//                   )}
//                   <button
//                     className="bg-red-800 my-3 text-white h-fit text-2xl font-bold p-3 outline-none border-4 border-white rounded-2xl"
//                     onClick={() => {
//                       setGameTitle("Games Database");
//                       setShowDetails(false);
//                       setGameGuid(null);
//                     }}
//                   >
//                     CLOSE DETAILS
//                   </button>
//                 </>
//               )
//           )}
//         </section>
//       </dialog>
//     </>
//   );
// }

function DetailsModal({
  favGameObj,
  searchByGuidToken,
  setSearchByGuidToken,
  setFavGameObj,
  setShowFavList,
  setGameTitle,

  gamesList,
  gameGuid,
  setGameGuid,
  showDetails,
  setShowDetails,
}) {
  function addURL(str) {
    const url = "https://www.giantbomb.com";

    const regex = /href="\//g;
    const regex2 = /href="..\/..\//g;
    const regex3 = /href="\/\//g;

    str = str.replace(regex3, `target="_blank" href="https://`);
    str = str.replace(regex, `target="_blank" href="${url}/`);
    str = str.replace(regex2, `target="_blank" href="${url}/`);
    return str;
  }

  let game = {};
  favGameObj ? (game = favGameObj) : (game = {});

  let gamesListStatus = false;

  gamesList ? (gamesListStatus = true) : false;

  return (
    <>
      <dialog
        className="flex flex-col z-[100] backdrop-blur-sm justify-center items-center w-screen h-screen bg-gray-800/40 fixed overflow-y-scroll top-0 left-0"
        open={favGameObj ? searchByGuidToken : showDetails}
      >
        <section className="grid grid-cols-1 grid-rows-[25rem] p-4 bg-gray-900/70 mt-4 max-h-screen sm:w-[70rem] relative rounded-lg">
          {gamesList ? (
            gamesList?.map(
              (game) =>
                game.guid === gameGuid && (
                  <>
                    <DetailModalInner
                      gamesListStatus={gamesListStatus}
                      // setGamesListStatus={setGamesListStatus}
                      game={game}
                      addURL={addURL}
                      gameGuid={gameGuid}
                      setGameGuid={setGameGuid}
                      showDetails={showDetails}
                      setShowDetails={setShowDetails}
                      setGameTitle={setGameTitle}
                    />
                  </>
                )
            )
          ) : (
            <>
              <DetailModalInner
                game={game}
                addURL={addURL}
                setGameTitle={setGameTitle}
                setFavGameObj={setFavGameObj}
                setSearchByGuidToken={setSearchByGuidToken}
                setShowFavList={setShowFavList}
              />
            </>
          )}
        </section>
      </dialog>
    </>
  );
}

function DetailModalInner({
  game,
  addURL,
  setGameTitle,
  setFavGameObj,
  setSearchByGuidToken,
  setShowFavList,

  gameGuid,
  setGameGuid,
  showDetails,
  setShowDetails,
  gamesListStatus,
  setGamesListStatus,
}) {
  return (
    <>
      {game.image.original_url && (
        <div
          style={{
            background: `url(${game.image.original_url})`,
            backgroundSize: "cover",
            backgroundPosition: "top",
          }}
        ></div>
      )}
      {game.description ? (
        <article
          className="flex flex-col bg-gray-700/40 p-4 text-2xl text-slate-300 overflow-y-scroll overflow-x-auto"
          style={{ width: "100%" }}
        >
          {/* {console.log(games.description)} */}
          <h2 className="text-3xl font-bold bg-green-700 text-amber-100 mt-3 border-t-2 border-t-green-500">
            {game.name}
          </h2>
          <h2 className="text-3xl font-bold text-amber-100 mt-3">
            Quick Introduction
          </h2>
          {game.deck && (
            <p className="text-2xl text-white p-2 bg-slate-800/40 border-b-[1px] border-blue-400">
              {game.deck}
            </p>
          )}
          <article className="sm:grid sm:grid-cols-2 sm:gap-3">
            {/* {Parser().parse(games.description)} */}
            {Parser().parse(addURL(game.description))}
          </article>
        </article>
      ) : (
        <p className="text-slate-300 text-2xl font-bold">
          No description available.
        </p>
      )}
      {!gamesListStatus && (
        <button
          className="bg-red-800 my-3 text-white h-fit text-2xl font-bold p-3 outline-none border-4 border-white rounded-2xl"
          onClick={() => {
            setGameTitle("Games Database");
            setFavGameObj(null);
            setSearchByGuidToken(false);
            setShowFavList(false);
          }}
        >
          CLOSE DETAILS
        </button>
      )}
      {gamesListStatus && (
        <button
          className="bg-red-800 my-3 text-white h-fit text-2xl font-bold p-3 outline-none border-4 border-white rounded-2xl"
          onClick={() => {
            alert("closing");
            setGameTitle("Games Database");
            setShowDetails(false);
            setGameGuid(null);
            gamesListStatus = false;
          }}
        >
          CLOSE DETAILS
        </button>
      )}
      ;
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
