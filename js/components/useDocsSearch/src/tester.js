// tester.js - simple page showing how to use the useDocsSearch component

import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { useDocsSearch } from "./index";

function UseSqlcSearchTester() {
	// State for the edge function URL used for search
	const [searchUrl, setSearchUrl] = useState("");

	// Handle input changes for the search URL
	const handleSearchUrl = async (event) => {
		setSearchUrl(event.target.value);
	};

	// Initialize the useDocsSearch custom hook
	const {
		searchText,    // Text to search for
		searchRes,     // Search results
		searchError,   // Error information if search fails
		validSearchUrl,// Boolean indicating if the search URL is valid
		isLoading,     // Boolean indicating if component is loading search result
		handleSearch,  // Function to handle search input changes
	} = useDocsSearch(searchUrl);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
			<div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl">
				<div className="mb-4">
					<a href="https://sqlitecloud.io" target="_blank">
						<span className="sr-only">SQLite Cloud</span>
						<svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M48.4608 27C48.4608 38.8779 38.84 48.5 26.9804 48.5C15.1209 48.5 5.5 38.8779 5.5 27C5.5 15.1221 15.1209 5.5 26.9804 5.5C38.84 5.5 48.4608 15.1221 48.4608 27Z" fill="#CFE2F8" stroke="#CFE2F8" strokeWidth="11" />
							<path d="M24.6796 12.4775C27.1916 8.34049 32.5791 7.02455 36.7128 9.53821C40.8466 12.0519 42.1612 17.4433 39.6492 21.5803L31.6724 34.7169C29.1603 38.8538 23.7728 40.1698 19.6391 37.6561C15.5053 35.1425 14.1907 29.751 16.7027 25.6141L24.6796 12.4775Z" fill="white" />
							<path fillRule="evenodd" clipRule="evenodd" d="M30.2892 33.8758L38.266 20.7392C40.3138 17.3667 39.2421 12.9716 35.8723 10.9225C32.5025 8.87335 28.1106 9.94611 26.0627 13.3186L18.0859 26.4552C16.0381 29.8276 17.1098 34.2227 20.4796 36.2718C23.8495 38.321 28.2414 37.2482 30.2892 33.8758ZM36.7128 9.53821C32.5791 7.02455 27.1916 8.34049 24.6796 12.4775L16.7027 25.6141C14.1907 29.751 15.5053 35.1425 19.6391 37.6561C23.7728 40.1698 29.1603 38.8538 31.6724 34.7169L39.6492 21.5803C42.1612 17.4433 40.8466 12.0519 36.7128 9.53821Z" fill="black" />
							<path fillRule="evenodd" clipRule="evenodd" d="M31.4389 19.6737C31.817 19.9122 31.9304 20.4122 31.6921 20.7907L16.1192 45.5232C15.881 45.9017 15.3813 46.0151 15.0031 45.7767C14.625 45.5383 14.5116 45.0382 14.7499 44.6598L30.3228 19.9272C30.561 19.5488 31.0607 19.4353 31.4389 19.6737Z" fill="black" />
							<path fillRule="evenodd" clipRule="evenodd" d="M33.1051 30.9949C33.1775 31.3606 32.94 31.7158 32.5746 31.7882C27.7347 32.7478 25.313 32.1394 24.2687 31.4044C23.9641 31.19 23.8908 30.7689 24.105 30.464C24.3193 30.159 24.74 30.0857 25.0447 30.3001C25.6271 30.71 27.5811 31.4021 32.3126 30.464C32.6779 30.3915 33.0328 30.6292 33.1051 30.9949Z" fill="black" />
						</svg>
					</a>
				</div>
				{/* Input for the edge function URL */}
				<div className="mb-6">
					<label htmlFor="search-url-input" className="block text-lg font-medium text-gray-700">
						Enter edge function URL:
					</label>
					<input
						type="text"
						id="search-url-input"
						value={searchUrl}
						onChange={handleSearchUrl}
						className={`mt-2 block w-full px-4 py-3 border ${validSearchUrl ? 'border-gray-300' : 'border-red-500'} rounded-lg shadow-sm focus:outline-none focus:ring-2 ${validSearchUrl ? 'focus:ring-indigo-500' : 'focus:ring-red-500'} focus:border-indigo-500`}
						placeholder="Type here..."
					/>
					{!validSearchUrl && (
						<p className="text-sm text-red-500 mt-2">Please enter a valid URL.</p>
					)}
				</div>
				{searchUrl && validSearchUrl && (
					<div className="mb-6">
						{/* Input for the search text */}
						<label htmlFor="search-text-input" className="block text-lg font-medium text-gray-700">
							Enter search text:
						</label>
						<input
							type="text"
							id="search-text-input"
							value={searchText}
							onChange={handleSearch}
							className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							placeholder="Type here..."
						/>
					</div>
				)}
			</div>
			{searchUrl && validSearchUrl && (
				<div className="mt-6 bg-white p-8 rounded-lg shadow-lg w-full max-w-xl">
					{!searchError ? (
						<>
							{/* Display search results */}
							<p className="text-lg font-semibold mb-4 text-gray-700">
								Number of results: {isLoading ? "loading ..." : searchRes.data.length}
							</p>
							<div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-auto text-sm text-gray-800 whitespace-pre-wrap">
								<pre>{JSON.stringify(searchRes, null, 2)}</pre>
							</div>
						</>
					) : (
						<>
							{/* Display error information */}
							<div className="bg-red-100 p-4 rounded-lg w-full max-w-xl">
								<h2 className="text-xl font-bold mb-4 text-red-600">Error Occurred</h2>
								<div className="flex items-center mb-2">
									<p className="text-lg font-regular text-red-700">
										Error status: {searchError.error.status}
									</p>
								</div>
								<div className="flex items-center mb-2">
									<p className="text-lg font-regular text-red-700">
										Error title: {searchError.error.title}
									</p>
								</div>
								<div className="flex items-center">
									<p className="text-lg font-regular text-red-700">
										Error detail: {searchError.error.detail}
									</p>
								</div>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
}

// Render the UseSqlcSearchTester component into the #app element
const container = document.getElementById("app");
const root = createRoot(container);
root.render(<UseSqlcSearchTester />);
