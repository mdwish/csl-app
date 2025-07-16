# Consolidated Screening List Search

This app allows you to search the Consolidated Screening List, which is a database of individuals and companies that are subject to economic sanctions or other trade restrictions.

## How to use the app

To use the app, simply type a name in the search box and click the "Search" button. The app will retrieve a list of matching results from the Consolidated Screening List and display them in a table.

Use the "Prev" and "Next" buttons to navigate through the results. The page size selector lets you choose how many results appear on each page.

## Technologies used

- HTML
- JavaScript
- Fetch API

## How the app works

The app uses the Fetch API to send a GET request to the Consolidated Screening List API with the specified search query and offset. The API returns a JSON object containing the search results, which are then displayed in a table using JavaScript.

The "Prev" and "Next" buttons are implemented using event listeners that update the offset and resubmit the search query when clicked.

## Future improvements

- Allow users to sort the results by column
- Add a loading spinner while the results are being fetched
- Add error handling for cases where the API request fails
- Add more search options, such as filtering by citizenship or type
- Add a way for users to view more details about each result
