import { Parser } from "html-to-react";

export default function DetailsModal({
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
  // Find instances of incomplete URLs in the big description HTML object.
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
    <dialog
      className="flex flex-col z-[100] backdrop-blur-sm justify-center items-center w-screen h-screen bg-gray-800/40 fixed overflow-y-scroll top-0 left-0"
      open={favGameObj ? searchByGuidToken : showDetails}
    >
      <section className="grid grid-cols-1 grid-rows-[25rem] p-4 bg-gray-900/70 mt-4 max-h-screen sm:w-[70rem] relative rounded-lg overflow-auto">
        {gamesList ? (
          gamesList?.map(
            (game) =>
              game.guid === gameGuid && (
                // <>
                <DetailModalInner
                  key={game.guid}
                  gamesListStatus={gamesListStatus}
                  game={game}
                  addURL={addURL}
                  gameGuid={gameGuid}
                  setGameGuid={setGameGuid}
                  showDetails={showDetails}
                  setShowDetails={setShowDetails}
                  setGameTitle={setGameTitle}
                />
                // </>
              )
          )
        ) : (
          // <>
          <DetailModalInner
            key={favGameObj.guid}
            game={game}
            addURL={addURL}
            setGameTitle={setGameTitle}
            setFavGameObj={setFavGameObj}
            setSearchByGuidToken={setSearchByGuidToken}
            setShowFavList={setShowFavList}
          />
          // </>
        )}
      </section>
    </dialog>
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
          className="flex flex-col bg-gray-700/40 p-4 text-2xl text-slate-300 overflow-auto"
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

          {Parser().parse(addURL(game.description))}
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
