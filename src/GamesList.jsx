export default function GamesList({
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
          style={{ paddingTop: headerHeight + 2 + "vh" }}
        >
          No games found matching {query}
        </h2>
      )}
      {!query ? (
        ""
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:gap-4 mt-5 w-11/12 sm:w-11/12 sm:grid-cols-[repeat(auto-fit,minmax(46rem,46rem))] justify-center">
          {gamesList?.map((game) => (
            <li
              key={game.guid}
              className="grid relative items-center grid-cols-[6rem_1fr] sm:grid-cols-[9rem_35rem] grid-rows-[repeat(4,minmax(3rem,max-content))] gap-x-2 sm:gap-2 w-full bg-slate-700 p-2 h-max border-emerald-600 border-[1px]"
            >
              {game.image && (
                <img
                  className="row-span-2 w-full place-self-start sm:items-center -translate-x-4 -translate-y-4 border border-lime-300 rounded-md shadow-lg shadow-black/50"
                  src={game.image.icon_url}
                  alt="image for game."
                />
              )}
              <div>
                <p className="text-3xl sm:text-4xl text-gray-300">
                  <span className="block py-2 pl-2 font-bold bg-gray-900/50 rounded-md border border-gray-500">
                    {game.name ? game.name : "No Title"}
                  </span>

                  <span className="text-xl font-bold">
                    {" "}
                    Release{`(`}d{`)`}:{" "}
                  </span>
                  <span className="text-xl">
                    {game.original_release_date
                      ? convertDate(game.original_release_date)
                      : " No date."}
                  </span>
                </p>
              </div>
              <div>
                {game.platforms && (
                  <ul className="flex flex-wrap w-full text-xl text-white">
                    <span className="text-xl text-white font-bold">
                      Platforms:
                    </span>
                    {game.platforms.map((platform) => (
                      <li
                        className="px-2 py-1 m-1 border border-cyan-600 rounded-md bg-purple-900/20"
                        key={`${game.guid}${platform.id}`}
                      >
                        {platform.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {game.deck ? (
                <p className="col-span-2 text-xl text-sky-200 p-2 m-1 border border-cyan-600 rounded-md bg-gray-700">
                  <span className="font-bold">Synopsis:</span>{" "}
                  {game.deck.length > 150
                    ? game.deck.slice(0, 150) + "..."
                    : game.deck}
                </p>
              ) : (
                <p className="col-span-2 text-xl text-sky-200 p-2 m-1 border border-cyan-600 rounded-md bg-gray-700">
                  No synopsis available.
                </p>
              )}

              <a
                className="col-span-2 text-lg sm:text-2xl text-gray-300 font-bold"
                href={game.site_detail_url}
                target="_blank"
                rel="noreferrer"
              >
                See game details on Giant Bomb.
              </a>

              {/* Open and close modal button */}
              {game.description && (
                <button
                  className="absolute flex justify-center items-center text-xl text-white font-bold  bg-green-700/80 h-10 px-2 right-1 bottom-2 rounded-lg cursor-pointer border-l-[1px] border-t-[1px] border-green-400 hover:bg-green-600 shadow-md shadow-black transition-all"
                  onClick={() => {
                    onHandleShowDetails(game.guid, game.name);
                  }}
                >
                  <p>📔 Details</p>
                </button>
              )}

              {/* Save to favourites button */}
              <button
                className="absolute left-[3.5rem] top-16 sm:left-[6.5rem] sm:top-[7.5rem] rounded-full bg-yellow-200/80 text-3xl  text-white font-bold p-1 hover:scale-125 hover:bg-yellow-300 px-2 border-white border-t-[2px] border-l-[2px] transition-all"
                onClick={() => {
                  handleAddNewFav(game.guid, game.name, game.image.icon_url);
                }}
              >
                💗
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
