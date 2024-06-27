//
// types.ts - shared types
//

import type { ChangeEvent } from "react";

export interface SearchResult {
	data: { snippet: string; url: string }[];
}

export interface SearchError {
	error: {
		/** Error status as http code */
		status?: string
		title?: string
		detail?: string
	}
}

export interface DocsSearchReturn {
	searchRes: SearchResult;
	searchText: string;
	searchError: SearchError;
	validSearchUrl: boolean;
	isLoading: boolean;
	handleSearch: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
}