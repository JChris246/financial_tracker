import { useState } from "react";
import { MenuIcon, XIcon } from "@heroicons/react/solid";

export const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navlinks = [
        {
            id: 1,
            name: "Home",
            route: "/"
        },
        {
            id: 2,
            name: "History",
            route: "/history"
        },
        {
            id: 3,
            name: "Add Transaction",
            route: "/#add-transaction"
        },
        {
            id: 4,
            name: "Calculators",
            route: "/calculators"
        },
    ];
    return (
        <div className="px-4 py-5 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
            <div className="relative flex items-center justify-between">
                <span className="ml-2 text-xl font-bold tracking-wide text-gray-800 uppercase">
                    <header>
                        <h1 data-test-id="header-title"
                            className="pb-4 mt-4 lg:mt-0 lg:py-8 text-3xl text-gray-200 underline-decoration">Finance Tracker</h1>
                    </header>
                </span>
                <ul className="items-center hidden space-x-8 lg:flex">{
                    navlinks.map(({ name, route, id }) => (
                        <li key={id}>
                            <a href={route} aria-label={name} title={name}
                                className="font-medium tracking-wide text-gray-200 transition-colors duration-200 hover:text-deep-purple-accent-400">
                                {name}
                            </a>
                        </li>
                    ))
                }</ul>
                {/*<ul className="flex items-center hidden space-x-8 lg:flex">
                <li>
                <a
                    href="/"
                    className="inline-flex items-center justify-center h-12 px-6 font-medium tracking-wide text-white transition duration-200 rounded
                        shadow-md bg-deep-purple-accent-400 hover:bg-deep-purple-accent-700 focus:shadow-outline focus:outline-none"
                    aria-label="Sign up"
                    title="Sign up"
                >
                    Sign up
                </a>
                </li>
                </ul>*/}
                <div className="lg:hidden">
                    <button aria-label="Open Menu" title="Open Menu" onClick={() => setIsMenuOpen(true)}
                        className="p-2 -mr-1 transition duration-200 rounded focus:outline-none focus:shadow-outline hover:bg-deep-purple-50
                            focus:bg-deep-purple-50">
                        <MenuIcon className="w-7 text-gray-300" />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute top-0 left-0 z-10 w-full p-5 bg-gray-700 border rounded shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <span className="ml-2 text-xl font-bold tracking-wide text-gray-800 uppercase">
                                    <header>
                                        <h1 className="py-12 text-3xl text-gray-200 underline-decoration">Finance Tracker</h1>
                                    </header>
                                </span>

                                <button aria-label="Close Menu" title="Close Menu" onClick={() => setIsMenuOpen(false)}
                                    className="p-2 -mt-2 -mr-2 transition duration-200 rounded hover:bg-gray-200 focus:bg-gray-200
                                        focus:outline-none focus:shadow-outline">
                                    <XIcon className="w-5 text-gray-300" />
                                </button>
                            </div>
                            <nav>
                                <ul className="space-y-4">{
                                    navlinks.map(({ name, route, id }) => (
                                        <li key={id}>
                                            <a href={route} aria-label={name} title={name}
                                                className="font-medium tracking-wide text-gray-200 transition-colors duration-200
                                                    hover:text-deep-purple-accent-400">
                                                {name}
                                            </a>
                                        </li>
                                    ))
                                }</ul>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};