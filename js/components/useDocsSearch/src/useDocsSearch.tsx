import type { ChangeEvent } from "react";
import type { SearchResult, SearchError, DocsSearchReturn } from "./shared";
import { useState, useRef, useEffect } from "react";

/**
 * Custom hook to perform search using SQLite Cloud Edge Function.
 * @param {string} searchUrl - The URL of the edge function to perform search.
 * @returns {DocsSearchReturn} - Contains search results, error, and handler functions.
 */
function useDocsSearch(searchUrl: string): DocsSearchReturn {
	// State to store search results
	const [searchRes, setSearchRes] = useState<SearchResult>({ data: [] });

	// State to track the last search request ID
	const [lastSearchId, setLastSearchId] = useState<number>(0);
	const lastSearchIdRef = useRef<number>(lastSearchId);

	// State to track the last request ID
	const [lastRequestId, setLastRequestId] = useState<number>(0);
	const lastRequestIdRef = useRef<number>(lastRequestId);

	// State to store the current search text
	const [searchText, setSearchText] = useState<string>("");

	// State to store any search errors
	const [searchError, setSearchError] = useState<SearchError>(undefined);

	// State to track if the search URL is valid
	const [validSearchUrl, setValidsearchUrl] = useState<boolean>(false);

	// State to store the parsed URL object
	const [url, setUrl] = useState<URL>(undefined);

	// State to store the loading state
	const [isLoading, setIsLoading] = useState<boolean>(false);

	// Effect to validate and parse the search URL whenever it changes
	useEffect(() => {
		if (searchUrl) {
			try {
				const url = new URL(searchUrl);
				setUrl(url);
				setValidsearchUrl(true);
			} catch (error) {
				setValidsearchUrl(false);
			}
		} else {
			setUrl(undefined);
			setValidsearchUrl(true);
		}
	}, [searchUrl]);

	/**
	 * Function to perform search using the edge function.
	 * @param {string} query - The search query string.
	 */
	const search = async (query: string) => {
		lastSearchIdRef.current += 1;
		setLastSearchId(lastSearchIdRef.current);
		setIsLoading(true);
		if (query && url) {
			// Perform search only if query is non-empty and URL is valid
			try {
				const encodedQuery = encodeURIComponent(query);
				const response = await fetch(
					`${url.href}?query=${encodedQuery}&requestid=${lastSearchIdRef.current}`
				);

				if (response.ok) {
					// If response is OK, update search results if request ID matches the last request ID
					setSearchError(undefined);
					const jsonData = await response.json();
					const requestId = jsonData.data.requestid;
					const res: SearchResult = {
						data: jsonData.data.search,
					};

					if (parseInt(requestId) > parseInt(lastRequestIdRef.current.toString())) {
						lastRequestIdRef.current = requestId;
						setLastRequestId(lastRequestIdRef.current);
						setSearchRes(res);
					}
				} else {
					// Handle non-OK responses
					const jsonError: SearchError = await response.json();
					setSearchError(jsonError);
				}
			} catch (error) {
				// Handle any errors not covered by the edge function
				const jsonError: SearchError = {
					error: {
						status: error.status ? error.status : 500,
						title: error.toString(),
						detail: `GET ${url.pathname} an error occurred`,
					},
				};
				setSearchError(jsonError);
			}
		} else {
			// Reset state if query is empty
			lastRequestIdRef.current = lastSearchIdRef.current;
			setLastRequestId(lastSearchIdRef.current);
			setSearchRes({ data: [] });
			setSearchError(undefined);
		}
		setIsLoading(false);
	};

	/**
	 * Event handler for search input changes.
	 * @param {ChangeEvent<HTMLInputElement>} event - The change event from the input field.
	 */
	const handleSearch = async (event: ChangeEvent<HTMLInputElement>) => {
		setSearchText(event.target.value);
		await search(event.target.value);
	};

	// Return the hook's state and handler functions
	return {
		searchRes,
		searchText,
		searchError,
		validSearchUrl,
		isLoading,
		handleSearch,
	};
}

export { useDocsSearch };
