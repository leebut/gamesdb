import { useEffect, useState } from "react";
import { Parser } from "html-to-react";
import "./App.css";

const apiKey = import.meta.env.VITE_API_KEY;
const searchTerm = "search";
const query = "alan wake";
const resources = "game";
const baseUrl = `https://www.giantbomb.com/api/${searchTerm}/?api_key=${apiKey}&format=json`;
const searchResources = `https://corsproxy.io/?https://www.giantbomb.com/api/${searchTerm}/?api_key=${apiKey}&format=json&query="${query}"&resources=${resources}`;

export default function App() {
  const [gamesList, setGamesList] = useState(["poo"]);
  const [query, setQuery] = useState("");
  const [gameId, setGameId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await fetch(searchResources);
        if (!res.ok) throw new Error("Could not fetch the games list.");
        const data = await res.json();
        if (!data) throw new Error("Nothing to show.");
        console.log(data.results);
        setGamesList(data.results);
      } catch (err) {
        alert(err.message);
      }
    }
    fetchGames();
  }, []);

  function handleInput(val) {
    setQuery(val);
    console.log(`VAL: ${val}`);
    () => {
      console.log(`QUERY: ${query}`);
    };
  }

  function handleShowDetails(id) {
    setGameId(id);
    setShowDetails(true);
  }

  return (
    <>
      <SearchBar onHandleInput={handleInput} />
      <GamesList
        gamesList={gamesList}
        onHandleShowDetails={handleShowDetails}
      />
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

function SearchBar({ onHandleInput }) {
  return (
    <header className="flex justify-center w-screen border-b-2 mb-5 border-b-gray-500 p-5">
      <input
        className="text-2xl bg-gray-500 text-gray-300 p-3 outline-none border-2 border-cyan-300 rounded-full placeholder:text-white"
        type="text"
        name="query"
        id="query"
        placeholder="Search query..."
        onChange={(e) => {
          onHandleInput(e.target.value);
        }}
      />
    </header>
  );
}

// Show the list of games from the API response. I decided not to create
// another component for the list items to reduce the amount of
// propdrilling and number of components.

function GamesList({ gamesList, onHandleShowDetails }) {
  return (
    <>
      <ul className="grid grid-cols-1 gap-3 w-screen md:m-10 md:grid-cols-[repeat(auto-fill,minmax(50rem,1fr))] justify-items-center">
        {gamesList?.map((games) => (
          <>
            <li
              key={games.id}
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
              <p className="text-xl text-sky-400">
                <span className="font-bold">Game ID:</span> {games.id}
              </p>
              <a
                className=" text-lg md:text-xl text-gray-300"
                href={games.site_detail_url}
                target="_blank"
                rel="noreferrer"
              >
                {games.site_detail_url}
              </a>

              {/* Open and close modal button */}
              <button
                className="absolute flex justify-center items-center text-white font-bold  bg-pink-800/50 w-20 h-10 right-0 top-0 cursor-pointer hover:bg-pink-600 transition-all"
                onClick={() => {
                  onHandleShowDetails(games.id);
                }}
              >
                <p>Details</p>
              </button>
            </li>
          </>
        ))}
      </ul>
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
  return (
    <>
      <dialog
        className="flex flex-col justify-start items-center w-screen h-screen bg-slate-700/95 fixed overflow-y-scroll top-0 left-0"
        open={showDetails}
        onClose={() => setShowDetails(false)}
      >
        <section className="grid grid-cols-1">
          {gamesList?.map(
            (games) =>
              games.id === gameId && (
                <>
                  <img src={games.image.screen_url} alt={games.name} />
                  <h2 className="text-3xl font-bold text-slate-300 mt-3 ml-3">
                    Deck Intro
                  </h2>
                  <p className="text-2xl text-white p-2 bg-slate-800/40 border-b-[1px] border-blue-400">
                    {games.deck}
                  </p>
                  {games.description ? (
                    <article className="flex flex-col bg-slate-800/40 p-4 text-xl text-slate-300 overflow-y-scroll overflow-x-hidden">
                      {Parser().parse(games.description)}
                    </article>
                  ) : (
                    <p className="text-slate-300 text-2xl font-bold">
                      No description available.
                    </p>
                  )}
                  <button
                    className="bg-red-800 my-3 text-white text-2xl font-bold p-3 outline-none "
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

// function Games({ games, key }) {
//   return (
//     <div className="grid grid-cols-[8rem_50rem] grid-rows-2 my-4 gap-2">
//       <li key={key}>
//         <img
//           className="row-span-3"
//           // src={games.image.icon_url}
//           alt="image for game."
//         />
//         <p className="text-4xl font-bold text-orange-800">
//           {games.name ? games.name : "No Title"}
//         </p>
//         <p className="text-2xl">
//           <span className="font-bold text-sky-800">Game ID:</span> {games.id}
//         </p>
//         <a href={games.site_detail_url} target="_blank" rel="noreferrer">
//           {games.site_detail_url}
//         </a>
//       </li>
//     </div>
//   );
// }
