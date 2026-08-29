# The Polite Scraper

## Target Classification

**Site:** Books to Scrape (https://books.toscrape.com)

**Scope:** First 3 catalogue pages only (60 unique books)

**Type:** Public practice sandbox — a site built explicitly for learning web scraping. According to their website: "This is a sandbox created specifically for people to practice web scraping techniques."

**Data Collected:**
- Book title
- Product URL
- Price (text and normalized)
- Availability status
- Rating
- Description
- Source page URL
- Fetch timestamp

**Robots.txt Result:**
The site allows scraping of the `/catalogue/` path, which is exactly what we target.

**Why This Assignment Needs No Browser:**
The data is already present in the HTML the server sends. A browser would only add overhead and cost without providing additional data. We can extract everything using plain HTTP requests and HTML parsing.

**Ethics Note:**
I will not reuse this code on another site without checking its rules and terms first.
