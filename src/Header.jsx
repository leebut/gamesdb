import { useRef, useEffect } from "react";

export default function Header({ children, setHeaderHeight }) {
  // Get the header height to position the pagination below it.
  const headerRef = useRef(null);
  useEffect(() => {
    // Give time for the init render to finish.
    const timerId = setTimeout(() => {
      if (headerRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        const viewPort = window.innerHeight;
        const vhValue = (headerHeight / viewPort) * 100;
        setHeaderHeight(vhValue);
      }
    }, 200);
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

export function Logo() {
  return (
    <div className="max-w-[20rem] sm:mr-[10rem] sm:max-w-[30rem]">
      <figure>
        <img src="logo.png" alt="Logo" />
      </figure>
    </div>
  );
}

export function SearchInput({ onHandleQueryInput }) {
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

export function FavouritesButton({ favGamesList, onHandleShowFavList }) {
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
