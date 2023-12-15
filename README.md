# Games Database React App

This is a project in progress, so it is not yet complete.
I am learning React from Jonas Schmedtmann on Udemy.
Since I am learning, there may be parts of the code that may not be properly implemented.

## Dependencies

**vite**
**Tailwindcss postcss autoprefixer** - as per Tailwindcss installation instructions.
**html-to-react** - to parse HTML in API response.

## Database API

I am using a games database API from [https://www.giantbomb.com](https://www.giantbomb.com).

You can obtain a free api key from [https://www.giantbomb.com/api](https://www.giantbomb.com/api)

My API key is in **.env** of the project root, which is not uploaded to Github. When you get your key, paste it into .env as **VITE_API_KEY**.

## Functionality

At the moment the search input is not working, so a hard-coded search is in place.
CORS is being dealt with by a third-party [https://corsproxy.io/](https://corsproxy.io/). I will use a Netlify function when I deploy there.
